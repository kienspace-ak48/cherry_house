(function () {
  const roleSel = document.getElementById('role');
  const propertyWrap = document.getElementById('propertyFieldWrap');
  const propertySel = document.getElementById('propertyId');
  if (!roleSel || !propertyWrap || !propertySel) return;

  function syncPropertyField() {
    const isStaff = roleSel.value === 'staff';
    propertyWrap.classList.toggle('d-none', !isStaff);
    propertySel.required = isStaff;
    if (!isStaff) propertySel.value = '';
  }

  roleSel.addEventListener('change', syncPropertyField);
  syncPropertyField();
})();
