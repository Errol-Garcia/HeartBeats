$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
      $('#sidebar').toggleClass('active');
    });
  });
  
  document.getElementById('card1').addEventListener('click', function() {
    window.location.href = './pages/normalizacion.html';
  });
  
  document.getElementById('card2').addEventListener('click', function() {
    window.location.href = './pages/completo.html'; // Cambia esta URL por la que desees
  });