(function () {
  const state = window.__GALLERY_PAGE__ || { selectedFolderId: null, folders: [] };
  let activeFolderId = state.selectedFolderId;
  let pendingFile = null;

  const folderList = document.getElementById('folderList');
  const imageContainer = document.getElementById('image_container');
  const folderModal = document.getElementById('folderModal');
  const folderNameInput = document.getElementById('folderNameInput');
  const folderModalError = document.getElementById('folderModalError');
  const uploadInput = document.getElementById('uploadInput');
  const uploadDropzone = document.getElementById('uploadDropzone');
  const uploadFolderSelect = document.getElementById('uploadFolderSelect');
  const uploadFileName = document.getElementById('uploadFileName');
  const btnUpload = document.getElementById('btnUpload');
  const imageCountBadge = document.getElementById('imageCountBadge');
  const activeFolderName = document.getElementById('activeFolderName');

  function openFolderModal() {
    if (!folderModal) return;
    folderModal.classList.remove('d-none');
    folderModal.classList.add('d-flex');
    if (folderNameInput) {
      folderNameInput.value = '';
      folderNameInput.focus();
    }
    if (folderModalError) {
      folderModalError.classList.add('d-none');
      folderModalError.textContent = '';
    }
  }

  function closeFolderModal() {
    if (!folderModal) return;
    folderModal.classList.add('d-none');
    folderModal.classList.remove('d-flex');
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderFolders(folders, selectedId) {
    if (!folderList) return;

    if (!folders.length) {
      folderList.innerHTML = `
        <div class="gallery-lib-empty-folders text-center text-body-secondary py-4 px-2">
          <i class="fa-regular fa-folder-open fa-2x mb-2 opacity-50"></i>
          <p class="small mb-2">Chưa có thư mục nào.</p>
          <button type="button" class="btn btn-sm btn-outline-primary" data-open-folder-modal>
            Tạo thư mục đầu tiên
          </button>
        </div>
      `;
      return;
    }

    folderList.innerHTML = folders
      .map((folder) => {
        const isActive = Number(folder.id) === Number(selectedId);
        return `
          <button
            type="button"
            class="gallery-lib-folder-item w-100 ${isActive ? 'is-active' : ''}"
            data-folder-id="${folder.id}"
            data-folder-name="${escapeHtml(folder.name)}"
          >
            <span class="gallery-lib-folder-icon"><i class="fa-solid fa-folder"></i></span>
            <span class="gallery-lib-folder-name text-truncate">${escapeHtml(folder.name)}</span>
            <span class="gallery-lib-folder-delete" data-del="${folder.id}" title="Xóa thư mục" role="button" tabindex="0">
              <i class="fa-solid fa-trash-can"></i>
            </span>
          </button>
        `;
      })
      .join('');
  }

  function syncUploadFolderSelect(folderId) {
    if (!uploadFolderSelect) return;
    uploadFolderSelect.value = String(folderId);
  }

  function renderImages(images) {
    if (!imageContainer) return;

    if (imageCountBadge) {
      imageCountBadge.textContent = `${images.length} ảnh`;
    }

    if (!images.length) {
      imageContainer.innerHTML = `
        <div class="col-12">
          <div class="gallery-lib-no-images text-center text-body-secondary py-5 rounded-3 border border-dashed">
            <i class="fa-regular fa-image fa-2x mb-2 opacity-50"></i>
            <p class="mb-0 small">Thư mục này chưa có ảnh. Upload ảnh đầu tiên ở trên.</p>
          </div>
        </div>
      `;
      return;
    }

    imageContainer.innerHTML = images
      .map((img) => `
        <div class="col">
          <div class="gallery-lib-card admin-gallery-card card border-0 shadow-sm overflow-hidden h-100">
            <img src="/${escapeHtml(img.path)}" alt="${escapeHtml(img.name)}" loading="lazy" class="admin-gallery-img w-100">
            <div class="admin-gallery-overlay d-flex align-items-center justify-content-center gap-2">
              <a href="/${escapeHtml(img.path)}" target="_blank" rel="noopener" class="btn btn-sm btn-light">Xem</a>
              <button type="button" data-id="${escapeHtml(img.path)}" class="btn btn-sm btn-danger">Xóa</button>
            </div>
            <div class="gallery-lib-card-caption small text-truncate px-2 py-1" title="${escapeHtml(img.name)}">${escapeHtml(img.name)}</div>
          </div>
        </div>
      `)
      .join('');
  }

  async function loadImages(folderId) {
    if (!folderId) return;
    activeFolderId = folderId;
    syncUploadFolderSelect(folderId);

    const folder = state.folders.find((f) => Number(f.id) === Number(folderId));
    if (activeFolderName && folder) {
      activeFolderName.textContent = folder.name;
    }

    renderFolders(state.folders, folderId);

    const url = new URL(window.location.href);
    url.searchParams.set('folder', String(folderId));
    window.history.replaceState(null, '', url.toString());

    try {
      const res = await fetch(`/admin/gallery/images?folder=${encodeURIComponent(folderId)}`);
      const data = await res.json();
      if (!data.success) return;
      renderImages(data.images || []);
    } catch (err) {
      console.error(err);
    }
  }

  function setPendingFile(file) {
    pendingFile = file || null;
    if (!uploadFileName || !btnUpload) return;

    if (!file) {
      uploadFileName.textContent = '';
      btnUpload.classList.add('d-none');
      return;
    }

    uploadFileName.textContent = `Đã chọn: ${file.name}`;
    btnUpload.classList.remove('d-none');
  }

  async function uploadFile(file, folderId) {
    if (!file || !folderId) {
      alert('Chọn thư mục và ảnh trước khi upload.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder_id', String(folderId));

    try {
      const res = await fetch('/admin/gallery/image-upload-ajax', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Upload lỗi');
        return;
      }
      renderImages(data.images || []);
      if (uploadInput) uploadInput.value = '';
      setPendingFile(null);
    } catch (err) {
      console.error(err);
      alert('Upload lỗi');
    }
  }

  document.getElementById('openFolderModal')?.addEventListener('click', openFolderModal);
  document.querySelectorAll('[data-open-folder-modal]').forEach((btn) => {
    btn.addEventListener('click', openFolderModal);
  });
  document.getElementById('closeFolderModal')?.addEventListener('click', closeFolderModal);
  document.getElementById('closeFolderModalX')?.addEventListener('click', closeFolderModal);
  folderModal?.addEventListener('click', (e) => {
    if (e.target === folderModal) closeFolderModal();
  });

  document.getElementById('btnCreateFolder')?.addEventListener('click', async () => {
    const name = folderNameInput?.value?.trim() || '';
    if (!name) {
      if (folderModalError) {
        folderModalError.textContent = 'Nhập tên thư mục.';
        folderModalError.classList.remove('d-none');
      }
      return;
    }

    try {
      const res = await fetch('/admin/gallery/category/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_name: name }),
      });
      const data = await res.json();
      if (!data.success) {
        const msg = data.message || 'Tạo thư mục thất bại';
        if (folderModalError) {
          folderModalError.textContent = msg;
          folderModalError.classList.remove('d-none');
        }
        return;
      }

      closeFolderModal();
      window.location.href = `/admin/gallery?folder=${data.folder.id}`;
    } catch (err) {
      console.error(err);
      if (folderModalError) {
        folderModalError.textContent = 'Tạo thư mục thất bại';
        folderModalError.classList.remove('d-none');
      }
    }
  });

  folderList?.addEventListener('click', async (e) => {
    const delBtn = e.target.closest('[data-del]');
    if (delBtn) {
      e.stopPropagation();
      const folderId = delBtn.dataset.del;
      if (!confirm('Xóa thư mục và toàn bộ ảnh bên trong?')) return;

      try {
        const res = await fetch('/admin/gallery/folder-delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder_id: folderId }),
        });
        const data = await res.json();
        if (!data.success) {
          alert(data.message || 'Xóa thư mục lỗi');
          return;
        }
        window.location.href = '/admin/gallery';
      } catch (err) {
        console.error(err);
      }
      return;
    }

    const folderBtn = e.target.closest('[data-folder-id]');
    if (!folderBtn) return;
    await loadImages(folderBtn.dataset.folderId);
  });

  uploadFolderSelect?.addEventListener('change', () => {
    loadImages(uploadFolderSelect.value);
  });

  uploadDropzone?.addEventListener('click', (e) => {
    if (e.target.closest('#btnUpload')) return;
    uploadInput?.click();
  });
  uploadDropzone?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      uploadInput?.click();
    }
  });

  uploadInput?.addEventListener('change', () => {
    const file = uploadInput.files?.[0];
    setPendingFile(file || null);
  });

  btnUpload?.addEventListener('click', () => {
    const folderId = uploadFolderSelect?.value || activeFolderId;
    uploadFile(pendingFile || uploadInput?.files?.[0], folderId);
  });

  uploadDropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadDropzone.classList.add('is-dragover');
  });
  uploadDropzone?.addEventListener('dragleave', () => {
    uploadDropzone.classList.remove('is-dragover');
  });
  uploadDropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadDropzone.classList.remove('is-dragover');
    const file = e.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Chỉ hỗ trợ file ảnh.');
      return;
    }
    setPendingFile(file);
    uploadFile(file, uploadFolderSelect?.value || activeFolderId);
  });

  imageContainer?.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('button[data-id]');
    if (!deleteBtn || !activeFolderId) return;
    if (!confirm('Xóa ảnh này?')) return;

    try {
      const res = await fetch('/admin/gallery/image-delete-ajax', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          img_path: deleteBtn.dataset.id,
          folder_id: activeFolderId,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Xóa ảnh lỗi');
        return;
      }
      renderImages(data.images || []);
    } catch (err) {
      console.error(err);
    }
  });
})();
