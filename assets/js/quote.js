/**
 * GrowthDigiTech Quote Form Engine
 * Handles direct quote requests with multi-select services, estimated timeframe collection, validation, and submission.
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

    if (!validateMultiSelectForm(form, selectedServices)) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit Request';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner" style="display:inline-block; width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:8px;"></span> Sending...';
    }

    // Clear previous form-level errors
    const prevFormErr = form.querySelector('.form-level-error');
    if (prevFormErr) prevFormErr.remove();

    const formData = {
      form_type: 'quote',
      form_source: 'Get a Quote Form',
      page_url: window.location.href,
      name: form.querySelector('input[name="name"]') ? form.querySelector('input[name="name"]').value.trim() : '',
      email: form.querySelector('input[name="email"]') ? form.querySelector('input[name="email"]').value.trim() : '',
      phone: form.querySelector('input[name="phone"]') ? form.querySelector('input[name="phone"]').value.trim() : '',
      location: form.querySelector('input[name="location"]') ? form.querySelector('input[name="location"]').value.trim() : '',
      service: selectedServices.join(', '),
      budget: form.querySelector('input[name="budget"]') ? form.querySelector('input[name="budget"]').value.trim() : '',
      estimated_days: form.querySelector('input[name="estimated_days"]') ? form.querySelector('input[name="estimated_days"]').value.trim() : '',
      comments: form.querySelector('textarea[name="comments"]') ? form.querySelector('textarea[name="comments"]').value.trim() : '',
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
        // Success: Reset form, reset service pills, trigger Thank You Success Modal
        form.reset();
        selectedServices = [];
        servicePills.forEach(p => p.classList.remove('selected'));
        const dropdownSpans = form.querySelectorAll('.custom-dropdown-selected');
        dropdownSpans.forEach(s => s.innerText = 'Select estimated timeline');

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }

        // Show Success Modal
        if (typeof window.showSuccessModal === 'function') {
          window.showSuccessModal({ firstName: resData.first_name });
        } else if (successPanel) {
          form.style.display = 'none';
          successPanel.style.display = 'block';
          const refEl = successPanel.querySelector('.quote-ref');
          if (refEl) refEl.innerText = `Reference Code: ${resData.ref || 'GDT-2026-CONFIRMED'}`;
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
      console.error("Quote Form Submission Error:", err);
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

  function validateMultiSelectForm(form, servicesList) {
    let isValid = true;
    let firstInvalidField = null;

    // Clear error messages
    form.querySelectorAll('.field-error-msg').forEach(el => el.remove());
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    const prevErr = form.querySelector('.form-level-error');
    if (prevErr) prevErr.remove();

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
      { name: 'phone', msg: 'Please enter a valid phone / WhatsApp number.', isPhone: true },
      { name: 'location', msg: 'Please enter your operating location.' }
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
