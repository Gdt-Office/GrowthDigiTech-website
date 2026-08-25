/* ===================================================================
   GrowthDigiTech — Shared Footer Injection
   Keeps footer markup in one place across all 6 pages.
=================================================================== */
(function () {
  var footerHTML = `
  <footer class="footer-grow">
    <div class="container">
      <div class="row g-4">
        <div class="col-lg-4">
          <a href="index.html" class="navbar-brand d-inline-flex mb-3" style="font-size:1.5rem;">
            <i class="bi bi-bar-chart-line-fill text-green me-2"></i>
            <span><span class="text-green">Growth</span><span class="text-blue">DigiTech</span></span>
          </a>
          <p style="font-size:.9rem; color:rgba(255,255,255,.6); max-width:300px;">
            We help businesses grow smarter with innovative digital solutions and result-driven strategies.
          </p>
          <div class="mt-3">
            <a href="https://www.instagram.com/growth_digitech/" target="_blank" rel="noopener" class="social-icon" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
            <a href="https://www.facebook.com/profile.php?id=61591292765138" target="_blank" rel="noopener" class="social-icon" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
            <a href="https://www.linkedin.com/in/growth-digitech-b12a23419/" target="_blank" rel="noopener" class="social-icon" aria-label="LinkedIn"><i class="bi bi-linkedin"></i></a>
          </div>
        </div>

        <div class="col-lg-2 col-6">
          <h6>Quick Links</h6>
          <a href="index.html">Home</a>
          <a href="about.html">About Us</a>
          <a href="services.html">Services</a>
          <a href="portfolio.html">Portfolio</a>
          <a href="blog.html">Blog</a>
          <a href="contact.html">Contact</a>
        </div>

        <div class="col-lg-3 col-6">
          <h6>Our Services</h6>
          <a href="services.html#web-development">Web Development</a>
          <a href="services.html#mobile-app">Mobile App Development</a>
          <a href="services.html#digital-marketing">Digital Marketing</a>
          <a href="services.html#seo">SEO &amp; SEM</a>
          <a href="services.html#branding">Logo Design &amp; Branding</a>
        </div>

        <div class="col-lg-3">
          <h6>Get In Touch</h6>
          <a href="mailto:growthdigitech25@gmail.com"><i class="bi bi-envelope me-2"></i>growthdigitech25@gmail.com</a>
          <a href="tel:+918072840179"><i class="bi bi-telephone me-2"></i>+91 80728 40179</a>
          <a href="https://www.growthdigitech.com" target="_blank" rel="noopener"><i class="bi bi-globe2 me-2"></i>www.growthdigitech.com</a>
          <form id="newsletterForm" class="mt-3">
            <label class="form-label-grow text-white-50" style="font-size:.78rem;">Subscribe to our newsletter</label>
            <div class="input-group">
              <input type="email" class="form-control form-control-grow" placeholder="Your email" style="background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.15); color:#fff;" required>
              <button class="btn btn-grow py-2 px-3" type="submit"><i class="bi bi-send"></i></button>
            </div>
            <small class="newsletter-msg d-block mt-2" style="display:none;"></small>
          </form>
        </div>
      </div>

      <div class="footer-bottom d-flex flex-wrap justify-content-between align-items-center">
        <span>&copy; <span id="copyYear"></span> GrowthDigiTech. All rights reserved.</span>
        <span>
          <a href="privacy.html" style="display:inline; margin-right:1rem;">Privacy Policy</a>
          <a href="terms.html" style="display:inline;">Terms &amp; Conditions</a>
        </span>
      </div>
    </div>
  </footer>`;

  function injectFooter() {
    var target = document.getElementById('footer-placeholder');
    if (target) {
      target.outerHTML = footerHTML;
    }
    var yearEl = document.getElementById('copyYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    if (window.jQuery) {
      jQuery(function ($) {
        var currentPage = window.location.pathname.split('/').pop() || 'index.html';
        $('.footer-grow a').each(function () {
          if ($(this).attr('href') === currentPage) $(this).css('color', '#5fd16b');
        });
        $('#newsletterForm').off('submit').on('submit', function (e) {
          e.preventDefault();
          var $input = $(this).find('input[type="email"]');
          var $msg = $(this).find('.newsletter-msg');
          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($input.val())) {
            $msg.removeClass('text-danger').addClass('text-green').text('Subscribed! Welcome aboard.').fadeIn();
            $input.val('');
          } else {
            $msg.removeClass('text-green').addClass('text-danger').text('Please enter a valid email.').fadeIn();
          }
          setTimeout(function () { $msg.fadeOut(); }, 4000);
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
  } else {
    injectFooter();
  }
})();
