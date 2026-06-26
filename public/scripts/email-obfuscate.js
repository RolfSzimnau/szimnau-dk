document.querySelectorAll('[data-email-obf]').forEach(el => {
  const u = el.getAttribute('data-u') ?? '';
  const d = el.getAttribute('data-d') ?? '';
  const sub = el.getAttribute('data-subject') ?? '';
  const addr = u + String.fromCharCode(64) + d;
  el.setAttribute('href', 'mailto:' + addr + (sub ? '?subject=' + sub : ''));
  const textEl = el.querySelector('[data-email-text]');
  if (textEl) textEl.textContent = addr;
});
