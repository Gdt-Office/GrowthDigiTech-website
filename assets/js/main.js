/**
 * GrowthDigiTech Global Script
 * Manages global components: scrolling header, services mega-dropdown, mobile drawer, floating action buttons.
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMegaDropdown();
  initMobileMenu();
  initActiveNavLink();
  initFloatingActions();
  initHeroAnimations();
  initScrollAnimations();
  initReviewsSlider();
  initInteractiveServicesSection();
});

/**
 * Compresses header on scroll and adds visual scroll state
 */
function initHeaderScroll() {
  const header = document.querySelector('.header-wrapper');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Handles desktop Services mega-dropdown with deliberate hover delay (180ms)
 */
function initMegaDropdown() {
  const servicesTrigger = document.getElementById('services-trigger');
  const megaDropdown = document.getElementById('mega-dropdown');
  if (!servicesTrigger || !megaDropdown) return;

  let hoverTimeout = null;
  let isDropdownOpen = false;

  const openDropdown = () => {
    clearTimeout(hoverTimeout);
    servicesTrigger.classList.add('open');
    servicesTrigger.setAttribute('aria-expanded', 'true');
    megaDropdown.classList.add('open');
    isDropdownOpen = true;
  };

  const closeDropdown = () => {
    clearTimeout(hoverTimeout);
    servicesTrigger.classList.remove('open');
    servicesTrigger.setAttribute('aria-expanded', 'false');
    megaDropdown.classList.remove('open');
    isDropdownOpen = false;
  };

  servicesTrigger.addEventListener('mouseenter', () => {
    hoverTimeout = setTimeout(openDropdown, 180);
  });

  servicesTrigger.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      if (!megaDropdown.matches(':hover')) {
        closeDropdown();
      }
    }, 100);
  });

  megaDropdown.addEventListener('mouseenter', () => {
    clearTimeout(hoverTimeout);
  });

  megaDropdown.addEventListener('mouseleave', () => {
    hoverTimeout = setTimeout(closeDropdown, 100);
  });

  servicesTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    if (isDropdownOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDropdownOpen) {
      closeDropdown();
      servicesTrigger.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (isDropdownOpen && !servicesTrigger.contains(e.target) && !megaDropdown.contains(e.target)) {
      closeDropdown();
    }
  });
}

/**
 * Handles mobile hamburger navigation and drawer state
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const closeBtn = document.getElementById('mobile-drawer-close');
  const backdrop = document.getElementById('drawer-backdrop');
  const accordionTrigger = document.getElementById('mobile-services-accordion');
  const accordionContent = document.getElementById('mobile-services-content');
  if (!mobileDrawer) return;

  let isDrawerOpen = false;

  const openDrawer = () => {
    if (menuBtn) menuBtn.classList.add('open');
    mobileDrawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    isDrawerOpen = true;
    trapFocus(mobileDrawer);
  };

  const closeDrawer = () => {
    if (menuBtn) menuBtn.classList.remove('open');
    mobileDrawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
    isDrawerOpen = false;
  };

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      if (isDrawerOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeDrawer);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDrawerOpen) {
      closeDrawer();
      if (menuBtn) menuBtn.focus();
    }
  });

  mobileDrawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  if (accordionTrigger && accordionContent) {
    accordionTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = accordionContent.classList.contains('open');
      if (isOpen) {
        accordionContent.classList.remove('open');
        accordionTrigger.querySelector('svg').style.transform = '';
      } else {
        accordionContent.classList.add('open');
        accordionTrigger.querySelector('svg').style.transform = 'rotate(180deg)';
      }
    });
  }
}

/**
 * Keyboard Accessibility helper to trap tab focus in the mobile drawer
 */
function trapFocus(element) {
  const focusableElements = element.querySelectorAll('a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select');
  if (focusableElements.length === 0) return;
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', function(e) {
    const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
    if (!isTabPressed) return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  });
  
  firstFocusable.focus();
}

/**
 * Marks active nav link based on current URL path
 */
