// Ocultar el scrollbar inicialmente
$("body").css("overflow", "hidden");

// Ocultar la pantalla de carga cuando la página y todos los elementos estén listos
$(window).on("load", function () {
    // Mostrar el scrollbar
    $("body").css("overflow", "auto");
    
    $("#loader").fadeOut("slow");
});