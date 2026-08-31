var Site = (function(){
  var ICONS = { drawing:"icon-pencil", painting:"icon-brush" };

  function card(item, onClick){
    var el = document.createElement("button");
    el.type = "button";
    el.className = "card card--" + item.m + (item.feature ? " card--feature" : "");
    el.setAttribute("data-medium", item.m);
    var posStyle = item.pos ? ' style="object-position:' + item.pos + '"' : '';
    var fill = item.img
      ? '<img src="' + item.img + '" alt=""' + posStyle + ' loading="lazy">'
      : '<svg aria-hidden="true"><use href="#' + ICONS[item.m] + '"/></svg>';
    el.innerHTML =
      '<span class="card__fill">' + fill + '</span>' +
      '<span class="card__cap"><span class="t">' + item.t + '</span><span class="m">' + item.m + '</span></span>';
    el.addEventListener("click", function(){ onClick(item); });
    return el;
  }

  function initLightbox(){
    var lightbox = document.getElementById("lightbox");
    if (!lightbox) return function(){};
    var lbFill = document.getElementById("lightbox-fill");
    var lbTitle = document.getElementById("lightbox-title");
    var lbMedium = document.getElementById("lightbox-medium");

    function openLightbox(item){
      lbFill.className = "card__fill";
      lbFill.innerHTML = item.img
        ? '<img src="' + item.img + '" alt="">'
        : '<svg style="width:22%;opacity:.8" aria-hidden="true"><use href="#' + ICONS[item.m] + '"/></svg>';
      lbFill.parentElement.className = "lightbox__panel card--" + item.m;
      lbTitle.textContent = item.t;
      lbMedium.textContent = item.img ? item.m : item.m + " — placeholder";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden","false");
    }
    function closeLightbox(){
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden","true");
    }
    document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function(e){ if (e.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeLightbox(); });

    return openLightbox;
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
