/**
 * GrowthDigiTech Contact Form Handler
 * Handles contact enquiries with frontend validation, AJAX fetch, loading state, error messages, and Thank You Modal.
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form') || document.querySelector('form[action*="contact"]');
  if (contactForm) {
    initContactForm(contactForm);
  }
});

function initContactForm(form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateContactForm(form)) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit Enquiry';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner" style="display:inline-block; width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:8px;"></span> Sending...';
    }

    // Clear previous form-level errors
    const prevFormErr = form.querySelector('.form-level-error');
    if (prevFormErr) prevFormErr.remove();

    const formData = {
      form_type: 'contact',
      form_source: 'Contact Form',
      page_url: window.location.href,
      name: form.querySelector('input[name="name"]') ? form.querySelector('input[name="name"]').value.trim() : '',
      business: form.querySelector('input[name="business"]') ? form.querySelector('input[name="business"]').value.trim() : '',
      email: form.querySelector('input[name="email"]') ? form.querySelector('input[name="email"]').value.trim() : '',
      phone: form.querySelector('input[name="phone"]') ? form.querySelector('input[name="phone"]').value.trim() : '',
      location: form.querySelector('input[name="location"]') ? form.querySelector('input[name="location"]').value.trim() : '',
      service: form.querySelector('select[name="service"]') ? form.querySelector('select[name="service"]').value.trim() : 'Digital Solutions',
      subject: form.querySelector('input[name="subject"]') ? form.querySelector('input[name="subject"]').value.trim() : 'Website Contact Enquiry',
      message: form.querySelector('textarea[name="message"]') ? form.querySelector('textarea[name="message"]').value.trim() : '',
      website_hp: form.querySelector('input[name="website_hp"]') ? form.querySelector('input[name="website_hp"]').value : ''
    };

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const resData = await response.json();

      if (resData && resData.success) {
        // Success: Reset form, re-enable button, show Thank You Modal
        form.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }

        if (typeof window.showSuccessModal === 'function') {
          window.showSuccessModal({ firstName: resData.first_name });
        } else {
          const successMsg = document.getElementById('contact-success-msg');
          if (successMsg) successMsg.style.display = 'block';
        }
      } else {
        // Failed: Keep entered data, show error message
        showFormError(form, resData.message || "We couldn't submit your request at the moment. Please try again or contact us directly through WhatsApp.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    } catch (err) {
      console.error("Contact Form Submission Error:", err);
      showFormError(form, "We couldn't submit your request at the moment. Please try again or contact us directly through WhatsApp.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    }
  });

  function showFormError(formElement, message) {
    const errBox = document.createElement('div');
    errBox.className = 'form-level-error';
    errBox.style.cssText = 'color:#ef4444; background:#fef2f2; border:1px solid #fca5a5; padding:12px 16px; border-radius:10px; margin-top:16px; font-size:0.9rem; font-weight:600; text-align:center;';
    errBox.innerText = message;
    formElement.appendChild(errBox);
  }

  function validateContactForm(form) {
    let isValid = true;
    let firstInvalidField = null;

    form.querySelectorAll('.field-error-msg').forEach(el => el.remove());
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    const prevErr = form.querySelector('.form-level-error');
    if (prevErr) prevErr.remove();

    const fieldsToValidate = [
      { name: 'name', msg: 'Please enter your full name.' },
      { name: 'email', msg: 'Please enter a valid email address.', isEmail: true },
      { name: 'phone', msg: 'Please enter a valid phone / WhatsApp number.', isPhone: true },
      { name: 'location', msg: 'Please enter your business location.' },
      { name: 'message', msg: 'Please describe your project requirements.' }
    ];

    fieldsToValidate.forEach(item => {
      const el = form.querySelector(`[name="${item.name}"]`);
      if (el) {
        const val = el.value.trim();
        let fieldValid = true;
        if (!val) {
          fieldValid = false;
        } else if (item.isEmail && !validateEmail(val)) {
          fieldValid = false;
        } else if (item.isPhone && !validatePhone(val)) {
          fieldValid = false;
        }

        if (!fieldValid) {
          showError(el, item.msg);
          if (!firstInvalidField) firstInvalidField = el;
          isValid = false;
        }
      }
    });

    if (!isValid && firstInvalidField) {
      if (typeof firstInvalidField.focus === 'function') firstInvalidField.focus();
      firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
  }

  function showError(element, message) {
    element.classList.add('invalid');
    const msg = document.createElement('span');
    msg.className = 'field-error-msg';
    msg.style.color = '#ef4444';
    msg.style.fontSize = '0.8rem';
    msg.style.marginTop = '4px';
    msg.style.display = 'block';
    msg.innerText = message;

    if (element.parentNode) {
      element.parentNode.appendChild(msg);
    }
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function validatePhone(phone) {
    const clean = String(phone).replace(/[\s\-\(\)\+]/g, '');
    return clean.length >= 7 && clean.length <= 15;
  }
}
