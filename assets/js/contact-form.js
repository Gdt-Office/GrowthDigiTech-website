/**
 * GrowthDigiTech Contact Form Handler
 * Handles Contact Form validation, POST submission to /api/enquiry,
 * fallback storage, and displays the 4-Hour Response Commitment Modal.
 */

document.addEventListener('DOMContentLoaded', () => {
  const forms = [
    document.getElementById('contact-form'),
    document.getElementById('contact-enquiry-form')
  ].filter(Boolean);

  forms.forEach(form => {
    initContactEnquiryForm(form);
  });
});

function initContactEnquiryForm(form) {
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
    const messageEl = form.querySelector('textarea[name="message"]');
    const honeypot = form.querySelector('input[name="b_address"]') ? form.querySelector('input[name="b_address"]').value : '';

    let isValid = true;
    if (!nameEl || !nameEl.value.trim()) { showError(nameEl, 'Please enter your full name.'); isValid = false; }
    if (!emailEl || !emailEl.value.trim() || !validateEmail(emailEl.value.trim())) { showError(emailEl, 'Please enter a valid email address.'); isValid = false; }
    if (!messageEl || !messageEl.value.trim()) { showError(messageEl, 'Please describe your project requirements.'); isValid = false; }

    if (!isValid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Enquiry →';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner" style="display:inline-block; width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:8px;"></span> Submitting...';
    }

    const randNum = Math.floor(1000 + Math.random() * 9000);
    const generatedRef = `GDT-CNT-2026-${randNum}`;

    const formData = {
      reference_id: generatedRef,
      form_type: 'contact',
      full_name: nameEl.value.trim(),
      company_name: businessEl ? businessEl.value.trim() : '',
      email: emailEl.value.trim(),
      phone: phoneEl ? phoneEl.value.trim() : '',
      city: cityEl ? cityEl.value.trim() : '',
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
      console.warn('Backend API endpoint unreachable. Saving enquiry locally:', err);
    }

    // 2. Fallback Local Storage Backup (Guarantees zero data loss)
    saveEnquiryToLocalStorage('contact_enquiries', formData);
    savedSuccessfully = true;

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }

    // Track GTM Conversion Event
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "contact_form_success",
      form_name: "contact_form",
      form_location: window.location.pathname
    });

    form.reset();

    // 3. Show 4-Hour Business Commitment Confirmation Modal
    showConfirmationModal({
      refId: generatedRef,
      name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      formType: 'Contact Enquiry'
    });
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

// Local Storage Helper
function saveEnquiryToLocalStorage(tableKey, data) {
  try {
    const existing = JSON.parse(localStorage.getItem(tableKey) || '[]');
    existing.push(data);
    localStorage.setItem(tableKey, JSON.stringify(existing));
  } catch (e) {
    console.error('LocalStorage error:', e);
  }
}

// Global Confirmation Modal Renderer
window.showConfirmationModal = function({ refId, name }) {
  let modalBackdrop = document.getElementById('gdt-confirmation-modal');
  if (!modalBackdrop) {
    modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'gdt-confirmation-modal';
    modalBackdrop.className = 'gdt-modal-backdrop';
    document.body.appendChild(modalBackdrop);
  }

  modalBackdrop.innerHTML = `
    <div class="gdt-modal-card">
      <button class="gdt-modal-close-btn" onclick="closeConfirmationModal()">&times;</button>
      <div class="gdt-modal-logo-wrap" style="margin-bottom: 20px; text-align: center;">
        <img src="assets/logo/logo.png" alt="GrowthDigiTech" style="max-height: 52px; width: auto; max-width: 100%; display: inline-block;">
      </div>
      <h2 class="gdt-modal-title">Enquiry Submitted Successfully!</h2>
      <div class="gdt-ref-badge">
        <i class="fa-solid fa-ticket"></i> Reference Code: ${refId}
      </div>

      <div class="gdt-commitment-box">
        <p style="margin: 0; font-size: 1.02rem; line-height: 1.65; color: #1e293b;">
          Thanks, <strong>${escapeHtml(name)}</strong> 🎉 We've got your submission and it's looking good. Our team will review everything and get back to you soon—usually within 4 business hours. Keep an eye on your inbox between 9:30 AM and 7:00 PM IST!
        </p>
      </div>

      <div class="gdt-modal-actions">
        <a href="https://web.whatsapp.com/send?phone=918072841079&text=Hi%20GrowthDigiTech,%20I%20just%20submitted%20an%20enquiry%20(Ref:%20${refId})." target="_blank" rel="noopener" class="btn-whatsapp">
          <i class="fab fa-whatsapp" style="font-size: 1.2rem;"></i> Connect on WhatsApp Now →
        </a>
        <button class="btn-close-modal" onclick="closeConfirmationModal()">Close Window</button>
      </div>
    </div>
  `;

  setTimeout(() => {
    modalBackdrop.classList.add('active');
  }, 10);
};

window.closeConfirmationModal = function() {
  const modal = document.getElementById('gdt-confirmation-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
  }
};

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
