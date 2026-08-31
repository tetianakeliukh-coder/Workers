/* ══════════════════════════════════════════════════════════════════════════
   OPMS — Shared app shell
   Renders the sidebar into <div id="shell-sidebar"> and marks the active
   module from <body data-module="...">. Also provides the small behaviours
   every module screen needs: dropdowns, checkboxes, search highlight,
   snackbar.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── Icons ─────────────────────────────────────────────────────────── */
  var S = 'stroke="currentColor" stroke-width="1.3"';
  var ICONS = {
    search:     '<circle cx="7" cy="7" r="4.5" ' + S + '/><path d="M10.5 10.5l3 3" ' + S + ' stroke-linecap="round"/>',
    home:       '<path d="M1.5 7.6 8 2l6.5 5.6" ' + S + ' stroke-linecap="round" stroke-linejoin="round"/><path d="M3 6.7V14h3.6v-3.6h2.8V14H13V6.7" ' + S + ' stroke-linecap="round" stroke-linejoin="round"/>',
    documents:  '<path d="M3.5 2h6L13 5.5V14h-9.5V2z" ' + S + ' stroke-linejoin="round"/><path d="M9.5 2v3.5H13" ' + S + ' stroke-linejoin="round"/><path d="M5.5 8.5h5M5.5 11h5" ' + S + ' stroke-linecap="round"/>',
    workers:    '<circle cx="8" cy="5.5" r="2.5" ' + S + '/><path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5" ' + S + ' stroke-linecap="round"/>',
    vacancies:  '<rect x="2" y="3" width="12" height="10" rx="1.5" ' + S + '/><path d="M2 7h12" ' + S + '/><path d="M6.5 3v10" ' + S + '/>',
    rostering:  '<rect x="2" y="2" width="12" height="12" rx="1.5" ' + S + '/><path d="M5 2v2M11 2v2" ' + S + ' stroke-linecap="round"/><path d="M2 6h12" ' + S + '/><path d="M6 6v8M10 6v8" ' + S + '/><path d="M2 10h12" ' + S + '/>',
    travel:     '<path d="M13 3.5 10 8h2L8.5 14 4 8.5H6L3 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>',
    timesheets: '<circle cx="8" cy="8.5" r="5.5" ' + S + '/><path d="M8 5.5v3.3l2.2 2" ' + S + ' stroke-linecap="round" stroke-linejoin="round"/>',
    reports:    '<rect x="1.5" y="8.5" width="3" height="5.5" rx="0.6" stroke="currentColor" stroke-width="1.2"/><rect x="6" y="6" width="3" height="8" rx="0.6" stroke="currentColor" stroke-width="1.2"/><rect x="10.5" y="2.5" width="3" height="11.5" rx="0.6" stroke="currentColor" stroke-width="1.2"/>',
    orgdocs:    '<path d="M2 5.5c0-.8.7-1.5 1.5-1.5H7l1.5 2H13c.8 0 1.5.7 1.5 1.5V13c0 .8-.7 1.5-1.5 1.5H3.5C2.7 14.5 2 13.8 2 13V5.5z" ' + S + '/>',
    notifs:     '<path d="M8 2a4.5 4.5 0 0 1 4.5 4.5V9l1.5 2H2l1.5-2V6.5A4.5 4.5 0 0 1 8 2z" ' + S + ' stroke-linejoin="round"/><path d="M6.5 11c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5" ' + S + ' stroke-linecap="round"/>'
  };

  function icon(name, cls) {
    return '<svg class="' + (cls || 'nav-icon') + '" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  /* ─── Navigation model ──────────────────────────────────────────────────
     `href` present  → screen exists, link is live.
     `href` absent   → module not designed yet, rendered dimmed + inert.     */
  var NAV = [
    { id: 'search',     label: 'Search',           icon: 'search',     action: 'global-search' },
    { id: 'home',       label: 'Home',             icon: 'home' },
    { id: 'documents',  label: 'Documents',        icon: 'documents' },
    { id: 'workers',    label: 'Workers',          icon: 'workers',    href: 'index.html' },
    { id: 'vacancies',  label: 'Manage Vacancies', icon: 'vacancies',  r4: true },
    { id: 'rostering',  label: 'Rostering',        icon: 'rostering' },
    { id: 'travel',     label: 'Travel',           icon: 'travel',     r4: true },
    { id: 'timesheets', label: 'Timesheets',       icon: 'timesheets', r4: true, href: 'timesheets.html' },
    { id: 'reports',    label: 'Reports',          icon: 'reports',    r4: true }
  ];

  var FOOTER_NAV = [
    { id: 'orgdocs', label: 'Org Documents', icon: 'orgdocs', r4: true },
    { id: 'notifs',  label: 'Notifications', icon: 'notifs',  r4: true, badge: true }
  ];

  var ACCOUNT = { initials: 'OR', name: 'Olivia Rhye', email: 'olivia@opms.com' };

  var LOGO =
    '<svg width="87" height="19" viewBox="0 0 87 19" fill="none" aria-label="OPMS">' +
      '<rect x="0" y="0" width="19" height="19" rx="3.5" fill="#0033ff"/>' +
      '<path d="M5 9.5C5 7.015 7.015 5 9.5 5S14 7.015 14 9.5 11.985 14 9.5 14 5 11.985 5 9.5z" stroke="white" stroke-width="1.6" fill="none"/>' +
      '<circle cx="9.5" cy="9.5" r="2" fill="white"/>' +
      '<text x="25" y="14.5" fill="#0033ff" font-family="system-ui,\'Segoe UI\',sans-serif" font-weight="700" font-size="13.5" letter-spacing="0.8">pms</text>' +
    '</svg>';

  var TOGGLE_ICON =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
      '<path d="M9.5 4L5.5 8l4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  /* ─── Sidebar collapse ──────────────────────────────────────────────────
     Remembered per browser so the choice survives navigating between
     modules — every screen renders its own copy of the sidebar.          */
  var SIDEBAR_KEY = 'opms-sidebar-collapsed';
  function readCollapsed() {
    try { return localStorage.getItem(SIDEBAR_KEY) === '1'; } catch (e) { return false; }
  }
  function writeCollapsed(v) {
    try { localStorage.setItem(SIDEBAR_KEY, v ? '1' : '0'); } catch (e) {}
  }

  /* Collapsed items are icons only, so the label moves into a tooltip. */
  function syncSidebarTitles(host) {
    var collapsed = host.classList.contains('collapsed');
    host.querySelectorAll('.nav-item').forEach(function (el) {
      var label = el.querySelector('.nav-label');
      if (!label) return;
      if (collapsed) el.setAttribute('title', label.textContent);
      else if (el.classList.contains('is-todo')) el.setAttribute('title', 'Not designed yet');
      else el.removeAttribute('title');
    });
    var btn = host.querySelector('.sidebar-toggle');
    if (!btn) return;
    var text = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
    btn.setAttribute('title', text);
    btn.setAttribute('aria-label', text);
    btn.setAttribute('aria-expanded', String(!collapsed));
  }

  function initSidebarToggle(host) {
    var btn = host.querySelector('.sidebar-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      writeCollapsed(host.classList.toggle('collapsed'));
      syncSidebarTitles(host);
      /* Screens size things off the viewport (frozen-column edges, table
         scroll state); the width change needs the same nudge a resize gives,
         once now and once after the transition settles. */
      window.dispatchEvent(new Event('resize'));
      setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 200);
    });
    syncSidebarTitles(host);
  }

  function navItem(item, current) {
    var cls = 'nav-item';
    if (item.r4) cls += ' r4';
    if (item.id === current) cls += ' active';

    var body;
    if (item.badge) {
      body = '<div class="notif-wrap">' + icon(item.icon, '') + '<div class="notif-dot"></div></div>';
    } else {
      body = icon(item.icon);
    }
    body += '<span class="nav-label">' + item.label + '</span>';

    if (item.action) {
      return '<li><button class="' + cls + '" data-action="' + item.action + '" aria-label="' + item.label + '">' + body + '</button></li>';
    }
    if (item.href) {
      return '<li><a class="' + cls + '" href="' + item.href + '">' + body + '</a></li>';
    }
    // No screen yet — inert and dimmed rather than a dead link.
    return '<li><span class="' + cls + ' is-todo" title="Not designed yet">' + body + '</span></li>';
  }

  function renderSidebar(current) {
    var host = document.getElementById('shell-sidebar');
    if (!host) return;

    host.className = 'sidebar' + (readCollapsed() ? ' collapsed' : '');
    host.innerHTML =
      '<div class="sidebar-top">' +
        '<div class="logo-area">' +
          '<span class="logo-mark">' + LOGO + '</span>' +
          '<button class="sidebar-toggle" type="button">' + TOGGLE_ICON + '</button>' +
        '</div>' +
        '<nav><ul class="nav-list">' + NAV.map(function (i) { return navItem(i, current); }).join('') + '</ul></nav>' +
      '</div>' +
      '<div class="sidebar-footer">' +
        '<ul class="footer-nav">' + FOOTER_NAV.map(function (i) { return navItem(i, current); }).join('') + '</ul>' +
        '<div class="account-block"><div class="account-row">' +
          '<div class="av-wrap"><div class="av">' + ACCOUNT.initials + '</div><div class="av-online"></div></div>' +
          '<div class="ac-info">' +
            '<div class="ac-name-row"><span class="ac-name">' + ACCOUNT.name + '</span>' +
              '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style="flex-shrink:0"><path d="M3 4.5l3 3 3-3" stroke="#757575" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</div>' +
            '<div class="ac-email">' + ACCOUNT.email + '</div>' +
          '</div>' +
        '</div></div>' +
      '</div>';

    initSidebarToggle(host);
  }

  /* ─── Shared behaviours ─────────────────────────────────────────────── */

  // Any .dd-wrap with a .dd-trigger toggles its .dd-panel; one open at a time.
  function initDropdowns(root) {
    (root || document).querySelectorAll('.dd-wrap').forEach(function (wrap) {
      var trigger = wrap.querySelector('.dd-trigger');
      var panel = wrap.querySelector('.dd-panel');
      if (!trigger || !panel) return;
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var wasOpen = panel.classList.contains('open');
        closeAllDropdowns();
        if (!wasOpen) { panel.classList.add('open'); trigger.classList.add('open'); }
      });
    });
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.dd-panel.open').forEach(function (p) { p.classList.remove('open'); });
    document.querySelectorAll('.dd-trigger.open').forEach(function (t) { t.classList.remove('open'); });
  }

  document.addEventListener('click', closeAllDropdowns);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAllDropdowns(); });

  // Escape a string for safe insertion as HTML text.
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // Wrap every case-insensitive occurrence of `term` in <mark class="hl">.
  function highlight(text, term) {
    if (!term) return esc(text);
    var out = '', lower = String(text).toLowerCase(), t = term.toLowerCase(), i = 0;
    while (true) {
      var at = lower.indexOf(t, i);
      if (at === -1) { out += esc(text.slice(i)); break; }
      out += esc(text.slice(i, at)) + '<mark class="hl">' + esc(text.slice(at, at + t.length)) + '</mark>';
      i = at + t.length;
    }
    return out;
  }

  // "Smith, John" and "Smith John" both give "SJ".
  function initials(name) {
    return String(name).split(/[,\s]+/).filter(Boolean).slice(0, 2)
      .map(function (part) { return part.charAt(0).toUpperCase(); }).join('');
  }

  var snackTimer;
  function snackbar(msg) {
    var el = document.getElementById('shell-snackbar');
    if (!el) {
      el = document.createElement('div');
      el.id = 'shell-snackbar';
      el.className = 'snackbar';
      el.innerHTML = '<span class="snackbar-msg"></span>';
      document.body.appendChild(el);
    }
    el.querySelector('.snackbar-msg').textContent = msg;
    el.classList.add('visible');
    clearTimeout(snackTimer);
    snackTimer = setTimeout(function () { el.classList.remove('visible'); }, 2600);
  }

  /* ─── Boot ──────────────────────────────────────────────────────────── */
  function init() {
    renderSidebar(document.body.getAttribute('data-module'));
    initDropdowns(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.Shell = {
    nav: NAV,
    icon: icon,
    esc: esc,
    highlight: highlight,
    initials: initials,
    snackbar: snackbar,
    initDropdowns: initDropdowns,
    closeAllDropdowns: closeAllDropdowns
  };
})();
