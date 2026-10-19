(() => {
  const $ = s => document.querySelector(s);
  const toast = $('#toast'); let toastTimer;
  function announce(message) { toast.textContent = message; toast.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000); }
  const toggle = $('#menu-toggle'), sidebar = $('#sidebar');
  function closeMenu() { sidebar.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', () => { const opened = sidebar.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(opened)); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && sidebar.classList.contains('open')) { closeMenu(); toggle.focus(); } });
  document.addEventListener('click', e => { if (!sidebar.contains(e.target) && !toggle.contains(e.target)) closeMenu(); });
  sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { closeMenu(); if (window.innerWidth <= 850) { const target = document.querySelector(a.getAttribute('href')); if (target) { target.setAttribute('tabindex','-1'); target.focus({preventScroll:true}); } } }));
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const value = button.dataset.copy; let ok = false;
    try { await navigator.clipboard.writeText(value); ok = true; } catch {
      const area = document.createElement('textarea'); area.value = value; area.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.append(area); area.select();
      try { ok = document.execCommand('copy'); } catch {} area.remove(); button.focus({preventScroll:true});
    }
    if (ok) { const old = button.textContent; button.textContent = '已复制 / Copied'; announce('已复制到剪贴板 / Copied to clipboard'); setTimeout(() => button.textContent = old, 2000); }
    else { announce('复制不可用，请选中文本手动复制 / Select and copy the text manually'); }
  }));
  const dialog = $('#image-dialog'); let opener;
  document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
    opener = button; $('#image-dialog-title').textContent = button.dataset.caption; $('#dialog-image').src = button.dataset.image; $('#dialog-image').alt = button.dataset.caption; $('#dialog-download').href = button.dataset.image; dialog.showModal();
  }));
  $('#dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { opener?.focus({preventScroll:true}); });
  document.querySelectorAll('.demo-action').forEach(button => button.addEventListener('click', () => announce('品牌界面交互样张 / Interface specimen')));
  $('#sample-form').addEventListener('submit', e => { e.preventDefault(); const email = $('#sample-email'); const valid = !!email.value.trim() && email.checkValidity(); email.setAttribute('aria-invalid', String(!valid)); $('#form-error').textContent = valid ? '格式正确，本示例未发送数据。 / Valid format. Nothing was sent.' : '请输入有效邮箱地址。 / Enter a valid email address.'; $('#form-error').style.color = valid ? '#465344' : '#9C3B32'; if(!valid) email.focus(); });
  $('#replay').addEventListener('click', () => { const mark = $('#motion-mark'); mark.classList.remove('replay'); void mark.offsetWidth; mark.classList.add('replay'); if(matchMedia('(prefers-reduced-motion: reduce)').matches) announce('已遵循减少动态效果设置 / Reduced motion respected'); });
  const sections = Array.from(document.querySelectorAll('.chapter'));
  let scheduled = false;
  function updateNavigation() {
    scheduled = false; let active = sections[0];
    const threshold = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) + (parseFloat(getComputedStyle(sections[0]).scrollMarginTop) || 0) + 20;
    for (const section of sections) { if(section.getBoundingClientRect().top <= threshold) active = section; else break; }
    sidebar.querySelectorAll('nav a').forEach(a => { if(a.getAttribute('href') === '#' + active.id) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); });
    $('#reading-position').textContent = active.id.slice(-2) + ' / 21';
  }
  window.addEventListener('scroll', () => { if(!scheduled) { scheduled = true; requestAnimationFrame(updateNavigation); } }, {passive:true});
  window.addEventListener('resize', () => { if(innerWidth > 850) closeMenu(); updateNavigation(); });
  updateNavigation();
})();
