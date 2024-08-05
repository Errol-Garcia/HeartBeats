$(document).ready(function(){
    var response1 = "";

  $.validator.addMethod(
    "extensionFile1",
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
  $.validator.addMethod(
    "extensionFile2",
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


  $("#form_upload_arrhythmia_segmentacion").validate({
    rules: {
        fileInputNormalizado: {
        required: true,
        extensionFile1: ["#fileInputNormalizado"],
      },
        fileInputEvents: {
        required: true,
        extensionFile1: ["#fileInputEvents"],
      },
      fileInputPQRS: {
        required: true,
        extensionFile2: ["#fileInputPQRS"],
      },
    },
    messages: {
        fileInputNormalizado: {
        required: "Por favor cargue un registro",
        extensionFile1: "La extensión no es la solicitada, debe ser (.dat)",
      },
      fileInputEvents: {
        required: "Por favor cargue un registro",
        extensionFile2: "La extensión no es la solicitada, debe ser (.dat)",
      },
      fileInputPQRS: {
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

$("#form_upload_arrhythmia_segmentacion").submit(function (e) {
  const predictArea = $(".predict-area");
  const btnSubmit = $("#btn_submit");
  const btnClean = $("#btn_clean");
  const download = $("#download-btn");

  e.preventDefault();

  getStatusbtnSubmit();

  var formData = new FormData();

  var fileInput = $("#fileInputNormalizado")[0].files[0];
  var fileInput2 = $("#fileInputPQRS")[0].files[0];
  var fileInput3 = $("#fileInputEvents")[0].files[0];

  formData.append("normalizacion", fileInput);
  formData.append("pqrs", fileInput2);
  formData.append("eventos", fileInput3);
    
  const Container = document.getElementById('segmentacion-container');
  const ContainerButton = document.getElementById('segmentacion-button');
  $.ajax({
    url: "http://127.0.0.1:5003/segmentacionMethod",
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

document.getElementById('download-btn').addEventListener('click', function() {
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

function getStatusbtnSubmit() {}

function mostarAlertaUpload() {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Los archivos cargados deben tener el mismo nombre",
  });
}