<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Predicción de arritmias cardíacas</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <link rel="stylesheet" href="css/main.css">
    <script src="https://code.jquery.com/jquery-3.7.0.min.js"
        integrity="sha256-2Pmvv0kuTBOenSvLm6bvfBSSHrUJ+3A7x6P5Ebd07/g=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
        integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous">
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.min.js"
        integrity="sha384-fbbOQedDUMZZ5KreZpsbe1LCZPVmfTnH7ois6mU1QK+m14rQ1l2bGBq41eYeM/fS" crossorigin="anonymous">
    </script>
    <script src="https://cdn.jsdelivr.net/npm/jquery-validation@1.19.0/dist/jquery.validate.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="js/main.js"></script>
</head>

<body>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-sm-8">
                <!-- <form id="form_predict_price" action="#" method="post" class="mt-2 needs-validation" novalidate> -->
                <form id="form_upload_arrhythmia" action="#" method="post" novalidate="novalidate">
                    <h1 class="text-center mb-3">Predicción de arritmias cardíacas</h1>

                    <div class="row mb-3">
                        <label for="fileInput" class="col-sm-4 col-form-label">Registro 1 (.atr)</label>
                        <div class="col-sm-8">
                            <input type="file" name="fileInput" id="fileInput" class="form-control"
                                placeholder="Cargar archivo" required>
                        </div>
                    </div>

                    <div class="row mb-3">
                        <label for="fileInput2" class="col-sm-4 col-form-label">Registro 2 (.hea)</label>
                        <div class="col-sm-8">
                            <input type="file" name="fileInput2" id="fileInput2" class="form-control"
                                placeholder="Cargar archivo" required>
                        </div>
                    </div>

                    <div class="row mb-3">
                        <label for="fileInput3" class="col-sm-4 col-form-label">Registro 3 (.dat)</label>
                        <div class="col-sm-8">
                            <input type="file" name="fileInput3" id="fileInput3" class="form-control"
                                placeholder="Cargar archivo" required>
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-12 text-end">
                            <button type="submit" id="btn_submit" class="btn btn-primary w-25">Cargar Archivos</button>
                        </div>
                    </div>
                </form>
                <form id="form_predict_arrhythmia" action="#" method="post" novalidate="novalidate">

                    <div class="row mb-3">
                        <div class="col-12 text-end">
                            <button type="submit" id="btn_submit2" class="btn btn-primary w-25">Predecir</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

</body>

</html>