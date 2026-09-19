/**
 * Renders the member ID card to a canvas and returns a PNG data URL.
 * Kept dependency-free (uses the browser Canvas API) so the main bundle
 * stays small — this module is only imported when a member downloads their card.
 */
export default async function renderMemberCard(card) {
  const W = 1014;
  const H = 639; // CR80-ish ratio at 2x
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Canvas not supported');

  // Background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#141417');
  grad.addColorStop(0.45, '#0a0a0b');
  grad.addColorStop(1, '#1a1a1e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Gold corner accents
  ctx.strokeStyle = 'rgba(200,162,75,0.55)';
  ctx.lineWidth = 2;
  const c = 44;
  [
    [0, 0, 1, 1],
    [W, 0, -1, 1],
    [0, H, 1, -1],
    [W, H, -1, -1],
  ].forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x + dx * 10, y + dy * 40);
    ctx.lineTo(x + dx * 10, y + dy * 10);
    ctx.lineTo(x + dx * 40, y + dy * 10);
    ctx.stroke();
  });

  // Brand
  ctx.fillStyle = '#e2c66e';
  ctx.font = '700 30px Cinzel, serif';
  ctx.fillText('GANGSTERS CLUB', 48, 78);

  ctx.fillStyle = 'rgba(200,200,210,0.75)';
  ctx.font = '500 13px Inter, sans-serif';
  ctx.fillText('PRIVATE MEMBER', 48, 104);

  // Photo
  const PHOTO = 132;
  const photoX = W - PHOTO - 48;
  const photoY = 48;
  try {
    const img = await loadImage(card.avatar_url);
    ctx.strokeStyle = 'rgba(200,162,75,0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(photoX - 2, photoY - 2, PHOTO + 4, PHOTO + 4);
    ctx.save();
    ctx.beginPath();
    ctx.rect(photoX, photoY, PHOTO, PHOTO);
    ctx.clip();
    ctx.drawImage(img, photoX, photoY, PHOTO, PHOTO);
    ctx.restore();
  } catch {
    ctx.strokeStyle = 'rgba(200,162,75,0.5)';
    ctx.strokeRect(photoX, photoY, PHOTO, PHOTO);
    ctx.fillStyle = 'rgba(226,198,110,0.9)';
    ctx.font = '600 34px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(card.full_name || '?').slice(0, 2).toUpperCase(), photoX + PHOTO / 2, photoY + PHOTO / 2 + 12);
    ctx.textAlign = 'left';
  }

  // Fields
  let y = 260;
  const label = (text) => {
    ctx.fillStyle = 'rgba(140,140,150,0.9)';
    ctx.font = '500 12px Inter, sans-serif';
    ctx.fillText(text, 48, y);
  };
  const value = (text, gold = false) => {
    ctx.fillStyle = gold ? '#e2c66e' : '#e8e8ea';
    ctx.font = '600 26px Inter, sans-serif';
    ctx.fillText(text, 48, y + 30);
    y += 74;
  };

  label('NAME');
  value(String(card.full_name).toUpperCase());
  label('MEMBER ID');
  value(card.member_id, true);
  label('MEMBER SINCE');
  value(formatMonthYearStatic(card.member_since));
  label('STATUS');
  value(String(card.status).toUpperCase(), card.status === 'active');

  // QR
  const QR = 168;
  const qrX = W - QR - 48;
  const qrY = H - QR - 48;
  if (card.qr) {
    try {
      const qrImg = await loadImage(card.qr);
      ctx.fillStyle = '#f5f0e4';
      ctx.fillRect(qrX - 8, qrY - 8, QR + 16, QR + 16);
      ctx.drawImage(qrImg, qrX, qrY, QR, QR);
    } catch {
      /* skip QR if it cannot be decoded */
    }
  }

  return canvas.toDataURL('image/png');
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) return reject(new Error('no src'));
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function formatMonthYearStatic(input) {
  if (!input) return '—';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
}
