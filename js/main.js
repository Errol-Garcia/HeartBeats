// document.addEventListener(DOMContentLoaded, function(){

// });

$(document).ready(function () {
  var response1 = "";
  var response2 = "";
  var response3 = "";

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
        extensionFile1: ["#fileInput"],
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
    console.log("pase por aquí 2");
    e.preventDefault();

    getStatusbtnSubmit();

    var formData = new FormData();

    var fileInput = $("#fileInput")[0].files[0];
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

      $.ajax({
        url: "http://127.0.0.1:5003/",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
          response1 = response;
          $("#response_load").html(response);
          $(".i_load_data").attr("style", "color: #1cc88a !important;");
        },
      });
    }
  });

  $("#form_predict_arrhythmia").submit(function (e) {
    console.log("pase por aquí 3");
    // e.preventDefault();

    console.log("file name 1: ", response1["fileName1"]);
    console.log("file name 2: ", response1["fileName2"]);
    console.log("file name 3: ", response1["fileName3"]);

    var Data = {
      fileNames: [
        response1["fileName1"],
        response1["fileName2"],
        response1["fileName3"],
      ],
    };

    $.ajax({
      url: "http://127.0.0.1:5003/predict",
      type: "POST",
      data: JSON.stringify(Data),
      contentType: "application/json",
      processData: false,
      success: function (response) {
        // $("#response_load").html(response);
        // $(".i_load_data").attr("style", "color: #1cc88a !important;");
      },
      error: function (xhr, status, error) {
        console.error("Error en la solicitud: " + status + ", " + error);
      },
    });
  });
});

// function isEmpty() {
//   console.log("pase por aquí empty");
//   const fileInput = $("#fileInput").val();
//   if (fileInput.isEmpty()) {
//     return true;
//   }
//   return false;
// }

function getStatusbtnSubmit() {
  // $("#btn_submit").attr("disabled", true);
  // $("#btn_submit").html(`
  //       <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
  //       Cargando...
  //   `);
}

// function resetForm() {
//   $("#form_upload_arrhythmia").trigger("reset");
//   $("#btn_submit").attr("disabled", false);
//   $("#btn_submit").html("Predecir");
//   window.location.href = "/Detector-de-arritmias/";
// }

function mostarAlertaUpload() {
  // document.getElementById("alertNames").classList.add("hidden");
  // document.getElementById('showModalBtn').addEventListener('click', function () {
  // var myModal = new bootstrap.Modal(document.getElementById("myModal"));
  // myModal.show();
  // myModal.hide();
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Los archivos cargados deben tener el mismo nombre",
    // footer: '<a href="#">Why do I have this issue?</a>'
  });

  // Swal.fire({
  //   icon: "error",
  //   title: "Oops...",
  //   text: "Los archivos cargados deben tener el mismo nombre",
  //   confirmButtonText: "Ok",
  // }).then((result) => {
  //   if (result.isConfirmed) {
  //     // location.reload();
  //   }
  // });
}
function ocultarAlertaUpload() {
  // document.getElementById("alertNames").classList.add("hidden");
  // location.reload();
}
