(function () {
  function bindGalleryPicker(root) {
    const picker = root.querySelector('[data-gallery-picker]');
    if (picker && window.AdminGalleryPicker?.bind) {
      window.AdminGalleryPicker.bind(picker);
    }
  }

  function syncComingSoonToggle(row) {
    const input = row.querySelector('[data-area-coming-soon-input]');
    const toggle = row.querySelector('[data-area-coming-soon-toggle]');
    if (!input || !toggle || toggle.dataset.boundComingSoon) return;
    toggle.dataset.boundComingSoon = '1';
    const sync = () => {
      input.value = toggle.checked ? '1' : '0';
    };
    sync();
    toggle.addEventListener('change', sync);
  }

  function updateCountBadge(sectionKey, count) {
    const card = document.querySelector(`[data-home-section="${sectionKey}"]`);
    const badge = card?.querySelector('[data-home-count-badge]');
    if (!badge) return;
    const labels = {
      areas: 'khu vực',
      kinds: 'loại',
      reviews: 'review',
    };
    badge.textContent = `${count} ${labels[sectionKey] || 'mục'}`;
  }

  function initDynamicList(options) {
    const {
      listEl,
      templateEl,
      addBtn,
      rowSelector,
      removeSelector,
      labelSelector,
      labelPrefix,
      minRows = 1,
      sectionKey,
      afterAdd,
      renumber,
    } = options;

    if (!listEl || !templateEl || !addBtn) return;

    function rows() {
      return Array.from(listEl.querySelectorAll(rowSelector));
    }

    function runRenumber() {
      if (typeof renumber === 'function') renumber(rows());
      rows().forEach((row, idx) => {
        const label = row.querySelector(labelSelector);
        if (label) label.textContent = `${labelPrefix} ${idx + 1}`;
        const removeBtn = row.querySelector(removeSelector);
        if (removeBtn) removeBtn.disabled = rows().length <= minRows;
      });
      if (sectionKey) updateCountBadge(sectionKey, rows().length);
    }

    function addRow() {
      const fragment = templateEl.content.cloneNode(true);
      listEl.appendChild(fragment);
      const row = listEl.lastElementChild;
      if (row) {
        if (typeof afterAdd === 'function') afterAdd(row, rows().length - 1);
        bindGalleryPicker(row);
        syncComingSoonToggle(row);
      }
      runRenumber();
    }

    addBtn.addEventListener('click', addRow);

    listEl.addEventListener('click', (event) => {
      const btn = event.target.closest(removeSelector);
      if (!btn || btn.disabled) return;
      const row = btn.closest(rowSelector);
      if (!row || rows().length <= minRows) return;
      row.remove();
      runRenumber();
    });

    rows().forEach((row) => {
      bindGalleryPicker(row);
      syncComingSoonToggle(row);
    });
    runRenumber();
  }

  function renumberAreaFeatured(areaRows) {
    let hasChecked = false;
    areaRows.forEach((row, idx) => {
      const radio = row.querySelector('[data-area-featured]');
      if (!radio) return;
      radio.value = String(idx);
      if (radio.checked) hasChecked = true;
    });
    if (!hasChecked && areaRows[0]) {
      const first = areaRows[0].querySelector('[data-area-featured]');
      if (first) first.checked = true;
    }
  }

  function renumberGalleryIds(areaRows) {
    areaRows.forEach((row, idx) => {
      const input = row.querySelector('[data-gallery-picker-input]');
      if (input) input.id = `areaImageUrl_dyn_${idx}`;
      const label = row.querySelector('[data-gallery-picker] label');
      if (label) label.setAttribute('for', `areaImageUrl_dyn_${idx}`);
    });
  }

  function renumberKindGalleryIds(kindRows) {
    kindRows.forEach((row, idx) => {
      const input = row.querySelector('[data-gallery-picker-input]');
      if (input) input.id = `kindImageUrl_dyn_${idx}`;
      const label = row.querySelector('[data-gallery-picker] label');
      if (label) label.setAttribute('for', `kindImageUrl_dyn_${idx}`);
    });
  }

  initDynamicList({
    listEl: document.getElementById('areasList'),
    templateEl: document.getElementById('areaRowTemplate'),
    addBtn: document.getElementById('addAreaRow'),
    rowSelector: '[data-area-row]',
    removeSelector: '[data-remove-area]',
    labelSelector: '[data-area-label]',
    labelPrefix: 'Khu vực',
    minRows: 1,
    sectionKey: 'areas',
    afterAdd: (row, idx) => {
      const radio = row.querySelector('[data-area-featured]');
      if (radio && idx === 0) radio.checked = true;
    },
    renumber: (areaRows) => {
      renumberAreaFeatured(areaRows);
      renumberGalleryIds(areaRows);
    },
  });

  initDynamicList({
    listEl: document.getElementById('kindsList'),
    templateEl: document.getElementById('kindRowTemplate'),
    addBtn: document.getElementById('addKindRow'),
    rowSelector: '[data-kind-row]',
    removeSelector: '[data-remove-kind]',
    labelSelector: '[data-kind-label]',
    labelPrefix: 'Loại',
    minRows: 1,
    sectionKey: 'kinds',
    renumber: renumberKindGalleryIds,
  });

  function applyComingSoonValues() {
    document.querySelectorAll('[data-area-row]').forEach((row) => {
      const input = row.querySelector('[data-area-coming-soon-input]');
      const toggle = row.querySelector('[data-area-coming-soon-toggle]');
      if (input && toggle) input.value = toggle.checked ? '1' : '0';
    });
  }

  const homepageForm = document.getElementById('homepageForm');
  if (homepageForm) {
    homepageForm.addEventListener('submit', applyComingSoonValues);
  }

  initDynamicList({
    listEl: document.getElementById('reviewsList'),
    templateEl: document.getElementById('reviewRowTemplate'),
    addBtn: document.getElementById('addReviewRow'),
    rowSelector: '[data-review-row]',
    removeSelector: '[data-remove-review]',
    labelSelector: '[data-review-label]',
    labelPrefix: 'Review',
    minRows: 1,
    sectionKey: 'reviews',
  });
})();
