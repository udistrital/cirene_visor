$(document).ready(function() {
  var sidebar = $('#sidebar').sidebar();
  // $('.sidebar-tabs').on('click', function() {
  //   var zoomslider = $('.ol-zoomslider');
  //   var zoom = $('.ol-zoom');
  //   zoomslider.css('margin-left',(zoom.offset().left-6) + 'px');
  // });
  $('.carousel').carousel();
  $('select').material_select();
  $('.modal').modal();
})
