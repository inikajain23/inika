var Site = (function(){
  var ICONS = { drawing:"icon-pencil", painting:"icon-brush" };

  function card(item, onClick){
    var el = document.createElement("button");
    el.type = "button";
    el.className = "card card--" + item.m + (item.feature ? " card--feature" : "");
    el.setAttribute("data-medium", item.m);
    var posStyle = item.pos ? ' style="object-position:' + item.pos + '"' : '';
    var fill;
    if (item.video){
      var posterAttr = item.poster ? ' poster="' + item.poster + '"' : '';
      fill = '<video src="' + item.video + '"' + posterAttr + posStyle + ' muted loop autoplay playsinline preload="metadata"></video>';
    } else if (item.img){
      fill = '<img src="' + item.img + '" alt=""' + posStyle + ' loading="lazy">';
    } else {
      fill = '<svg aria-hidden="true"><use href="#' + ICONS[item.m] + '"/></svg>';
    }
    el.innerHTML =
      '<span class="card__fill">' + fill + '</span>' +
      '<span class="card__cap"><span class="t">' + item.t + '</span><span class="m">' + item.m + '</span></span>';
    el.addEventListener("click", function(){ onClick(item); });
    return el;
  }

  function initLightbox(){
    var lightbox = document.getElementById("lightbox");
    if (!lightbox) return { open:function(){}, setItems:function(){} };
    var lbFill = document.getElementById("lightbox-fill");
    var lbTitle = document.getElementById("lightbox-title");
    var lbMedium = document.getElementById("lightbox-medium");
    var prevBtn = document.getElementById("lightbox-prev");
    var nextBtn = document.getElementById("lightbox-next");
    var items = [];
    var currentIndex = -1;

    function renderItem(item){
      lbFill.className = "card__fill";
      if (item.video){
        var posterAttr = item.poster ? ' poster="' + item.poster + '"' : '';
        lbFill.innerHTML = '<video src="' + item.video + '"' + posterAttr + ' controls playsinline></video>';
      } else if (item.img){
        lbFill.innerHTML = '<img src="' + item.img + '" alt="">';
      } else {
        lbFill.innerHTML = '<svg style="width:22%;opacity:.8" aria-hidden="true"><use href="#' + ICONS[item.m] + '"/></svg>';
      }
      lbFill.parentElement.className = "lightbox__panel card--" + item.m;
      lbTitle.textContent = item.t;
      lbMedium.textContent = (item.img || item.video) ? item.m : item.m + " — placeholder";
      if (prevBtn && nextBtn){
        var hasMultiple = items.length > 1;
        prevBtn.style.display = hasMultiple ? "" : "none";
        nextBtn.style.display = hasMultiple ? "" : "none";
      }
    }

    function pauseVideo(){
      var video = lbFill.querySelector("video");
      if (video) video.pause();
    }

    function showIndex(i){
      if (!items.length) return;
      pauseVideo();
      currentIndex = (i + items.length) % items.length;
      renderItem(items[currentIndex]);
    }

    function openLightbox(item){
      var idx = items.indexOf(item);
      if (idx === -1){
        currentIndex = -1;
        renderItem(item);
      } else {
        showIndex(idx);
      }
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden","false");
    }
    function closeLightbox(){
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden","true");
      pauseVideo();
    }
    function next(){ showIndex(currentIndex + 1); }
    function prev(){ showIndex(currentIndex - 1); }

    document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function(e){ if (e.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", function(e){
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    });
    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);

    return {
      open: openLightbox,
      setItems: function(list){ items = list; }
    };
  }

  function initFilters(masonrySelector){
    var masonry = document.querySelector(masonrySelector);
    if (!masonry) return;
    var filterBtns = document.querySelectorAll(".filters button");
    filterBtns.forEach(function(btn){
      btn.addEventListener("click", function(){
        filterBtns.forEach(function(b){ b.setAttribute("aria-pressed","false"); });
        btn.setAttribute("aria-pressed","true");
        var f = btn.getAttribute("data-filter");
        masonry.querySelectorAll(".card").forEach(function(c){
          var show = f === "all" || c.getAttribute("data-medium") === f;
          c.style.display = show ? "" : "none";
        });
      });
    });
  }

  function initReveal(){
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var reveals = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)){
      reveals.forEach(function(el){ el.classList.add("is-visible"); });
    } else {
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting){ entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
        });
      }, { threshold:0.12 });
      reveals.forEach(function(el){ io.observe(el); });
    }
  }

  return { card: card, initLightbox: initLightbox, initFilters: initFilters, initReveal: initReveal };
})();
