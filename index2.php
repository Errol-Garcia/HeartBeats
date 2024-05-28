<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arrhythmia Predictor</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <link rel="stylesheet" href="css/main.css">

    <!-- <script>
    $(function() {
        $.get("files_scaner.php", function(data) {

            datos = JSON.parse(data);
            if (datos[0] == 1) {
                $(".i_load_data").attr('style', 'color: #1cc88a !important;');
            }
            if (datos[1] == 1) {
                $(".i_clean").attr('style', 'color: #1cc88a !important;');
            }
            if (datos[2] == 1) {
                $(".i_fit").attr('style', 'color: #1cc88a !important;');
            }
        });

        cardid = "load_data";
        $(".container").hide();
        $("#" + cardid).show();

        $("#btn_load_data").click(function(e) {
            e.preventDefault();
            var formData = new FormData();
            var fileInput = $('#fileInput')[0].files[0];
            formData.append('file', fileInput);

            $.ajax({
                url: 'http://127.0.0.1:5000/upload',
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function(response) {
                    $('#response_load').html(response);
                    $('.i_load_data').attr('style', 'color: #1cc88a !important;');

                }
            });
        })

    })
    </script> -->
</head>

<body>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-sm-8">
                <!-- <form id="form_predict_price" action="#" method="post" class="mt-2 needs-validation" novalidate> -->
                <form id="form_predict_arrhythmia" action="#" method="post" novalidate="novalidate">
                    <h1 class="text-center mb-3">Predecir arritmias cardíacas</h1>

                    <div class="col-sm-8">
                        <div class="p-5">
                            <div class="text-center">
                                <h1 class="h4 text-gray-900 mb-4">Cargar datos</h1>
                            </div>
                            <form class="user" form method="POST" action="#" id="frm_licence"
                                enctype="multipart/form-data">

                                <!-- -->
                                <div class="form-group row">
                                    <div class="col-sm-12 mb-3 mb-sm-0">
                                        <input type="file" class="form-control" id="fileInput" name="fileInput"
                                            placeholder="">
                                    </div>

                                </div>
                                <hr>

                            </form>
                            <h1 id="response_load"></h1>


                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-12 text-end">
                            <button type="submit" id="btn_submit" class="btn btn-primary w-25">Predecir</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

</body>

</html>