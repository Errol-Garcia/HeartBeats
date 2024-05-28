<?php
    $archivo = $_GET["file"];
    $output = shell_exec("python procesar_archivo.py $archivo");
    echo $output;
?>