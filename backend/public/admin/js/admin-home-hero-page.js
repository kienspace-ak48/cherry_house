(function () {
  const listEl = document.getElementById('heroSlidesList');
  const addBtn = document.getElementById('addHeroSlide');
  const template = document.getElementById('heroSlideRowTemplate');

  if (!listEl || !addBtn || !template) return;

  function slideRows() {
    return Array.from(listEl.querySelectorAll('[data-slide-row]'));
  }

  function renumberSlides() {
    const rows = slideRows();
    rows.forEach((row, idx) => {
      const label = row.querySelector('[data-slide-label]');
      if (label) label.textContent = `Slide ${idx + 1}`;
      const removeBtn = row.querySelector('[data-remove-slide]');
      if (removeBtn) removeBtn.disabled = rows.length <= 1;
    });
  }

  function bindGalleryPicker(row) {
    const picker = row.querySelector('[data-gallery-picker]');
    if (picker && window.AdminGalleryPicker?.bind) {
      window.AdminGalleryPicker.bind(picker);
    }
  }

  function addSlide() {
    const fragment = template.content.cloneNode(true);
    listEl.appendChild(fragment);
    bindGalleryPicker(listEl.lastElementChild);
    renumberSlides();
  }

  addBtn.addEventListener('click', addSlide);

  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove-slide]');
    if (!btn || btn.disabled) return;
    const row = btn.closest('[data-slide-row]');
    if (!row || slideRows().length <= 1) return;
    row.remove();
    renumberSlides();
  });

  renumberSlides();
})();
