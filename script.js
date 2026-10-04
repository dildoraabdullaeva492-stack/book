(() => {
  const body = document.body;

  const openSite = () => {
    body.classList.add('is-open');
    body.classList.remove('is-opening');
  };
  body.classList.add('is-opening');
  document.addEventListener('DOMContentLoaded', () => window.setTimeout(openSite, 820));
  window.addEventListener('load', () => window.setTimeout(openSite, 420));
  window.setTimeout(openSite, 1800); // fallback so content never stays hidden

  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const searchToggle = document.querySelector('[data-search-toggle]');
  const searchInput = document.querySelector('[data-search-input]');
  const toast = document.querySelector('[data-toast]');
  const cartCount = document.querySelector('[data-cart-count]');
  let cart = 0;
  let toastTimer;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-show'), 2200);
  };

  const setHeaderState = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 34);
  };
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      body.classList.toggle('menu-open');
      body.classList.remove('search-open');
    });
  }

  if (searchToggle) {
    searchToggle.addEventListener('click', () => {
      body.classList.toggle('search-open');
      body.classList.remove('menu-open');
      if (body.classList.contains('search-open')) searchInput?.focus();
    });
  }

  const revealItems = document.querySelectorAll('.reveal-up, .book-card');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-inview');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  revealItems.forEach((item, index) => {
    if (item.classList.contains('book-card')) item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    revealObserver.observe(item);
  });

  const floatingBooks = document.querySelectorAll('[data-float]');
  const rotations = new Map();
  floatingBooks.forEach((book) => {
    const angle = book.classList.contains('float-book--one') ? -8 : book.classList.contains('float-book--two') ? 6 : 9;
    rotations.set(book, angle);
  });
  const moveBooks = () => {
    const y = window.scrollY;
    floatingBooks.forEach((book) => {
      const speed = Number(book.dataset.float || 0);
      const rotate = rotations.get(book) || 0;
      book.style.transform = `rotate(${rotate}deg) translate3d(0, ${y * speed * 0.012}px, 0)`;
    });
  };
  moveBooks();
  window.addEventListener('scroll', moveBooks, { passive: true });

  const bookCards = Array.from(document.querySelectorAll('.book-card'));
  const filterPills = document.querySelectorAll('[data-filter]');
  const applyFilter = (filter) => {
    filterPills.forEach((pill) => pill.classList.toggle('is-active', pill.dataset.filter === filter));
    bookCards.forEach((card) => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('is-hidden', !match);
      if (match) requestAnimationFrame(() => card.classList.add('is-inview'));
    });
  };
  filterPills.forEach((pill) => pill.addEventListener('click', () => applyFilter(pill.dataset.filter)));

  document.querySelectorAll('[data-filter-jump]').forEach((button) => {
    button.addEventListener('click', () => {
      applyFilter(button.dataset.filterJump);
      document.querySelector('#catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      bookCards.forEach((card) => {
        const match = !q || (card.dataset.title || '').toLowerCase().includes(q);
        card.classList.toggle('is-hidden', !match);
      });
    });
  }

  document.querySelectorAll('[data-add-cart]').forEach((button) => {
    button.addEventListener('click', () => {
      cart += 1;
      if (cartCount) cartCount.textContent = String(cart);
      const card = button.closest('.book-card');
      const title = card?.querySelector('h3')?.textContent || 'Kitob';
      showToast(`${title} savatchaga qo‘shildi.`);
    });
  });

  // Quick view modal.
  const modal = document.querySelector('[data-modal]');
  const modalImage = document.querySelector('[data-modal-image]');
  const modalTitle = document.querySelector('[data-modal-title]');
  const modalText = document.querySelector('[data-modal-text]');
  const modalAdd = document.querySelector('[data-modal-add]');
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  };
  const openModal = (card) => {
    if (!modal || !card) return;
    const title = card.querySelector('h3')?.textContent || 'Kitob';
    const author = card.querySelector('.book-card__meta p')?.textContent || '';
    const price = card.querySelector('.book-card__meta span')?.textContent || '';
    const img = card.querySelector('img');
    if (modalTitle) modalTitle.textContent = title;
    if (modalText) modalText.textContent = `${author}. Narx: ${price}. Bu nashr AX BOOK MARKET tanlangan vitrinasida — muqova, janr va kayfiyat bo‘yicha ehtiyotkorlik bilan saralangan.`;
    if (modalImage && img) {
      modalImage.src = img.getAttribute('src');
      modalImage.alt = img.alt;
    }
    if (modalAdd) modalAdd.dataset.title = title;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  };
  document.querySelectorAll('[data-quick-view]').forEach((button) => {
    button.addEventListener('click', () => openModal(button.closest('.book-card')));
  });
  document.querySelector('[data-modal-close]')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  modalAdd?.addEventListener('click', () => {
    cart += 1;
    if (cartCount) cartCount.textContent = String(cart);
    showToast(`${modalAdd.dataset.title || 'Kitob'} savatchaga qo‘shildi.`);
    closeModal();
  });

  document.querySelectorAll('.accordion__item').forEach((item) => {
    item.addEventListener('click', () => {
      const panel = item.nextElementSibling;
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.accordion__item.is-open').forEach((openItem) => {
        openItem.classList.remove('is-open');
        const openPanel = openItem.nextElementSibling;
        if (openPanel) openPanel.style.maxHeight = '0px';
      });
      if (!isOpen && panel) {
        item.classList.add('is-open');
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  });

  const newsletterForm = document.querySelector('[data-newsletter-form]');
  newsletterForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = newsletterForm.querySelector('[data-form-message]');
    if (message) message.textContent = 'Rahmat! Obuna so‘rovingiz qabul qilindi — yangiliklar emailga yuboriladi.';
    newsletterForm.reset();
    showToast('Obuna tasdiqlandi.');
  });

  const contactForm = document.querySelector('[data-contact-form]');
  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = contactForm.querySelector('[data-contact-message]');
    if (message) message.textContent = 'Xabaringiz qabul qilindi. AX BOOK MARKET jamoasi tez orada javob beradi.';
    contactForm.reset();
    showToast('Xabaringiz qabul qilindi.');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      body.classList.remove('menu-open', 'search-open');
      closeModal();
    }
  });
})();
