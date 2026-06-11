/**
 * Shared gallery image picker — opens modal, loads /admin/gallery/images, writes to bound input.
 */
(function () {
  const modal = document.getElementById('galleryPickerModal');
  const gridEl = document.getElementById('galleryPickerGrid');
  const foldersEl = document.getElementById('galleryPickerFolders');
  const loadingEl = document.getElementById('galleryPickerLoading');
  const emptyEl = document.getElementById('galleryPickerEmpty');

  if (!modal || !gridEl) return;

  let activePicker = null;
  let activeFolder = null;
  let foldersCache = null;

  function publicUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return path.startsWith('/') ? path : `/${path}`;
  }

  function setPickerValue(picker, url) {
    const input = picker.querySelector('[data-gallery-picker-input]');
    const preview = picker.querySelector('[data-gallery-picker-preview]');
    const previewImg = picker.querySelector('[data-gallery-picker-preview-img]');
    const clearBtn = picker.querySelector('[data-gallery-picker-clear]');
    const pathText = picker.querySelector('[data-gallery-picker-path-text]');

    if (input) input.value = url;
    if (previewImg) previewImg.src = url;
    if (preview) preview.classList.toggle('d-none', !url);
    if (clearBtn) clearBtn.classList.toggle('d-none', !url);
    if (pathText) pathText.textContent = url || 'Chưa chọn ảnh — mở gallery để chọn.';
  }

  function openModal(picker) {
    activePicker = picker;
    modal.classList.remove('d-none');
    modal.classList.add('d-flex');
    document.body.classList.add('overflow-hidden');
    loadFolders().then((folders) => {
      if (!folders.length) {
        showEmptyMessage('Chưa có thư mục ảnh. Tạo thư mục trong Gallery trước.');
        return;
      }
      if (!activeFolder) activeFolder = String(folders[0].id);
      loadImages(activeFolder);
    });
  }

  function closeModal() {
    modal.classList.add('d-none');
    modal.classList.remove('d-flex');
    document.body.classList.remove('overflow-hidden');
    activePicker = null;
  }

  function setLoading(on) {
    loadingEl.classList.toggle('d-none', !on);
    if (on) {
      gridEl.innerHTML = '';
      emptyEl.classList.add('d-none');
    }
  }

  function showEmptyMessage(message, showGalleryLink = true) {
    setLoading(false);
    gridEl.innerHTML = '';
    emptyEl.classList.remove('d-none');
    emptyEl.innerHTML = `
      <p class="mb-2">${message}</p>
      ${showGalleryLink ? '<a href="/admin/gallery" class="btn btn-sm btn-primary" target="_blank" rel="noopener">Mở Gallery để tạo thư mục</a>' : ''}
    `;
  }

  async function loadFolders() {
    if (foldersCache) {
      renderFolders(foldersCache);
      return foldersCache;
    }
    try {
      const res = await fetch('/admin/gallery/folders');
      const data = await res.json();
      if (!data.success) return [];
      foldersCache = data.folders || [];
      renderFolders(foldersCache);
      return foldersCache;
    } catch (err) {
      console.error(err);
      foldersEl.innerHTML = '<span class="small text-danger">Không tải được thư mục</span>';
      return [];
    }
  }

  function renderFolders(folders) {
    if (!folders.length) {
      foldersEl.innerHTML = '<span class="small text-body-secondary">Chưa có thư mục — tạo trong Gallery trước.</span>';
      return;
    }

    if (!activeFolder) {
      activeFolder = String(folders[0].id);
    }

    foldersEl.innerHTML = folders
      .map(
        (f) =>
          `<button type="button" class="btn btn-sm ${String(f.id) === String(activeFolder) ? 'btn-primary' : 'btn-outline-secondary'}" data-folder="${f.id}">${f.name}</button>`,
      )
      .join('');
  }

  function renderImages(images) {
    setLoading(false);
    gridEl.innerHTML = '';

    if (!images.length) {
      emptyEl.classList.remove('d-none');
      return;
    }
    emptyEl.classList.add('d-none');

    images.forEach((img) => {
      const url = publicUrl(img.path);
      const col = document.createElement('div');
      col.className = 'col';
      col.innerHTML = `
        <button type="button" class="gallery-picker-item w-100 border-0 p-0 rounded overflow-hidden bg-light" data-url="${url.replace(/"/g, '&quot;')}">
          <img src="${url.replace(/"/g, '&quot;')}" alt="${(img.name || '').replace(/"/g, '&quot;')}" loading="lazy" class="w-100 gallery-picker-item-img">
        </button>
      `;
      gridEl.appendChild(col);
    });
  }

  async function loadImages(folder) {
    if (!folder) {
      showEmptyMessage('Chưa có thư mục ảnh. Tạo thư mục trong Gallery trước.');
      return;
    }

    activeFolder = folder;
    renderFolders(foldersCache || []);
    setLoading(true);
    try {
      const res = await fetch(`/admin/gallery/images?folder=${encodeURIComponent(folder)}`);
      const data = await res.json();
      if (!data.success) {
        setLoading(false);
        emptyEl.classList.remove('d-none');
        return;
      }
      renderImages(data.images || []);
    } catch (err) {
      console.error(err);
      setLoading(false);
      emptyEl.classList.remove('d-none');
    }
  }

  function bindPicker(picker) {
    if (!picker || picker.dataset.galleryPickerBound === '1') return;
    picker.dataset.galleryPickerBound = '1';
    picker.querySelector('[data-gallery-picker-open]')?.addEventListener('click', () => openModal(picker));
    picker.querySelector('[data-gallery-picker-clear]')?.addEventListener('click', () => setPickerValue(picker, ''));
  }

  document.querySelectorAll('[data-gallery-picker]').forEach(bindPicker);
  window.AdminGalleryPicker = { bind: bindPicker };

  modal.querySelectorAll('[data-gallery-picker-close]').forEach((btn) => {
    btn.addEventListener('click', closeModal);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('d-none')) closeModal();
  });

  foldersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-folder]');
    if (!btn) return;
    loadImages(btn.dataset.folder);
  });

  gridEl.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-picker-item');
    if (!item || !activePicker) return;
    const url = item.dataset.url;
    setPickerValue(activePicker, url);
    closeModal();
  });
})();
