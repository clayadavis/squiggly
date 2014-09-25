cookieName = 'squigglyText='

function writeCookie(md){
  document.cookie = cookieName + encodeURIComponent(md);
}

function readCookie(){
  var ca = document.cookie.split(';');
  for (i=0; i < ca.length; i++){
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1);
    if (c.indexOf(cookieName) != 1) {
      return decodeURIComponent(c.substring(cookieName.length, c.length));
    }
  }
}

function updatePreview(ev){
  console.log("Updating preview...")
  var md = $('#editor').val();
  var html = marked(md);
  var $html = $('<div>' + html + '</div>');
  g_html = html;
  writeCookie(md);

  var i = 0;
  var slideStyles = ['btn-primary', 'btn-success', 'btn-info',
    'btn-warning', 'btn-danger'];

  $html.find('h1').each(function(){
    var $h1 = $(this);
    var name = $h1.text();
    console.log("Section: " + name);
    var slug = _.slugify(name);

    $h1.nextUntil('h1').andSelf().wrapAll(
      '<div class="slide-outer"><div class="slide-inner hleft vtop"/></div>'
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

  $('#preview > .slide-outer').mouseenter(previewMouseEnter);
  $('#preview > .slide-outer').mouseleave(previewMouseLeave);
  //$('#slideshow-pane').html($html.html());
}

var editorChangeHandler = _.debounce(updatePreview, 500, false);

function slideshowClickHandler(ev){
  $('#slideshow-pane').html($('#preview').html());
  $('#slideshow-pane .slide-outer').height($(window).height()
                                  ).addClass('disabled');
  $('#main').hide();
  $('#slideshow').show();
  g_currentSlide = 0;
}

function goToSlide(n){
  var selector = '#slideshow-pane .slide-outer:eq(' + n + ')';
  if ($('#slideshow').is(':visible')){
    $.scrollTo(selector, 400);
  }
  console.log('Scroll to slide ' + n);
}

function nextSlide(){
  g_currentSlide = Math.min(
    g_currentSlide + 1, $('#slideshow-pane .slide-outer').length - 1
  );
  goToSlide(g_currentSlide);
}

function prevSlide(){
  g_currentSlide = Math.max(g_currentSlide - 1, 0);
  goToSlide(g_currentSlide);
}

function editClickHandler(ev){
  $('#slideshow').hide();
  $('#main').show();
}

function saveFile(ev){
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
  downloadURL(url);
  // could downloadify https://github.com/dcneiner/Downloadify
  // Another way: http://html5-demos.appspot.com/static/a.download.html
}

function saveGist(ev){
  var text = $('#editor').val();
  var gist= {
    "description": "A saved squiggly presentation.",
    "public": false,
    "files": {
      "squiggle.md": {
        "content": text
      }
    }
  }
  $.ajax({
    type: "POST",
    url: 'https://api.github.com/gists',
    data: JSON.stringify(gist),
    dataType: 'json'
  }).done(function(resp){
      var raw = resp.files['squiggle.md'].raw_url;
      $('#editor-pane .buttonbar').prepend(
       '<div class="alert alert-success alert-dismissable">' +
       ' <button type="button" class="close" data-dismiss="alert"' +
       ' aria-hidden="true">&times;</button>' +
       ' <strong>Success!</strong> Saved to Gist' +
       '   <a href="' + resp.html_url + '">' + resp.html_url + '</a> .' +
       '   Don\'t lose that link! </div>')
      //window.open(resp.html_url);
      console.log('save success');
  }).fail(function(resp){
      $('#editor-pane .buttonbar').prepend(
       '<div class="alert alert-success alert-danger">' +
       '<button type="button" class="close" data-dismiss="alert"' +
       'aria-hidden="true">&times;</button>' +
       '  <strong>Warning!</strong> Failed to save your squiggle to Gist.' +
       '  Try again later.</div>')
      //window.open(resp.html_url);
      console.log('save failed');

  });
}

function loadGist(ev){
  //GET /gists/:id
  //$.ajax
  //var raw = data.files['squiggle.md'].raw_url;
  //$.ajax
  //$('#editor').val(data);
}

function loadClickHandler(ev){
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
    alert('File loading coming soon');
  } else {
    alert('The File APIs are not fully supported in this browser.');
  }
}

function loadThemes(){
  var themes = ['Amelia', 'Cerulean', 'Cosmo', 'Cyborg', 'Flatly', 'Journal',
                'Readable', 'Simplex', 'Slate', 'Spacelab', 'United'];
  var $ul = $('#menu-themes');
  for (i=0;i<themes.length;i++){
    var $li = $('<li id="theme-'+ themes[i].toLowerCase() +
                '" role="presentation">' +
                '<a role="menuitem" tabindex="-1" href="#">' +
                themes[i] + '</a></li>');
    $ul.append($li);
  }
  $ul.children().click(function(){
    $this = $(this);
    if ($this.hasClass('active')){
      return false;
    }
    var name = $this.text();
    if (name === 'Default'){
      var url =
        '//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css';
    } else {
      var url = '//netdna.bootstrapcdn.com/bootswatch/3.0.0/' +
                $this.text().toLowerCase() + '/bootstrap.min.css';
    }
    $('#css-bootstrap').attr('href', url);
    $this.addClass('active').siblings().removeClass('active');
  });
}

function resizeSlideshow(ev){
  if ($('#slideshow').is(':visible')){
    console.log("Resize to: " + $(window).height() + 'px');
    $('#slideshow-pane .slide-outer').height($(window).height());
    //refreshScrollspy();
  }
}

function previewMouseEnter(ev){
  var $this = $(this);
  var $as = $('#alignment-selector');
  clearTimeout($as.data('hideTimer'));
  var pos = $this.offset();
  var x = ($this.width() - $as.width())/2;
  var y = ($this.height() - $as.height())/2;
  $as.css('left', pos.left + x).css('top', pos.top + y).show();
  bindAlignmentSelector($this);
}

function bindAlignmentSelector($target){
  var $btns = $('#alignment-selector .btn');
  var $inner = $target.find('.slide-inner');
  $btns.unbind().click(function(){
    var $this = $(this);
    $this.addClass('active').siblings().removeClass('active');
    var myClass = $this.data('class');
    if (_(myClass).startsWith('h')){
      $inner.removeClass('hleft hcenter hright').addClass(myClass);
    } else {
      $inner.removeClass('vbottom vmid vtop').addClass(myClass);
    }
  });
  $btns.each(function(){
    var $btn = $(this);
    if ($inner.hasClass($btn.data('class'))){
      $btn.addClass('active').siblings().removeClass('active');
    }
  });
}

function previewMouseLeave(ev){
  var $as = $('#alignment-selector');
  var hideTimer = setTimeout(function(){$as.hide()},10);
  $as.data('hideTimer', hideTimer);
}

$(window).load(function(){
  $('#btn-slideshow').click(slideshowClickHandler);
  $('#btn-edit').click(editClickHandler);
  $('#btn-save').click(saveGist);
  $('#btn-load').click(loadClickHandler);

  $('#editor').keyup(editorChangeHandler);
  loadThemes();
  $(window).resize(_.debounce(resizeSlideshow, 1, false));
  //$(window).resize(resizeSlideshow);

  $('#alignment-selector').mouseenter(function(ev){
    clearTimeout($(this).data('hideTimer'));
  });

  $('#alignment-selector').mouseleave(function(ev){
    $as = $(this);
    var hideTimer = setTimeout(function(){$as.hide()},10);
    $as.data('hideTimer', hideTimer);
  });

  $('#alignment-selector .btn').click(function(){
    var $this = $(this);
    $this.addClass('active').siblings().removeClass('active');
    var myClass = $this.data('class');
    $target = function(){return $this.data('$target');}();
    console.log($target);
    if (_(myClass).startsWith('h')){
      $target.removeClass('hleft hcenter hright').addClass(myClass);
    } else {
      $target.removeClass('vbottom vmid vtop').addClass(myClass);
    }
  });

  $(document).keydown(function(ev) {
    if(ev.keyCode == 39 || ev.keyCode == 40){
      ev.preventDefault();
      nextSlide();
    } else if (ev.keyCode == 37 || ev.keyCode == 38){
      ev.preventDefault();
      prevSlide();
    }
  });

});

$(document).ready(function(){
  editorChangeHandler();
  var h = $('.buttonbar').height() + $('.buttonbar').position().top;
  $('#preview').height(h + 'px');
  if (readCookie()){
    $('#editor').val(readCookie());
  }
});

var g_currentSlide;
