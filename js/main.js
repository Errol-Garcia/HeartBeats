
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

  $('#sidebarCollapse').on('click', function () {
    $('#sidebar').toggleClass('active');
  });

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

  $("#form_upload_arrhythmia").validate({
    rules: {
      fileInput: {
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
      fileInput: {
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

  $("#form_upload_arrhythmia").submit(function (e) {
    const predictArea = $(".predict-area");
    const btnSubmit = $("#btn_submit");
    const btnClean = $("#btn_clean");

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

      const formContainer = document.getElementById('formContainer');
      const Container = document.getElementById('upload-area');
      $.ajax({
        url: "http://127.0.0.1:5003",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
          console.log(response.filename);
          response1 = response;
          enableBtnSubmit();
          $("#upload-area").empty();
          fetchECGData(response['fileName'])
            .then((data) => plotECG(data));
        formContainer.classList.remove('hidden');

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

  //PREDICCIÓN DE LOS
  $("#form_predict_arrhythmia").submit(function (e) {
    
    disableBtnSubmit();
    e.preventDefault();
    console.log("file name 1: ", response1["fileName"]);

    var Data = {
      fileNames: response1["fileName"]
    };
    
    const formContainer = document.getElementById('formContainer');
    const ContainerSignal = document.getElementById('ContainerPredict');

    $.ajax({
      url: "http://127.0.0.1:5003/predict",
      type: "POST",
      data: JSON.stringify(Data),
      contentType: "application/json",
      processData: false,
      success: function (data) {
        stopPlot();
        $("#formContainer").empty();
        ContainerSignal.classList.remove('hidden');

        samplingFrequency = data.sampling_frequency;
        segmentSize = Math.floor(samplingFrequency);
        totalSamples = data.total_samples;
        chartData = data.data;
        arrhythmiaData = data.arrhythmia; // Asumimos que estos datos están en el JSON de respuesta
        numSegments = data.num_segments;
        totalTime = totalSamples / samplingFrequency;
        renderChart(chartData.slice(0, 2000));
        updateProgress();
      },
      error: function (xhr, status, error) {
        $("#txtErrorUpload").removeClass('hidden');
        enableBtnUpload();
      },
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  var input1 = document.getElementById("fileInput1");
  var input2 = document.getElementById("fileInput2");
  var input3 = document.getElementById("fileInput3");

  if (input1) {
    input1.addEventListener("change", function (event) {
      var inputFile = event.target;
      var fileName =
        inputFile.files.length > 0 ? inputFile.files[0].name : "Seleccionar";
      inputFile.nextElementSibling.innerText = fileName;
    });
  }

  if (input2) {
    input2.addEventListener("change", function (event) {
      var inputFile = event.target;
      var fileName =
        inputFile.files.length > 0 ? inputFile.files[0].name : "Seleccionar";
      inputFile.nextElementSibling.innerText = fileName;
    });
  }

  if (input3) {
    input3.addEventListener("change", function (event) {
      var inputFile = event.target;
      var fileName =
        inputFile.files.length > 0 ? inputFile.files[0].name : "Seleccionar";
      inputFile.nextElementSibling.innerText = fileName;
    });
  }
});

function getStatusbtnSubmit() {}

function mostarAlertaUpload() {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Los archivos cargados deben tener el mismo nombre",
  });
}

// IMPLEMENTACIÓN DE LA GRÁFICA

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

async function fetchECGData(filename) {
  const response = await fetch("http://127.0.0.1:5003/ecg/" + filename);
  const data = await response.json();
  return data;
}

//IMPRESION FUNCIONAL DE GRAFICA
let intervalId;  

function plotECG(data) {
  const trace = {
    y: data.slice(0, 1000),
    type: "scatter",
    mode: "lines",
    line: {
      color: "#000",
      width: 1,
    },
  };

  const layout = {
    xaxis: {
      title: "Time (ms)",
      titlefont: {
        size: 16,
        color: "#333",
      },
      range: [0, 1000],
      tickfont: {
        size: 14,
        color: "#333",
      },
      fixedrange: true,
    },
    yaxis: {
      title: "Amplitude (mV)",
      titlefont: {
        size: 16,
        color: "#333",
      },
      tickfont: {
        size: 14,
        color: "#333",
      },
      fixedrange: true,
    },
    plot_bgcolor: "rgba(255, 255, 255, 0.9)",
    paper_bgcolor: "#f4f4f4",
    dragmode: false,
    modeBarButtonsToRemove: ["toImage"],
    modeBarButtonsToAdd: [],
  };
  const config = { responsive: true };
  Plotly.newPlot("ecg-plot", [trace], layout, config);

  const samplingRate = 360;
  const interval = 1000 / samplingRate;
  let currentIndex = 1000;

  intervalId = setInterval(() => {
    if (currentIndex < data.length) {
      const newData = data.slice(currentIndex, currentIndex + 1);
      const update = {
        y: [[newData[0]]],
      };
      Plotly.extendTraces("ecg-plot", update, [0]);
      currentIndex += 1;

      Plotly.relayout("ecg-plot", {
        "xaxis.range": [currentIndex - 1000, currentIndex],
      });
    }
  }, interval);
}



function recargar(){
  window.location.reload();
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
  document.querySelector('h2').textContent = `ECG Visualization - Segment ${currentSegment}`;

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



function stopPlot() {
  clearInterval(intervalId);  // Detiene el intervalo
}


document.getElementById('btn_clean2').addEventListener('click', function () {
  recargar();
});
document.getElementById('btn_clean3').addEventListener('click', function () {
  recargar();
});