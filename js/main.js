// document.addEventListener(DOMContentLoaded, function(){

// });

$(document).ready(function () {
  var response1 = "";
  var response2 = "";
  var response3 = "";

  $.validator.addMethod(
    "filesEqual",
    function (value, element, params) {
      // Obtener el nombre del archivo sin la extensión
      function getFileNameWithoutExtension(fileInput) {
        let fileName = $(fileInput).val().split("\\").pop().split(".")[0];
        return fileName;
      }

      // Obtener los nombres de los archivos sin la extensión
      let fileInput1Name = getFileNameWithoutExtension(params[0]);
      let fileInput2Name = getFileNameWithoutExtension(params[1]);
      let fileInput3Name = getFileNameWithoutExtension(params[2]);

      console.log("fileInput1Name:", fileInput1Name);
      console.log("fileInput2Name:", fileInput2Name);
      console.log("fileInput3Name:", fileInput3Name);

      // Comprobar si los nombres son iguales
      return (
        fileInput1Name === fileInput2Name && fileInput1Name === fileInput3Name
      );
    },
    "Todos los archivos deben tener el mismo nombre"
  );

  console.log("pase por aquí 1");
  $("#form_upload_arrhythmia").validate({
    rules: {
      fileInput: {
        required: true,
        // filesEqual: ["#fileInput", "#fileInput2", "#fileInput3"], // Aplicar la regla personalizada
      },
      fileInput2: {
        required: true,
        // equalTo: "#fileInput",
      },
      fileInput3: {
        required: true,
        // equalTo: "#fileInput",
      },
    },
    messages: {
      fileInput: {
        required: "Por favor cargue un registro",
        filesEqual: "Todos los archivos deben tener el mismo nombre",
      },
      fileInput2: {
        required: "Por favor cargue un registro",
        equalTo: "Los archivos deben tener el mismo nombre",
      },
      fileInput3: {
        required: "Por favor cargue un registro",
        equalTo: "Los archivos deben tener el mismo nombre",
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

    // if (isEmpty() == false) {
    getStatusbtnSubmit();

    var formData = new FormData();
    // var formData2 = new FormData();
    // var formData3 = new FormData();

    var fileInput = $("#fileInput")[0].files[0];
    var fileInput2 = $("#fileInput2")[0].files[0];
    var fileInput3 = $("#fileInput3")[0].files[0];

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

    // $.post(
    //   "http://localhost:5000/",
    //   $("#form_upload_arrhythmia").serialize(),
    //   function (data) {
    //     Swal.fire({
    //       title: "El precio de la vivienda es: $" + data,
    //       icon: "success",
    //       showConfirmButton: true,
    //       confirmButtonText: "Ok",
    //     }).then((result) => {
    //       if (result.isConfirmed) {
    //         resetForm();
    //       } else {
    //         resetForm();
    //       }
    //     });
    //   }
    // );
    // }
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

function validateData(Data_name1, Data_name2, Data_name3) {}
