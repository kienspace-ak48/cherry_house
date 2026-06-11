(function () {
  function bindGalleryPicker(root) {
    const picker = root.querySelector('[data-gallery-picker]');
    if (picker && window.AdminGalleryPicker?.bind) {
      window.AdminGalleryPicker.bind(picker);
    }
  }

  function initDynamicList(options) {
    const { listEl, templateEl, addBtn, rowSelector, removeSelector, labelSelector, labelPrefix, minRows = 1, afterAdd } =
      options;
    if (!listEl || !templateEl || !addBtn) return;

    function rows() {
      return Array.from(listEl.querySelectorAll(rowSelector));
    }

    function renumber() {
      rows().forEach((row, idx) => {
        const label = row.querySelector(labelSelector);
        if (label) label.textContent = `${labelPrefix} ${idx + 1}`;
        const removeBtn = row.querySelector(removeSelector);
        if (removeBtn) removeBtn.disabled = rows().length <= minRows;
      });
    }

    addBtn.addEventListener('click', () => {
      const clone = templateEl.content.cloneNode(true);
      listEl.appendChild(clone);
      const row = listEl.lastElementChild;
      if (row) {
        bindGalleryPicker(row);
        if (typeof afterAdd === 'function') afterAdd(row);
      }
      renumber();
    });

    listEl.addEventListener('click', (e) => {
      const btn = e.target.closest(removeSelector);
      if (!btn || !listEl.contains(btn)) return;
      const row = btn.closest(rowSelector);
      if (!row || rows().length <= minRows) return;
      row.remove();
      renumber();
    });

    rows().forEach((row) => bindGalleryPicker(row));
    renumber();
  }

  initDynamicList({
    listEl: document.getElementById('galleryList'),
    templateEl: document.getElementById('galleryRowTemplate'),
    addBtn: document.getElementById('addGalleryRow'),
    rowSelector: '[data-gallery-row]',
    removeSelector: '[data-remove-gallery-row]',
    labelSelector: '[data-gallery-label]',
    labelPrefix: 'Ảnh',
    minRows: 1,
  });

  initDynamicList({
    listEl: document.getElementById('paragraphList'),
    templateEl: document.getElementById('paragraphRowTemplate'),
    addBtn: document.getElementById('addParagraphRow'),
    rowSelector: '[data-paragraph-row]',
    removeSelector: '[data-remove-paragraph-row]',
    labelSelector: '[data-paragraph-label]',
    labelPrefix: 'Đoạn',
    minRows: 1,
  });

  initDynamicList({
    listEl: document.getElementById('policyList'),
    templateEl: document.getElementById('policyRowTemplate'),
    addBtn: document.getElementById('addPolicyRow'),
    rowSelector: '[data-policy-row]',
    removeSelector: '[data-remove-policy-row]',
    labelSelector: '[data-policy-label]',
    labelPrefix: 'Điều khoản',
    minRows: 1,
  });
})();
