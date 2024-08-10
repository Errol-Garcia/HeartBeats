
let response1 = "";
let chart;
let chartData = [];
let arrhythmiaData = [];
let currentIndex = 0;
let interval;
let segmentSize;
let samplingFrequency;
let totalSamples;
let numSegments;
let totalTime;
let currentSegment = 1;
let isPlaying = false;


$(document).ready(function () {
  var response1 = "";

  $.validator.addMethod(
    "extensionFile1",
    function (value, element, params) {
      // Obtener el nombre del archivo sin la extensión
      var fileInput = value.split(".")[1];
      if (fileInput == "json") {
        return true;
      } else {
        return false;
      }
    },
    "la extension no es la adecuada"
  );


  $("#form_upload_arrhythmia_predecir").validate({
    rules: {
      fileInput: {
        required: true,
        extensionFile1: ["#fileInput"],
      }
    },
    messages: {
      fileInput: {
        required: "Por favor cargue un registro",
        extensionFile1: "La extensión no es la solicitada, debe ser (.json)",
      }
    },
    highlight: function (element, errorClass, validClass) {
      $(element)
        .parents(".col-sm-10")
        .addClass("has-error")
        .removeClass("has-success");
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element)
        .parents(".col-sm-10")
        .addClass("has-success")
        .removeClass("has-error");
    },
  });
});

$("#form_upload_arrhythmia_predecir").submit(function (e) {
  const predictArea = $(".predict-area");
  const btnSubmit = $("#btn_submit");
  const btnClean = $("#btn_clean");
  const download = $("#download-btn");

  e.preventDefault();

  var formData = new FormData();

  var fileInput = $("#fileInput")[0].files[0];

  formData.append("file", fileInput);

  $("#txtErrorUpload").addClass('hidden');
  const Container = document.getElementById('predecir-container');
  const ContainerButton = document.getElementById('predecir-button');
  const ContainerView = document.getElementById('view-area');

  $.ajax({
    url: "http://127.0.0.1:5003/predictOnly",
    type: "POST",
    data: formData,
    contentType: false,
    processData: false,
    success: function (response) {
      console.log(response.filename);
      response1 = response;
      enableBtnSubmit();
      filename = response['fileName']
      let path = '../api/files/';
      let downloadBtn = document.getElementById('download-btn');
      downloadBtn.setAttribute('data-path', `${path}${filename}`);
      Container.classList.remove('hidden');
      ContainerView.classList.remove('hidden');

      samplingFrequency = response.response.sampling_frequency;
      segmentSize = Math.floor(samplingFrequency);
      totalSamples = response.response.total_samples;
      chartData = response.data;
      arrhythmiaData = response.arrhythmia; // Asumimos que estos datos están en el JSON de respuesta
      numSegments = response.response.num_segments;
      totalTime = totalSamples / samplingFrequency;
      renderChart(chartData.slice(0, 2000));
      updateProgress();
    },
    error: function (xhr, status, error) {
      $("#txtErrorUpload").removeClass('hidden');
      enableBtnUpload();
    },
  });

  disableBtnSubmit();

  btnClean.on("click", function () {
    predictArea.empty();
    btnSubmit.removeAttr("disabled");
    $("#btn_clean").addClass("d-none");
    location.reload();
  });
});

document.getElementById('download-btn').addEventListener('click', function () {
  var filePath = this.getAttribute('data-path');
  var a = document.createElement('a');
  a.href = filePath;
  a.download = filePath.split('/').pop();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});


function disableBtnSubmit() {
  $("#btn_submit").attr("disabled", "disabled");
  $("#btn_submit").html(`
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Cargando...
  `);
}

function enableBtnSubmit() {
  $("#btn_submit").html(`
      <i class="fa-solid fa-upload"></i> Cargar
  `);

  $("#btn_clean").removeClass("d-none");
}

function enableBtnUpload() {
  $("#btn_submit").html(`
      <i class="fa-solid fa-upload"></i> Cargar
  `);
  $("#btn_submit").removeAttr("disabled");
}

function mostarAlertaUpload() {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Los archivos cargados deben tener el mismo nombre",
  });
}


