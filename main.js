/* ----------------------------------------------------
   Double Cheeked Up (DCU) Interactivity Script
   ---------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollSpy();
  initTableBooking();
  initMenuCart();
  initMapInteraction();
  initSparkleTrail();
  initDemoBadge();
  initMenuTabs();
  initCheckoutModal();
  initAdminPortal();
  initUserAuthAndHub();
});

/* 1. Mobile Navigation Toggle */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('mobile-active');
      toggleBtn.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        navMenu.classList.remove('mobile-active');
        toggleBtn.classList.remove('active');
      }
    });

    // Close menu when clicking links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-active');
        toggleBtn.classList.remove('active');
      });
    });
  }
}

/* 2. Scroll Spy - Highlights Active Nav Link */
function initScrollSpy() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 100; // Offset for navbar

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === current) {
        link.classList.add('active');
      }
    });
  });
}

/* 3. Table Booking Modal & Local Storage Persistence */
function initTableBooking() {
  const overlay = document.getElementById('booking-modal-overlay');
  const openButtons = [
    document.getElementById('nav-book-btn'),
    document.getElementById('hero-book-btn'),
    document.getElementById('booking-modal-close'),
    // Direct hook inside Meme Card 3 ("Table for 1: booked ✓")
    document.getElementById('meme-card-3')
  ];

  const closeBtn = document.getElementById('booking-modal-close');
  const form = document.getElementById('booking-form');

  // Open modal triggers
  openButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (btn === closeBtn) {
          closeModal();
        } else {
          openModal();
        }
      });
    }
  });

  // Close when clicking overlay backdrop
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });
  }

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('booking-name').value;
      const phone = document.getElementById('booking-phone').value;
      const date = document.getElementById('booking-date').value;
      const time = document.getElementById('booking-time').value;
      const guests = document.getElementById('booking-guests').value;

      const reservation = { name, phone, date, time, guests, id: Date.now() };

      // Associate with current user if logged in
      const currentUser = JSON.parse(localStorage.getItem('dcu_current_user') || 'null');
      if (currentUser) {
        reservation.username = currentUser.username;
      }

      // Save reservation list to Local Storage
      const currentBookings = JSON.parse(localStorage.getItem('dcu_bookings') || '[]');
      currentBookings.push(reservation);
      localStorage.setItem('dcu_bookings', JSON.stringify(currentBookings));

      // Show success feedback
      closeModal();
      showToast(`Booking Locked In for ${name}! See you there. 🫶`);
      form.reset();

      // Update user hub bookings if open
      if (window.refreshUserHubData) {
        window.refreshUserHubData();
      }
    });
  }

  function openModal() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Set minimum date to today
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
    }
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* 4. Menu Cart / Add to Plate functionality */
function initMenuCart() {
  const addButtons = document.querySelectorAll('.add-dish-btn');
  const counter = document.getElementById('cart-counter');
  const cartBtn = document.getElementById('cart-btn');

  let plateItems = JSON.parse(localStorage.getItem('dcu_plate_items') || '{}');
  updateCartUI();

  addButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      const price = btn.getAttribute('data-price');

      if (!plateItems[name]) {
        plateItems[name] = { price: parseInt(price), qty: 0 };
      }
      plateItems[name].qty += 1;

      localStorage.setItem('dcu_plate_items', JSON.stringify(plateItems));
      updateCartUI();

      showToast(`Added ${name} to your plate! 🍜`);

      // Animate cart button
      if (cartBtn) {
        cartBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
          cartBtn.style.transform = '';
        }, 200);
      }
    });
  });

  // Clicking the cart details
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      const items = JSON.parse(localStorage.getItem('dcu_plate_items') || '{}');
      const itemKeys = Object.keys(items);
      const activeItems = itemKeys.filter(name => items[name].qty > 0);

      if (activeItems.length === 0) {
        showToast("Your plate is empty! Order some gyozas fr fr 🥟");
        return;
      }

      // Open the interactive checkout modal instead of standard alert
      if (window.openCheckoutModal) {
        window.openCheckoutModal(items, activeItems);
      }
    });
  }

  function updateCartUI() {
    if (!counter) return;
    const items = JSON.parse(localStorage.getItem('dcu_plate_items') || '{}');
    const totalQty = Object.values(items).reduce((acc, curr) => acc + curr.qty, 0);
    counter.textContent = totalQty;
  }
}

