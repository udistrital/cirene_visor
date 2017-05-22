$(document).ready(function() {
  var sidebar = $('#sidebar').sidebar();
  $('.sidebar-tabs').on('click', function() {
    $zoomslider = $('.ol-zoomslider');
    $zoomslider.css('opacity', '0.0');
    if (!$zoomslider.hasClass('desplegado')) {
      $zoomslider.addClass('desplegado');
    } else {
      $zoomslider.removeClass('desplegado');
    }
    $zoomslider.animate({
      opacity: "1.0"
    }, 5000);
  });
  $('.carousel').carousel();
  $('select').material_select();
  $('.modal').modal();
})
