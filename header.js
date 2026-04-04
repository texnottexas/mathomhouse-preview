// Google Analytics
const gaScript1 = document.createElement('script');
gaScript1.setAttribute('async', '');
gaScript1.src = 'https://www.googletagmanager.com/gtag/js?id=G-4R1NPM39PL';
document.head.appendChild(gaScript1);

const gaScript2 = document.createElement('script');
gaScript2.textContent = 'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-4R1NPM39PL");';
document.head.appendChild(gaScript2);

// Compute path to site root (works in both root and subdirectory deployments)
function headerRoot() {
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
      if (!placeholder) return;
      const range = document.createRange();
      range.selectNode(document.body);
      placeholder.appendChild(range.createContextualFragment(html));
      initializeSidebar();
    })
    .catch(err => console.error('Header load error:', err));
}

function updateThemeIcons(isLight) {
  document.querySelectorAll('.icon-moon').forEach(el => el.style.display = isLight ? 'none' : 'block');
  document.querySelectorAll('.icon-sun').forEach(el => el.style.display = isLight ? 'block' : 'none');
  // topbar SVG icons (IDs used on index.html topbar buttons)
  const moonId = document.getElementById('icon-moon');
  const sunId = document.getElementById('icon-sun');
  if (moonId) moonId.style.display = isLight ? 'none' : 'block';
  if (sunId) sunId.style.display = isLight ? 'block' : 'none';
  const lbl = document.querySelector('.sidebar-theme-label');
  if (lbl) lbl.textContent = isLight ? 'Light mode' : 'Dark mode';
}

function applyTheme(isLight) {
  if (isLight) {
    document.documentElement.dataset.theme = 'light';
    document.body.dataset.theme = 'light';
  } else {
    delete document.documentElement.dataset.theme;
    delete document.body.dataset.theme;
  }
  updateThemeIcons(isLight);
}

function initializeSidebar() {
  // Apply saved theme
  const savedTheme = localStorage.getItem('theme');
  const isLight = savedTheme === 'light';
  applyTheme(isLight);

  // Wire up all theme toggle buttons (sidebar data-theme-toggle + topbar #themeToggle)
  const themeButtons = [
    ...document.querySelectorAll('[data-theme-toggle]'),
    ...document.querySelectorAll('#themeToggle'),
  ];
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentlyLight = document.body.dataset.theme === 'light';
      const nextLight = !currentlyLight;
      localStorage.setItem('theme', nextLight ? 'light' : 'dark');
      applyTheme(nextLight);
    });
  });

  // Mark active nav item
  const currentPath = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-item').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    try {
      const url = new URL(href, location.origin);
      if (url.pathname.replace(/\/$/, '') === currentPath) {
        a.classList.add('active');
      }
    } catch (_) {}
  });
}

// Mobile sidebar open/close
window.openSidebar = function () {
  const sidebar = document.getElementById('header-placeholder');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.add('sidebar-open');
  if (overlay) overlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
};

window.closeSidebar = function () {
  const sidebar = document.getElementById('header-placeholder');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('sidebar-open');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
};

document.addEventListener('DOMContentLoaded', loadHeader);
