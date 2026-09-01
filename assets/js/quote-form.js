/**
 * GrowthDigiTech Quote Form Handler
 * Handles Get a Quote Form & Home CTA Form validation and POST submission to /api/enquiry (saves to quote_enquiries table).
 */

document.addEventListener('DOMContentLoaded', () => {
  initCustomDropdowns();

  const quoteForm = document.getElementById('free-quote-form');
  if (quoteForm) {
    initMultiSelectQuoteForm(quoteForm, 'quote-success');
  }

  const homeForm = document.getElementById('home-cta-form');
  if (homeForm) {
    initMultiSelectQuoteForm(homeForm, 'home-quote-success');
  }
});

function initMultiSelectQuoteForm(form, successPanelId) {
  const successPanel = document.getElementById(successPanelId);

  // Handle Multi-Select Service Pills
  const servicePills = form.querySelectorAll('.service-pill-opt');
  const hiddenServiceInput = form.querySelector('input[name="service"]');
  let selectedServices = [];

  servicePills.forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('selected');
      const val = pill.dataset.value;

      const idx = selectedServices.indexOf(val);
      if (idx > -1) {
        selectedServices.splice(idx, 1);
      } else {
        selectedServices.push(val);
      }

      if (hiddenServiceInput) {
        hiddenServiceInput.value = selectedServices.join(', ');
      }

      // Clear error if any
      const gridParent = pill.closest('.service-multiselect-grid');
      if (gridParent && gridParent.parentNode) {
        const err = gridParent.parentNode.querySelector('.field-error-msg');
        if (err) err.remove();
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous error banners
    form.querySelectorAll('.form-error-banner').forEach(el => el.remove());

    if (!validateMultiSelectForm(form, selectedServices)) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit Request';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner" style="display:inline-block; width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:8px;"></span> Submitting Request...';
    }

    const honeypot = form.querySelector('input[name="b_address"]') ? form.querySelector('input[name="b_address"]').value : '';
    const timelineInput = form.querySelector('input[name="estimated_days"]') || form.querySelector('select[name="estimated_days"]');

    const formData = {
      form_type: 'quote',
      full_name: form.querySelector('input[name="name"]') ? form.querySelector('input[name="name"]').value.trim() : '',
      email: form.querySelector('input[name="email"]') ? form.querySelector('input[name="email"]').value.trim() : '',
      phone: form.querySelector('input[name="phone"]') ? form.querySelector('input[name="phone"]').value.trim() : '',
      location: form.querySelector('input[name="location"]') ? form.querySelector('input[name="location"]').value.trim() : '',
      service: selectedServices.join(', '),
      budget: form.querySelector('input[name="budget"]') ? form.querySelector('input[name="budget"]').value.trim() : '',
      timeline: timelineInput ? timelineInput.value.trim() : '',
      comments: form.querySelector('textarea[name="comments"]') ? form.querySelector('textarea[name="comments"]').value.trim() : '',
      page_url: window.location.href,
      b_address: honeypot
    };

    const randNum = Math.floor(1000 + Math.random() * 9000);
    const generatedRef = `GDT-2026-${randNum}`;

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const resData = await response.json();

      if (response.ok && resData.success === true) {
        // Reset form & selections
        form.reset();
        selectedServices = [];
        servicePills.forEach(p => p.classList.remove('selected'));
        if (hiddenServiceInput) hiddenServiceInput.value = '';
        const selectedSpan = form.querySelector('.custom-dropdown-selected');
        if (selectedSpan) selectedSpan.innerHTML = 'Select expected timeframe / days...';

        form.style.display = 'none';
        if (successPanel) {
          successPanel.style.display = 'block';
          const refEl = successPanel.querySelector('.quote-ref');
          if (refEl) refEl.innerText = `Reference Code: ${generatedRef}`;
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

      // Display safe error banner with WhatsApp fallback option
      const errBanner = document.createElement('div');
      errBanner.className = 'form-error-banner';
      errBanner.style.cssText = 'margin-top:16px; padding:14px 16px; background:#fef2f2; border:1px solid #fca5a5; border-radius:10px; color:#991b1b; font-size:0.9rem; text-align:left; line-height:1.5;';
      errBanner.innerHTML = `⚠️ <strong>Submission Error:</strong> ${err.message || 'We could not save your enquiry. Please try again.'}<br><span style="font-size:0.85rem; color:#7f1d1d;">Your entered details have been preserved. You can try submitting again or chat directly: <a href="https://web.whatsapp.com/send?phone=918072841079" target="_blank" rel="noopener" style="color:#0284c7; font-weight:700; text-decoration:underline;">Connect on WhatsApp →</a></span>`;
      
      form.appendChild(errBanner);
      errBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  function validateMultiSelectForm(form, servicesList) {
    let isValid = true;
    let firstInvalidField = null;

    // Clear error messages
    form.querySelectorAll('.field-error-msg').forEach(el => el.remove());
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

    // Validate Services Multi-select
    if (servicesList.length === 0) {
      const grid = form.querySelector('.service-multiselect-grid');
      if (grid) {
        showError(grid, "Please select at least one expected service.");
        if (!firstInvalidField) firstInvalidField = grid;
      }
      isValid = false;
    }

    const fieldsToValidate = [
      { name: 'name', msg: 'Please enter your full name.' },
      { name: 'email', msg: 'Please enter a valid email address.', isEmail: true },
      { name: 'phone', msg: 'Please enter your phone / WhatsApp number.', isPhone: true },
      { name: 'location', msg: 'Please enter your operating location.' },
      { name: 'budget', msg: 'Please enter your estimated budget.' },
      { name: 'estimated_days', msg: 'Please select estimated timeframe / days.' }
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
        } else if (item.isPhone && !validateIndianPhone(val)) {
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

  function validateIndianPhone(phone) {
    const cleaned = String(phone).replace(/[^\d+]/g, '');
    const re = /^(?:\+91|91)?[6-9]\d{9}$/;
    return re.test(cleaned);
  }
}

/**
 * Custom Advanced Dropdown Component Handler
 */
function initCustomDropdowns(container = document) {
  const dropdowns = container.querySelectorAll('.custom-dropdown-container');

  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.custom-dropdown-trigger');
    const menu = dropdown.querySelector('.custom-dropdown-menu');
    const hiddenInput = dropdown.querySelector('input[type="hidden"]');
    const selectedSpan = dropdown.querySelector('.custom-dropdown-selected');
    const items = dropdown.querySelectorAll('.custom-dropdown-item');

    if (!trigger || !menu) return;

    // Toggle menu
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentGroup = dropdown.closest('.modern-input-group');

      document.querySelectorAll('.custom-dropdown-container.open').forEach(d => {
        if (d !== dropdown) {
          d.classList.remove('open');
          const pg = d.closest('.modern-input-group');
          if (pg) pg.classList.remove('dropdown-open');
        }
      });

      const isOpen = dropdown.classList.toggle('open');
      if (parentGroup) {
        parentGroup.classList.toggle('dropdown-open', isOpen);
      }
      trigger.setAttribute('aria-expanded', isOpen);
    });

    // Select Item
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        items.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');

        const val = item.dataset.value;
        const textStrong = item.querySelector('strong') ? item.querySelector('strong').innerText : val;
        const icon = item.querySelector('.custom-dropdown-item-icon') ? item.querySelector('.custom-dropdown-item-icon').innerText : '';

        if (hiddenInput) hiddenInput.value = val;
        if (selectedSpan) selectedSpan.innerHTML = `${icon} <strong>${textStrong}</strong> — ${val}`;

        dropdown.classList.remove('open');
        const parentGroup = dropdown.closest('.modern-input-group');
        if (parentGroup) parentGroup.classList.remove('dropdown-open');
        trigger.setAttribute('aria-expanded', 'false');

        // Clear error message if any
        const err = dropdown.parentNode.querySelector('.field-error-msg');
        if (err) err.remove();
        dropdown.classList.remove('invalid');
      });
    });
  });

  // Close on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-dropdown-container.open').forEach(d => {
      d.classList.remove('open');
      const pg = d.closest('.modern-input-group');
      if (pg) pg.classList.remove('dropdown-open');
    });
  });
}
