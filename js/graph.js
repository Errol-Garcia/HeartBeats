const URL_API = 'http://127.0.0.1:5003/api';

let chart;
let chartData = [];
let currentIndex = 0;
let interval;
let segmentSize;
let samplingFrequency;
let totalSamples;
let numSegments;
let totalTime;
let currentSegment = 1;
let isPlaying = false;
let arrhythmiaData = [];
let filename;

$(document).ready(function () {
	pageLoad();
	initializeEventListeners();
	initializeFormValidation();
});

function initializeEventListeners() {
	$(".toggle-btn").click(() => $("#sidebar").toggleClass("expand"));
	$("#form_upload_files").submit(handleFileUpload);
}

function initializeFormValidation() {
	$("#form_upload_files").validate({
		rules: {
			segxFile: { required: true },
			prdxFile: { required: true },
		},
		messages: {
			segxFile: { required: "Por favor cargue un registro" },
			prdxFile: { required: "Por favor cargue un registro" },
		},
		highlight: (element) => $(element).parents(".col-sm-10").toggleClass("has-error has-success"),
		unhighlight: (element) => $(element).parents(".col-sm-10").toggleClass("has-error has-success"),
	});
}

async function handleFileUpload(e) {
	e.preventDefault();

	const formData = new FormData(this);
	if (validateEmptyFiles() === false) return;
	if (validateDifferentFiles() === false) return;
	appendFilesToFormData(formData);

	toggleLoadingState("#btn_upload", true, "Cargando...", null);
	disableButton(".btn", true);
	disableButton(".form-control", true);

	var isDisabled = false;

	try {
		const response = await uploadFiles(formData);
		filename = response.filename;
		const data = await fetchGraphData(filename);

		setupChartData(data);
		cloneTemplate();
		setupSlider();
		updateChart();
		setupControlButtons();
		showButton("#btn_clean", true);
		isDisabled = true;

		scrollToBottom();
	} catch (error) {
		console.error("Error al subir archivos: ", error);
		isDisabled = false;
	} finally {
		disableButton(".btn", false);
		disableButton(".form-control", isDisabled);
		disableButton("#btn_upload", isDisabled);
		toggleLoadingState("#btn_upload", false, "Cargar", "fa-upload");
	}
}

function validateEmptyFiles() {
	segxFile = $("#segxFile")[0].files[0];
	prdxFile = $("#prdxFile")[0].files[0];

	if (!segxFile || !prdxFile) {
		return false;
	}
}

function validateDifferentFiles() {
	segxFile = $("#segxFile")[0].files[0]["name"].split("-")[1].split(".")[0];
	prdxFile = $("#prdxFile")[0].files[0]["name"].split("-")[1].split(".")[0];

	if (segxFile != prdxFile) {
		Swal.fire({
			icon: "error",
			title: "Oops...",
			text: "Los archivos cargados deben tener el mismo nombre",
		});
		return false;
	}
}

function appendFilesToFormData(formData) {
	segxFile = $("#segxFile")[0].files[0];
	prdxFile = $("#prdxFile")[0].files[0];

	formData.append("segxFile", segxFile);
	formData.append("prdxFile", prdxFile);
}

async function pageLoad() {
	const response = await fetch(`${URL_API}/pageLoad`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json"
		}
	});
}

async function uploadFiles(formData) {
	const response = await fetch(`${URL_API}/upload`, {
		method: "POST",
		body: formData,
	});
	return await response.json();
}

