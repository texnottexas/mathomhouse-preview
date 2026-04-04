// Google Analytics
const gaScript1 = document.createElement('script');
gaScript1.setAttribute('async', '');
gaScript1.src = 'https://www.googletagmanager.com/gtag/js?id=G-4R1NPM39PL';
document.head.appendChild(gaScript1);

const gaScript2 = document.createElement('script');
gaScript2.textContent = 'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-4R1NPM39PL");';
document.head.appendChild(gaScript2);

function headerRoot() {
  // Compute path to deployment root — works in both root and subdirectory deployments
  // On user github.io page (mathomhouse.github.io/): root is depth 0
  // On project github.io page (texnottexas.github.io/mathomhouse-preview/): root is depth 1
  const parts = location.pathname.split('/').filter(Boolean);
  const isFile = parts.length > 0 && parts[parts.length - 1].includes('.');
  const dirParts = isFile ? parts.slice(0, -1) : parts;
  const rootDepth = location.hostname.endsWith('.github.io') && parts.length > 0
    && location.hostname.split('.')[0] !== parts[0] ? 1 : 0;
  const steps = Math.max(0, dirParts.length - rootDepth);
  return steps > 0 ? '../'.repeat(steps) : './';
}

function loadHeader() {
  fetch(headerRoot() + 'header.html')
    .then(res => res.text())
    .then(html => {
      const placeholder = document.getElementById('header-placeholder');
      placeholder.textContent = '';
      const tmp = document.createElement('div');
      tmp.textContent = html;
      // header.html is a trusted same-origin file — use a template to parse it safely
      const range = document.createRange();
      range.selectNode(document.body);
      placeholder.appendChild(range.createContextualFragment(html));
      initializeHeader();
    })
    .catch(err => console.error('Header load error:', err));
}

function updateThemeIcons(isLight) {
  const moonIcon = document.getElementById('icon-moon');
  const sunIcon = document.getElementById('icon-sun');
  if (!moonIcon || !sunIcon) return;
  moonIcon.style.display = isLight ? 'none' : 'block';
  sunIcon.style.display = isLight ? 'block' : 'none';
}

function initializeHeader() {
  const hamburger = document.getElementById('hamburger');
  const dropdown = document.getElementById('nav');

  // Dark mode is the default. Apply light only if user explicitly chose it.
  const savedTheme = localStorage.getItem('theme');
  const isLight = savedTheme === 'light';
  if (isLight) {
    document.documentElement.dataset.theme = 'light';
    document.body.dataset.theme = 'light';
  } else {
    delete document.documentElement.dataset.theme;
    delete document.body.dataset.theme;
  }
  updateThemeIcons(isLight);

  const toggleButton = document.getElementById('themeToggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      const currentlyLight = document.body.dataset.theme === 'light';
      if (currentlyLight) {
        delete document.documentElement.dataset.theme;
        delete document.body.dataset.theme;
        localStorage.setItem('theme', 'dark');
        updateThemeIcons(false);
      } else {
        document.documentElement.dataset.theme = 'light';
        document.body.dataset.theme = 'light';
        localStorage.setItem('theme', 'light');
        updateThemeIcons(true);
      }
    });
  }

  // Hide dropdown when clicking outside
  document.addEventListener('click', function(event) {
    if (!dropdown.contains(event.target) && !hamburger.contains(event.target)) {
      dropdown.style.display = 'none';
      document.querySelectorAll('.submenu-container.open').forEach(el => el.classList.remove('open'));
    }
  });

  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }

  // Submenu support
  document.querySelectorAll('.submenu-container > a').forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      const container = this.closest('.submenu-container');
      document.querySelectorAll('.submenu-container.open').forEach(open => {
        if (open !== container) open.classList.remove('open');
      });
      container.classList.toggle('open');
    });
  });
}

function toggleDropdown() {
  const hamburger = document.getElementById('hamburger');
  const dropdown = document.getElementById('nav');
  const rect = hamburger.getBoundingClientRect();
  dropdown.style.top = rect.bottom + 'px';
  dropdown.style.left = rect.left + 'px';
  dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
}

document.addEventListener('DOMContentLoaded', loadHeader);
