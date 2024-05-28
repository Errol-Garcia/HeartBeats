<?
    if(isset($_POST["submit"])){
        $archivo_name = $_FILES["file"]["name"];
        $archivo_temporal =$_FILES["file"]["tmp_name"];
        $destino = "./files/$archivo_name";

        move_uploaded_file($archivo_temporal,$destino);

        header("Location: preprocesar_python.php?file=$destino");

        exit();
    }

?>