/* 5. Custom Map Pin Toggle & Directions Redirect */
function initMapInteraction() {
  const pin = document.getElementById('map-pin-marker');
  const popup = document.getElementById('map-popup');
  const directionsBtn = document.getElementById('get-directions-btn');

  if (pin && popup) {
    pin.addEventListener('click', () => {
      popup.style.display = (popup.style.display === 'none' || popup.style.display === '') ? 'block' : 'none';
    });
  }

  if (directionsBtn) {
    directionsBtn.addEventListener('click', () => {
      // Direct deep link query for Google Maps
      window.open('https://www.google.com/maps/search/?api=1&query=Double+Cheeked+Up+DHA+Lahore', '_blank');
    });
  }
}

/* 6. Mouse Cursor Sparkle Trail Effect */
function initSparkleTrail() {
  let lastSparkleTime = 0;

  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    // Throttle sparkle creation (max 1 every 60ms)
    if (now - lastSparkleTime < 60) return;
    lastSparkleTime = now;

    createSparkle(e.pageX, e.pageY);
  });

  function createSparkle(x, y) {
    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle-decor';
    sparkle.textContent = '✦';

    // Randomize colors slightly (bun gold, yellow cheese, or white)
    const colors = ['#D4935A', '#E8B84B', '#F5F2EE'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    sparkle.style.color = randomColor;
    sparkle.style.position = 'absolute';
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '9999';

    // Add random slight offsets
    const offsetVal = 10;
    const randomX = (Math.random() - 0.5) * offsetVal;
    const randomY = (Math.random() - 0.5) * offsetVal;

    // Custom float and shrink animation
    sparkle.animate([
      { transform: 'translate(0, 0) scale(0.6) rotate(0deg)', opacity: 0.9 },
      { transform: `translate(${randomX}px, ${randomY - 25}px) scale(1.1) rotate(180deg)`, opacity: 1 },
      { transform: `translate(${randomX * 1.5}px, ${randomY - 50}px) scale(0) rotate(360deg)`, opacity: 0 }
    ], {
      duration: 1000,
      easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
      fill: 'forwards'
    });

    document.body.appendChild(sparkle);

    // Clean up
    setTimeout(() => {
      sparkle.remove();
    }, 1000);
  }
}

/* Helper: Toast Notifications */
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');

  if (toast && toastMsg) {
    toastMsg.textContent = message;
    toast.classList.add('active');

    setTimeout(() => {
      toast.classList.remove('active');
    }, 3500);
  }
}

/* 7. Bottom-Right Demo Badge Action */
function initDemoBadge() {
  const badge = document.getElementById('demo-badge');
  if (badge) {
    badge.addEventListener('click', () => {
      showToast("Double Cheeked Up Web Demo Active! It's giving yummy! ✦");
    });
  }
}

/* 8. Menu Tabs Category Switcher */
function initMenuTabs() {
  const tabs = document.querySelectorAll('.menu-tab-btn');
  const categories = document.querySelectorAll('.menu-category-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetCat = tab.getAttribute('data-category');

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      categories.forEach(cat => {
        if (cat.getAttribute('id') === `cat-${targetCat}`) {
          cat.classList.add('active');
        } else {
          cat.classList.remove('active');
        }
      });
    });
  });
}