function renderChart(data) {
  const labels = Array.from({ length: data.length }, (_, i) => i / samplingFrequency);
  chart = new Chartist.Line('.ct-chart', {
    labels: labels,
    series: [data]
  }, {
    fullWidth: true,
    chartPadding: { right: 40 },
    lineSmooth: false,
    showPoint: false,
    axisX: {
      labelInterpolationFnc: function (value, index) {
        return index % (samplingFrequency * 2) === 0 ? `${(value).toFixed(2)}s` : null;
      }
    }
  });
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

/*
function renderChart(data) {
  const labels = Array.from({ length: data.length }, (_, i) => i / samplingFrequency);
  const series = [];

  let currentSeries = [];
  let currentClass = arrhythmiaData[0] === 1 ? 'ct-series-a' : 'ct-series-b';

  for (let i = 0; i < data.length; i++) {
    const arrhythmia = arrhythmiaData[Math.floor(i / segmentSize)];

    // Determine the class based on arrhythmia status
    const newClass = arrhythmia === 0 ? 'ct-series-a' : 'ct-series-b';

    if (newClass !== currentClass) {
      series.push({ value: currentSeries, className: currentClass });
      currentSeries = [];
      currentClass = newClass;
    }

    currentSeries.push(data[i]);
  }

  if (currentSeries.length > 0) {
    series.push({ value: currentSeries, className: currentClass });
  }

  new Chartist.Line('.ct-chart', {
    labels: labels.slice(0, series.flat().length),
    series: series.map(s => s.value)
  }, {
    fullWidth: true,
    chartPadding: { right: 40 },
    lineSmooth: false,
    showPoint: false,
    series: series.reduce((acc, s, i) => {
      acc[`ct-series-${i}`] = { className: s.className };
      return acc;
    }, {}),
    axisX: {
      labelInterpolationFnc: function(value, index) {
        //return index % (samplingFrequency * 2) === 0 ? `${(value).toFixed(2)}s` : null;
          // Cambia este valor para ajustar la frecuencia de las etiquetas
          const labelFrequency = samplingFrequency / 2; // Aumentar para menos etiquetas, reducir para más
          if (typeof value === 'number') {
            return index % labelFrequency === 0 ? `${value.toFixed(2)}s` : null;
          }
          return null;
        
      }
    }
  });
}

function updateChart() {
  currentIndex += segmentSize;
  if (currentIndex >= chartData.length) {
    clearInterval(interval);
    currentIndex = chartData.length - segmentSize;
  }
  const dataSegment = chartData.slice(currentIndex, currentIndex + segmentSize);
  const arrhythmiaSegment = arrhythmiaData.slice(Math.floor(currentIndex / segmentSize), Math.floor(currentIndex / segmentSize) + Math.ceil(dataSegment.length / segmentSize));
  renderChart(dataSegment, arrhythmiaSegment);
  updateProgress();
}
*/
function updateProgress() {
  const progressBar = document.getElementById('progress-bar');
  const progressTime = document.getElementById('progress-time');
  const progress = (currentIndex / totalSamples) * 100;
  progressBar.value = progress;

  const currentTime = currentIndex / samplingFrequency;
  progressTime.textContent = `${formatTime(currentTime)}/${formatTime(totalTime)}`;

  // Actualizar número de segmento
  currentSegment = Math.floor(currentIndex / segmentSize) + 1;
  document.querySelector('h2').textContent = `Segment ${currentSegment}`;

  // Mostrar estado de arritmia
  const arrhythmiaStatus = arrhythmiaData[currentSegment - 1];
  document.querySelector('h2').textContent += ` - Arrhythmia: ${arrhythmiaStatus}`;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function play() {
  if (!isPlaying) {
    isPlaying = true;
    clearInterval(interval);
    interval = setInterval(updateChart, 1000);
  }
}

function pause() {
  isPlaying = false;
  clearInterval(interval);
}

function forward() {
  currentIndex += segmentSize;
  if (currentIndex >= chartData.length) {
    currentIndex = chartData.length - segmentSize;
  }
  renderChart(chartData.slice(currentIndex, currentIndex + 2000));
  updateProgress();
}

function backward() {
  currentIndex -= segmentSize;
  if (currentIndex < 0) {
    currentIndex = 0;
  }
  renderChart(chartData.slice(currentIndex, currentIndex + 2000));
  updateProgress();
}

