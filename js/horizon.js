// Horizon — animações de scroll (GSAP + ScrollTrigger + Lenis).
// Sem JS ou com movimento reduzido, a página fica completa e estática.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ---------- menu ----------
  const burger = $('#burger');
  const menu = $('#menu');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open && window.gsap) {
      gsap.fromTo(menu, { clipPath: 'circle(0% at 100% 0%)' }, { clipPath: 'circle(150% at 100% 0%)', duration: 0.7, ease: 'power3.inOut' });
      gsap.fromTo($$('li', menu), { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: 'power3.out', delay: 0.25 });
    }
  };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const showAll = () => {
    const copy = $('.intro-copy'); const shade = $('.intro-shade'); const logo = $('.intro-logo');
    if (copy) copy.style.opacity = 1; if (shade) shade.style.opacity = 0.35; if (logo) logo.style.opacity = 0;
    document.documentElement.classList.add('no-pin');
  };
  if (reduce || !window.gsap || !window.ScrollTrigger) { showAll(); return; }

  gsap.registerPlugin(ScrollTrigger);

  // ---------- scroll suave ----------
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = $(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: 0, duration: 1.6 });
    }));
  }

  // ---------- abertura: logo acende, cresce e revela o palco ----------
  const logo = $('.intro-logo');
  gsap.fromTo('.intro-logo-wrap', { opacity: 0, scale: 0.86, filter: 'blur(14px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.6, ease: 'power3.out' });
  gsap.fromTo('.scroll-hint', { opacity: 0 }, { opacity: 1, delay: 1.2, duration: 1 });

  const intro = gsap.timeline({
    scrollTrigger: { trigger: '.intro', start: 'top top', end: 'bottom bottom', scrub: 1 },
  });
  intro
    .fromTo(logo, { scale: 1 }, { scale: 16, ease: 'power2.in', duration: 0.5 }, 0)
    .fromTo(logo, { opacity: 1 }, { opacity: 0, duration: 0.18, immediateRender: false }, 0.3)
    .to('.intro-shade', { opacity: 0.2, duration: 0.5 }, 0)
    .fromTo('.intro-bg', { scale: 1.3 }, { scale: 1, duration: 0.8, ease: 'none' }, 0)
    .to('.scroll-hint', { opacity: 0, duration: 0.1 }, 0)
    .fromTo('.intro-copy', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.3 }, 0.42)
    .fromTo('.intro-copy h1', { letterSpacing: '0.5em' }, { letterSpacing: '0.14em', duration: 0.4, ease: 'power2.out' }, 0.42)
    .to('.intro-shade', { opacity: 0.55, duration: 0.2 }, 0.8);

  // ---------- portas: parallax interno ----------
  $$('.door').forEach((d) => {
    gsap.fromTo($('img', d), { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: d, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // ---------- capítulos: imagem acende, título entra, painel sobe ----------
  $$('.chapter').forEach((ch) => {
    const img = $('.ch-media img', ch);
    const shade = $('.ch-shade', ch);
    const head = $('.ch-head', ch);
    const body = $('.ch-body', ch);
    const panel = $('.panel', ch);

    gsap.fromTo(img, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: ch, start: 'top bottom', end: 'top top', scrub: true } });
    gsap.fromTo(shade, { opacity: 0.85 }, { opacity: 0.12, ease: 'none', scrollTrigger: { trigger: ch, start: 'top 85%', end: 'top 5%', scrub: true } });
    gsap.fromTo(shade, { opacity: 0.12 }, { opacity: 0.78, ease: 'none', immediateRender: false, scrollTrigger: { trigger: body, start: 'top 95%', end: 'top 35%', scrub: true } });

    gsap.fromTo(head.children, { opacity: 0, y: 70 }, {
      opacity: 1, y: 0, stagger: 0.12, ease: 'power3.out', duration: 1.1,
      scrollTrigger: { trigger: head, start: 'top 45%', toggleActions: 'play none none reverse' },
    });
    gsap.to(head, { opacity: 0, y: -80, ease: 'none', scrollTrigger: { trigger: body, start: 'top 90%', end: 'top 45%', scrub: true } });

    gsap.fromTo(panel, { y: 160, scale: 0.92, rotateX: 8, transformPerspective: 1200 }, {
      y: 0, scale: 1, rotateX: 0, ease: 'none',
      scrollTrigger: { trigger: body, start: 'top bottom', end: 'top 55%', scrub: true },
    });
  });

  // ---------- revelações em lote ----------
  gsap.set('.reveal', { opacity: 0, y: 46 });
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, stagger: 0.08, duration: 0.9, ease: 'power3.out', overwrite: true }),
  });

  // ---------- contador R$ 100 mil ----------
  const num = $('.prize-num');
  if (num) {
    const obj = { v: 0 };
    num.textContent = '0';
    ScrollTrigger.create({
      trigger: num, start: 'top 80%', once: true,
      onEnter: () => gsap.to(obj, { v: 100, duration: 2.2, ease: 'power3.out', onUpdate: () => { num.textContent = Math.round(obj.v); } }),
    });
    gsap.fromTo('.prize', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'back.out(1.6)', scrollTrigger: { trigger: num, start: 'top 85%' } });
  }

  // mascotes flutuando e camisas girando levemente
  $$('.div-mascot').forEach((m, i) => gsap.to(m, { y: -12, duration: 1.8 + i * 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
  $$('.div-shirt').forEach((s, i) => gsap.fromTo(s, { rotate: -4 }, { rotate: 4, duration: 3 + i * 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut' }));

  // ---------- cards de experiência com inclinação 3D ----------
  if (window.matchMedia('(pointer: fine)').matches) {
    $$('.xp-card').forEach((c) => {
      c.addEventListener('mousemove', (e) => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(c, { rotateY: x * 16, rotateX: -y * 16, transformPerspective: 700, duration: 0.4, ease: 'power2.out' });
      });
      c.addEventListener('mouseleave', () => gsap.to(c, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power3.out' }));
    });
  }

  // ---------- espaços: galeria horizontal presa ----------
  const track = $('.spaces-track');
  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', () => {
    const dist = () => track.scrollWidth - window.innerWidth;
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.spaces', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true },
    });
  });
  mm.add('(max-width: 860px)', () => { document.documentElement.classList.add('no-pin'); return () => document.documentElement.classList.remove('no-pin'); });

  // ---------- frase olímpica acende palavra por palavra ----------
  const big = $('.olympic-big');
  if (big) {
    const wrap = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w.trim()) { frag.appendChild(document.createTextNode(w)); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = w; frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrap(n);
      });
    };
    big.classList.remove('reveal');
    gsap.set(big, { opacity: 1, y: 0 });
    wrap(big);
    gsap.fromTo($$('.w', big), { opacity: 0.12 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: big, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  }

  // logo gigante do final sobe como um sol no horizonte
  gsap.fromTo('.finale-sky', { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 0.14, ease: 'none', scrollTrigger: { trigger: '.finale', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