/* 9. Interactive Checkout Modal & Order Placement */
function initCheckoutModal() {
  const overlay = document.getElementById('checkout-modal-overlay');
  const closeBtn = document.getElementById('checkout-modal-close');
  const form = document.getElementById('checkout-form');
  const itemsList = document.getElementById('checkout-items-list');
  const totalPriceEl = document.getElementById('checkout-total-price');

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  // Expose function globally to be called from the cart script
  window.openCheckoutModal = (items, activeItems) => {
    if (!itemsList || !totalPriceEl || !overlay) return;

    itemsList.innerHTML = '';
    let total = 0;

    activeItems.forEach(name => {
      const item = items[name];
      const itemRow = document.createElement('div');
      itemRow.style.display = 'flex';
      itemRow.style.justify = 'space-between';
      itemRow.style.marginBottom = '0.5rem';
      itemRow.style.fontSize = '0.95rem';
      itemRow.innerHTML = `
        <span>${item.qty}x ${name}</span>
        <span style="color: var(--primary-accent);">Rs.${item.price * item.qty}</span>
      `;
      itemsList.appendChild(itemRow);
      total += item.price * item.qty;
    });

    totalPriceEl.textContent = `Rs.${total}`;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('checkout-name').value;
      const phone = document.getElementById('checkout-phone').value;
      const type = document.getElementById('checkout-type').value;

      const items = JSON.parse(localStorage.getItem('dcu_plate_items') || '{}');
      const itemKeys = Object.keys(items);
      const activeItems = itemKeys.filter(name => items[name].qty > 0);

      let orderedItemsStr = activeItems.map(name => `${items[name].qty}x ${name}`).join(', ');
      let totalBill = activeItems.reduce((acc, name) => acc + (items[name].price * items[name].qty), 0);

      const orderId = `DCU-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder = {
        id: orderId,
        name,
        phone,
        type,
        items: orderedItemsStr,
        total: totalBill,
        status: 'Pending',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Associate with current user if logged in
      const currentUser = JSON.parse(localStorage.getItem('dcu_current_user') || 'null');
      if (currentUser) {
        newOrder.username = currentUser.username;
      }

      // Save to localStorage
      const orders = JSON.parse(localStorage.getItem('dcu_orders') || '[]');
      orders.push(newOrder);
      localStorage.setItem('dcu_orders', JSON.stringify(orders));

      // Clear Cart
      localStorage.setItem('dcu_plate_items', '{}');
      const counter = document.getElementById('cart-counter');
      if (counter) counter.textContent = '0';

      closeModal();
      showToast(`Order ${orderId} placed! The kitchen is cooking. 🚀`);
      form.reset();

      // Update user hub orders if open
      if (window.refreshUserHubData) {
        window.refreshUserHubData();
      }

      // Update admin panel if visible
      if (window.refreshAdminDashboard) {
        window.refreshAdminDashboard();
      }
    });
  }

  function closeModal() {
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* 10. Admin Portal & Dashboard Logic */
function initAdminPortal() {
  const loginBtn = document.getElementById('admin-login-btn');
  const loginOverlay = document.getElementById('admin-login-modal-overlay');
  const loginClose = document.getElementById('admin-login-modal-close');
  const loginForm = document.getElementById('admin-login-form');
  const loginError = document.getElementById('admin-login-error');

  const dashboard = document.getElementById('admin-dashboard');
  const logoutBtn = document.getElementById('admin-logout-btn');

  const ordersList = document.getElementById('admin-orders-list');
  const bookingsList = document.getElementById('admin-bookings-list');

  const statRevenue = document.getElementById('stat-revenue');
  const statOrdersCount = document.getElementById('stat-orders-count');
  const statPendingSub = document.getElementById('stat-pending-sub');
  const statBookingsCount = document.getElementById('stat-bookings-count');

  const clearOrdersBtn = document.getElementById('clear-orders-btn');
  const clearBookingsBtn = document.getElementById('clear-bookings-btn');
  const visitorCountEl = document.getElementById('dashboard-visitors');

  // Seed default data if localStorage is empty to show a populated dashboard
  seedDemoData();

  // Hidden Admin Triggers
  // 1. Keyboard Shortcut Ctrl + Shift + A (or Cmd + Shift + A)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      if (loginOverlay) {
        loginOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (loginError) loginError.style.display = 'none';
      }
    }
  });

  // 2. Double Click copyright in footer
  const copyrightEl = document.querySelector('.footer-copyright');
  if (copyrightEl) {
    copyrightEl.style.cursor = 'pointer';
    copyrightEl.addEventListener('dblclick', () => {
      if (loginOverlay) {
        loginOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (loginError) loginError.style.display = 'none';
      }
    });
  }

  // 3. URL Hash / query param triggers
  function checkAdminHash() {
    if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
      if (loginOverlay) {
        loginOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (loginError) loginError.style.display = 'none';
        window.location.hash = ''; // Clear hash to prevent infinite prompt on reload
      }
    }
  }
  window.addEventListener('hashchange', checkAdminHash);
  window.addEventListener('load', checkAdminHash);

  // 4. Mobile phone trigger: 5 rapid clicks/taps on the brand logo
  let logoTapCount = 0;
  let lastLogoTapTime = 0;
  const brandLogo = document.querySelector('.nav-brand');
  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      const now = Date.now();
      if (now - lastLogoTapTime < 500) {
        logoTapCount++;
        if (logoTapCount === 5) {
          e.preventDefault();
          if (loginOverlay) {
            loginOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (loginError) loginError.style.display = 'none';
          }
          logoTapCount = 0;
        }
      } else {
        logoTapCount = 1;
      }
      lastLogoTapTime = now;
    });
  }

  // Visitor counter tick simulator
  setInterval(() => {
    if (visitorCountEl && dashboard && dashboard.style.display !== 'none') {
      const activeVibes = Math.floor(35 + Math.random() * 20);
      visitorCountEl.textContent = `Active Vibes: ${activeVibes} users`;
    }
  }, 4000);

  // Toggle Login Modal
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loginOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (loginError) loginError.style.display = 'none';
    });
  }

  if (loginClose && loginOverlay) {
    loginClose.addEventListener('click', closeLoginModal);
    loginOverlay.addEventListener('click', (e) => {
      if (e.target === loginOverlay) closeLoginModal();
    });
  }

  function closeLoginModal() {
    if (loginOverlay) loginOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Handle Login Submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('admin-username').value;
      const pass = document.getElementById('admin-password').value;

      if (user === 'admin' && pass === 'dubcheeked1122') {
        // Successful login
        closeLoginModal();
        loginForm.reset();
        showToast("Logged in as Admin! Welcome to the Control Room. 🔐");

        // Show dashboard overlay
        if (dashboard) {
          dashboard.style.display = 'block';
          document.body.style.overflow = 'hidden';
          refreshDashboard();
        }
      } else {
        // Show error message
        if (loginError) loginError.style.display = 'block';
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (dashboard) {
        dashboard.style.display = 'none';
        document.body.style.overflow = '';
        showToast("Logged out of Admin Portal.");
      }
    });
  }

  // Refresh stats and lists
  function refreshDashboard() {
    const orders = JSON.parse(localStorage.getItem('dcu_orders') || '[]');
    const bookings = JSON.parse(localStorage.getItem('dcu_bookings') || '[]');

    // Stats Calculations
    const totalRev = orders.reduce((acc, curr) => acc + curr.total, 0);
    const activeOrders = orders.filter(o => o.status === 'Pending').length;

    if (statRevenue) statRevenue.textContent = `Rs.${totalRev.toLocaleString()}`;
    if (statOrdersCount) statOrdersCount.textContent = orders.length;
    if (statPendingSub) statPendingSub.textContent = `${activeOrders} Pending kitchen`;
    if (statBookingsCount) statBookingsCount.textContent = bookings.length;

    // Populate Orders List
    if (ordersList) {
      ordersList.innerHTML = '';
      if (orders.length === 0) {
        ordersList.innerHTML = '<tr><td colspan="7" style="text-align: center; color: rgba(245,242,238,0.4); padding: 1.5rem;">No orders in queue yet.</td></tr>';
      } else {
        orders.forEach(order => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><span class="badge-id" style="background: rgba(212,147,90,0.1); color: var(--primary-accent); padding: 0.2rem 0.5rem; border-radius: 6px; font-weight: bold; font-family: var(--font-nav);">${order.id}</span></td>
            <td><strong>${order.name}</strong><br><span style="font-size:0.75rem;opacity:0.6;">${order.phone}</span></td>
            <td><span style="font-size:0.8rem; background: rgba(245,242,238,0.05); padding: 0.15rem 0.4rem; border-radius: 4px;">${order.type}</span></td>
            <td style="max-width: 220px; white-space: normal; font-size:0.8rem; line-height: 1.3;">${order.items}</td>
            <td style="color:var(--primary-accent); font-weight:bold; font-family: var(--font-nav);">Rs.${order.total}</td>
            <td><span class="status-indicator status-${order.status.toLowerCase()}" style="font-size: 0.75rem; font-weight: bold; padding: 0.2rem 0.5rem; border-radius: 4px; ${order.status === 'Pending' ? 'background: rgba(168,53,32,0.1); color: var(--tertiary-bright);' :
              order.status === 'Completed' ? 'background: rgba(46,125,50,0.1); color: #81c784;' :
                'background: rgba(245,242,238,0.05); color: rgba(245,242,238,0.4);'
            }">${order.status}</span></td>
            <td>
              ${order.status === 'Pending' ? `
                <button class="action-btn complete-btn" data-id="${order.id}" style="background: #2e7d32; color: #fff; border: none; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer; margin-right: 0.3rem;">Serve ✓</button>
                <button class="action-btn cancel-btn" data-id="${order.id}" style="background: var(--tertiary-bright); color: #fff; border: none; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer;">Void ×</button>
              ` : `<span style="font-size:0.8rem;color:rgba(245,242,238,0.3);">Handled</span>`}
            </td>
          `;
          ordersList.appendChild(tr);
        });
      }
    }

    // Populate Bookings List
    if (bookingsList) {
      bookingsList.innerHTML = '';
      if (bookings.length === 0) {
        bookingsList.innerHTML = '<tr><td colspan="6" style="text-align: center; color: rgba(245,242,238,0.4); padding: 1.5rem;">No bookings placed yet.</td></tr>';
      } else {
        bookings.forEach((booking, idx) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong>${booking.name}</strong></td>
            <td><span style="font-size:0.85rem;">${booking.phone}</span></td>
            <td>${booking.date}</td>
            <td>${booking.time}</td>
            <td><span class="badge-guests" style="background: rgba(232,184,75,0.1); color: var(--secondary-accent); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">${booking.guests} Pax</span></td>
            <td>
              <button class="action-btn cancel-btn cancel-booking-btn" data-index="${idx}" style="background: var(--tertiary-bright); color: #fff; border: none; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer;">Cancel ×</button>
            </td>
          `;
          bookingsList.appendChild(tr);
        });
      }
    }
  }

  // Expose dashboard refresh function globally
  window.refreshAdminDashboard = refreshDashboard;

  // Complete Order
  if (ordersList) {
    ordersList.addEventListener('click', (e) => {
      if (e.target.classList.contains('complete-btn')) {
        const id = e.target.getAttribute('data-id');
        updateOrderStatus(id, 'Completed');
      } else if (e.target.classList.contains('cancel-btn')) {
        const id = e.target.getAttribute('data-id');
        updateOrderStatus(id, 'Void');
      }
    });
  }

  // Cancel Booking
  if (bookingsList) {
    bookingsList.addEventListener('click', (e) => {
      if (e.target.classList.contains('cancel-booking-btn')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        const bookings = JSON.parse(localStorage.getItem('dcu_bookings') || '[]');
        bookings.splice(index, 1);
        localStorage.setItem('dcu_bookings', JSON.stringify(bookings));
        showToast("Reservation removed from schedule.");
        refreshDashboard();
      }
    });
  }

  function updateOrderStatus(orderId, newStatus) {
    const orders = JSON.parse(localStorage.getItem('dcu_orders') || '[]');
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = newStatus;
      localStorage.setItem('dcu_orders', JSON.stringify(orders));
      showToast(`Order ${orderId} marked as ${newStatus}!`);
      refreshDashboard();
      // Update User Hub if active
      if (window.refreshUserHubData) {
        window.refreshUserHubData();
      }
    }
  }

  // Clear completed orders
  if (clearOrdersBtn) {
    clearOrdersBtn.addEventListener('click', () => {
      const orders = JSON.parse(localStorage.getItem('dcu_orders') || '[]');
      const activeOnly = orders.filter(o => o.status === 'Pending');
      localStorage.setItem('dcu_orders', JSON.stringify(activeOnly));
      showToast("Cleared completed/voided orders from queue.");
      refreshDashboard();
    });
  }

  // Clear all bookings
  if (clearBookingsBtn) {
    clearBookingsBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to clear all table reservations?")) {
        localStorage.setItem('dcu_bookings', '[]');
        showToast("Cleared all table reservations.");
        refreshDashboard();
      }
    });
  }

  // Seed default dashboard data if it's the first run
  function seedDemoData() {
    if (!localStorage.getItem('dcu_users')) {
      const defaultUsers = [
        {
          name: 'Demo Customer',
          phone: '0321 1234567',
          username: 'demo',
          password: 'password'
        }
      ];
      localStorage.setItem('dcu_users', JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem('dcu_orders')) {
      const defaultOrders = [
        {
          id: 'DCU-1489',
          name: 'Demo Customer A',
          phone: '0300 0000000',
          type: 'Dine-in',
          items: '1x Katsu Sandwich, 1x Regular Fries, 1x Yuzu Passion',
          total: 2400,
          status: 'Pending',
          timestamp: '08:15 PM'
        },
        {
          id: 'DCU-9023',
          name: 'Demo Customer B',
          phone: '0322 0000000',
          type: 'Delivery',
          items: '2x Chicken Bao Buns, 1x Matilda Cake',
          total: 3100,
          status: 'Completed',
          timestamp: '07:45 PM'
        },
        {
          id: 'DCU-4832',
          name: 'Demo Customer C',
          phone: '0333 0000000',
          type: 'Takeaway',
          items: '1x Beef Burger, 1x Togarashi Fries',
          total: 1600,
          status: 'Pending',
          timestamp: '08:42 PM'
        }
      ];
      localStorage.setItem('dcu_orders', JSON.stringify(defaultOrders));
    }

    if (!localStorage.getItem('dcu_bookings')) {
      const defaultBookings = [
        {
          name: 'Demo Guest A',
          phone: '0321 0000000',
          date: new Date().toISOString().split('T')[0],
          time: '8:00 PM',
          guests: '4',
          id: 1716900000001
        },
        {
          name: 'Demo Guest B',
          phone: '0301 0000000',
          date: new Date().toISOString().split('T')[0],
          time: '9:00 PM',
          guests: '2',
          id: 1716900000002
        }
      ];
      localStorage.setItem('dcu_bookings', JSON.stringify(defaultBookings));
    }
  }
}

/* 11. User Authentication & Hub Modal Logic */
function initUserAuthAndHub() {
  const userHubBtn = document.getElementById('user-hub-btn');
  const authOverlay = document.getElementById('user-auth-modal-overlay');
  const authClose = document.getElementById('user-auth-modal-close');

  const tabLogin = document.getElementById('auth-tab-login');
  const tabSignup = document.getElementById('auth-tab-signup');
  const loginForm = document.getElementById('user-login-form');
  const signupForm = document.getElementById('user-signup-form');
  const loginError = document.getElementById('login-error');
  const signupError = document.getElementById('signup-error');

  const hubOverlay = document.getElementById('user-hub-modal-overlay');
  const hubClose = document.getElementById('user-hub-modal-close');
  const logoutBtn = document.getElementById('user-logout-btn');

  const ordersList = document.getElementById('user-orders-list');
  const bookingsList = document.getElementById('user-bookings-list');

  const profileName = document.getElementById('profile-display-name');
  const profilePhone = document.getElementById('profile-display-phone');
  const profileUsername = document.getElementById('profile-display-username');

  // Check session state on load
  checkSession();

  // Tab Switching
  if (tabLogin && tabSignup) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      tabLogin.style.color = 'var(--primary-accent)';
      tabLogin.style.borderBottom = '2px solid var(--primary-accent)';
      tabSignup.style.color = 'rgba(245, 242, 238, 0.4)';
      tabSignup.style.borderBottom = '2px solid transparent';
      if (loginForm) loginForm.style.display = 'flex';
      if (signupForm) signupForm.style.display = 'none';
      if (loginError) loginError.style.display = 'none';
      if (signupError) signupError.style.display = 'none';
    });

    tabSignup.addEventListener('click', () => {
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
      tabSignup.style.color = 'var(--primary-accent)';
      tabSignup.style.borderBottom = '2px solid var(--primary-accent)';
      tabLogin.style.color = 'rgba(245, 242, 238, 0.4)';
      tabLogin.style.borderBottom = '2px solid transparent';
      if (signupForm) signupForm.style.display = 'flex';
      if (loginForm) loginForm.style.display = 'none';
      if (loginError) loginError.style.display = 'none';
      if (signupError) signupError.style.display = 'none';
    });
  }

  // Open Hub or Auth depending on login status
  if (userHubBtn) {
    userHubBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentUser = JSON.parse(localStorage.getItem('dcu_current_user') || 'null');
      if (currentUser) {
        openHubModal(currentUser);
      } else {
        openAuthModal();
      }
    });
  }

  // Close buttons
  if (authClose && authOverlay) {
    authClose.addEventListener('click', closeAuthModal);
    authOverlay.addEventListener('click', (e) => {
      if (e.target === authOverlay) closeAuthModal();
    });
  }

  if (hubClose && hubOverlay) {
    hubClose.addEventListener('click', closeHubModal);
    hubOverlay.addEventListener('click', (e) => {
      if (e.target === hubOverlay) closeHubModal();
    });
  }

  // Signup Submit
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const phone = document.getElementById('signup-phone').value;
      const username = document.getElementById('signup-username').value.trim().toLowerCase();
      const password = document.getElementById('signup-password').value;

      const users = JSON.parse(localStorage.getItem('dcu_users') || '[]');
      const userExists = users.some(u => u.username === username);

      if (userExists) {
        if (signupError) signupError.style.display = 'block';
        return;
      }

      const newUser = { name, phone, username, password };
      users.push(newUser);
      localStorage.setItem('dcu_users', JSON.stringify(users));

      // Log in
      const sessionUser = { name, phone, username };
      localStorage.setItem('dcu_current_user', JSON.stringify(sessionUser));

      closeAuthModal();
      signupForm.reset();
      checkSession();
      showToast(`Welcome aboard, ${name}! Your account is ready. 👤`);
    });
  }

  // Login Submit
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim().toLowerCase();
      const password = document.getElementById('login-password').value;

      const users = JSON.parse(localStorage.getItem('dcu_users') || '[]');
      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        const sessionUser = { name: user.name, phone: user.phone, username: user.username };
        localStorage.setItem('dcu_current_user', JSON.stringify(sessionUser));

        closeAuthModal();
        loginForm.reset();
        checkSession();
        showToast(`Logged in successfully! Welcome back, ${user.name}. 👤`);
      } else {
        if (loginError) loginError.style.display = 'block';
      }
    });
  }

  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('dcu_current_user');
      closeHubModal();
      checkSession();

      // Clear inputs
      const nameInput = document.getElementById('booking-name');
      const phoneInput = document.getElementById('booking-phone');
      const checkoutNameInput = document.getElementById('checkout-name');
      const checkoutPhoneInput = document.getElementById('checkout-phone');

      if (nameInput) nameInput.value = '';
      if (phoneInput) phoneInput.value = '';
      if (checkoutNameInput) checkoutNameInput.value = '';
      if (checkoutPhoneInput) checkoutPhoneInput.value = '';

      showToast("Logged out of your profile.");
    });
  }

  function checkSession() {
    const currentUser = JSON.parse(localStorage.getItem('dcu_current_user') || 'null');
    if (currentUser && userHubBtn) {
      const firstName = currentUser.name.split(' ')[0];
      userHubBtn.innerHTML = `<span>👤 ${firstName}</span>`;
      userHubBtn.title = "View Profile";

      // Pre-fill forms
      const nameInput = document.getElementById('booking-name');
      const phoneInput = document.getElementById('booking-phone');
      const checkoutNameInput = document.getElementById('checkout-name');
      const checkoutPhoneInput = document.getElementById('checkout-phone');

      if (nameInput) nameInput.value = currentUser.name;
      if (phoneInput) phoneInput.value = currentUser.phone;
      if (checkoutNameInput) checkoutNameInput.value = currentUser.name;
      if (checkoutPhoneInput) checkoutPhoneInput.value = currentUser.phone;
    } else if (userHubBtn) {
      userHubBtn.innerHTML = '<span>👤</span>';
      userHubBtn.title = "User Sign In";
    }
  }

  function openAuthModal() {
    if (authOverlay) {
      authOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (loginError) loginError.style.display = 'none';
      if (signupError) signupError.style.display = 'none';
      // Default to login tab
      if (tabLogin) tabLogin.click();
    }
  }

  function closeAuthModal() {
    if (authOverlay) {
      authOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function openHubModal(user) {
    if (profileName) profileName.textContent = user.name;
    if (profilePhone) profilePhone.textContent = user.phone;
    if (profileUsername) profileUsername.textContent = `@${user.username}`;

    refreshHubData(user);

    if (hubOverlay) {
      hubOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeHubModal() {
    if (hubOverlay) {
      hubOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function refreshHubData(user) {
    const currentUser = user || JSON.parse(localStorage.getItem('dcu_current_user') || 'null');
    if (!currentUser) return;

    const orders = JSON.parse(localStorage.getItem('dcu_orders') || '[]');
    const bookings = JSON.parse(localStorage.getItem('dcu_bookings') || '[]');

    // Filter
    const userOrders = orders.filter(o => o.username === currentUser.username || o.phone === currentUser.phone);
    const userBookings = bookings.filter(b => b.username === currentUser.username || b.phone === currentUser.phone);

    // Populate Orders
    if (ordersList) {
      ordersList.innerHTML = '';
      if (userOrders.length === 0) {
        ordersList.innerHTML = '<tr><td colspan="4" style="text-align: center; color: rgba(245,242,238,0.4); padding: 1.5rem;">No orders placed yet.</td></tr>';
      } else {
        userOrders.forEach(order => {
          const tr = document.createElement('tr');
          const statusClass = order.status === 'Pending' ? 'user-status-pending' : (order.status === 'Completed' ? 'user-status-completed' : 'user-status-void');
          tr.innerHTML = `
            <td style="font-weight: bold; font-family: var(--font-nav); padding: 0.6rem;">${order.id}</td>
            <td style="max-width: 250px; font-size: 0.8rem; line-height: 1.3; padding: 0.6rem;">${order.items}</td>
            <td style="color: var(--primary-accent); font-weight: bold; padding: 0.6rem;">Rs.${order.total}</td>
            <td style="padding: 0.6rem;"><span class="${statusClass}">${order.status}</span></td>
          `;
          ordersList.appendChild(tr);
        });
      }
    }

    // Populate Bookings
    if (bookingsList) {
      bookingsList.innerHTML = '';
      if (userBookings.length === 0) {
        bookingsList.innerHTML = '<tr><td colspan="4" style="text-align: center; color: rgba(245,242,238,0.4); padding: 1.5rem;">No bookings scheduled yet.</td></tr>';
      } else {
        userBookings.forEach(booking => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="padding: 0.6rem;">${booking.date}</td>
            <td style="padding: 0.6rem;">${booking.time}</td>
            <td style="padding: 0.6rem; font-weight: bold; color: var(--secondary-accent);">${booking.guests} Pax</td>
            <td style="padding: 0.6rem;">
              <button class="cancel-booking-inline" data-id="${booking.id}">Cancel</button>
            </td>
          `;

          // Add cancel handler
          const cancelBtn = tr.querySelector('.cancel-booking-inline');
          if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
              if (confirm("Cancel this table reservation?")) {
                const allBookings = JSON.parse(localStorage.getItem('dcu_bookings') || '[]');
                const updated = allBookings.filter(b => b.id !== booking.id);
                localStorage.setItem('dcu_bookings', JSON.stringify(updated));
                showToast("Reservation cancelled successfully.");
                refreshHubData(currentUser);

                // Also update admin panel if open
                if (window.refreshAdminDashboard) {
                  window.refreshAdminDashboard();
                }
              }
            });
          }

          bookingsList.appendChild(tr);
        });
      }
    }
  }

  // Expose global refresh function so that placing order/booking updates hub
  window.refreshUserHubData = refreshHubData;
}
