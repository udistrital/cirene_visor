$(document).ready(function() {
  var sidebar = $('#sidebar').sidebar();
  window.sidebar = sidebar;
  $('.carousel').carousel();
  $('select').material_select();
  $('.modal').modal();
  // $('select').on('contentChanged', function() {
  //   // re-initialize (update)
  //   $(this).material_select();
  // });
  //$('ul.tabs').tabs();
});
