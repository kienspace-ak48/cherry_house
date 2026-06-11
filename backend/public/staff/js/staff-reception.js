(function initStaffReception() {
  const lookupInput = document.getElementById('lookupInput');
  const btnLookup = document.getElementById('btnLookup');
  const lookupResults = document.getElementById('lookupResults');
  const lookupResultsCard = document.getElementById('lookupResultsCard');
  const lookupCount = document.getElementById('lookupCount');
  const btnToggleScanner = document.getElementById('btnToggleScanner');

  if (!lookupInput || !btnLookup) return;

  const STATUS = {
    pending_payment: 'Chờ TT',
    confirmed: 'Chưa check-in',
    checked_in: 'Đã check-in',
    completed: 'Hoàn tất',
    cancelled: 'Đã hủy',
  };

  function esc(t) {
    return String(t ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function renderResults(items) {
    lookupCount.textContent = String(items.length);
    lookupResultsCard.style.display = items.length ? 'block' : 'none';
    if (!items.length) {
      lookupResults.innerHTML = '<p style="padding:16px;text-align:center;color:var(--staff-muted);">Không tìm thấy</p>';
      return;
    }
    lookupResults.innerHTML = items.map((b) => {
      const paid = b.payment?.status === 'paid' || ['confirmed','checked_in'].includes(b.status);
      let actions = `<a href="/staff/bookings/${b.id}" class="staff-btn staff-btn-outline" style="padding:4px 8px;font-size:12px;">Chi tiết</a>`;
      if (b.status === 'confirmed' && paid) {
        actions += `<a href="/staff/bookings/${b.id}" class="staff-btn staff-btn-primary" style="padding:4px 8px;font-size:12px;margin-left:4px;">Check-in</a>`;
      }
      if (b.status === 'pending_payment' || !paid) {
        actions += `<form method="POST" action="/staff/bookings/${b.id}/mark-paid" style="display:inline;margin-left:4px;"><input type="hidden" name="redirect" value="/staff/reception"><button class="staff-btn staff-btn-success" style="padding:4px 8px;font-size:12px;">TT quầy</button></form>`;
      }
      if (b.status === 'checked_in') {
        actions += `<form method="POST" action="/staff/bookings/${b.id}/check-out" style="display:inline;margin-left:4px;" onsubmit="return confirm('Check-out?');"><input type="hidden" name="redirect" value="/staff/reception"><button class="staff-btn staff-btn-info" style="padding:4px 8px;font-size:12px;">Check-out</button></form>`;
      }
      return `<div style="padding:14px;border-bottom:1px solid var(--staff-border);">
        <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;">
          <div><code>${esc(b.bookingCode)}</code> <span class="staff-badge staff-badge-secondary">${esc(STATUS[b.status]||b.status)}</span></div>
          <div>${actions}</div>
        </div>
        <div style="margin-top:8px;font-size:.85rem;"><strong>${esc(b.guestName)}</strong> · ${esc(b.guestPhone)} · Phòng ${esc(b.roomCode)}</div>
      </div>`;
    }).join('');
  }

  async function runLookup(q) {
    const query = String(q || '').trim();
    if (query.length < 3 && !/^CH-/i.test(query)) return;
    const res = await fetch(`/staff/bookings/lookup?q=${encodeURIComponent(query)}`, { credentials: 'same-origin' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderResults(json.data || []);
  }

  btnLookup.addEventListener('click', () => runLookup(lookupInput.value).catch(() => {}));
  lookupInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); runLookup(lookupInput.value).catch(() => {}); } });

  let scanner = null;
  let scannerOn = false;
  btnToggleScanner?.addEventListener('click', async () => {
    if (typeof Html5Qrcode === 'undefined') return;
    try {
      if (scannerOn) {
        await scanner.stop();
        scanner.clear();
        scannerOn = false;
      } else {
        scanner = new Html5Qrcode('qrReader');
        await scanner.start({ facingMode: 'environment' }, { fps: 8, qrbox: 200 }, (decoded) => {
          lookupInput.value = String(decoded).replace(/^CHERRY:/, '');
          runLookup(lookupInput.value).catch(() => {});
        }, () => {});
        scannerOn = true;
      }
    } catch (_e) { /* camera denied */ }
  });
})();
