(function () {
  const form = document.getElementById('promoCodeForm');
  if (!form) return;

  const percentWrap = form.querySelector('[data-discount-percent-wrap]');
  const fixedWrap = form.querySelector('[data-discount-fixed-wrap]');
  const percentInput = form.querySelector('#discountPercent');
  const fixedInput = form.querySelector('#discountAmountVnd');
  const radios = form.querySelectorAll('[data-discount-type-radio]');

  function syncDiscountFields() {
    const selected = form.querySelector('[data-discount-type-radio]:checked');
    const type = selected?.value || 'percent';
    const isPercent = type === 'percent';

    percentWrap?.classList.toggle('d-none', !isPercent);
    fixedWrap?.classList.toggle('d-none', isPercent);

    if (percentInput) {
      percentInput.required = isPercent;
      if (!isPercent) percentInput.value = '';
    }
    if (fixedInput) {
      fixedInput.required = !isPercent;
      if (isPercent) fixedInput.value = '';
    }
  }

  radios.forEach((radio) => radio.addEventListener('change', syncDiscountFields));
  syncDiscountFields();
})();
