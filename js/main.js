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

  console.log("pase por aquí 1");
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

      // $.ajax({
      //   url: "http://127.0.0.1:5003/",
      //   type: "POST",
      //   data: formData,
      //   contentType: false,
      //   processData: false,
      //   success: function (response) {
      //     response1 = response;
      //     $("#response_load").html(response);
      //     $(".i_load_data").attr("style", "color: #1cc88a !important;");
      //   },
      // });
      const formContainer = document.getElementById('formContainer');
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

          fetchECGData(response['fileName'])
            //.then((response) => response.json())
            .then((data) => plotECG(data));

          // let predictHTML = `
          //             <form id="form_predict_arrhythmia" action="#" method="post" novalidate="novalidate">
          //                 <h3 class="card-title text-center col-lg-12 mt-2 mb-2">Ritmo Cardiaco</h3>
  
          //                 <div class="col-lg-12 text-center mb-2">
          //       <div id="ecg-plot"></div>
          //                 </div>
  
          //                 <div class="col-lg-12 text-end">
          //                     <button type=" submit" id="btn_submit" class="btn btn-dark"><i
          //                             class="fa-solid fa-brain"></i>
          //                         Predecir</button>
          //                 </div>
          //             </form>
          //         `;

          // predictArea.html(predictHTML);
        formContainer.classList.remove('hidden');

        },
      });

      disableBtnSubmit();

      btnClean.on("click", function () {
        predictArea.empty();
        btnSubmit.removeAttr("disabled");
        $("#btn_clean").addClass("d-none");
        // $("#form_upload_arrhythmia").trigger("reset");
        location.reload();
      });
    }
  });

  //PREDICCIÓN DE LOS
  $("#form_predict_arrhythmia").submit(function (e) {
    
    e.preventDefault();
    console.log("pase por aquí 3");
    // e.preventDefault();

    console.log("file name 1: ", response1["fileName"]);

    var Data = {
      fileNames: response1["fileName"]
    };

    
    const Container = document.getElementById('signal-ECG');

    $.ajax({
      url: "http://127.0.0.1:5003/predict",
      type: "POST",
      data: JSON.stringify(Data),
      contentType: "application/json",
      processData: false,
      success: function (data) {
        var datosall;
        fetch('./api/datos.json')  // Ruta al archivo JSON
            .then(response => response.json())
            .then(data => {
                datosall=data;
                const initialData = data;

            const seriesData = [
                { name: 'No Arritmia', color: 'black', data: [] },
                { name: 'Con Arritmia', color: 'red', data: [] }
            ];

            // Crear el gráfico
            const chart = Highcharts.chart('ecg-plot2', {
                chart: {
                    type: 'line',
                    animation: Highcharts.svg, 
                },
                title: {
                    text: 'Cardiograma Animado'
                },
                xAxis: {
                    title: {
                        text: 'Tiempo'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Amplitud'
                    }
                },
                series: seriesData
            });

            
            let index = 0;
            const interval = 50; // Intervalo
            datos=initialData.datos.flat()
            function addPoint() {
                
                if (index < datos.length) {                    
                    
                    
                    if (index < 2000) {
                        for(i=0;i<80;i++){
                            const point =  { x: index, y: datos[index]};
                            chart.series[0].addPoint(point, true, false);
                            index+=1;
                        }
                    } 
                    else {
                        pointlast={ x: index-1, y: datos[index-1]}
                        if(index==2000)chart.series[1].addPoint(pointlast, true, false);
                        for(i=0;i<80;i++){
                            const point =  { x: index, y: datos[index]};
                            chart.series[1].addPoint(point, true, false);
                            index+=1;
                        }                        
                        
                    } 
                    
                    // Eliminar el punto más antiguo para mantener solo 578 puntos visibles
                    if (index>578){
                        for(i=0;i<100;i++){
                            if (chart.series[0].data.length > 0) {
                                chart.series[0].data[0].remove(false);
                            }
                            else{
                                chart.series[1].data[0].remove(false);
                            }

                        }
                        
                        
                    }
                   
                    chart.redraw();
                    //index+=1;
                    
                } else {
                    clearInterval(timer);
                }
            }

            const timer = setInterval(addPoint, interval);
            })
            .catch(error => console.error('Error al cargar los datos:', error));
          //                 <h3 class="card-title text-center col-lg-12 mt-2 mb-2">Ritmo Cardiaco</h3>
  
          //                 <div class="col-lg-12 text-center mb-2">
          //       <div id="ecg-plot"></div>
          //                 </div>
  
          //         `;

          // predictArea.html(predictHTML);
          
        // Container.classList.remove('hidden');
        
      
        // Container.classList.remove('hidden');
      },
      error: function (xhr, status, error) {
        console.error("Error en la solicitud: " + status + ", " + error);
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

async function fetchECGData(filename) {
  const response = await fetch("http://127.0.0.1:5003/ecg/" + filename);
  const data = await response.json();
  return data;
}

//IMPRESION FUNCIONAL DE GRAFICA

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

  setInterval(() => {
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

function plotECG2(data) {
  var datosall;
  datosall=data;
  const initialData = data;

  const seriesData = [
    { name: 'No Arritmia', color: 'black', data: [] },
    { name: 'Con Arritmia', color: 'red', data: [] }
  ];

// Crear el gráfico
  const chart = Highcharts.chart('ecg-plot2', {
    chart: {
        type: 'line',
        animation: Highcharts.svg, 
    },
    title: {
        text: 'Cardiograma Animado'
    },
    xAxis: {
        title: {
            text: 'Tiempo'
        }
    },
    yAxis: {
        title: {
            text: 'Amplitud'
        }
    },
    series: seriesData
  });


  let index = 0;
  const interval = 50; // Intervalo
  datos=initialData.datos.flat()
  function addPoint() {
  
  if (index < datos.length) {                    
      
      
      if (index < 2000) {
          for(i=0;i<15;i++){
              const point =  { x: index, y: datos[index]};
              chart.series[0].addPoint(point, true, false);
              index+=1;
          }
      } 
      else {
          pointlast={ x: index-1, y: datos[index-1]}
          if(index==2000)chart.series[1].addPoint(pointlast, true, false);
          for(i=0;i<15;i++){
              const point =  { x: index, y: datos[index]};
              chart.series[1].addPoint(point, true, false);
              index+=1;
          }                        
          
      } 
      
      // Eliminar el punto más antiguo para mantener solo 578 puntos visibles
      if (index>578){
          for(i=0;i<100;i++){
              if (chart.series[0].data.length > 0) {
                  chart.series[0].data[0].remove(false);
              }
              else{
                  chart.series[1].data[0].remove(false);
              }

          }
          
          
      }
      
      chart.redraw();
      //index+=1;
      
  } else {
      clearInterval(timer);
  }
}

const timer = setInterval(addPoint, interval);
}
 