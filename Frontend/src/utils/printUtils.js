import { SCHOOL } from '../config/school';

const _initials = (name) =>
  name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const gradeClass = (val) => {
  const n = parseFloat(val);
  if (isNaN(n)) return '';
  if (n >= 12) return 'gc-high';
  if (n >= 10) return 'gc-mid';
  return 'gc-low';
};

export const appreciation = (avg) => {
  const n = parseFloat(avg);
  if (isNaN(n)) return '';
  if (n >= 16) return 'Très bien';
  if (n >= 14) return 'Bien';
  if (n >= 12) return 'Assez bien';
  if (n >= 10) return 'Passable';
  return 'Insuffisant';
};

export const avgBoxClass = (avg) => {
  const n = parseFloat(avg);
  if (isNaN(n)) return 'avg-neutral';
  if (n >= 12) return 'avg-high';
  if (n >= 10) return 'avg-mid';
  return 'avg-low';
};

export const sharedStyles = `
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',Arial,sans-serif; background:white; color:#1e293b; line-height:1.55; font-size:14px; }

  /* ── Print header ─────────────────────────── */
  .ph { display:flex; align-items:center; gap:16px; padding:18px 28px; background:linear-gradient(135deg,#4f46e5 0%,#3730a3 100%); color:white; }
  .ph-badge { width:46px; height:46px; background:white; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:17px; font-weight:900; color:#4f46e5; flex-shrink:0; letter-spacing:-1px; }
  .ph-name  { font-size:18px; font-weight:800; }
  .ph-tag   { font-size:11px; opacity:.7; margin-top:2px; }
  .ph-right { margin-left:auto; text-align:right; font-size:11px; opacity:.8; line-height:1.7; }
  .rpt-banner { background:#f8fafc; border-top:3px solid #4f46e5; border-bottom:1px solid #e2e8f0; padding:10px 0; text-align:center; }
  .rpt-banner h2 { font-size:13px; font-weight:800; letter-spacing:5px; color:#1e293b; text-transform:uppercase; }
  .rpt-banner p  { font-size:12px; color:#64748b; margin-top:3px; }

  /* ── Info grid ─────────────────────────────── */
  .info-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px 28px; background:#f8fafc; padding:16px 24px; border-bottom:1px solid #e2e8f0; }
  .info-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.8px; color:#94a3b8; margin-bottom:2px; }
  .info-val   { font-size:14px; font-weight:600; color:#0f172a; }

  /* ── Section titles ────────────────────────── */
  .sec { padding:20px 28px 0; }
  .sec-title { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:2px; color:#4f46e5; padding-bottom:6px; border-bottom:2px solid #e0e7ff; margin-bottom:14px; }

  /* ── Tables ──────────────────────────────────  */
  table { width:100%; border-collapse:collapse; font-size:13px; }
  thead th { background:#1e293b; color:white; padding:9px 12px; text-align:left; font-size:11px; font-weight:700; letter-spacing:.4px; white-space:nowrap; }
  thead th.tc { text-align:center; }
  tbody tr:nth-child(even) { background:#f8fafc; }
  tbody td { padding:8px 12px; border-bottom:1px solid #e2e8f0; vertical-align:middle; }
  tbody td.tc { text-align:center; }
  tfoot td { padding:9px 12px; background:#f1f5f9; font-weight:700; font-size:13px; border-top:2px solid #cbd5e1; }
  tfoot td.tc { text-align:center; }

  /* ── Grade colours ───────────────────────────  */
  .gc-high { color:#16a34a; font-weight:700; }
  .gc-mid  { color:#d97706; font-weight:700; }
  .gc-low  { color:#dc2626; font-weight:700; }

  /* ── Average box ─────────────────────────────  */
  .avg-box { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-radius:8px; margin-top:14px; font-weight:700; font-size:15px; }
  .avg-high { background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; }
  .avg-mid  { background:#fef9c3; color:#92400e; border:1px solid #fde68a; }
  .avg-low  { background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; }
  .avg-neutral { background:#f1f5f9; color:#1e293b; border:1px solid #e2e8f0; }

  /* ── Absence badges ──────────────────────────  */
  .badge-ok  { display:inline-block; background:#dcfce7; color:#15803d; border:1px solid #86efac; padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600; white-space:nowrap; }
  .badge-nok { display:inline-block; background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600; white-space:nowrap; }

  /* ── Signature zone ──────────────────────────  */
  .sig-zone { display:flex; justify-content:flex-end; gap:60px; padding:28px 28px 0; }
  .sig-block { text-align:center; }
  .sig-title { font-size:12px; font-weight:700; margin-bottom:44px; }
  .sig-line  { border-top:1px solid #cbd5e1; padding-top:5px; font-size:11px; color:#94a3b8; }

  /* ── Footer ──────────────────────────────────  */
  .print-footer { display:flex; justify-content:space-between; align-items:center; font-size:10px; color:#94a3b8; border-top:1px solid #e2e8f0; padding:12px 28px; margin-top:32px; }

  /* ── Page break ──────────────────────────────  */
  .page-item { page-break-after:always; }
  .page-item:last-child { page-break-after:auto; }

  @media print {
    body { font-size:12px; }
    .no-print { display:none !important; }
  }
`;

export const makeHeader = (reportTitle, subtitle = '') => `
  <div class="ph">
    <div class="ph-badge">${_initials(SCHOOL.name)}</div>
    <div>
      <div class="ph-name">${SCHOOL.name}</div>
      <div class="ph-tag">${SCHOOL.tagline}</div>
    </div>
    <div class="ph-right">
      <div>Année scolaire : <strong>${SCHOOL.year}</strong></div>
      <div>${SCHOOL.address}</div>
      <div>${SCHOOL.email}</div>
    </div>
  </div>
  <div class="rpt-banner">
    <h2>${reportTitle}</h2>
    ${subtitle ? `<p>${subtitle}</p>` : ''}
  </div>
`;

export const makeFooter = (extra = '') => {
  const date = new Date().toLocaleDateString('fr-FR');
  return `
    <div class="print-footer">
      <span>${SCHOOL.name} &middot; ${SCHOOL.phone} &middot; ${SCHOOL.email}</span>
      <span>${extra || `Document généré le ${date}`}</span>
    </div>
  `;
};

export const buildPrintDoc = ({ title, head = '', body }) => `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>${sharedStyles}</style>
    ${head}
  </head>
  <body>${body}</body>
  </html>
`;