function initActiveNavLink() {
  const currentPath = window.location.pathname;
  const desktopLinks = document.querySelectorAll('.nav-desktop .nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-drawer .mobile-nav-link');

  const checkAndSetLink = (link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    const pageName = href.substring(href.lastIndexOf('/') + 1);
    const currentPageName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    
    if (currentPageName === pageName || (currentPageName === '' && pageName === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  };

  desktopLinks.forEach(checkAndSetLink);
  mobileLinks.forEach(checkAndSetLink);
}

/**
 * Manages floating action buttons (Call, WhatsApp, Back to Top)
 */
function initFloatingActions() {
  // 1. Back to Top Button
  const topBtn = document.getElementById('back-to-top-btn');
  if (topBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        topBtn.classList.add('visible');
      } else {
        topBtn.classList.remove('visible');
      }
    }, { passive: true });

    topBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 2. WhatsApp Floating Chat Widget
  const waToggleBtn = document.getElementById('whatsapp-toggle-btn');
  const waChatBox = document.getElementById('whatsapp-chat-widget');
  const waChatClose = document.getElementById('wa-chat-close');
  const waChatSend = document.getElementById('wa-chat-send');
  const waChatInput = document.getElementById('wa-chat-input');

  if (waToggleBtn && waChatBox) {
    const openWaChat = () => {
      waChatBox.classList.add('open');
      if (waChatInput) waChatInput.focus();
    };

    const closeWaChat = () => {
      waChatBox.classList.remove('open');
    };

    waToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (waChatBox.classList.contains('open')) {
        closeWaChat();
      } else {
        openWaChat();
      }
    });

    if (waChatClose) {
      waChatClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeWaChat();
      });
    }

    const sendWaMsg = () => {
      const msg = waChatInput ? waChatInput.value.trim() : '';
      const defaultText = "Hi GrowthDigiTech! I would like to inquire about your digital growth and software services.";
      const text = msg ? encodeURIComponent(msg) : encodeURIComponent(defaultText);
      const phone = "918072841079";

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

      if (isMobile) {
        const appUrl = `whatsapp://send?phone=${phone}&text=${text}`;
        const webUrl = `https://wa.me/${phone}?text=${text}`;
        
        let appOpened = false;
        const onBlur = () => { appOpened = true; };
        window.addEventListener('blur', onBlur, { once: true });

        window.location.href = appUrl;

        setTimeout(() => {
          if (!appOpened) {
            window.open(webUrl, '_blank');
          }
        }, 600);
      } else {
        window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${text}`, '_blank');
      }

      closeWaChat();
      if (waChatInput) waChatInput.value = '';
    };

    if (waChatSend) {
      waChatSend.addEventListener('click', sendWaMsg);
    }

    if (waChatInput) {
      waChatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendWaMsg();
        }
      });
    }

    document.addEventListener('click', (e) => {
      if (waChatBox.classList.contains('open') && !waChatBox.contains(e.target) && !waToggleBtn.contains(e.target)) {
        closeWaChat();
      }
    });
  }

  // 3. Global WhatsApp Direct Web Link Interceptor (Direct to WhatsApp Web on Desktop)
  document.addEventListener('click', (e) => {
    const waAnchor = e.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"]');
    if (!waAnchor) return;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

    if (!isMobile) {
      e.preventDefault();
      const rawHref = waAnchor.getAttribute('href') || '';
      let phone = "918072841079";
      let text = "";

      try {
        if (rawHref.includes('phone=')) {
          const matchPhone = rawHref.match(/phone=([0-9]+)/);
          if (matchPhone) phone = matchPhone[1];
        } else {
          const matchDigits = rawHref.match(/wa\.me\/([0-9]+)/);
          if (matchDigits) phone = matchDigits[1];
        }
        if (rawHref.includes('text=')) {
          const matchText = rawHref.match(/text=([^&]+)/);
          if (matchText) text = matchText[1];
        }
      } catch (err) {}

      const defaultText = "Hi GrowthDigiTech! I would like to inquire about your digital growth and software services.";
      const encodedText = text || encodeURIComponent(defaultText);
      const webUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${encodedText}`;

      window.open(webUrl, '_blank', 'noopener,noreferrer');
    }
  });
}

/**
 * Elementor-Style Page-Load Hero Entrance Animation System
 * - Text container (.hero-copy) slides & fades in from the left (-50px -> 0).
 * - Image container (.hero-visual) slides & fades in from the right (+50px -> 0).
 * - Starts ~100ms after page render and completes smoothly within 850ms.
 * - Content remains permanently visible once revealed.
 */
function initHeroAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Mark body that JS is ready for hero entrance animations
  document.body.classList.add('hero-js-loaded');

  const heroCopy = document.querySelector('.hero-section .hero-copy, main > section:first-of-type .hero-copy');
  const heroVisual = document.querySelector('.hero-section .hero-visual, main > section:first-of-type .hero-visual');

  // Trigger animation ~100ms after initial page render for smooth CSS transition calculation
  setTimeout(() => {
    if (heroCopy) heroCopy.classList.add('hero-revealed');
    if (heroVisual) heroVisual.classList.add('hero-revealed');
  }, 100);
}

/**
 * High Performance Inside-to-Outside Fade-In & Expand Reveal System
 * Content expands outward from scale: 0.95, blur: 6px, opacity: 0 to scale: 1, blur: 0, opacity: 1.
 * Sequence: Eyebrow (0ms) -> Heading (100ms) -> Paragraph (200ms) -> Buttons (300ms) -> Visuals (480ms) / Staggered Cards (100ms).
 * Runs strictly ONCE per element as it enters the viewport.
 */
function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Mark body as animation ready
  document.body.classList.add('anim-ready');

  // 1. Hero / Banner Sequence Across All Pages
  const heroSections = document.querySelectorAll('main > section:first-of-type, .hero-section, section.hero-section');
  heroSections.forEach(hero => {
    // Eyebrow badge
    const eyebrow = hero.querySelector('.eyebrow');
    if (eyebrow && !eyebrow.hasAttribute('data-reveal')) {
      eyebrow.setAttribute('data-reveal', 'heading');
      eyebrow.style.transitionDelay = '0ms';
    }

    // Main Heading (h1)
    const heading = hero.querySelector('h1');
    if (heading && !heading.hasAttribute('data-reveal')) {
      heading.setAttribute('data-reveal', 'heading');
      heading.style.transitionDelay = eyebrow ? '100ms' : '0ms';
    }

    // Paragraph / Subtitle text
    const text = hero.querySelector('p');
    if (text && !text.hasAttribute('data-reveal')) {
      text.setAttribute('data-reveal', 'text');
      text.style.transitionDelay = eyebrow ? '200ms' : '100ms';
    }

    // Hero CTAs / Buttons / Services Nav Rail (staggered)
    const buttons = hero.querySelectorAll('.hero-ctas .btn, .services-nav-rail .service-nav-btn, .hero-ctas > a, .hero-ctas > button, a.btn');
    buttons.forEach((btn, index) => {
      if (!btn.hasAttribute('data-reveal')) {
        btn.setAttribute('data-reveal', 'btn');
        btn.style.transitionDelay = `${(eyebrow ? 300 : 200) + (index * 80)}ms`;
      }
    });

    // Trust Line / Micro Badges
    const trustLine = hero.querySelector('.hero-trust-line');
    if (trustLine && !trustLine.hasAttribute('data-reveal')) {
      trustLine.setAttribute('data-reveal', 'text');
      trustLine.style.transitionDelay = '420ms';
    }

    // Visual Mockup / Hero Image
    const visual = hero.querySelector('.hero-visual, .cockpit-wrapper, .browser-mock, .portfolio-visual-container');
    if (visual && !visual.hasAttribute('data-reveal')) {
      visual.setAttribute('data-reveal', 'image');
      visual.style.transitionDelay = '480ms';
    }
  });

  // 2. Section Headings & Subtitles across all pages
  document.querySelectorAll('.section-title, .eyebrow').forEach(el => {
    if (!el.hasAttribute('data-reveal')) {
      el.setAttribute('data-reveal', 'heading');
      el.style.transitionDelay = '0ms';
    }
  });

  document.querySelectorAll('.section-desc').forEach(el => {
    if (!el.hasAttribute('data-reveal')) {
      el.setAttribute('data-reveal', 'text');
      el.style.transitionDelay = '100ms';
    }
  });

  // 3. Grid Cards (Staggered inside-out reveal: 100ms per child)
  const cardContainers = [
    '.grid-2', '.grid-3', '.grid-4', '.service-division-box', 
    '.contact-routes', '.why-grid', '.reviews-grid', '.journey-grid', 
    '.portfolio-masonry', '.insights-grid', '.cap-map-grid', '.quote-two-column-layout'
  ];

  cardContainers.forEach(containerSelector => {
    document.querySelectorAll(containerSelector).forEach(parent => {
      const cards = parent.querySelectorAll('.service-list-row, .route-card, .project-card, .review-card, .guide-box, .why-card, .journey-step, .modern-quote-card, .contact-form-card, .portfolio-card-large, .insight-card, .presence-card');
      cards.forEach((card, index) => {
        if (!card.hasAttribute('data-reveal')) {
          card.setAttribute('data-reveal', 'card');
          card.style.transitionDelay = `${index * 100}ms`;
        }
      });
    });
  });

  // 4. Standalone Images across all pages
  document.querySelectorAll('img:not(.header-logo-img):not(.wa-chat-logo), .portfolio-visual-container, .mega-feat-img').forEach(img => {
    if (!img.hasAttribute('data-reveal')) {
      img.setAttribute('data-reveal', 'image');
      img.style.transitionDelay = '100ms';
    }
  });

  // 5. Form Fields (Staggered inside-out reveal: 80ms per field)
  document.querySelectorAll('form, .modern-form-row, .quote-form-grid').forEach(parent => {
    const fields = parent.querySelectorAll('.modern-input-group, .form-group');
    fields.forEach((field, index) => {
      if (!field.hasAttribute('data-reveal')) {
        field.setAttribute('data-reveal', 'form-field');
        field.style.transitionDelay = `${index * 80}ms`;
      }
    });
  });

  // 6. IntersectionObserver trigger (Runs strictly ONCE per element)
  const revealElements = document.querySelectorAll('[data-reveal]');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.08
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target); // Runs strictly ONCE!
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

