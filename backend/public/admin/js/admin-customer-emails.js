(function customerEmailPage() {
  const selectAll = document.getElementById('selectAllCustomers');
  const rowChecks = () => [...document.querySelectorAll('.customer-row-check:not(:disabled)')];
  const actionBar = document.getElementById('customerEmailActionBar');
  const selectedCountEl = document.getElementById('customerEmailSelectedCount');
  const btnOpenSend = document.getElementById('btnOpenSendEmail');
  const modal = document.getElementById('sendEmailModal');
  const emailType = document.getElementById('emailType');
  const customFields = document.getElementById('customEmailFields');
  const promoFields = document.getElementById('promoEmailFields');
  const customShowCta = document.getElementById('customShowCta');
  const customCtaFields = document.getElementById('customCtaFields');
  const recipientCountEl = document.getElementById('sendEmailRecipientCount');
  const btnConfirmSend = document.getElementById('btnConfirmSendEmail');

  function getSelectedIds() {
    return rowChecks()
      .filter((cb) => cb.checked)
      .map((cb) => Number(cb.value))
      .filter((id) => Number.isInteger(id) && id > 0);
  }

  function updateSelectionUi() {
    const checks = rowChecks();
    const selected = checks.filter((cb) => cb.checked);
    const count = selected.length;

    if (selectedCountEl) selectedCountEl.textContent = String(count);
    if (actionBar) actionBar.classList.toggle('d-none', count === 0);
    if (selectAll) {
      selectAll.indeterminate = count > 0 && count < checks.length;
      selectAll.checked = checks.length > 0 && count === checks.length;
    }
  }

  function openModal() {
    if (!modal) return;
    const count = getSelectedIds().length;
    if (!count) {
      myNotification('Chọn ít nhất một khách hàng', 'warning');
      return;
    }
    if (recipientCountEl) recipientCountEl.textContent = String(count);
    modal.classList.remove('d-none');
    modal.classList.add('d-flex');
    document.body.classList.add('overflow-hidden');
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add('d-none');
    modal.classList.remove('d-flex');
    document.body.classList.remove('overflow-hidden');
  }

  function syncEmailType() {
    const isPromo = emailType?.value === 'promo';
    if (customFields) customFields.classList.toggle('d-none', isPromo);
    if (promoFields) promoFields.classList.toggle('d-none', !isPromo);
  }

  function syncCtaFields() {
    if (!customCtaFields || !customShowCta) return;
    customCtaFields.style.display = customShowCta.checked ? '' : 'none';
  }

  selectAll?.addEventListener('change', () => {
    const checked = !!selectAll.checked;
    rowChecks().forEach((cb) => { cb.checked = checked; });
    updateSelectionUi();
  });

  document.getElementById('customerEmailTable')?.addEventListener('change', (e) => {
    if (e.target?.classList?.contains('customer-row-check')) updateSelectionUi();
  });

  btnOpenSend?.addEventListener('click', openModal);
  emailType?.addEventListener('change', syncEmailType);
  customShowCta?.addEventListener('change', syncCtaFields);
  modal?.querySelectorAll('[data-send-email-close]').forEach((btn) => {
    btn.addEventListener('click', closeModal);
  });
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('d-none')) closeModal();
  });

  btnConfirmSend?.addEventListener('click', async () => {
    const userIds = getSelectedIds();
    if (!userIds.length) {
      myNotification('Chọn ít nhất một khách hàng', 'warning');
      return;
    }

    const type = emailType?.value || 'custom';
    const payload = { userIds, emailType: type };

    if (type === 'promo') {
      const promoCodeId = document.getElementById('promoCodeId')?.value;
      if (!promoCodeId) {
        myNotification('Chọn mã giảm giá', 'warning');
        return;
      }
      payload.promoCodeId = promoCodeId;
    } else {
      payload.customPayload = {
        subject: document.getElementById('customSubject')?.value?.trim() || '',
        eventName: document.getElementById('customEventName')?.value?.trim() || '',
        content1: document.getElementById('customContent1')?.value?.trim() || '',
        content2: document.getElementById('customContent2')?.value?.trim() || '',
        showCta: !!customShowCta?.checked,
        ctaLabel: document.getElementById('customCtaLabel')?.value?.trim() || '',
        ctaUrl: document.getElementById('customCtaUrl')?.value?.trim() || '',
      };
    }

    const originalHtml = btnConfirmSend.innerHTML;
    btnConfirmSend.disabled = true;
    btnConfirmSend.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang gửi…';

    try {
      const res = await fetch('/admin/customer-emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Gửi thất bại');

      closeModal();
      const parts = [`Đã gửi: ${json.sent}`];
      if (json.failed) parts.push(`Lỗi: ${json.failed}`);
      if (json.skipped) parts.push(`Bỏ qua: ${json.skipped}`);
      myNotification(parts.join(' · '), json.failed ? 'warning' : 'success', 4000);

      rowChecks().forEach((cb) => { cb.checked = false; });
      if (selectAll) selectAll.checked = false;
      updateSelectionUi();
    } catch (err) {
      myNotification(err.message || 'Gửi email thất bại', 'danger', 4000);
    } finally {
      btnConfirmSend.disabled = false;
      btnConfirmSend.innerHTML = originalHtml;
    }
  });

  syncEmailType();
  syncCtaFields();
  updateSelectionUi();
})();
