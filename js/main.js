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
	$.validator.addMethod("filesEqual", function (value, element, params) {
		function getFileNameWithoutExtension(fileInput) {
			let fileName = $(fileInput).val().split("\\").pop().split(".")[0];
			return fileName;
		}

		let heaFileName = getFileNameWithoutExtension(params[0]);
		let datFileName = getFileNameWithoutExtension(params[1]);
		let atrFileName = getFileNameWithoutExtension(params[2]);

		return heaFileName === datFileName && heaFileName === atrFileName;
	});

	$("#form_upload_files").validate({
		rules: {
			heaFile: { required: true },
			datFile: { required: true },
			atrFile: { required: true },
		},
		messages: {
			heaFile: { required: "Por favor cargue un registro", filesEqual: "Los archivos deben tener el mismo nombre" },
			datFile: { required: "Por favor cargue un registro" },
			atrFile: { required: "Por favor cargue un registro" },
		},
		highlight: (element) => $(element).parents(".col-sm-10").toggleClass("has-error has-success"),
		unhighlight: (element) => $(element).parents(".col-sm-10").toggleClass("has-error has-success"),
	});
}

async function handleFileUpload(e) {
	e.preventDefault();

	const formData = new FormData(this);
	if (appendFilesToFormData(formData) === false) {
		return;
	}

	toggleLoadingState("#btn_upload", true, "Cargando...", null);
	disableButton(".btn", true);
	disableButton(".form-control", true);

	var isDisabled = false;

	try {
		const response = await uploadFiles(formData);
		filename = response.filename;
		const data = await fetchECGData(filename[0]);

		setupChartData(data);
		cloneTemplate();
		initializeChart();
		setupControlButtons();
		showButton("#btn_clean", true);
		$("#form_predict_arrhythmia").submit(handlePrediction);
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

async function handlePrediction(e) {
	e.preventDefault();

	isPlaying = true;
    togglePlayPause();
	toggleLoadingState("#btn_predict", true, "Prediciendo...", null);
	disableButton(".btn", true);

	var isDisabled = false;

	try {
		const data = await fetchPredictionData(filename[0]);
		chartData = data.data;
		arrhythmiaData = data.arrhythmia;

		initializeChart();
		resetGraph();
		isDisabled = true;

		scrollToBottom();
	} catch (error) {
		console.error("Error al predecir: ", error);
		isDisabled = false;
	} finally {
		disableButton(".btn", false);
		disableButton("#btn_upload", isDisabled);
		disableButton("#btn_predict", isDisabled);
		toggleLoadingState("#btn_predict", false, "Predecir", "fa-brain");
	}
}

function appendFilesToFormData(formData) {
	heaFile = $("#heaFile")[0].files[0];
	datFile = $("#datFile")[0].files[0];
	atrFile = $("#atrFile")[0].files[0];

	if (!heaFile || !datFile || !atrFile) {
        return false;
    }

	formData.append("heaFile", heaFile);
	formData.append("datFile", datFile);
	formData.append("atrFile", atrFile);
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

async function fetchECGData(filename) {
	const response = await fetch(`http://127.0.0.1:5003/api/ecg/${filename}`);
	return await response.json();
}

async function fetchPredictionData(filename) {
	const response = await fetch(`http://127.0.0.1:5003/api/predict/${filename}`, {
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
	numSegments = data.num_segments;
	totalTime = totalSamples / samplingFrequency;
}

function cloneTemplate() {
	var template = $('#template_graph_area').prop('content');
	var clone = $(template).find('#form_predict_arrhythmia').clone();
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
        renderChart(chartData.slice(0, 2000));
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
	renderChart(chartData.slice(currentIndex, currentIndex + 2000));
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
	renderChart(chartData.slice(currentIndex, currentIndex + 2000));
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
	renderChart(chartData.slice(currentIndex, currentIndex + 2000));
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
			$('#form_predict_arrhythmia h3').html(`
				Ritmo Cardiaco <span class="badge text-bg-success">normal</span>
			`);
		} else {
			$('#form_predict_arrhythmia h3').html(`
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
	resetForm();
	$(".graph-area").empty();
	$("#form_upload_files")[0].reset();
	disableButton(".btn", false);
	disableButton(".form-control", false);
	showButton("#btn_clean", false);
}

function resetGraph() {
	renderChart(chartData.slice(0, 2000));
	$('#progress_bar').css('width', 0);
	$('#progress_bar').attr('aria-valuenow', 0);
	$("#progress_time").text(`00:00/${formatTime(totalTime)}`);
	currentIndex = 0;
}

function resetForm() {
	togglePlayPause();
    chart;
    chartData = [];
    currentIndex = 0;
    interval;
    segmentSize;
    samplingFrequency;
    totalSamples;
    numSegments;
    totalTime;
    currentSegment = 1;
    arrhythmiaData = [];
}

async function pageLoad(){
	console.log("prueba pageLoad");
	const response = await fetch(`http://127.0.0.1:5003/api/pageLoad`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json"
		}
	});
	// return await response.json();
}
	