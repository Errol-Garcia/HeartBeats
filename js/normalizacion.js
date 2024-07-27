$(document).ready(function(){
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
    
    const Container = document.getElementById('normalizacion-container');
    const ContainerButton = document.getElementById('normalizacion-button');
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
        let path = '../api/files/';
        let downloadBtn = document.getElementById('download-btn');
        downloadBtn.setAttribute('data-path', `${path}${filename}`);
        Container.classList.remove('hidden');

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

document.getElementById('download-btn').addEventListener('click', function() {
  var filePath = this.getAttribute('data-path');
  var a = document.createElement('a');
  a.href = filePath;
  a.download = filePath.split('/').pop();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

// document.addEventListener("DOMContentLoaded", function () {
//   var input1 = document.getElementById("fileInput1");
//   var input2 = document.getElementById("fileInput2");
//   var input3 = document.getElementById("fileInput3");

//   if (input1) {
//     input1.addEventListener("change", function (event) {
//       var inputFile = event.target;
//       var fileName =
//         inputFile.files.length > 0 ? inputFile.files[0].name : "Seleccionar";
//       inputFile.nextElementSibling.innerText = fileName;
//     });
//   }

//   if (input2) {
//     input2.addEventListener("change", function (event) {
//       var inputFile = event.target;
//       var fileName =
//         inputFile.files.length > 0 ? inputFile.files[0].name : "Seleccionar";
//       inputFile.nextElementSibling.innerText = fileName;
//     });
//   }

//   if (input3) {
//     input3.addEventListener("change", function (event) {
//       var inputFile = event.target;
//       var fileName =
//         inputFile.files.length > 0 ? inputFile.files[0].name : "Seleccionar";
//       inputFile.nextElementSibling.innerText = fileName;
//     });
//   }
// });