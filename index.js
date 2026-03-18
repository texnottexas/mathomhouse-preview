document.addEventListener('DOMContentLoaded', function () {
    // Theme setup — apply saved preference immediately
    var savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.dataset.theme = 'dark';
    }

    // Back to top button
    var backToTop = document.getElementById('backToTop');
    if (backToTop) {
      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    window.addEventListener('scroll', function () {
      if (backToTop) {
        backToTop.classList.toggle('show', window.scrollY > 300);
      }
    });

    // Section reveal on scroll
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('show');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section').forEach(function (section) {
      observer.observe(section);
    });

    // HT icon cycling with clean transition handling
    var htIcons = [
      "/mathomhouse-preview/images/yellow-ht-icon.png",
      "/mathomhouse-preview/images/red-ht-icon.png",
      "/mathomhouse-preview/images/blue-ht-icon.png",
      "/mathomhouse-preview/images/ball-ht-icon.png",
      "/mathomhouse-preview/images/white-ht-icon.png",
      "/mathomhouse-preview/images/pink-ht-icon.png"
    ];

    var iconElement = document.getElementById("ht-icon");
    if (iconElement) {
      var currentIcon = 0;
      var transitioning = false;
      setInterval(function () {
        if (transitioning) return;
        transitioning = true;
        iconElement.style.opacity = 0;
        iconElement.addEventListener('transitionend', function handler() {
          iconElement.removeEventListener('transitionend', handler);
          currentIcon = (currentIcon + 1) % htIcons.length;
          iconElement.src = htIcons[currentIcon];
          iconElement.style.opacity = 1;
          transitioning = false;
        });
      }, 5000);
    }

    // Feedback modal
    var feedbackInput = document.getElementById('modal-feedback-input');
    var charCount = document.getElementById('char-count');
    if (feedbackInput && charCount) {
      feedbackInput.addEventListener('input', function () {
        charCount.textContent = this.value.length;
      });
    }

    function openFeedbackModal() {
      document.getElementById('feedback-modal').classList.remove('hidden');
      document.getElementById('modal-backdrop').classList.remove('hidden');
    }

    function closeFeedbackModal() {
      document.getElementById('feedback-modal').classList.add('hidden');
      document.getElementById('modal-backdrop').classList.add('hidden');
      document.getElementById('feedback-confirmation').classList.add('hidden');
    }

    function submitModalFeedback() {
      var type = document.getElementById('feedback-type').value;
      var feedback = document.getElementById('modal-feedback-input').value.trim();
      var discord = document.getElementById('discord-name').value.trim();
      var pageURL = window.location.href;

      if (!feedback) {
        alert("Please enter your feedback.");
        return;
      }

      var localTime = new Date().toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      var userLang = navigator.language || navigator.userLanguage;

      // Submit to Google Forms
      var formURL = 'https://docs.google.com/forms/d/e/1FAIpQLSerJUAkcskPE5sDyrMarZoskzm6wpN2HvHzPeKxjnFmPZHddg/formResponse';
      var formData = new FormData();
      formData.append('entry.1593678335', type);
      formData.append('entry.486773277', feedback);
      formData.append('entry.1545987824', discord);

      fetch(formURL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });

      // NOTE: Discord webhook removed from client-side code for security.
      // To restore Discord notifications, use a server-side proxy
      // (e.g., Cloudflare Worker, Netlify Function, or GitHub Actions).
      // See docs/security-review.md for details.

      document.getElementById('modal-feedback-input').value = '';
      document.getElementById('discord-name').value = '';
      if (charCount) charCount.textContent = '0';

      showToast("Feedback submitted!");
      setTimeout(closeFeedbackModal, 3000);
    }

    function showToast(message) {
      var toast = document.getElementById('toast');
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(function () { toast.classList.remove('show'); }, 3000);
    }

    // Support modal
    function openSupportModal() {
      document.getElementById('support-modal').classList.remove('hidden');
      document.getElementById('support-backdrop').classList.remove('hidden');
    }

    function closeSupportModal() {
      document.getElementById('support-modal').classList.add('hidden');
      document.getElementById('support-backdrop').classList.add('hidden');
    }

    // Wire up event listeners (replacing inline onclick handlers)
    var feedbackCard = document.getElementById('feedback-card');
    if (feedbackCard) {
      feedbackCard.addEventListener('click', function (e) {
        e.preventDefault();
        openFeedbackModal();
      });
    }

    var supportCard = document.getElementById('support-card');
    if (supportCard) {
      supportCard.addEventListener('click', function (e) {
        e.preventDefault();
        openSupportModal();
      });
    }

    var feedbackSubmitBtn = document.getElementById('feedback-submit-btn');
    if (feedbackSubmitBtn) {
      feedbackSubmitBtn.addEventListener('click', submitModalFeedback);
    }

    var feedbackCancelBtn = document.getElementById('feedback-cancel-btn');
    if (feedbackCancelBtn) {
      feedbackCancelBtn.addEventListener('click', closeFeedbackModal);
    }

    var supportCloseBtn = document.getElementById('support-close-btn');
    if (supportCloseBtn) {
      supportCloseBtn.addEventListener('click', closeSupportModal);
    }

    var modalBackdrop = document.getElementById('modal-backdrop');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', closeFeedbackModal);
    }

    var supportBackdrop = document.getElementById('support-backdrop');
    if (supportBackdrop) {
      supportBackdrop.addEventListener('click', closeSupportModal);
    }

    // Expose for other pages that might need these
    window.openFeedbackModal = openFeedbackModal;
    window.closeFeedbackModal = closeFeedbackModal;
    window.openSupportModal = openSupportModal;
    window.closeSupportModal = closeSupportModal;
  });
