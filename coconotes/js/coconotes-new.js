console.log("test");

$( document ).ready(function() {
    console.log( "ready!" );
    $('.ui.sticky')
      .sticky({
        context: '#coco-go'
      })
    ;
    $('.ui.sticky')
      .sticky({
        context: '#coco-cancel'
      })
    ;
    $('.ui.dropdown')
      .dropdown({
        allowAdditions: true,
        useLabels: true
      })
    ;
});