/**
 * 4-Card Responsive Autoscroll Carousel Slider with Left/Right Buttons
 * Handles continuous autoscroll (3.5s), hover pause, prev/next button clicks,
 * touch swipe, and active pagination dots update.
 */
function initReviewsSlider() {
  const viewport = document.getElementById('reviews-viewport');
  const track = document.getElementById('reviews-track');
  const prevBtn = document.getElementById('review-prev-btn');
  const nextBtn = document.getElementById('review-next-btn');
  const dotsContainer = document.getElementById('review-dots-container');

  if (!viewport || !track) return;

  const cards = track.querySelectorAll('.review-card-item');
  if (cards.length === 0) return;

  let autoscrollTimer = null;
  let activeIndex = 0;

  // Calculate number of visible cards based on window width
  function getVisibleCount() {
    if (window.innerWidth >= 1024) return 4;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  // Calculate total pages for dots
  function getTotalPages() {
    const visible = getVisibleCount();
    return Math.max(1, Math.ceil(cards.length / visible));
  }

  // Render pagination dots
  function renderDots() {
    if (!dotsContainer) return;
    const totalPages = getTotalPages();
    dotsContainer.innerHTML = '';
    dotsContainer.className = 'reviews-dots-wrapper';

    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('span');
      dot.className = `review-dot ${i === activeIndex ? 'active' : ''}`;
      dot.addEventListener('click', () => scrollToPage(i));
      dotsContainer.appendChild(dot);
    }
  }

  // Scroll to a specific card index or page
  function scrollToIndex(index) {
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = 20;
    const scrollAmount = (cardWidth + gap) * index;

    viewport.scrollTo({
      left: scrollAmount,
      behavior: 'smooth'
    });

    activeIndex = Math.floor(index / getVisibleCount());
    updateDots();
  }

  function scrollToPage(pageIndex) {
    const visible = getVisibleCount();
    scrollToIndex(pageIndex * visible);
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.review-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === activeIndex);
    });
  }

  // Next / Prev actions
  function scrollNext() {
    const visible = getVisibleCount();
    const maxIndex = cards.length - visible;
    const currentScrollIndex = Math.round(viewport.scrollLeft / (cards[0].getBoundingClientRect().width + 20));

    if (currentScrollIndex >= maxIndex) {
      scrollToIndex(0); // Smooth loop back to start
    } else {
      scrollToIndex(currentScrollIndex + 1);
    }
  }

  function scrollPrev() {
    const visible = getVisibleCount();
    const currentScrollIndex = Math.round(viewport.scrollLeft / (cards[0].getBoundingClientRect().width + 20));

    if (currentScrollIndex <= 0) {
      scrollToIndex(cards.length - visible); // Loop to end
    } else {
      scrollToIndex(currentScrollIndex - 1);
    }
  }

  // Event Listeners for Prev / Next Buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAutoscroll();
      scrollPrev();
      startAutoscroll();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAutoscroll();
      scrollNext();
      startAutoscroll();
    });
  }

  // Update active dot on manual scroll / swipe
  viewport.addEventListener('scroll', () => {
    const visible = getVisibleCount();
    const cardWidth = cards[0].getBoundingClientRect().width + 20;
    const currentIndex = Math.round(viewport.scrollLeft / cardWidth);
    activeIndex = Math.min(getTotalPages() - 1, Math.floor(currentIndex / visible));
    updateDots();
  });

  // Hover to pause autoscroll
  viewport.addEventListener('mouseenter', stopAutoscroll);
  viewport.addEventListener('mouseleave', startAutoscroll);

  // Autoscroll timer
  function startAutoscroll() {
    stopAutoscroll();
    autoscrollTimer = setInterval(scrollNext, 3500);
  }

  function stopAutoscroll() {
    if (autoscrollTimer) clearInterval(autoscrollTimer);
  }

  // Init
  renderDots();
  startAutoscroll();

  window.addEventListener('resize', () => {
    renderDots();
  });
}

