/* The Rosalia BCN — script.js */

(() => {
  // ── Header scroll effect ──
  const header = document.getElementById('header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile hamburger ──
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('click', e => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
        nav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // ── Scroll reveal ──
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    revealEls.forEach(el => io.observe(el));
  }

  // ── i18n ──
  const translations = {
    es: {
      // Nav
      'nav.reservas':            'Reservas',
      'nav.nosotros':            'Nosotros',
      'nav.menu':                'Menú',
      'nav.franquicias':         'Franquicias',
      'nav.eventos':             'Eventos',
      'nav.blog':                'Blog',
      // Hero
      'hero.tagline':            'Brunch · Dining · Live Music · Barcelona',
      'hero.cta':                'Reservar mesa',
      // About
      'about.eyebrow':           'Nuestra Esencia',
      'about.title':             'Más que un restaurante,<br /><em>una emoción</em>',
      'about.body':              'De los mejores brunchs de Barcelona a noches con espectáculo en vivo. Cada visita, una experiencia única e irrepetible.',
      // Cards
      'card1.title':             'Brunch de Autor',
      'card1.text':              'Japanese Fluffy Pancakes, Eggs Benedict, tostadas creativas y açaí bowls. Disponible cada día hasta las 16:00.',
      'card2.title':             'Noche con Espectáculo',
      'card2.text':              'DJ sets, violonchelo en vivo y performers únicos. Cada noche, una atmósfera irrepetible.',
      'card3.title':             'The R Lounge',
      'card3.text':              'Terraza exclusiva con vistas al mar. El espacio perfecto para celebraciones privadas y eventos corporativos.',
      // Menu preview
      'menu.eyebrow':            'Nuestra Cocina',
      'menu.title':              'Una selección<br /><em>para cada momento</em>',
      'menu.cta':                'Ver menú completo',
      'menucat1.name':           'Brunch & Desayunos',
      'menucat2.name':           'Almuerzo & Cenas',
      'menucat3.name':           'Street Food Fusion',
      'menucat4.name':           'Dulces & Bebidas',
      'menucat1.range':          'Desde €12.95',
      'menucat2.range':          'Desde €16.95',
      'menucat3.range':          'Desde €11.00',
      'menucat4.range':          'Desde €5.95',
      // Experience
      'exp.eyebrow':             'Noche en The Rosalia',
      'exp.title':               'Del desayuno<br /><em>al espectáculo</em>',
      'exp.body':                'Música en vivo, DJ sets y performers únicos. Cada noche, The Rosalia se transforma en algo más.',
      'exp.cta':                 'Ver eventos',
      'exp.feat1':               'Música en Vivo',
      'exp.feat2':               'DJ Sets',
      'exp.feat3':               'Performers',
      'exp.feat4':               'Eventos Privados',
      // Reserve CTA
      'reserve.eyebrow':         'Reservas',
      'reserve.title':           '¿Listo para vivir<br /><em>la experiencia Rosalia?</em>',
      'reserve.body':            'Reserva tu mesa online o llámanos directamente. Te esperamos.',
      'reserve.cta':             'Reservar mesa',
      // Footer
      'footer.contact-heading':  'Contáctanos',
      'footer.location':         'Barcelona, España',
      'footer.hours1':           'Lun – Vie  10:00 – 23:00',
      'footer.hours2':           'Sáb – Dom  9:00 – 23:00',
      'footer.explore-heading':  'Explora',
      'footer.menu-link':        'Menú',
      'footer.reservas-link':    'Reservas',
      'footer.eventos-link':     'Eventos',
      'footer.franquicias-link': 'Franquicias',
      'footer.blog-link':        'Blog',
      'footer.copyright':        '© 2025 The Rosalia BCN. Todos los derechos reservados.',
      'footer.privacy':          'Política de Privacidad',
      'footer.legal':            'Aviso Legal',
      // Reservas page
      'res.page-eyebrow':        'Reservas',
      'res.page-title':          'Reserva tu<br /><em>experiencia</em>',
      'res.page-body':           'Completa el formulario y nos pondremos en contacto para confirmar tu reserva.',
      'res.info-hours':          'Horario',
      'res.info-phone':          'Teléfono',
      'res.info-email':          'Email',
      'res.label-name':          'Nombre completo',
      'res.label-phone':         'Teléfono',
      'res.label-email':         'Email',
      'res.label-date':          'Fecha',
      'res.label-time':          'Hora',
      'res.label-guests':        'Comensales',
      'res.label-notes':         'Notas y peticiones especiales',
      'res.ph-name':             'Tu nombre completo',
      'res.ph-phone':            '+34 612 345 678',
      'res.ph-email':            'tu@email.com',
      'res.ph-notes':            'Alergias, ocasión especial, peticiones...',
      'res.time-default':        'Selecciona hora',
      'res.guests-default':      'Número de comensales',
      'res.submit':              'Confirmar Reserva',
      'res.success-title':       '¡Reserva recibida!',
      'res.success-body':        'Te contactaremos pronto para confirmar tu mesa. ¡Hasta pronto!',
      // Menu page
      'menu.page-eyebrow':       'Nuestra Carta',
      'menu.page-title':         'Sabores que<br /><em>te sorprenderán</em>',
      'menu.page-body':          'Cocina creativa con alma mediterránea, pensada para disfrutar a cualquier hora.',
      'menu.filter-all':         'Todo',
      'menu.filter-brunch':      'Brunch',
      'menu.filter-lunch':       'Almuerzo & Cenas',
      'menu.filter-street':      'Street Food',
      'menu.filter-drinks':      'Bebidas',
      'menu.s1-heading':         'Brunch & Desayunos',
      'menu.s2-heading':         'Almuerzo & Cenas',
      'menu.s3-heading':         'Street Food Fusion',
      'menu.s4-heading':         'Dulces & Bebidas',
      // Nosotros page
      'nos.page-eyebrow':        'Nuestra Historia',
      'nos.page-title':          'El alma de<br /><em>The Rosalia</em>',
      'nos.page-body':           'Nacimos del sueño de crear un espacio donde la gastronomía, la música y las emociones se encuentran.',
      'nos.s1-eyebrow':          'El Concepto',
      'nos.s1-title':            'De día, brunch.<br /><em>De noche, espectáculo.</em>',
      'nos.s1-body':             'The Rosalia BCN es un espacio que se transforma. Por la mañana, el aroma del café y los pancakes japoneses dan la bienvenida. Al caer la noche, la música en vivo y los performers crean una atmósfera única en Barcelona.',
      'nos.s2-eyebrow':          'Nuestra Filosofía',
      'nos.s2-title':            'Más allá de<br /><em>la gastronomía</em>',
      'nos.s2-body':             'Creemos que comer bien es solo el comienzo. Cada detalle — desde la música hasta el emplatado — está pensado para crear un momento que merece ser vivido.',
      'nos.values-eyebrow':      'Nuestros Valores',
      'nos.v1-title':            'Creatividad',
      'nos.v1-text':             'Cocina de autor con influencias mediterráneas y asiáticas. Siempre en evolución.',
      'nos.v2-title':            'Experiencia',
      'nos.v2-text':             'Cada visita es irrepetible. Del brunch íntimo a la noche más vibrante de Barcelona.',
      'nos.v3-title':            'Autenticidad',
      'nos.v3-text':             'Ingredientes frescos, trato cercano y espacios únicos. Así es The Rosalia.',
      'nos.contact-eyebrow':     'Encuéntranos',
      'nos.contact-title':       'Ven a<br /><em>conocernos</em>',
      'nos.h1':                  'Lun – Vie',
      'nos.h1-val':              '10:00 – 23:00',
      'nos.h2':                  'Sáb – Dom',
      'nos.h2-val':              '9:00 – 23:00',
    },
    en: {
      // Nav
      'nav.reservas':            'Reservations',
      'nav.nosotros':            'About',
      'nav.menu':                'Menu',
      'nav.franquicias':         'Franchises',
      'nav.eventos':             'Events',
      'nav.blog':                'Blog',
      // Hero
      'hero.tagline':            'Brunch · Dining · Live Music · Barcelona',
      'hero.cta':                'Book a table',
      // About
      'about.eyebrow':           'Our Essence',
      'about.title':             'More than a restaurant,<br /><em>an emotion</em>',
      'about.body':              "From Barcelona's finest brunches to nights filled with live entertainment. Every visit, a unique and unforgettable experience.",
      // Cards
      'card1.title':             'Signature Brunch',
      'card1.text':              'Japanese Fluffy Pancakes, Eggs Benedict, creative toasts and açaí bowls. Available every day until 16:00.',
      'card2.title':             'Night with Entertainment',
      'card2.text':              'DJ sets, live cello and unique performers. Every night, an unforgettable atmosphere.',
      'card3.title':             'The R Lounge',
      'card3.text':              'Exclusive terrace with sea views. The perfect space for private celebrations and corporate events.',
      // Menu preview
      'menu.eyebrow':            'Our Kitchen',
      'menu.title':              'A selection<br /><em>for every moment</em>',
      'menu.cta':                'View full menu',
      'menucat1.name':           'Brunch & Breakfast',
      'menucat2.name':           'Lunch & Dinner',
      'menucat3.name':           'Street Food Fusion',
      'menucat4.name':           'Sweets & Drinks',
      'menucat1.range':          'From €12.95',
      'menucat2.range':          'From €16.95',
      'menucat3.range':          'From €11.00',
      'menucat4.range':          'From €5.95',
      // Experience
      'exp.eyebrow':             'Night at The Rosalia',
      'exp.title':               'From breakfast<br /><em>to the show</em>',
      'exp.body':                'Live music, DJ sets and unique performers. Every night, The Rosalia transforms into something more.',
      'exp.cta':                 'View events',
      'exp.feat1':               'Live Music',
      'exp.feat2':               'DJ Sets',
      'exp.feat3':               'Performers',
      'exp.feat4':               'Private Events',
      // Reserve CTA
      'reserve.eyebrow':         'Reservations',
      'reserve.title':           'Ready to experience<br /><em>The Rosalia?</em>',
      'reserve.body':            'Book your table online or call us directly. We look forward to welcoming you.',
      'reserve.cta':             'Book a table',
      // Footer
      'footer.contact-heading':  'Contact Us',
      'footer.location':         'Barcelona, Spain',
      'footer.hours1':           'Mon – Fri  10:00 – 23:00',
      'footer.hours2':           'Sat – Sun  9:00 – 23:00',
      'footer.explore-heading':  'Explore',
      'footer.menu-link':        'Menu',
      'footer.reservas-link':    'Reservations',
      'footer.eventos-link':     'Events',
      'footer.franquicias-link': 'Franchises',
      'footer.blog-link':        'Blog',
      'footer.copyright':        '© 2025 The Rosalia BCN. All rights reserved.',
      'footer.privacy':          'Privacy Policy',
      'footer.legal':            'Legal Notice',
      // Reservas page
      'res.page-eyebrow':        'Reservations',
      'res.page-title':          'Book your<br /><em>experience</em>',
      'res.page-body':           'Fill in the form and we will contact you to confirm your reservation.',
      'res.info-hours':          'Hours',
      'res.info-phone':          'Phone',
      'res.info-email':          'Email',
      'res.label-name':          'Full name',
      'res.label-phone':         'Phone',
      'res.label-email':         'Email',
      'res.label-date':          'Date',
      'res.label-time':          'Time',
      'res.label-guests':        'Guests',
      'res.label-notes':         'Notes & special requests',
      'res.ph-name':             'Your full name',
      'res.ph-phone':            '+34 612 345 678',
      'res.ph-email':            'your@email.com',
      'res.ph-notes':            'Allergies, special occasion, requests...',
      'res.time-default':        'Select time',
      'res.guests-default':      'Number of guests',
      'res.submit':              'Confirm Reservation',
      'res.success-title':       'Reservation received!',
      'res.success-body':        'We will contact you shortly to confirm your table. See you soon!',
      // Menu page
      'menu.page-eyebrow':       'Our Menu',
      'menu.page-title':         'Flavors that<br /><em>will surprise you</em>',
      'menu.page-body':          'Creative Mediterranean cuisine, designed to enjoy at any time of day.',
      'menu.filter-all':         'All',
      'menu.filter-brunch':      'Brunch',
      'menu.filter-lunch':       'Lunch & Dinner',
      'menu.filter-street':      'Street Food',
      'menu.filter-drinks':      'Drinks',
      'menu.s1-heading':         'Brunch & Breakfast',
      'menu.s2-heading':         'Lunch & Dinner',
      'menu.s3-heading':         'Street Food Fusion',
      'menu.s4-heading':         'Sweets & Drinks',
      // Nosotros page
      'nos.page-eyebrow':        'Our Story',
      'nos.page-title':          'The soul of<br /><em>The Rosalia</em>',
      'nos.page-body':           'Born from the dream of creating a space where gastronomy, music and emotions meet.',
      'nos.s1-eyebrow':          'The Concept',
      'nos.s1-title':            'By day, brunch.<br /><em>By night, a show.</em>',
      'nos.s1-body':             'The Rosalia BCN is a space that transforms. In the morning, the scent of coffee and Japanese pancakes welcomes you. As night falls, live music and performers create a unique atmosphere in Barcelona.',
      'nos.s2-eyebrow':          'Our Philosophy',
      'nos.s2-title':            'Beyond<br /><em>gastronomy</em>',
      'nos.s2-body':             'We believe that eating well is just the beginning. Every detail — from the music to the plating — is designed to create a moment worth living.',
      'nos.values-eyebrow':      'Our Values',
      'nos.v1-title':            'Creativity',
      'nos.v1-text':             'Signature cuisine with Mediterranean and Asian influences. Always evolving.',
      'nos.v2-title':            'Experience',
      'nos.v2-text':             "Every visit is unrepeatable. From intimate brunch to Barcelona's most vibrant night.",
      'nos.v3-title':            'Authenticity',
      'nos.v3-text':             "Fresh ingredients, warm service and unique spaces. That's The Rosalia.",
      'nos.contact-eyebrow':     'Find Us',
      'nos.contact-title':       'Come and<br /><em>meet us</em>',
      'nos.h1':                  'Mon – Fri',
      'nos.h1-val':              '10:00 – 23:00',
      'nos.h2':                  'Sat – Sun',
      'nos.h2-val':              '9:00 – 23:00',
    }
  };

  function applyLang(lang) {
    const t = translations[lang] || translations.es;
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (t[key] !== undefined) el.textContent = t[key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.dataset.i18nHtml;
      if (t[key] !== undefined) el.innerHTML = t[key];
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.dataset.i18nPh;
      if (t[key] !== undefined) el.placeholder = t[key];
    });

    document.querySelectorAll('.lang[data-lang]').forEach(el => {
      el.classList.toggle('lang--active', el.dataset.lang === lang);
    });

    localStorage.setItem('rosalia-lang', lang);
  }

  document.querySelectorAll('.lang[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  const savedLang = localStorage.getItem('rosalia-lang') || 'es';
  applyLang(savedLang);

  // ── Reservation form ──
  const resForm = document.getElementById('reservation-form');
  if (resForm) {
    const successEl = document.getElementById('form-success');
    resForm.addEventListener('submit', e => {
      e.preventDefault();
      resForm.style.opacity = '0';
      resForm.style.transform = 'translateY(16px)';
      setTimeout(() => {
        resForm.style.display = 'none';
        successEl.classList.add('visible');
      }, 400);
    });

    const dateInput = resForm.querySelector('input[type="date"]');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
    }
  }

  // ── Menu page filter ──
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuSections = document.querySelectorAll('.menu-section[data-category]');
  if (filterBtns.length && menuSections.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
        btn.classList.add('filter-btn--active');
        const cat = btn.dataset.filter;
        menuSections.forEach(sec => {
          sec.style.display = (cat === 'all' || sec.dataset.category === cat) ? '' : 'none';
        });
      });
    });
  }
})();
