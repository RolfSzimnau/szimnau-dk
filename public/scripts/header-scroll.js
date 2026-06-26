const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    header?.classList.add('bg-navy/80', 'backdrop-blur-md', 'border-b', 'border-glass-border');
  } else {
    header?.classList.remove('bg-navy/80', 'backdrop-blur-md', 'border-b', 'border-glass-border');
  }
}, { passive: true });
