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

  $("#form_upload_arrhythmia").validate({
    rules: {
        fileInput: {
        required: true,
        extensionFile1: ["#fileInput"],
      },
    },
    messages: {
        fileInput: {
        required: "Por favor cargue un registro",
        extensionFile1: "La extensión no es la solicitada, debe ser (.dat)",
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

$("#form_upload_arrhythmia").submit(function (e) {
  const predictArea = $(".predict-area");
  const btnSubmit = $("#btn_submit");
  const btnClean = $("#btn_clean");
  const download = $("#download-btn");

  e.preventDefault();

  getStatusbtnSubmit();

  var formData = new FormData();

  var fileInput = $("#fileInput")[0].files[0];

  formData.append("file", fileInput);
    
  const Container = document.getElementById('segmentacion-container');
  const ContainerButton = document.getElementById('segmentacion-button');
  $.ajax({
    url: "http://127.0.0.1:5003/predict-only",
    type: "POST",
    data: formData,
    contentType: false,
    processData: false,
    success: function (response) {
      console.log(response.filename);
      response1 = response;
      enableBtnSubmit();
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

document.addEventListener("DOMContentLoaded", function () {
  var input1 = document.getElementById("fileInput");

  if (input1) {
    input1.addEventListener("change", function (event) {
      var inputFile = event.target;
      var fileName =
        inputFile.files.length > 0 ? inputFile.files[0].name : "Seleccionar";
      inputFile.nextElementSibling.innerText = fileName;
    });
  }

});