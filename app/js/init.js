$(document).ready(function() {
  var sidebar = $('#sidebar').sidebar().on('click', function() {
    $zoomslider = $('.ol-zoomslider');
    $zoomslider.css('visibility', 'hidden');
    if (!$zoomslider.hasClass('desplegado')) {
      setTimeout(function(){
        $zoomslider.addClass('desplegado');
        $zoomslider.css('visibility', 'visible');
      },400);
    } else {
      setTimeout(function(){
        $zoomslider.removeClass('desplegado');
        $zoomslider.css('visibility', 'visible');
      },400);
    }
  });
  $('.carousel').carousel();
  $('select').material_select();
  $('.modal').modal();
})
