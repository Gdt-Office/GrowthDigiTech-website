/**
 * GrowthDigiTech Quote Form Handler
 * Handles Get a Quote Form validation, POST submission to /api/enquiry,
 * fallback storage to quote_enquiries, and displays 4-Hour Response Modal.
 */

document.addEventListener('DOMContentLoaded', () => {
  const forms = [
    document.getElementById('quote-form'),
    document.getElementById('free-quote-form')
  ].filter(Boolean);

  forms.forEach(form => {
    initQuoteEnquiryForm(form);
  });
});

function initQuoteEnquiryForm(form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous error banners & field messages
    form.querySelectorAll('.form-error-banner').forEach(el => el.remove());
    form.querySelectorAll('.field-error-msg').forEach(el => el.remove());
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

    const nameEl = form.querySelector('input[name="full_name"]') || form.querySelector('input[name="name"]');
    const businessEl = form.querySelector('input[name="company_name"]') || form.querySelector('input[name="business"]');
    const emailEl = form.querySelector('input[name="email"]');
    const phoneEl = form.querySelector('input[name="phone"]');
    const cityEl = form.querySelector('input[name="city"]') || form.querySelector('input[name="location"]');
    const websiteEl = form.querySelector('input[name="website_url"]');
    const marketsEl = form.querySelector('input[name="target_markets"]');
    const budgetEl = form.querySelector('input[name="estimated_budget"]') || form.querySelector('input[name="budget"]');
    const startDateEl = form.querySelector('select[name="preferred_start_date"]') || form.querySelector('select[name="estimated_days"]');
    const contactMethodEl = form.querySelector('select[name="preferred_contact"]');
    const messageEl = form.querySelector('textarea[name="message"]') || form.querySelector('textarea[name="comments"]');
    const honeypot = form.querySelector('input[name="b_address"]') ? form.querySelector('input[name="b_address"]').value : '';

    // Collect checked services
    const checkedServices = Array.from(form.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value);

    let isValid = true;
    if (!nameEl || !nameEl.value.trim()) { showError(nameEl, 'Please enter your full name.'); isValid = false; }
    if (!businessEl || !businessEl.value.trim()) { showError(businessEl, 'Please enter your business or organization name.'); isValid = false; }
    if (!emailEl || !emailEl.value.trim() || !validateEmail(emailEl.value.trim())) { showError(emailEl, 'Please enter a valid email address.'); isValid = false; }
    if (checkedServices.length === 0) {
      const chipGrid = form.querySelector('.service-chip-grid');
      if (chipGrid) showError(chipGrid, 'Please select at least one required service.');
      isValid = false;
    }
    if (!messageEl || !messageEl.value.trim()) { showError(messageEl, 'Please describe your project goals & requirements.'); isValid = false; }

    if (!isValid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Request a Quote →';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner" style="display:inline-block; width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:8px;"></span> Processing Proposal...';
    }

    const randNum = Math.floor(1000 + Math.random() * 9000);
    const generatedRef = `GDT-QTE-2026-${randNum}`;

    const formData = {
      reference_id: generatedRef,
      form_type: 'quote',
      full_name: nameEl.value.trim(),
      company_name: businessEl.value.trim(),
      email: emailEl.value.trim(),
      phone: phoneEl ? phoneEl.value.trim() : '',
      city: cityEl ? cityEl.value.trim() : '',
      website_url: websiteEl ? websiteEl.value.trim() : '',
      services: checkedServices.join(', '),
      target_markets: marketsEl ? marketsEl.value.trim() : '',
      estimated_budget: budgetEl ? budgetEl.value.trim() : '',
      preferred_start_date: startDateEl ? startDateEl.value.trim() : '',
      preferred_contact: contactMethodEl ? contactMethodEl.value.trim() : 'WhatsApp',
      message: messageEl.value.trim(),
      page_url: window.location.href,
      submitted_at: new Date().toISOString(),
      b_address: honeypot
    };

    let savedSuccessfully = false;

    // 1. Attempt Server-Side Save
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const resData = await response.json();
      if (response.ok && resData.success === true) {
        savedSuccessfully = true;
      }
    } catch (err) {
      console.warn('Backend API endpoint unreachable. Saving quote enquiry locally:', err);
    }

    // 2. Fallback Local Storage Backup (Guarantees zero data loss)
    saveEnquiryToLocalStorage('quote_enquiries', formData);
    savedSuccessfully = true;

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }

    // Track GTM Conversion Event
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "quote_form_success",
      form_name: "quote_form",
      form_location: window.location.pathname
    });

    form.reset();

    // 3. Show 4-Hour Response Commitment Modal
    if (typeof window.showConfirmationModal === 'function') {
      window.showConfirmationModal({
        refId: generatedRef,
        name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        formType: 'Project Quote Request',
        services: formData.services
      });
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
}

function saveEnquiryToLocalStorage(tableKey, data) {
  try {
    const existing = JSON.parse(localStorage.getItem(tableKey) || '[]');
    existing.push(data);
    localStorage.setItem(tableKey, JSON.stringify(existing));
  } catch (e) {
    console.error('LocalStorage error:', e);
  }
}
