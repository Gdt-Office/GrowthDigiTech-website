/**
 * GrowthDigiTech Animation & Interactive Motion Engine
 * Handles custom path drawings, intersection entries, and state transitions.
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initGrowthPathDrawing();
  initPathwaySelector();
  initReviewTabs();
});

/**
 * Implements standard staggered reveal animations on scroll
 */
function initScrollAnimations() {
  // Check if reduced-motion is requested
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  // Setup Scroll Reveal Intersection Observer
  const revealOptions = {
    threshold: 0.15, // 15% visibility trigger
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        // Add active state to start animation
        const element = entry.target;
        
        // Handle optional staggered items
        if (element.classList.contains('stagger-container')) {
          const children = element.querySelectorAll('.stagger-item');
          children.forEach((child, i) => {
            child.style.transitionDelay = `${i * 80}ms`;
            child.classList.add('revealed');
          });
        } else {
          element.classList.add('revealed');
        }
        
        observer.unobserve(element); // Play once
      }
    });
  }, revealOptions);

  // Apply reveal class names
  document.querySelectorAll('.reveal-on-scroll, .stagger-container').forEach(el => {
    revealObserver.observe(el);
  });
}

/**
 * Animates the custom SVG Growth Path lines once they enter the screen
 */
function initGrowthPathDrawing() {
  const paths = document.querySelectorAll('.growth-path-line');
  if (paths.length === 0) return;

  const pathObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const path = entry.target;
        path.style.strokeDashoffset = '0';
        observer.unobserve(path);
      }
    });
  }, { threshold: 0.25 });

  paths.forEach(path => {
    const length = path.getTotalLength();
    // Initialize stroke array variables
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    path.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1)';
    pathObserver.observe(path);
  });
}

/**
 * Manages Home Page "Service Pathways" problem-led interactive selector
 */
function initPathwaySelector() {
  const tabs = document.querySelectorAll('.pathway-tab');
  const contentWrapper = document.getElementById('pathway-content-container');
  if (tabs.length === 0 || !contentWrapper) return;

  // Rich data content for the pathways
  const data = {
    leads: {
      title: "Generate More Enquiries",
      desc: "Turn passive searchers and social media users into high-intent buyer inquiries. We align digital campaigns to direct phone calls, Google Ads, and local SEO, ensuring maximum ROI.",
      features: [
        "Digital Marketing: Cross-channel growth campaigns",
        "SEO & Local Search: Target local Hosur and national buyers",
        "Google & Meta Paid Campaigns: Instant targeted demand",
        "Lead Capture: High-converting landing pages"
      ],
      link: "services.html#growth"
    },
    website: {
      title: "High-Performance Website",
      desc: "A fast, professional, and accessible website is the core of modern trust. We build bespoke websites designed around business capabilities, page performance, and clear buyer journeys.",
      features: [
        "Website Design & Copy: Clear enterprise communication",
        "Landing Pages: Built for high ad-campaign conversion",
        "E-commerce Integrations: Safe shopping and client portals",
        "Speed Optimizations: Near-perfect Lighthouse scores"
      ],
      link: "services.html#experience"
    },
    app: {
      title: " B2B & Customer Applications",
      desc: "Connect your team or your clients with mobile apps built for utility and smooth performance. We design modern app screens and deploy scalable client environments.",
      features: [
        "Mobile App Development: iOS & Android systems",
        "Client Dashboards: Interactive secure portals",
        "Progressive Web Apps: Fast offline-capable apps",
        "Bespoke Workflows: Scaled to your physical constraints"
      ],
      link: "services.html#experience"
    },
    operations: {
      title: "Automate Business Operations",
      desc: "Connect campaign leads with sales follow-ups, ERP stock management, employee timesheets, and accounting tools. Stop losing data in spreadsheet lists and chats.",
      features: [
        "CRM & HRM Integrations: Centralize customer & staff workflows",
        "ERP Systems: Link inventory, orders, purchase & invoices",
        "Billing Software: Fast daily ledger automation",
        "Custom Software: Built for unique, validated processes"
      ],
      link: "services.html#operations"
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const pathwayKey = tab.dataset.pathway;
      if (!pathwayKey || !data[pathwayKey]) return;

      // Update Active Tab State
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Crossfade animation (200ms)
      contentWrapper.style.opacity = '0';
      
      setTimeout(() => {
        const item = data[pathwayKey];
        
        // Assemble new HTML structure
        contentWrapper.innerHTML = `
          <div class="pathway-body">
            <div class="pathway-info">
              <h3>${item.title}</h3>
              <p>${item.desc}</p>
              <a href="${item.link}" class="btn btn-primary">
                Explore Capabilities
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
            <div class="pathway-features">
              <h4 class="form-label" style="margin-bottom: 20px; color: var(--text-navy);">Standard Deliverables</h4>
              ${item.features.map(f => `
                <div class="pathway-feature-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>${f}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        
        contentWrapper.style.opacity = '1';
      }, 200);
    });
  });
}

/**
 * Handles review panel navigation (simple tab controls for Google Reviews)
 */
function initReviewTabs() {
  const reviews = document.querySelectorAll('.review-card');
  const tabContainer = document.getElementById('review-dots-container');
  if (reviews.length === 0 || !tabContainer) return;

  // Generate dots dynamic control panel
  tabContainer.innerHTML = '';
  reviews.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.className = `review-dot-btn ${idx === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Show review ${idx + 1}`);
    dot.addEventListener('click', () => {
      // Set active dot
      document.querySelectorAll('.review-dot-btn').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');

      // Update visible review card
      reviews.forEach((card, cIdx) => {
        if (cIdx === idx) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => { card.style.opacity = '1'; }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
    tabContainer.appendChild(dot);
  });

  // Init state - show first, hide others
  reviews.forEach((card, idx) => {
    if (idx !== 0) {
      card.style.display = 'none';
    } else {
      card.style.display = 'flex';
    }
    card.style.transition = 'opacity 300ms ease';
  });
}

// Add necessary CSS rules for reveals dynamically to prevent style bloat in styles.css
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  .reveal-on-scroll {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 600ms var(--t-std), transform 600ms var(--t-std);
  }
  .reveal-on-scroll.revealed {
    opacity: 1;
    transform: translateY(0);
  }
  .stagger-item {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 500ms var(--t-std), transform 500ms var(--t-std);
  }
  .stagger-item.revealed {
    opacity: 1;
    transform: translateY(0);
  }
  .review-dot-btn {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--border-light);
    border: none;
    cursor: pointer;
    transition: var(--t-fast);
  }
  .review-dot-btn.active {
    background-color: var(--cyan);
    transform: scale(1.3);
  }
  #review-dots-container {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 32px;
  }
`;
document.head.appendChild(styleSheet);
