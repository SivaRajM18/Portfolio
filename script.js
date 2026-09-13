(function(){
  // Mobile menu
  var hamburger = document.getElementById('hamburger');
  var panel = document.getElementById('mobile-panel');
  hamburger.addEventListener('click', function(){
    var open = panel.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  panel.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      panel.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Active nav link on scroll
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('nav.primary-links a, .mobile-panel a');
  var byHash = {};
  navLinks.forEach(function(a){ byHash[a.getAttribute('href')] = byHash[a.getAttribute('href')] || []; byHash[a.getAttribute('href')].push(a); });

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var id = '#' + entry.target.id;
        navLinks.forEach(function(a){ a.classList.remove('active'); });
        (byHash[id] || []).forEach(function(a){ a.classList.add('active'); });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach(function(s){ observer.observe(s); });

  // Scroll reveal (with staggered delay for items inside the same grid row)
  var staggerParents = document.querySelectorAll('.card-row, .feature-grid, .tech-grid, .skills-grid, .insight-grid, .cs-grid');
  staggerParents.forEach(function(parent){
    Array.prototype.forEach.call(parent.children, function(child, i){
      if(child.classList.contains('reveal')){
        child.style.transitionDelay = Math.min(i * 70, 280) + 'ms';
      }
    });
  });

  var reveals = document.querySelectorAll('.reveal');
  var revealObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(function(el){ revealObserver.observe(el); });

  // Animated timeline fill for Achievements
  var timeline = document.querySelector('.timeline');
  if(timeline){
    var timelineObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('fill');
          timelineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    timelineObserver.observe(timeline);
  }

  // Scroll progress bar
  var bar = document.getElementById('scroll-progress');
  function updateProgress(){
    var h = document.documentElement;
    var scrolled = h.scrollTop;
    var height = h.scrollHeight - h.clientHeight;
    var pct = height > 0 ? (scrolled / height) * 100 : 0;
    bar.style.width = pct + '%';
  }
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // Contact form -> mailto
  var form = document.getElementById('contact-form');
  var note = document.getElementById('form-note');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('cf-name').value.trim();
    var email = document.getElementById('cf-email').value.trim();
    var subject = document.getElementById('cf-subject').value.trim() || 'Portfolio Contact';
    var message = document.getElementById('cf-message').value.trim();
    if(!name || !email || !message){
      note.textContent = 'Please fill in your name, email and message.';
      return;
    }
    var body = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
    var mailto = 'mailto:sivarajm1811@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    window.location.href = mailto;
    note.textContent = 'Opening your email app to send this message…';
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var heroEl = document.querySelector('.hero');
  var heroMouse = { x: -9999, y: -9999, active: false };
  var ripples = [];

  // Neural network canvas background (hero) — reacts to cursor + clicks
  var canvas = document.getElementById('network-canvas');
  if(canvas && !reduceMotion){
    var ctx = canvas.getContext('2d');
    var nodes = [];
    var raf;
    function resize(){
      var rect = heroEl.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      var count = Math.min(60, Math.round((rect.width * rect.height) / 22000));
      nodes = [];
      for(var i = 0; i < count; i++){
        nodes.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25
        });
      }
    }
    function tick(){
      var w = canvas.width / window.devicePixelRatio;
      var h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);
      for(var i = 0; i < nodes.length; i++){
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if(n.x < 0 || n.x > w) n.vx *= -1;
        if(n.y < 0 || n.y > h) n.vy *= -1;
        if(heroMouse.active){
          var dx = n.x - heroMouse.x, dy = n.y - heroMouse.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if(d < 90 && d > 0.01){
            var force = ((90 - d) / 90) * 0.7;
            n.x += (dx / d) * force;
            n.y += (dy / d) * force;
          }
        }
      }
      for(var i = 0; i < nodes.length; i++){
        for(var j = i + 1; j < nodes.length; j++){
          var a = nodes[i], b = nodes[j];
          var dx2 = a.x - b.x, dy2 = a.y - b.y;
          var dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if(dist < 130){
            ctx.strokeStyle = 'rgba(130,245,230,' + (0.16 * (1 - dist / 130)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for(var i = 0; i < nodes.length; i++){
        ctx.fillStyle = 'rgba(130,245,230,0.55)';
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      for(var i = ripples.length - 1; i >= 0; i--){
        var rp = ripples[i];
        rp.r += 3.2; rp.alpha -= 0.018;
        if(rp.alpha <= 0){ ripples.splice(i, 1); continue; }
        ctx.strokeStyle = 'rgba(139,124,246,' + rp.alpha + ')';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      raf = requestAnimationFrame(tick);
    }
    resize();
    tick();
    var resizeTimer;
    window.addEventListener('resize', function(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });
    document.addEventListener('visibilitychange', function(){
      if(document.hidden){ cancelAnimationFrame(raf); } else { tick(); }
    });
    heroEl.addEventListener('click', function(e){
      var r = heroEl.getBoundingClientRect();
      ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 0, alpha: 0.55 });
    });
  }

  // Typing effect for the hero eyebrow, then reveal the stats strip
  var eyebrow = document.querySelector('.hero .eyebrow');
  var heroStats = document.getElementById('hero-stats');
  function showStats(){ if(heroStats){ heroStats.classList.add('in-view'); } }
  if(eyebrow && !reduceMotion){
    var full = eyebrow.textContent;
    eyebrow.textContent = '';
    eyebrow.style.borderRight = '2px solid var(--brass)';
    eyebrow.style.paddingRight = '4px';
    var i = 0;
    (function typeChar(){
      if(i <= full.length){
        eyebrow.textContent = full.slice(0, i);
        i++;
        setTimeout(typeChar, 22);
      } else {
        eyebrow.style.borderRight = 'none';
        setTimeout(showStats, 250);
      }
    })();
  } else {
    showStats();
  }

  window.addEventListener('load', function(){
    setTimeout(function(){ if(heroEl){ heroEl.classList.add('loaded'); } }, 120);
  });

  var frame = document.querySelector('.hero-visual .frame');
  if(frame && !reduceMotion && window.matchMedia('(hover: hover)').matches){
    frame.style.transformStyle = 'preserve-3d';
    frame.addEventListener('mousemove', function(e){
      var r = frame.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      frame.style.transform = 'rotateY(' + (px * 10) + 'deg) rotateX(' + (py * -10) + 'deg)';
    });
    frame.addEventListener('mouseleave', function(){
      frame.style.transform = '';
    });
  }

  var ambientLayer = document.querySelector('.ambient');
  var gridLayer = document.querySelector('.grid-bg');
  var copyLayer = document.querySelector('.hero-copy');
  if(heroEl && !reduceMotion && window.matchMedia('(hover: hover)').matches){
    heroEl.addEventListener('mousemove', function(e){
      var r = heroEl.getBoundingClientRect();
      heroMouse.x = e.clientX - r.left;
      heroMouse.y = e.clientY - r.top;
      heroMouse.active = true;
      var mx = (heroMouse.x / r.width) - 0.5;
      var my = (heroMouse.y / r.height) - 0.5;
      if(ambientLayer){ ambientLayer.style.transform = 'translate3d(' + (mx * 22) + 'px,' + (my * 22) + 'px,0)'; }
      if(gridLayer){ gridLayer.style.transform = 'translate3d(' + (mx * -12) + 'px,' + (my * -12) + 'px,0)'; }
      if(copyLayer){ copyLayer.style.transform = 'translate3d(' + (mx * -10) + 'px,' + (my * -10) + 'px,0)'; }
    });
    heroEl.addEventListener('mouseleave', function(){
      heroMouse.active = false;
      if(ambientLayer){ ambientLayer.style.transform = ''; }
      if(gridLayer){ gridLayer.style.transform = ''; }
      if(copyLayer){ copyLayer.style.transform = ''; }
    });
  }

  var spotCards = document.querySelectorAll('.info-card, .skill-card, .insight-card, .edu-card, .contact-info-card, .ps-grid, .dashboard-mock');
  spotCards.forEach(function(card){
    card.addEventListener('pointermove', function(e){
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  document.querySelectorAll('.btn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      var r = btn.getBoundingClientRect();
      var span = document.createElement('span');
      span.className = 'ripple';
      var size = Math.max(r.width, r.height);
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - r.left - size / 2) + 'px';
      span.style.top = (e.clientY - r.top - size / 2) + 'px';
      btn.appendChild(span);
      setTimeout(function(){ span.remove(); }, 650);
    });
  });

  var holdBtn = document.getElementById('hold-btn');
  var holdFill = document.getElementById('hold-fill');
  var lockOverlay = document.getElementById('lock-overlay');
  var insightGrid = document.getElementById('insight-grid');
  var lockStatus = document.getElementById('lock-status');
  if(holdBtn && lockOverlay && insightGrid){
    var holdDuration = 1300;
    var holdStart = 0;
    var holdRaf = null;
    var unlocked = false;
    var circumference = 176;
    function stepHold(now){
      var elapsed = now - holdStart;
      var pct = Math.min(elapsed / holdDuration, 1);
      holdFill.style.strokeDashoffset = circumference * (1 - pct);
      if(pct >= 1){ unlock(); return; }
      holdRaf = requestAnimationFrame(stepHold);
    }
    function startHold(){
      if(unlocked) return;
      holdStart = performance.now();
      cancelAnimationFrame(holdRaf);
      holdRaf = requestAnimationFrame(stepHold);
    }
    function cancelHold(){
      cancelAnimationFrame(holdRaf);
      if(!unlocked){ holdFill.style.strokeDashoffset = circumference; }
    }
    function unlock(){
      unlocked = true;
      lockOverlay.classList.add('unlocked');
      insightGrid.classList.remove('locked');
      insightGrid.classList.add('just-unlocked');
      if(lockStatus){ lockStatus.textContent = 'Unlocked — enjoy the preview.'; }
      setTimeout(function(){ lockOverlay.style.display = 'none'; }, 700);
    }
    holdBtn.addEventListener('pointerdown', startHold);
    holdBtn.addEventListener('pointerup', cancelHold);
    holdBtn.addEventListener('pointerleave', cancelHold);
    holdBtn.addEventListener('keydown', function(e){
      if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); startHold(); }
    });
    holdBtn.addEventListener('keyup', function(e){
      if(e.key === ' ' || e.key === 'Enter'){ cancelHold(); }
    });
  }
})();