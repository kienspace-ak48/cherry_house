(function initStaffCheckInSignature() {
  const startBtn = document.getElementById('checkin-start-btn');
  const panel = document.getElementById('checkin-signature-panel');
  const form = document.getElementById('checkin-signature-form');
  const canvas = document.getElementById('checkin-signature-canvas');
  const hiddenInput = document.getElementById('checkin-signature-data');
  const clearBtn = document.getElementById('checkin-signature-clear');

  if (!startBtn || !panel || !form || !canvas || !hiddenInput) return;

  const ctx = canvas.getContext('2d');
  let drawing = false;
  let hasInk = false;
  let canvasReady = false;

  function setupCanvas() {
    const wrap = canvas.parentElement;
    const width = Math.max(wrap?.clientWidth || 320, 280);
    const height = 180;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1a1a1a';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    hasInk = false;
    canvasReady = true;
  }

  function pointerPos(event) {
    const rect = canvas.getBoundingClientRect();
    const touch = event.changedTouches?.[0] || event.touches?.[0];
    const clientX = touch ? touch.clientX : event.clientX;
    const clientY = touch ? touch.clientY : event.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startDraw(event) {
    if (!canvasReady) return;
    event.preventDefault();
    drawing = true;
    const pos = pointerPos(event);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(event) {
    if (!drawing || !canvasReady) return;
    event.preventDefault();
    const pos = pointerPos(event);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    hasInk = true;
  }

  function endDraw(event) {
    if (!drawing) return;
    event.preventDefault();
    drawing = false;
  }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', endDraw, { passive: false });

  startBtn.addEventListener('click', () => {
    panel.removeAttribute('hidden');
    panel.style.display = 'block';
    startBtn.style.display = 'none';
    window.requestAnimationFrame(() => setupCanvas());
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (canvasReady) setupCanvas();
    });
  }

  form.addEventListener('submit', (event) => {
    if (!hasInk) {
      event.preventDefault();
      window.alert('Vui lòng yêu cầu khách ký tên trước khi hoàn tất check-in.');
      return;
    }
    hiddenInput.value = canvas.toDataURL('image/png');
  });
})();