/**
 * Interactive Circular Wheel Services Section Handler
 */
function initInteractiveServicesSection() {
  const section = document.getElementById('interactive-services');
  if (!section) return;

  const nodesContainer = document.getElementById('wheel-nodes-container');
  const nodeItems = section.querySelectorAll('.wheel-node-item');
  const card = document.getElementById('wheel-content-card');
  const badge = document.getElementById('wheel-badge');
  const illustration = document.getElementById('wheel-illustration');
  const mainIcon = document.getElementById('wheel-main-icon');
  const title = document.getElementById('wheel-title');
  const desc = document.getElementById('wheel-desc');
  const benefits = document.getElementById('wheel-benefits');
  const progressBar = document.getElementById('wheel-auto-bar');

  if (!nodesContainer || !nodeItems.length || !card) return;

  const servicesData = [
    {
      badge: "SERVICE 01 / 07",
      title: "Website Development",
      desc: "Build a fast, professional and mobile-friendly website that creates trust and converts visitors into customers.",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
      benefits: [
        "Responsive website",
        "SEO-friendly structure",
        "Fast page loading",
        "Lead-generation features"
      ],
      illustration: `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
          <span style="font-size:0.75rem; color:var(--cyan); font-weight:700;">LIVE BROWSER MOCKUP</span>
          <span style="font-size:0.7rem; color:rgba(255,255,255,0.6);">Core Web Vitals 99%</span>
        </div>
        <div style="background:#0f172a; border-radius:8px; padding:10px; border:1px solid rgba(255,255,255,0.1);">
          <div style="display:flex; gap:4px; margin-bottom:8px;">
            <span style="width:8px; height:8px; border-radius:50%; background:#ef4444;"></span>
            <span style="width:8px; height:8px; border-radius:50%; background:#f59e0b;"></span>
            <span style="width:8px; height:8px; border-radius:50%; background:#22c55e;"></span>
          </div>
          <div style="font-size:0.72rem; font-family:monospace; color:#38bdf8;">
            &lt;div class="growth-system"&gt;High Conversion UX&lt;/div&gt;
          </div>
        </div>
      `
    },
    {
      badge: "SERVICE 02 / 07",
      title: "Digital Marketing",
      desc: "Build your online presence and attract potential customers through an integrated digital marketing strategy.",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
      benefits: [
        "SEO and website optimization",
        "Content marketing",
        "Social media marketing",
        "Paid advertising campaigns"
      ],
      illustration: `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
          <span style="font-size:0.75rem; color:var(--cyan); font-weight:700;">MULTI-CHANNEL ENGINE</span>
          <span style="font-size:0.7rem; color:#22c55e; font-weight:700;">+340% Reach</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; text-align:center;">
          <div style="background:rgba(255,255,255,0.06); padding:6px; border-radius:6px; font-size:0.68rem; color:#fff;">SEO</div>
          <div style="background:rgba(255,255,255,0.06); padding:6px; border-radius:6px; font-size:0.68rem; color:#fff;">Content</div>
          <div style="background:rgba(255,255,255,0.06); padding:6px; border-radius:6px; font-size:0.68rem; color:#fff;">Social</div>
          <div style="background:rgba(255,255,255,0.06); padding:6px; border-radius:6px; font-size:0.68rem; color:#fff;">Ads</div>
        </div>
      `
    },
    {
      badge: "SERVICE 03 / 07",
      title: "Meta Ads",
      desc: "Reach targeted audiences through Facebook and Instagram and generate valuable enquiries.",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
      benefits: [
        "Audience targeting",
        "Lead-generation campaigns",
        "Retargeting",
        "Campaign optimization"
      ],
      illustration: `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
          <span style="font-size:0.75rem; color:var(--cyan); font-weight:700;">FB & IG ADS MANAGER</span>
          <span style="font-size:0.7rem; color:#3b82f6; font-weight:700;">Verified Meta Partner</span>
        </div>
        <div style="background:rgba(37,99,235,0.15); border:1px solid rgba(59,130,246,0.3); padding:8px 12px; border-radius:6px; font-size:0.75rem; color:#fff; display:flex; justify-content:space-between;">
          <span>Targeted Lead Campaign</span>
          <span style="color:#22c55e;">Active</span>
        </div>
      `
    },
    {
      badge: "SERVICE 04 / 07",
      title: "Google Ads",
      desc: "Connect with customers who are actively searching for your services and generate high-intent leads.",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
      benefits: [
        "Search advertising",
        "Keyword targeting",
        "Conversion tracking",
        "Campaign optimization"
      ],
      illustration: `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
          <span style="font-size:0.75rem; color:var(--cyan); font-weight:700;">GOOGLE SEARCH SPONSORED</span>
          <span style="font-size:0.7rem; color:#f59e0b; font-weight:700;">High Intent</span>
        </div>
        <div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); padding:8px 12px; border-radius:6px; font-size:0.75rem; color:#fff;">
          🔍 Top Search Rank #1 • Direct Call Extension
        </div>
      `
    },
    {
      badge: "SERVICE 05 / 07",
      title: "CRM Software",
      desc: "Manage leads, customer information, follow-ups and sales activities from one organized platform.",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      benefits: [
        "Lead management",
        "Follow-up reminders",
        "Sales pipeline",
        "Customer reports"
      ],
      illustration: `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
          <span style="font-size:0.75rem; color:var(--cyan); font-weight:700;">SALES PIPELINE CRM</span>
          <span style="font-size:0.7rem; color:#22c55e; font-weight:700;">100% Organised</span>
        </div>
        <div style="display:flex; gap:6px;">
          <div style="flex:1; background:rgba(255,255,255,0.06); padding:6px; border-radius:6px; font-size:0.68rem; color:#fff;">New (12)</div>
          <div style="flex:1; background:rgba(255,255,255,0.06); padding:6px; border-radius:6px; font-size:0.68rem; color:#fff;">Proposal (5)</div>
          <div style="flex:1; background:rgba(34,197,94,0.2); padding:6px; border-radius:6px; font-size:0.68rem; color:#22c55e; font-weight:700;">Won (8)</div>
        </div>
      `
    },
    {
      badge: "SERVICE 06 / 07",
      title: "HRM Software",
      desc: "Simplify attendance, leave, payroll and everyday employee management.",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>`,
      benefits: [
        "Attendance management",
        "Leave management",
        "Payroll processing",
        "Employee records"
      ],
      illustration: `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
          <span style="font-size:0.75rem; color:var(--cyan); font-weight:700;">HR & PAYROLL DASHBOARD</span>
          <span style="font-size:0.7rem; color:#38bdf8; font-weight:700;">Biometric Clock-In</span>
        </div>
        <div style="background:rgba(255,255,255,0.06); padding:8px 12px; border-radius:6px; font-size:0.75rem; color:#fff; display:flex; justify-content:space-between;">
          <span>Monthly Payroll Run</span>
          <span style="color:#22c55e; font-weight:700;">Automated ✓</span>
        </div>
      `
    },
    {
      badge: "SERVICE 07 / 07",
      title: "ERP Software",
      desc: "Connect your business departments and manage important operations through one centralized system.",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
      benefits: [
        "Inventory management",
        "Sales and purchasing",
        "Finance management",
        "Centralized reporting"
      ],
      illustration: `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
          <span style="font-size:0.75rem; color:var(--cyan); font-weight:700;">ENTERPRISE ERP COCKPIT</span>
          <span style="font-size:0.7rem; color:#a855f7; font-weight:700;">Unified Ops</span>
        </div>
        <div style="background:rgba(168,85,247,0.15); border:1px solid rgba(168,85,247,0.3); padding:8px 12px; border-radius:6px; font-size:0.75rem; color:#fff;">
          📦 Stock & Invoicing Synchronized
        </div>
      `
    }
  ];

  const total = servicesData.length;
  let currentIndex = 0;
  let progressVal = 0;
  let progressInterval = null;
  let isPaused = false;
  let pauseTimeout = null;

  // Position 7 nodes radially around the circular perimeter
  function positionNodesRadial() {
    const isMobile = window.innerWidth < 480;
    const radius = isMobile ? 130 : 175;

    nodeItems.forEach((node, i) => {
      const angleDeg = (i * (360 / total)) - 90; // Start at top
      const angleRad = (angleDeg * Math.PI) / 180;
      const x = Math.round(radius * Math.cos(angleRad));
      const y = Math.round(radius * Math.sin(angleRad));

      node.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  function rotateWheelTo(index) {
    const rotDeg = -(index * (360 / total));
    nodesContainer.style.transform = `rotate(${rotDeg}deg)`;

    nodeItems.forEach((node, i) => {
      const inner = node.querySelector('.wheel-node-inner');
      if (inner) {
        inner.style.transform = `rotate(${-rotDeg}deg)`;
      }

      if (i === index) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }
    });

    // Render Right Content Panel
    renderContentCard(index);
  }

  function renderContentCard(index) {
    const data = servicesData[index];
    if (!data) return;

    card.classList.add('switching');

    setTimeout(() => {
      badge.textContent = data.badge;
      if (illustration) illustration.innerHTML = data.illustration;
      mainIcon.innerHTML = data.icon;
      title.textContent = data.title;
      desc.textContent = data.desc;

      benefits.innerHTML = data.benefits.map(b => `
        <div class="wheel-benefit-item">
          <span class="wheel-benefit-check">✓</span>
          <span>${b}</span>
        </div>
      `).join('');

      card.classList.remove('switching');
    }, 200);
  }

  function startProgress() {
    progressVal = 0;
    if (progressBar) progressBar.style.width = '0%';

    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      if (isPaused) return;
      progressVal += 2;
      if (progressBar) progressBar.style.width = `${Math.min(progressVal, 100)}%`;

      if (progressVal >= 100) {
        progressVal = 0;
        currentIndex = (currentIndex + 1) % total;
        rotateWheelTo(currentIndex);
      }
    }, 90);
  }

  function selectService(index, isManual = false) {
    currentIndex = index;
    rotateWheelTo(currentIndex);

    if (isManual) {
      isPaused = true;
      if (progressBar) progressBar.style.width = '100%';

      if (pauseTimeout) clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(() => {
        isPaused = false;
        startProgress();
      }, 9000);
    }
  }

  // Node Click Handlers
  nodeItems.forEach((node, i) => {
    node.addEventListener('click', () => {
      selectService(i, true);
    });
  });

  // Init Radial positions & stage rotation
  positionNodesRadial();
  rotateWheelTo(0);

  window.addEventListener('resize', positionNodesRadial);

  // Check Reduced Motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    startProgress();
    section.addEventListener('mouseenter', () => { isPaused = true; });
    section.addEventListener('mouseleave', () => { if (!pauseTimeout) isPaused = false; });
  } else {
    if (progressBar) progressBar.style.display = 'none';
  }
}
