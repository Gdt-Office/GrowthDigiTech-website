/**
 * GrowthDigiTech Free Quote Form Engine
 * Handles simple direct quote requests with multi-select services, validation, and submission.
 */

document.addEventListener('DOMContentLoaded', () => {
  const quoteForm = document.getElementById('free-quote-form');
  if (!quoteForm) return;

  initMultiSelectQuoteForm(quoteForm);
});

function initMultiSelectQuoteForm(form) {
  const successPanel = document.getElementById('quote-success');

  // Handle Multi-Select Service Pills
  const servicePills = form.querySelectorAll('.service-pill-opt');
  const hiddenServiceInput = form.querySelector('#service');
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
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner" style="display:inline-block; width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:8px;"></span> Submitting Quote Request...';
    }

    const formData = {
      name: form.querySelector('#name') ? form.querySelector('#name').value.trim() : '',
      email: form.querySelector('#email') ? form.querySelector('#email').value.trim() : '',
      phone: form.querySelector('#phone') ? form.querySelector('#phone').value.trim() : '',
      location: form.querySelector('#location') ? form.querySelector('#location').value.trim() : '',
      service: selectedServices.join(', '),
      budget: form.querySelector('#budget') ? form.querySelector('#budget').value.trim() : '',
      comments: form.querySelector('#comments') ? form.querySelector('#comments').value.trim() : ''
    };

    const randNum = Math.floor(1000 + Math.random() * 9000);
    const generatedRef = `GDT-2026-${randNum}`;

    try {
      const response = await fetch('api/send-quote.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const resData = await response.json();
      const finalRef = resData.ref || generatedRef;

      form.style.display = 'none';
      if (successPanel) {
        successPanel.style.display = 'block';
        const refEl = successPanel.querySelector('.quote-ref');
        if (refEl) refEl.innerText = `Reference Code: ${finalRef}`;
        successPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      // Fallback for static demo environment
      form.style.display = 'none';
      if (successPanel) {
        successPanel.style.display = 'block';
        const refEl = successPanel.querySelector('.quote-ref');
        if (refEl) refEl.innerText = `Reference Code: ${generatedRef}`;
        successPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
      { id: '#name', msg: 'Please enter your full name.' },
      { id: '#email', msg: 'Please enter a valid email address.', isEmail: true },
      { id: '#phone', msg: 'Please enter your phone / WhatsApp number.' },
      { id: '#location', msg: 'Please enter your location.' },
      { id: '#budget', msg: 'Please enter your estimated budget.' }
    ];

    fieldsToValidate.forEach(item => {
      const el = form.querySelector(item.id);
      if (el) {
        const val = el.value.trim();
        let fieldValid = true;
        if (!val) {
          fieldValid = false;
        } else if (item.isEmail && !validateEmail(val)) {
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
}
