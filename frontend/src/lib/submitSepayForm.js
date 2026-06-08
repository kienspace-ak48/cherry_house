/**
 * Tự động POST form sang SePay (bank transfer).
 *
 * @param {string} checkoutUrl
 * @param {Record<string, string | number>} fields
 */
export function submitSepayForm(checkoutUrl, fields) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = checkoutUrl;
  form.style.display = 'none';

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
