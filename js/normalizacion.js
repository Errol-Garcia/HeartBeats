
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
      if (fileInput == "atr") {
        return true;
      } else {
        return false;
      }
    },
    "la extension no es la adecuada"
  );
  $.validator.addMethod(
    "extensionFile2",
    function (value, element, params) {
      // Obtener el nombre del archivo sin la extensión
      var fileInput = value.split(".")[1];
      if (fileInput == "hea") {
        return true;
      } else {
        return false;
      }
    },
    "la extension no es la adecuada"
  );
  $.validator.addMethod(
    "extensionFile3",
    function (value, element, params) {
      // Obtener el nombre del archivo sin la extensión
      var fileInput = value.split(".")[1];
      if (fileInput == "dat") {
        return true;
      } else {
        return false;
      }
    },
    "la extension no es la adecuada"
  );


  $("#form_upload_arrhythmia_normalizacion").validate({
    rules: {
      fileInput1: {
        required: true,
        extensionFile1: ["#fileInput1"],
      },
      fileInput2: {
        required: true,
        extensionFile2: ["#fileInput2"],
      },
      fileInput3: {
        required: true,
        extensionFile3: ["#fileInput3"],
      },
    },
    messages: {
      fileInput1: {
        required: "Por favor cargue un registro",
        extensionFile1: "La extensión no es la solicitada, debe ser (.atr)",
      },
      fileInput2: {
        required: "Por favor cargue un registro",
        extensionFile2: "La extensión no es la solicitada, debe ser (.hea)",
      },
      fileInput3: {
        required: "Por favor cargue un registro",
        extensionFile3: "La extensión no es la solicitada, debe ser (.dat)",
      },
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

$("#form_upload_arrhythmia_normalizacion").submit(function (e) {
  const predictArea = $(".predict-area");
  const btnSubmit = $("#btn_submit");
  const btnClean = $("#btn_clean");
  const download = $("#download-btn");

  console.log("pase por aquí 2");
  e.preventDefault();

  getStatusbtnSubmit();

  var formData = new FormData();

  var fileInput = $("#fileInput1")[0].files[0];
  var fileInput2 = $("#fileInput2")[0].files[0];
  var fileInput3 = $("#fileInput3")[0].files[0];

  console.log("fileInput1Name:", fileInput["name"].split(".")[0]);
  console.log("fileInput2Name:", fileInput2["name"].split(".")[0]);
  console.log("fileInput3Name:", fileInput3["name"].split(".")[0]);

  if (
    fileInput["name"].split(".")[0] != fileInput2["name"].split(".")[0] ||
    fileInput["name"].split(".")[0] != fileInput3["name"].split(".")[0]
  ) {
    mostarAlertaUpload();
  } else {
    formData.append("file", fileInput);
    formData.append("file2", fileInput2);
    formData.append("file3", fileInput3);

    $("#txtErrorUpload").addClass('hidden');
    const Container = document.getElementById('normalizacion-container');
    const ContainerButton = document.getElementById('normalizacion-button');
    const ContainerView = document.getElementById('view-area');
    $.ajax({
      url: "http://127.0.0.1:5003/normalizacion",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (response) {
        console.log(response.filename);
        response1 = response;
        enableBtnSubmit();
        filename = response['fileName']
        fileEvento = response['fileEvento']
        let path = '../api/files/';
        let downloadBtn = document.getElementById('download-btn');
        let downloadBtnEvento = document.getElementById('download-btn-event');
        downloadBtn.setAttribute('data-path', `${path}${filename}`);
        downloadBtnEvento.setAttribute('data-path', `${path}${fileEvento}`);
        Container.classList.remove('hidden');
        ContainerView.classList.remove('hidden');

        samplingFrequency = response.response.sampling_frequency;
        segmentSize = Math.floor(samplingFrequency);
        totalSamples = response.response.total_samples;
        chartData = response.response.data;
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
  }
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

document.getElementById('download-btn-event').addEventListener('click', function () {
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

function getStatusbtnSubmit() { }

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
          labelInterpolationFnc: function(value, index) {
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

function updateProgress() {
  const progressBar = document.getElementById('progress-bar');
  const progressTime = document.getElementById('progress-time');
  const progress = (currentIndex / totalSamples) * 100;
  progressBar.value = progress;

  const currentTime = currentIndex / samplingFrequency;
  progressTime.textContent = `${formatTime(currentTime)}/${formatTime(totalTime)}`;

  document.querySelector('h2').textContent = `ECG Visualización`;
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
