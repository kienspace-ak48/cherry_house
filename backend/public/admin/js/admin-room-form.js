(function () {
  const MAX_GALLERY = 5;

  function bindGalleryPicker(root) {
    const picker = root.querySelector('[data-gallery-picker]');
    if (picker && window.AdminGalleryPicker?.bind) {
      window.AdminGalleryPicker.bind(picker);
    }
  }

  function initGalleryList() {
    const listEl = document.getElementById('roomGalleryList');
    const templateEl = document.getElementById('roomGalleryRowTemplate');
    const addBtn = document.getElementById('addRoomGalleryRow');
    if (!listEl || !templateEl || !addBtn) return;

    function rows() {
      return Array.from(listEl.querySelectorAll('[data-gallery-row]'));
    }

    function renumber() {
      rows().forEach((row, idx) => {
        const label = row.querySelector('[data-gallery-label]');
        if (label) label.textContent = `Ảnh ${idx + 1}`;
        const removeBtn = row.querySelector('[data-remove-gallery-row]');
        if (removeBtn) removeBtn.disabled = rows().length <= 1;
      });
      addBtn.disabled = rows().length >= MAX_GALLERY;
      addBtn.classList.toggle('disabled', rows().length >= MAX_GALLERY);
    }

    addBtn.addEventListener('click', () => {
      if (rows().length >= MAX_GALLERY) return;
      const clone = templateEl.content.cloneNode(true);
      listEl.appendChild(clone);
      bindGalleryPicker(listEl.lastElementChild);
      renumber();
    });

    listEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove-gallery-row]');
      if (!btn || !listEl.contains(btn)) return;
      const row = btn.closest('[data-gallery-row]');
      if (!row || rows().length <= 1) return;
      row.remove();
      renumber();
    });

    rows().forEach((row) => bindGalleryPicker(row));
    renumber();
  }

  function initExtraParagraphs() {
    const listEl = document.getElementById('extraParagraphList');
    const templateEl = document.getElementById('extraParagraphRowTemplate');
    const addBtn = document.getElementById('addExtraParagraphRow');
    if (!listEl || !templateEl || !addBtn) return;

    addBtn.addEventListener('click', () => {
      listEl.appendChild(templateEl.content.cloneNode(true));
    });

    listEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove-extra-paragraph-row]');
      if (!btn || !listEl.contains(btn)) return;
      const row = btn.closest('[data-extra-paragraph-row]');
      if (!row) return;
      if (listEl.querySelectorAll('[data-extra-paragraph-row]').length <= 1) {
        row.querySelector('textarea')?.value = '';
        return;
      }
      row.remove();
    });
  }

  function initRoomTypePreview() {
    const select = document.getElementById('roomTypeId');
    const body = document.getElementById('roomTypePreviewBody');
    const editLink = document.getElementById('roomTypeEditLink');
    const dataEl = document.getElementById('roomTypeCatalogData');
    if (!select || !body || !dataEl) return;

    let catalog = [];
    try {
      catalog = JSON.parse(dataEl.textContent || '[]');
    } catch {
      catalog = [];
    }

    function renderPreview() {
      const id = Number(select.value);
      const rt = catalog.find((item) => item.id === id);
      if (!rt) {
        body.innerHTML = '<p class="text-body-secondary mb-0">Chọn loại phòng để xem diện tích, giường, tiện nghi…</p>';
        if (editLink) editLink.href = '/admin/room-types';
        return;
      }

      if (editLink) editLink.href = `/admin/room-types/${rt.id}/edit`;

      const amenityHtml = rt.amenities.length
        ? `<ul class="mb-2 ps-3">${rt.amenities.map((a) => `<li>${a}</li>`).join('')}</ul>`
        : '<p class="text-body-secondary mb-2">Chưa gắn tiện nghi — thêm tại Loại phòng.</p>';

      body.innerHTML = `
        <div class="mb-2"><span class="badge text-bg-light text-body-secondary">${rt.badge || ''}</span></div>
        <div class="fw-semibold mb-2">${rt.title || ''}</div>
        <ul class="list-unstyled mb-2">
          <li><i class="fa-solid fa-ruler-combined me-2 text-body-secondary"></i>${rt.areaSqm || '—'} m²</li>
          <li><i class="fa-solid fa-bed me-2 text-body-secondary"></i>${rt.bedLabel || '—'}</li>
          <li><i class="fa-solid fa-users me-2 text-body-secondary"></i>${rt.capacityLabel || '—'}</li>
          <li><i class="fa-regular fa-clock me-2 text-body-secondary"></i>Nhận ${rt.checkInTime || '14:00'} · Trả ${rt.checkOutTime || '12:00'}</li>
        </ul>
        <div class="fw-semibold mb-1">Tiện nghi (${rt.amenities.length})</div>
        ${amenityHtml}
        <div class="text-body-secondary">Gallery loại phòng: ${rt.galleryCount || 0} ảnh (dự phòng)</div>
      `;
    }

    select.addEventListener('change', renderPreview);
    renderPreview();
  }

  initGalleryList();
  initExtraParagraphs();
  initRoomTypePreview();
})();
