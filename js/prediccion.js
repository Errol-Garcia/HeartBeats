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
		rs: {
			segxFile: { required: true },
		},
		messages: {
			segxFile: { required: "Por favor cargue un registro" },
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
		const data = await fetchSegmentedData(filename);

		setupChartData(data);
		cloneTemplate();
		initializeChart();
		setupControlButtons();
		showButton("#btn_clean", true);
		$("#form_predict").submit(handlePredict);
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

async function handlePredict(e) {
	e.preventDefault();

	isPlaying = true;
    togglePlayPause();
	toggleLoadingState("#btn_predict", true, "Prediciendo...", null);
	disableButton(".btn", true);

	var isDisabled = false;

	try {
		const data = await fetchPredictData(filename);
		const predict = data.prediction;
	
		setupDownloadLinks('#btn_download_predict', predict);
		showButton(".download", true);
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
		toggleLoadingState("#btn_predict", false, "Predecir", "fa-heart-pulse");
	}
}

function appendFilesToFormData(formData) {
	segxFile = $("#segxFile")[0].files[0];

	if (!segxFile) {
        return false;
    }

	formData.append("segxFile", segxFile);
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

async function fetchSegmentedData(filename) {
	const response = await fetch(`http://127.0.0.1:5003/api/segmented/${filename}`);
	return await response.json();
}

async function fetchPredictData(filename) {
	const response = await fetch(`http://127.0.0.1:5003/api/predictonly/${filename}`, {
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
	var clone = $(template).find('#form_predict').clone();
	$(".graph-area").append(clone);
}

function setupDownloadLinks(id, value) {
    const path = '../api/files/';
    $(id).attr('data-path', `${path}${value}`);

    $(id).on('click', function () {
        var filePath = $(this).data('path');
        var a = $('<a target="_blank" rel="noopener noreferrer"></a>').attr({
            href: filePath,
            download: filePath.split('/').pop()
        }).appendTo('body');
        a[0].click();
        a.remove();
    });
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
}