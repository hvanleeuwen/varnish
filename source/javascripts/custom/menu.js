var sidebarVisible = true;
var codeExpanded = false;
var windowSize = 0;

$( document ).ready(function() {

    windowSize = window.innerWidth;
    //change collapse icons depending on context
    if(window.innerWidth > 1024) {
        $(".collapse-toggle").html("Collapse " + feather.icons['chevron-left'].toSvg());
    }else{
        $(".collapse-toggle").html(feather.icons['x'].toSvg());
    }
    //show mobile sidebar
    $(".navbar-toggler").click(function(){
        showSidebarMobile();
     });

    //showing and hiding sidebar
    $(".collapse-toggle").click(function(){
        if(window.innerWidth > 1200) {
            if(! sidebarVisible) {
              //show the sidebar
              showSidebarDesktop();
            } else {
              hideSidebarDesktop();
            }
        } else {
            hideSidebarMobile();
        }
    });

    //attempt to smoothly handle resizing windows
    $(window).on('resize', function(){
        //nav is shown by default on desktop only
        if(window.innerWidth > 1200) {
            //reset css to desktop
            showSidebarDesktop();

            if(windowSize > 1200 && ! sidebarVisible) {
                hideSidebarDesktop();
            }
        }/* else { // this is redundant and triggers menu instability on mobile resize
            showSidebarDesktop();
            hideSidebarMobile();
        }*/

        checkForExtraPadding();

        windowSize = window.innerWidth;

        if(window.innerWidth < 768) {
          var $toTop = $('#to-top');
          $toTop.hide();
        }
    });

    //show scroll to top button after scrolling 500px, with 100ms "debounce"
    $(document).scroll(function() {
        var scrollTimer = window.scrollTimer || null;
        if (scrollTimer) {
          clearTimeout(scrollTimer);
        }
        window.scrollTimer = window.setTimeout(
          function() {
            var $this     = $(this);
            var y         = $this.scrollTop();
            var $toTop    = $('#to-top');
            var isVisible = $toTop.is(':visible');
            if (y > 500) {
                if(window.innerWidth > 768 && ! isVisible) {
                    $toTop.fadeIn();
                }
            } else if (isVisible) {
                $toTop.fadeOut();
            }
          },
          100
        );
    });

    //hide the mobile menu if a chapter section link is clicked
    $('.section-link').click(function(){
        if(window.innerWidth < 1200) {
            hideSidebarMobile();
        }
    });

    //expand all code button
    $("#expand-code").click(function(){
        if(codeExpanded == true) {
            $(".solution-button").not(".collapsed").click();
            codeExpanded = false;
            $("#expand-code").html("Expand All Solutions " + feather.icons['plus'].toSvg());
        } else {
            $(".solution-button.collapsed").click();
            codeExpanded = true;
            $("#expand-code").html("Collapse All Solutions " + feather.icons['minus'].toSvg());
        }
    });
  /* Search --------------------------*/
  /* Adapted from https://github.com/r-lib/pkgdown/blob/ae7363faac9040a473a54fb3d770decdfb8dfec1/inst/BS5/assets/pkgdown.js#L83-L152 */
  // Initialise search index on focus
  var fuse;
  $("#search-input").focus(async function(e) {
    if (fuse) {
      return;
    }

    $(e.target).addClass("loading");
    var response = await fetch($("#search-input").data("search-index"));
    var data = await response.json();

    var options = {
      keys: ["what", "text", "code"],
      ignoreLocation: true,
      threshold: 0.1,
      includeMatches: true,
      includeScore: true,
    };
    fuse = new Fuse(data, options);

    $(e.target).removeClass("loading");
  });

  // Use algolia autocomplete
  var options = {
    autoselect: true,
    debug: true,
    hint: false,
    minLength: 2,
  };
  var q;
  async function searchFuse(query, callback) {
    await fuse;

    var items;
    if (!fuse) {
      items = [];
    } else {
      q = query;
      var results = fuse.search(query, { limit: 20 });
      items = results
        .filter((x) => x.score <= 0.75)
        .map((x) => x.item);
      if (items.length === 0) {
        items = [{dir:"Sorry 😿",previous_headings:"",title:"No results found.",what:"No results found.",path:window.location.href}];
      }
    }
    callback(items);
  }
  $("#search-input").autocomplete(options, [
    {
      name: "content",
      source: searchFuse,
      templates: {
        suggestion: (s) => {
          if (s.title == s.what) {
            return `${s.dir} >	<div class="search-details"> ${s.title}</div>`;
          } else if (s.previous_headings == "") {
            return `${s.dir} >	<div class="search-details"> ${s.title}</div> > ${s.what}`;
          } else {
            return `${s.dir} >	<div class="search-details"> ${s.title}</div> > ${s.previous_headings} > ${s.what}`;
          }
        },
      },
    },
  ]).on('autocomplete:selected', function(event, s) {
    window.location.href = s.path + "?q=" + q + "#" + s.id;
  });
});

