// ================================================================
// CONFIGURAÇÃO FÁCIL DE EDITAR
// ================================================================

// Nome dela — usado em alt de imagens, pode usar em textos se quiser
const NOME_DELA = "NOME_DELA";

// FRASES da seção 3 — adicione, remova ou edite à vontade
const PHRASES = [
  "Eu te amo mais que ontem e menos que amanhã.",
  "Mesmo longe, nos teus olhos vejo as estrelas.",
  "Você consegue tornar um dia comum em uma memória que eu quero guardar.",
  "Entre tantas pessoas nesse mundo, eu escolheria encontrar você novamente.",
  "Às vezes eu olho para você e simplesmente penso: que sorte a minha."
];

const PHRASE_DISPLAY_MS = 3600; // tempo que cada frase fica na tela

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ================================================================
// ESTRELAS NO CANVAS
// ================================================================
(function initStars() {
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.floor((w * h) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.1 + 0.2,
      baseAlpha: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.15 + 0.02,
      twinkleOffset: Math.random() * Math.PI * 2
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.y += s.speed;
      if (s.y > h) s.y = 0;
      const twinkle = prefersReducedMotion ? 0 : Math.sin(t / 900 + s.twinkleOffset) * 0.25;
      const alpha = Math.max(0, Math.min(1, s.baseAlpha + twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(243, 240, 232, ${alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();

// ================================================================
// TELA DE ABERTURA
// ================================================================
(function initOpening() {
  const line1 = document.querySelector('.opening .line-1');
  const line2 = document.querySelector('.opening .line-2');
  const openBtn = document.getElementById('open-btn');
  const openingScreen = document.getElementById('opening');
  const mainContent = document.getElementById('main-content');
  const musicBtn = document.getElementById('music-toggle');
  const music = document.getElementById('bg-music');

  setTimeout(() => line1.classList.add('show'), 300);
  setTimeout(() => line2.classList.add('show'), 2400);
  setTimeout(() => openBtn.classList.add('show'), 4200);

  openBtn.addEventListener('click', () => {
    openingScreen.classList.add('leaving');
    mainContent.classList.remove('hidden');
    musicBtn.classList.add('visible');

    music.volume = 0.55;
    music.play().catch(() => { /* usuário pode iniciar manualmente pelo botão */ });
    setPlayingIcon(true);

    setTimeout(() => {
      openingScreen.style.display = 'none';
      initScrollReveal();
      initPhraseSequence();
    }, 1300);
  }, { once: true });

  function setPlayingIcon(playing) {
    document.getElementById('icon-play').style.display = playing ? 'none' : 'block';
    document.getElementById('icon-pause').style.display = playing ? 'block' : 'none';
  }

  musicBtn.addEventListener('click', () => {
    if (music.paused) {
      music.play().catch(() => {});
      setPlayingIcon(true);
    } else {
      music.pause();
      setPlayingIcon(false);
    }
  });
})();

// ================================================================
// SCROLL REVEAL — aplica a qualquer elemento com [data-reveal],
// .reveal-line, .about-line, .gallery-item
// ================================================================
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.reveal-line, .about-line, .about-final, .gallery-item, [data-reveal]'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.35 });

  targets.forEach((el) => observer.observe(el));

  // Efeito máquina de escrever na carta, ao entrar na tela
  const letter = document.querySelector('[data-typewriter]');
  if (letter) {
    const letterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          typewriterEffect(letter);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    letterObserver.observe(letter);
  }

  // Ativa a foto final e o gallery lightbox
  initGalleryLightbox();
}

// ================================================================
// SEQUÊNCIA DE FRASES CINEMATOGRÁFICAS (seção 3)
// ================================================================
function initPhraseSequence() {
  const phraseEl = document.getElementById('phrase-display');
  const phraseSection = document.querySelector('.phrases');
  let started = false;
  let index = 0;

  function showNext() {
    if (index >= PHRASES.length) return;
    phraseEl.textContent = PHRASES[index];
    requestAnimationFrame(() => phraseEl.classList.add('show'));

    setTimeout(() => {
      phraseEl.classList.remove('show');
      setTimeout(() => {
        index++;
        if (index < PHRASES.length) showNext();
      }, 700);
    }, PHRASE_DISPLAY_MS);
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !started) {
        started = true;
        showNext();
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  observer.observe(phraseSection);
}

// ================================================================
// GALERIA — LIGHTBOX
// ================================================================
function initGalleryLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const galleryImages = document.querySelectorAll('.gallery-item img');

  galleryImages.forEach((img) => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.remove('hidden');
      requestAnimationFrame(() => lightbox.classList.add('visible'));
    });
  });

  lightbox.addEventListener('click', () => {
    lightbox.classList.remove('visible');
    setTimeout(() => lightbox.classList.add('hidden'), 400);
  });
}

// ================================================================
// EFEITO MÁQUINA DE ESCREVER — CARTA
// ================================================================
function typewriterEffect(el) {
  const fullText = el.textContent.trim();
  el.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'typed-cursor';
  cursor.textContent = '\u00A0';

  if (prefersReducedMotion) {
    el.textContent = fullText;
    return;
  }

  let i = 0;
  const speed = 18; // ms por caractere

  function type() {
    if (i <= fullText.length) {
      el.textContent = fullText.slice(0, i);
      el.appendChild(cursor);
      i++;
      setTimeout(type, speed);
    } else {
      cursor.remove();
    }
  }
  type();
}
