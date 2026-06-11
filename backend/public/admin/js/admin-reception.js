(function initReceptionDesk() {
  const lookupInput = document.getElementById('lookupInput');
  const btnLookup = document.getElementById('btnLookup');
  const lookupResults = document.getElementById('lookupResults');
  const lookupResultsCard = document.getElementById('lookupResultsCard');
  const lookupCount = document.getElementById('lookupCount');
  const btnToggleScanner = document.getElementById('btnToggleScanner');
  const qrReaderEl = document.getElementById('qrReader');

  if (!lookupInput || !btnLookup) return;

  const STATUS_LABELS = {
    pending_payment: 'Chờ thanh toán',
    confirmed: 'Đã xác nhận',
    completed: 'Hoàn tất',
    cancelled: 'Đã hủy',
    no_show: 'Không đến',
    draft: 'Nháp',
  };

  function fmtVnd(n) {
    return `${Number(n || 0).toLocaleString('vi-VN')} ₫`;
  }

  function escapeHtml(text) {
    return String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderResults(items) {
    if (!lookupResults || !lookupResultsCard) return;
    lookupCount.textContent = String(items.length);
    lookupResultsCard.style.display = items.length ? 'block' : 'none';

    if (!items.length) {
      lookupResults.innerHTML = '<p class="text-center text-body-secondary py-4 mb-0">Không tìm thấy booking phù hợp</p>';
      return;
    }

    lookupResults.innerHTML = items.map((b) => {
      const paid = b.payment?.status === 'paid' || b.status === 'confirmed';
      const canMarkPaid = b.status === 'pending_payment' || !paid;
      const canCheckOut = b.status === 'confirmed' && paid;

      let actions = `<a href="/admin/bookings/${b.id}" class="btn btn-sm btn-outline-primary">Chi tiết</a>`;
      if (canMarkPaid && b.status !== 'cancelled') {
        actions += `
          <form method="POST" action="/admin/bookings/${b.id}/mark-paid" class="d-inline ms-1">
            <input type="hidden" name="redirect" value="/admin/bookings/reception">
            <button type="submit" class="btn btn-sm btn-success">Thanh toán quầy</button>
          </form>`;
      }
      if (canCheckOut) {
        actions += `
          <form method="POST" action="/admin/bookings/${b.id}/check-out" class="d-inline ms-1" onsubmit="return confirm('Check-out khách ${escapeHtml(b.guestName)}?');">
            <input type="hidden" name="redirect" value="/admin/bookings/reception">
            <button type="submit" class="btn btn-sm btn-info text-white">Check-out</button>
          </form>`;
      }

      return `
        <div class="border-bottom p-3">
          <div class="d-flex flex-wrap justify-content-between gap-2">
            <div>
              <code class="fs-6">${escapeHtml(b.bookingCode)}</code>
              <span class="badge bg-secondary ms-1">${escapeHtml(STATUS_LABELS[b.status] || b.status)}</span>
            </div>
            <div class="text-end text-nowrap">${actions}</div>
          </div>
          <div class="mt-2 small">
            <strong>${escapeHtml(b.guestName)}</strong> · ${escapeHtml(b.guestPhone)} · ${escapeHtml(b.guestEmail)}<br>
            ${escapeHtml(b.propertyName)} — ${escapeHtml(b.branchName)} · Phòng <strong>${escapeHtml(b.roomCode)}</strong><br>
            ${escapeHtml(b.checkIn)} → ${escapeHtml(b.checkOut)} (${b.nights} đêm) · ${fmtVnd(b.totalVnd)}
          </div>
        </div>`;
    }).join('');
  }

  async function runLookup(q) {
    const query = String(q || '').trim();
    if (query.length < 3 && !/^CH-/i.test(query)) {
      if (typeof myNotification === 'function') {
        myNotification('Nhập ít nhất 3 ký tự hoặc mã CH-…', 'warning');
      }
      return;
    }
    try {
      const res = await fetch(`/admin/bookings/lookup?q=${encodeURIComponent(query)}`, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Tra cứu thất bại');
      renderResults(json.data || []);
    } catch (err) {
      if (typeof myNotification === 'function') {
        myNotification(err.message || 'Lỗi tra cứu', 'danger');
      }
    }
  }

  btnLookup.addEventListener('click', () => runLookup(lookupInput.value));
  lookupInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runLookup(lookupInput.value);
    }
  });

  let html5QrCode = null;
  let scannerOn = false;

  async function startScanner() {
    if (!qrReaderEl || typeof Html5Qrcode === 'undefined') return;
    if (scannerOn) return;
    html5QrCode = new Html5Qrcode('qrReader');
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 8, qrbox: { width: 220, height: 220 } },
      (decoded) => {
        const text = String(decoded || '').trim();
        if (!text) return;
        lookupInput.value = text.replace(/^CHERRY:/, '');
        runLookup(lookupInput.value);
      },
      () => {},
    );
    scannerOn = true;
  }

  async function stopScanner() {
    if (!html5QrCode || !scannerOn) return;
    try {
      await html5QrCode.stop();
      html5QrCode.clear();
    } catch (_err) {
      /* ignore */
    }
    scannerOn = false;
  }

  if (btnToggleScanner) {
    btnToggleScanner.addEventListener('click', async () => {
      try {
        if (scannerOn) {
          await stopScanner();
          btnToggleScanner.textContent = 'Bật camera';
        } else {
          await startScanner();
          btnToggleScanner.textContent = 'Tắt camera';
        }
      } catch (err) {
        if (typeof myNotification === 'function') {
          myNotification('Không mở được camera. Cho phép quyền camera hoặc dùng tra cứu thủ công.', 'warning');
        }
      }
    });
  }
})();
