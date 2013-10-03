function updatePreview(ev){
  console.log("Updating preview...")
  var md = $('#editor').val();
  var html = marked(md);
  var $html = $('<div>' + html + '</div>');
  g_html = html;

  var i = 0;
  var slideStyles = ['btn-primary', 'btn-success', 'btn-info',
    'btn-warning', 'btn-danger'];

  $html.find('h1').each(function(){
    var $h1 = $(this);
    var name = $h1.text();
    console.log("Section: " + name);
    var slug = _.slugify(name);

    $h1.nextUntil('h1').andSelf().wrapAll(
      '<div class="slide-outer"><div class="slide-inner"/></div>'
    );

    var $outer = $h1.closest('div.slide-outer');
    $outer.addClass(slideStyles[i++ % slideStyles.length]);
    //resizeSection($outer);

    $outer.attr('id', slug);

    $("#nav-box > ul").append(
      $('<li></li>').html(
        $("<a></a>").text(name).attr('href', '#' + slug)
      )
    );
  });
  $('#preview').html($html.html());
  //$('#slideshow-pane').html($html.html());
}

var editorChangeHandler = _.debounce(updatePreview, 500, false);

function slideshowClickHandler(ev){
  $('#slideshow-pane').html($('#preview').html());
  $('#slideshow-pane .slide-outer').height($(window).height());
  $('#main').hide();
  $('#slideshow').show();
}

function editClickHandler(ev){
  $('#slideshow').hide();
  $('#main').show();
}

function saveClickHandler(ev){
  function downloadURL(url) {
      var hiddenIFrameID = 'hiddenDownloader',
          iframe = document.getElementById(hiddenIFrameID);
      if (iframe === null) {
          iframe = document.createElement('iframe');
          iframe.id = hiddenIFrameID;
          iframe.style.display = 'none';
          document.body.appendChild(iframe);
      }
      iframe.src = url;
  };

  console.log('saving');
  var blob = new Blob([$('#editor').val()], {type: 'application/x-please-download'});
  var url = window.URL.createObjectURL(blob);
  // window.location = url; // might be really bad
  // OR
  // downloadURL(url);
  // OR
  // use downloadify https://github.com/dcneiner/Downloadify
  // OR
  // upload to a gist?
  // OR
  // Another way: http://html5-demos.appspot.com/static/a.download.html
}

function loadClickHandler(ev){

}

function resizeSlideshow(ev){
  if ($('#slideshow').is(':visible')){
    console.log("Resize to: " + $(window).height() + 'px');
    $('#slideshow-pane .slide-outer').height($(window).height());
    //refreshScrollspy();
  }
}


$(window).load(function(){
  $('#btn-slideshow').click(slideshowClickHandler);
  $('#btn-edit').click(editClickHandler);
  $('#btn-save').click(saveClickHandler);
  $('#btn-load').click(loadClickHandler);

  $('#editor').keyup(editorChangeHandler);

  $(window).resize(_.debounce(resizeSlideshow, 1, false));
  //$(window).resize(resizeSlideshow);

});

$(document).ready(function(){
  editorChangeHandler();
});

