$(document).ready(function () {

    $('#sidebarCollapse').on('click', function () {
      $('#sidebar').toggleClass('active');
    });
    
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
  
    $("#form_upload_arrhythmia_view").validate({
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
  
    $("#form_upload_arrhythmia_view").submit(function (e) {
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
  
  });
  
  
  function getStatusbtnSubmit() {}
  
  function mostarAlertaUpload() {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Los archivos cargados deben tener el mismo nombre",
    });
  }

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

  $(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
      $('#sidebar').toggleClass('active');
    });
  });
  
  function mostarAlertaUpload() {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Los archivos cargados deben tener el mismo nombre",
    });
  }