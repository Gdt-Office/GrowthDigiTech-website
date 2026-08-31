/**
 * GrowthDigiTech Reusable Thank You Success Modal Component
 */

(function () {
  let activeModal = null;
  let previousFocusedElement = null;

  function createModalHtml() {
    if (document.getElementById('gdt-success-modal')) return;

    const modalMarkup = `
      <div class="gdt-modal-backdrop" id="gdt-success-modal" role="dialog" aria-modal="true" aria-labelledby="gdt-modal-title" tabindex="-1">
        <div class="gdt-modal-card">
          <button type="button" class="gdt-modal-close" aria-label="Close Modal">&times;</button>
          
          <div class="gdt-modal-icon-wrapper">
            <svg class="gdt-modal-checkmark" viewBox="0 0 52 52">
              <circle class="gdt-modal-circle" cx="26" cy="26" r="24" fill="none"/>
              <path class="gdt-modal-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>

          <h2 class="gdt-modal-title" id="gdt-modal-title">Thank You for Contacting GrowthDigiTech!</h2>
          <p class="gdt-modal-message" id="gdt-modal-message">We have received your details successfully. Our team will review your requirements and contact you within 2 hours to discuss the best solution for your business.</p>
          <div class="gdt-modal-subtext">We look forward to helping your business grow.</div>

          <div class="gdt-modal-actions">
            <button type="button" class="gdt-modal-btn gdt-modal-btn-primary" id="gdt-modal-done-btn">Done</button>
            <a href="https://web.whatsapp.com/send?phone=918072841079" target="_blank" rel="noopener" class="gdt-modal-btn gdt-modal-btn-whatsapp" id="gdt-modal-wa-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              Chat With Us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalMarkup);

    const modal = document.getElementById('gdt-success-modal');
    const closeBtn = modal.querySelector('.gdt-modal-close');
    const doneBtn = document.getElementById('gdt-modal-done-btn');

    closeBtn.addEventListener('click', closeSuccessModal);
    doneBtn.addEventListener('click', closeSuccessModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeSuccessModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && activeModal && activeModal.classList.contains('active')) {
        closeSuccessModal();
      }
    });
  }

  window.showSuccessModal = function (options = {}) {
    createModalHtml();

    const modal = document.getElementById('gdt-success-modal');
    const msgEl = document.getElementById('gdt-modal-message');
    const name = options.firstName ? options.firstName.trim() : '';

    if (name) {
      msgEl.innerHTML = `Thank you, <strong>${name}</strong>! We have received your details successfully. Our team will review your requirements and contact you within <strong>2 hours</strong> to discuss the best solution for your business.`;
    } else {
      msgEl.innerHTML = `We have received your details successfully. Our team will review your requirements and contact you within <strong>2 hours</strong> to discuss the best solution for your business.`;
    }

    previousFocusedElement = document.activeElement;
    activeModal = modal;

    modal.style.display = 'flex';
    // Force reflow
    void modal.offsetWidth;
    modal.classList.add('active');

    const doneBtn = document.getElementById('gdt-modal-done-btn');
    if (doneBtn) doneBtn.focus();
  };

  window.closeSuccessModal = function () {
    const modal = document.getElementById('gdt-success-modal');
    if (!modal) return;

    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
      if (previousFocusedElement && typeof previousFocusedElement.focus === 'function') {
        previousFocusedElement.focus();
      }
    }, 250);
  };
})();
