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

	toggleLoadingState("#btn_upload", true, "Cargando...", null);
	disableButton(".btn", true);
	disableButton(".form-control", true);

	const formData = new FormData(this);
	appendFilesToFormData(formData);

	var isDisabled = false;

	try {
		const response = await uploadFiles(formData);
		filename = response.filename;
		const data = await fetchGraphData(filename);

		setupChartData(data);
		cloneTemplate();
		initializeChart();
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

function appendFilesToFormData(formData) {
	formData.append("segxFile", $("#segxFile")[0].files[0]);
	formData.append("prdxFile", $("#prdxFile")[0].files[0]);
}

async function uploadFiles(formData) {
	return await $.ajax({
		url: "http://127.0.0.1:5003/api/upload",
		type: "POST",
		data: formData,
		contentType: false,
		processData: false,
	});
}

async function fetchGraphData(filename) {
	const response = await fetch(`http://127.0.0.1:5003/api/graph/${filename}`);
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
}

function initializeChart() {
    setTimeout(() => {
        renderChart(chartData.slice(0, 1000));
        updateProgress();
    }, 0);
}

function renderChart(data) {
	const labels = data.length;
	const chartOptions = {
		fullWidth: true,
		chartPadding: { right: 40 },
		axisX: {
			labelInterpolationFnc: function (value, index) {
				return labels[index];
			}
		}
	};

	chart = new Chartist.Line('.ct-chart', {
		series: [data]
	}, chartOptions);
}

function updateChart() {
	currentIndex += segmentSize;
	if (currentIndex >= chartData.length) {
		clearInterval(interval);
		currentIndex = chartData.length - segmentSize;
	}
	renderChart(chartData.slice(currentIndex, currentIndex + 1000));
	updateProgress();
}

function togglePlayPause() {
    isPlaying = !isPlaying;
    if (isPlaying) {
        interval = setInterval(updateChart, 1000);
        $("#btn_play").html(`<i class="fa-solid fa-pause"></i>`);
    } else {
        clearInterval(interval);
        $("#btn_play").html(`<i class="fa-solid fa-play"></i>`);
    }
}

function forward() {
	isPlaying = false;
	clearInterval(interval);
	$("#btn_play").html(`<i class="fa-solid fa-play"></i>`);
	currentIndex += segmentSize;
	if (currentIndex >= chartData.length) {
		currentIndex = chartData.length - segmentSize;
	}
	renderChart(chartData.slice(currentIndex, currentIndex + 1000));
	updateProgress();
}

function backward() {
	isPlaying = false;
	clearInterval(interval);
	$("#btn_play").html(`<i class="fa-solid fa-play"></i>`);
	currentIndex -= segmentSize;
	if (currentIndex < 0) {
		currentIndex = 0;
	}
	renderChart(chartData.slice(currentIndex, currentIndex + 1000));
	updateProgress();
}

function updateProgress() {
	const progress = (currentIndex / totalSamples) * 100;
	$('#progress_bar').css('width', progress + '%');
	$('#progress_bar').attr('aria-valuenow', progress);

	const currentTime = currentIndex / samplingFrequency;
	$("#progress_time").text(`${formatTime(currentTime)}/${formatTime(totalTime)}`);

	if (arrhythmiaData.length > 0) {
		currentSegment = Math.floor(currentIndex / segmentSize) + 1;

		if(arrhythmiaData[currentSegment - 1] === 0) {
			$('#form_graph h3').html(`
				Ritmo Cardiaco <span class="badge text-bg-success">normal</span>
			`);
		} else {
			$('#form_graph h3').html(`
				Ritmo Cardiaco <span class="badge text-bg-danger">arritmia</span>
			`);
		}
	}
}

function formatTime(seconds) {
	const minutes = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function scrollToBottom() {
	const container = $('.container-content');
	container.scrollTop(container[0].scrollHeight);
}

function disableButton(selector, isDisabled) {
	if (isDisabled) {
		$(selector).attr("disabled", "disabled");
	} else {
		$(selector).removeAttr("disabled");
	}
}

function showButton(selector, isDisabled) {
	if (isDisabled) {
		$(selector).removeClass("d-none");
	} else {
		$(selector).addClass("d-none");
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
	$(".graph-area").empty();
	$("#form_upload_files")[0].reset();
	disableButton(".btn", false);
	disableButton(".form-control", false);
	showButton("#btn_clean", false);

	resetForm();
    chartData = [];
	arrhythmiaData = [];
}

function resetForm() {
	isPlaying = false;
	$("#btn_play").html(`<i class="fa-solid fa-play"></i>`);
	clearInterval(interval);
    chart;
    currentIndex = 0;
    interval;
    segmentSize;
    samplingFrequency;
    totalSamples;
    numSegments;
    totalTime;
    currentSegment = 1;
}