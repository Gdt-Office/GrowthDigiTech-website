/* ===================================================================
   GrowthDigiTech — Site Interactions (jQuery)
=================================================================== */
$(function () {

  /* ---------- Navbar scroll state ---------- */
  function handleNavScroll() {
    if ($(window).scrollTop() > 30) {
      $('#mainNav').addClass('scrolled');
    } else {
      $('#mainNav').removeClass('scrolled');
    }
  }
  handleNavScroll();
  $(window).on('scroll', handleNavScroll);

  /* ---------- Back to top button ---------- */
  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 400) {
      $('#backToTop').addClass('show');
    } else {
      $('#backToTop').removeClass('show');
    }
  });
  $('#backToTop').on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 500);
  });

  /* ---------- Scroll reveal ---------- */
  function revealOnScroll() {
    var windowBottom = $(window).scrollTop() + $(window).height();
    $('.reveal').each(function () {
      var topOfElement = $(this).offset().top + 60;
      if (windowBottom > topOfElement) {
        $(this).addClass('in');
      }
    });
  }
  revealOnScroll();
  $(window).on('scroll', revealOnScroll);

  /* ---------- Animated counters (stats) ---------- */
  var countersAnimated = false;
  function animateCounters() {
    if (countersAnimated) return;
    var $counters = $('.counter');
    if (!$counters.length) return;
    var windowBottom = $(window).scrollTop() + $(window).height();
    var firstTop = $counters.first().offset().top;
    if (windowBottom > firstTop + 40) {
      countersAnimated = true;
      $counters.each(function () {
        var $this = $(this);
        var target = parseInt($this.data('count'), 10);
        var suffix = $this.data('suffix') || '';
        $({ val: 0 }).animate({ val: target }, {
          duration: 1400,
          easing: 'swing',
          step: function () {
            $this.text(Math.floor(this.val) + suffix);
          },
          complete: function () {
            $this.text(target + suffix);
          }
        });
      });
    }
  }
  $(window).on('scroll', animateCounters);
  animateCounters();

  /* ---------- Portfolio filter ---------- */
  $('.portfolio-filter .btn').on('click', function () {
    var filter = $(this).data('filter');
    $('.portfolio-filter .btn').removeClass('active');
    $(this).addClass('active');

    if (filter === 'all') {
      $('.portfolio-item').fadeIn(350);
    } else {
      $('.portfolio-item').each(function () {
        if ($(this).data('category') === filter) {
          $(this).fadeIn(350);
        } else {
          $(this).hide();
        }
      });
    }
  });

  /* ---------- Smooth scroll for in-page anchors ---------- */
  $('a.smooth-scroll').on('click', function (e) {
    var href = $(this).attr('href');
    if (href.indexOf('#') === 0 && href.length > 1) {
      var target = $(href);
      if (target.length) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: target.offset().top - 90 }, 500);
        $('.navbar-collapse').collapse('hide');
      }
    }
  });

  /* ---------- Contact form validation (front-end demo) ---------- */
  $('#contactForm').on('submit', function (e) {
    e.preventDefault();
    var form = this;
    var valid = true;

    $(form).find('[required]').each(function () {
      if (!$(this).val() || ($(this).attr('type') === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($(this).val()))) {
        $(this).addClass('is-invalid');
        valid = false;
      } else {
        $(this).removeClass('is-invalid');
      }
    });

    var $alert = $('#formAlert');
    if (valid) {
      $alert.removeClass('alert-danger').addClass('alert-success')
        .text('Thank you! Your message has been received. Our team will get back to you within 24 hours.')
        .fadeIn();
      form.reset();
      /*
        BACKEND NOTE:
        Replace this block with an actual AJAX call to your backend / form
        service (PHP mailer, Node endpoint, Formspree, EmailJS, etc.) e.g.:

        $.ajax({
          url: '/send-mail.php',
          method: 'POST',
          data: $(form).serialize(),
          success: function(res){ ... },
          error: function(err){ ... }
        });
      */
    } else {
      $alert.removeClass('alert-success').addClass('alert-danger')
        .text('Please fill in all required fields correctly.')
        .fadeIn();
    }

    setTimeout(function () { $alert.fadeOut(); }, 6000);
  });

  /* ---------- Newsletter form (footer) ---------- */
  $('#newsletterForm').on('submit', function (e) {
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

  /* ---------- Active nav link highlighting based on current page ---------- */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  $('.navbar-grow .nav-link, .navbar-grow .dropdown-item').each(function () {
    var href = $(this).attr('href');
    if (href === currentPage) {
      $(this).addClass('active');
      $(this).closest('.dropdown').find('> .nav-link').addClass('active');
    }
  });

  /* ---------- Inject Floating WhatsApp Button ---------- */
  var $whatsappBtn = $('<a href="https://wa.me/918072840179" target="_blank" rel="noopener noreferrer" class="whatsapp-btn" aria-label="Chat on WhatsApp">' +
                       '<i class="bi bi-whatsapp"></i>' +
                       '<span class="whatsapp-tooltip">Chat with us</span>' +
                       '</a>');
  $('body').append($whatsappBtn);

});

