/**
 * GrowthDigiTech Contact Form Handler
 * Handles Contact Form validation and POST submission to /api/enquiry (saves to contact_enquiries table).
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-enquiry-form');
  if (contactForm) {
    initContactEnquiryForm(contactForm, 'contact-success-msg');
  }
});

function initContactEnquiryForm(form, successPanelId) {
  const successPanel = document.getElementById(successPanelId);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous error banners & field messages
    form.querySelectorAll('.form-error-banner').forEach(el => el.remove());
    form.querySelectorAll('.field-error-msg').forEach(el => el.remove());
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

    const nameEl = form.querySelector('input[name="name"]');
    const businessEl = form.querySelector('input[name="business"]');
    const emailEl = form.querySelector('input[name="email"]');
    const phoneEl = form.querySelector('input[name="phone"]');
    const locationEl = form.querySelector('input[name="location"]');
    const messageEl = form.querySelector('textarea[name="message"]');
    const honeypot = form.querySelector('input[name="b_address"]') ? form.querySelector('input[name="b_address"]').value : '';

    let isValid = true;
    if (!nameEl || !nameEl.value.trim()) { showError(nameEl, 'Please enter contact name.'); isValid = false; }
    if (!emailEl || !emailEl.value.trim() || !validateEmail(emailEl.value.trim())) { showError(emailEl, 'Please enter a valid email address.'); isValid = false; }
    if (!phoneEl || !phoneEl.value.trim() || !validateIndianPhone(phoneEl.value.trim())) { showError(phoneEl, 'Please enter a valid Indian phone/WhatsApp number.'); isValid = false; }
    if (!messageEl || !messageEl.value.trim()) { showError(messageEl, 'Please describe your project requirements.'); isValid = false; }

    if (!isValid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit Enquiry';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner" style="display:inline-block; width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:8px;"></span> Submitting...';
    }

    const formData = {
      form_type: 'contact',
      full_name: nameEl.value.trim(),
      company_name: businessEl ? businessEl.value.trim() : '',
      email: emailEl.value.trim(),
      phone: phoneEl.value.trim(),
      location: locationEl ? locationEl.value.trim() : '',
      message: messageEl.value.trim(),
      page_url: window.location.href,
      b_address: honeypot
    };

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const resData = await response.json();

      if (response.ok && resData.success === true) {
        // Track GTM Conversion Event
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "contact_form_success",
          form_name: "contact_form",
          form_location: window.location.pathname
        });

        form.reset();
        form.style.display = 'none';
        if (successPanel) {
          successPanel.style.display = 'block';
          successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        throw new Error(resData.error || 'We could not save your enquiry. Please try again.');
      }
    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }

      const errBanner = document.createElement('div');
      errBanner.className = 'form-error-banner';
      errBanner.style.cssText = 'margin-top:16px; padding:14px 16px; background:#fef2f2; border:1px solid #fca5a5; border-radius:10px; color:#991b1b; font-size:0.9rem; text-align:left; line-height:1.5;';
      errBanner.innerHTML = `⚠️ <strong>Submission Error:</strong> ${err.message || 'We could not save your enquiry. Please try again.'}<br><span style="font-size:0.85rem; color:#7f1d1d;">Your entered details have been preserved. You can try submitting again or connect directly: <a href="https://web.whatsapp.com/send?phone=918072841079" target="_blank" rel="noopener" style="color:#0284c7; font-weight:700; text-decoration:underline;">Connect on WhatsApp →</a></span>`;

      form.appendChild(errBanner);
      errBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  function showError(element, message) {
    if (!element) return;
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

  function validateIndianPhone(phone) {
    const cleaned = String(phone).replace(/[^\d+]/g, '');
    const re = /^(?:\+91|91)?[6-9]\d{9}$/;
    return re.test(cleaned);
  }
}