async function fetchGraphData(filename) {
	const response = await fetch(`${URL_API}/graph/${filename}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json"
		}
	});
	return await response.json();
}

function setupChartData(data) {
	samplingFrequency = data.sampling_frequency;
	segmentSize = Math.floor(samplingFrequency);
	totalSamples = data.total_samples;
	chartData = data.data;
	arrhythmiaData = data.arrhythmia;
	numSegments = data.num_segments;
	totalTime = totalSamples / samplingFrequency;
}

function cloneTemplate() {
	var template = $('#template_graph_area').prop('content');
	var clone = $(template).find('#form_graph').clone();
	$(".graph-area").append(clone);
}

function setupControlButtons() {
	$("#btn_backward").on("click", backward);
	$("#btn_play").on("click", togglePlayPause);
	$("#btn_forward").on("click", forward);
	$("#btn_clean").on("click", clean);
	$("#time_slider").on("input", sliderInput);
	$("#progress_bar").on("input", sliderInput);
}

function setupSlider() {
	$('#time_slider').attr('max', 100);
	$('#time_slider').val(0);
	updateProgress();
}

function renderChart(data, labels) {
	const ctx = $('#ecgChart')[0].getContext('2d');
	const segmentData = data.map((y, i) => ({ x: i, y: y }));

	if (chart) {
		chart.destroy();
	}

	chart = new Chart(ctx, {
		type: 'line',
		data: {
			datasets: [{
				label: `Segment ${currentIndex + 1}`,
				data: segmentData,
				borderColor: labels[0] === 1 ? 'red' : 'green',
				borderWidth: 2,
				fill: false,
				pointRadius: 0,
			}]
		},
		options: {
			scales: {
				x: {
					type: 'linear',
					position: 'bottom',
					beginAtZero: true,
					ticks: {
						callback: function (value) {
							return `${(value / samplingFrequency).toFixed(2)}s`;
						}
					}
				}
			},
			elements: {
				line: {
					tension: 0
				}
			},
			plugins: {
				legend: {
					display: false
				}
			}
		}
	});
}

function updateChart() {
	if (chartData.length === 0 || arrhythmiaData.length === 0) {
		console.error('No hay datos para visualizar');
		return;
	}

	const segmentData = chartData[currentIndex];
	const arrythmiaLabel = arrhythmiaData[currentIndex];
	if (!segmentData) {
		console.error('No hay datos de segmento disponibles');
		return;
	}

	renderChart(segmentData, [arrythmiaLabel]);
	updateProgress();
}

function togglePlayPause() {
	isPlaying = !isPlaying;
	if (isPlaying) {
		isPlaying = true;
		clearInterval(interval);
		interval = setInterval(() => {
			currentIndex++;
			if (currentIndex >= chartData.length) {
				currentIndex = chartData.length - 1;
				togglePlayPause();
			}
			updateChart();
		}, 1000);
		$("#btn_play").html(`<i class="fa-solid fa-pause"></i>`);
	} else {
		isPlaying = false;
		clearInterval(interval);
		$("#btn_play").html(`<i class="fa-solid fa-play"></i>`);
	}
}

function forward() {
	isPlaying = false;
	clearInterval(interval);
	$("#btn_play").html(`<i class="fa-solid fa-play"></i>`);
	currentIndex++;
	if (currentIndex >= chartData.length) {
		currentIndex = chartData.length - 1;
	}
	updateChart();
}

function backward() {
	isPlaying = false;
	clearInterval(interval);
	$("#btn_play").html(`<i class="fa-solid fa-play"></i>`);
	currentIndex--;
	if (currentIndex < 0) {
		currentIndex = 0;
	}
	updateChart();
}

function sliderInput() {
	$('#time_slider').on('click', function () {
		isPlaying = false;
		clearInterval(interval);
		$("#btn_play").html(`<i class="fa-solid fa-play"></i>`);
		const newProgress = $(this).val();
		currentIndex = Math.floor((newProgress / 100) * (chartData.length - 1));
		updateChart();
	});
}

function updateProgress() {
	const timeSlider = $('#time_slider')
	const progressTime = $('#progress_time');
	const progress = (currentIndex / (chartData.length - 1)) * 100;

	const currentTime = currentIndex * (segmentSize / samplingFrequency);
	progressTime.text(`${formatTime(currentTime)}/${formatTime(totalTime)}`);
	timeSlider.val(progress);
}

function formatTime(seconds) {
	const minutes = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function scrollToBottom() {
	window.location.href = "#title_cardiac_rhythm";
}

function disableButton(selector, isDisabled) {
	const btn = $(selector);
	if (isDisabled) {
		btn.attr("disabled", "disabled");
	} else {
		btn.removeAttr("disabled");
	}
}

function showButton(selector, isDisabled) {
	const btn = $(selector);
	if (isDisabled) {
		btn.removeClass("d-none");
	} else {
		btn.addClass("d-none");
	}
}

function toggleLoadingState(id, isLoading, text, icon) {
	const btn = $(id);
	if (isLoading) {
		btn.html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${text}`);
	} else {
		btn.html(`<i class="fa-solid ${icon}"></i> ${text}`);
	}
}

function clean() {
	resetForm();
	$(".graph-area").empty();
	$("#form_upload_files")[0].reset();
	disableButton(".btn", false);
	disableButton(".form-control", false);
	showButton("#btn_clean", false);
}

function resetForm() {
	togglePlayPause();
	chart;
	chartData = [];
	arrhythmiaData = [];
	currentIndex = 0;
	interval;
	segmentSize;
	samplingFrequency;
	totalSamples;
	numSegments;
	totalTime;
	currentSegment = 1;
}