//needed to avoid the collapsed navbar overlapping main content
function checkForExtraPadding(){
    if(window.innerWidth > 1200 && window.innerWidth < 1352)
        {
            if(sidebarVisible == false) {
                $('.primary-content').css({
                'padding-left': '90px'
                 });
            }
        } else {
            $('.primary-content').css({
                'padding-left': ''});
        }
}

function showSidebarMobile(){
    // console.log('showSidebarMobile');
    var $sidebar        = $('#sidebar');
    var $sidebarCol     = $('#sidebar-col');
    var $primaryContent = $('.primary-content');
    var $sidebarInner   = $('.sidebar-inner');
    var $collapseToggle = $('.collapse-toggle');
    $collapseToggle.html(feather.icons['x'].toSvg());
    sidebarVisible = true;
    if(window.innerWidth < 768) {
        $sidebar.css({
            position: 'absolute',
            top: '150px',
            left: '0px',
            right: '0px'
        });
    } else {
       $sidebar.css({
            position: 'absolute',
            top: '200px',
            left: '0px',
            right: '0px'
        });
    }
    $sidebarCol.css({position:''});
    $sidebar.show();
    $sidebar.attr('aria-hidden', 'false');
}

function hideSidebarMobile(){
    // console.log('hideSidebarMobile');
    sidebarVisible = false;
    var $sidebar = $('#sidebar');
    $sidebar.hide();
    $sidebar.attr('tabindex', '-1'); // remove from tab order
    $sidebar.attr('aria-hidden', 'true'); // ensure not read by screen readers
}

function showSidebarDesktop(){
    // console.log('showSidebarDesktop');
    sidebarVisible = true;
    var $sidebar        = $('#sidebar');
    var $sidebarCol     = $('#sidebar-col');
    var $primaryContent = $('.primary-content');
    var $sidebarInner   = $('.sidebar-inner');
    var $collapseToggle = $('.collapse-toggle');
    $sidebar.css({
            position: 'relative',
            top: '0px'
        });
    $sidebarCol.attr('class', 'col-lg-4');
    $sidebarCol.css({
        position: 'relative',
        width:'',
        top: '',
        height: ''
    });
    $primaryContent.attr('class', "col-xl-8 primary-content");
    $sidebarInner.css('visibility', 'visible');
    $collapseToggle.html("Collapse " + feather.icons['chevron-left'].toSvg());
    $sidebar.attr('aria-hidden', 'false');
    $collapseToggle.attr('aria-expanded', 'true');
    $sidebar.show();
    checkForExtraPadding();
}

function hideSidebarDesktop(){
    // console.log('hideSidebarDesktop');
    sidebarVisible = false;
    var $sidebar        = $('#sidebar');
    var $sidebarCol     = $('#sidebar-col');
    var $primaryContent = $('.primary-content');
    var $sidebarInner   = $('.sidebar-inner');
    var $collapseToggle = $('.collapse-toggle');
    $sidebarInner.css('visibility', 'hidden');
    $collapseToggle.html("Expand " + feather.icons['chevron-right'].toSvg());
    $sidebarCol.css({
        position: 'absolute',
        left: '-10px',
        width:'115px',
        height: ($('#sidebar-col').height())
    });
    $sidebarCol.attr('class', 'col-lg-1');
    $primaryContent.attr('class', "col-lg-12 primary-content");
    $sidebar.attr('tabindex', '-1');
    $sidebar.attr('aria-hidden', 'true');
    $collapseToggle.attr('aria-expanded', 'false');
    checkForExtraPadding();
}
