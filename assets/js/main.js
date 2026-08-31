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
