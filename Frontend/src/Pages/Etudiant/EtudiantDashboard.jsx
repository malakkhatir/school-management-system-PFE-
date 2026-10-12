import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../Api/Api';
import { SCHOOL } from '../../config/school';
import { gradeClass, appreciation, avgBoxClass, makeHeader, makeFooter, buildPrintDoc } from '../../utils/printUtils';
import {
  User,
  BookOpen,
  CalendarX,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  GraduationCap,
  Calendar,
  Key,
  X,
  Printer,
  FileText,
  Loader2,
  Menu,
  Search,
  TrendingUp,
  Home,
  ChevronRight,
  CheckCircle,
  XCircle,
  Users
} from 'lucide-react';

export default function EtudiantDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [etudiant, setEtudiant] = useState(null);
  const [notes, setNotes] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notesSearch, setNotesSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Design system class constants
  const inputCls = 'w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors';
  const labelCls = 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5';
  const btnPrimary = 'inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-semibold rounded-lg shadow-sm shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-600/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  const btnSecondary = 'inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 transition-colors';

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    const storedRoleId = localStorage.getItem('roleId');
    const token = localStorage.getItem('token');

    if (!token || storedRole !== 'etudiant' || storedRoleId !== id) {
      navigate('/404', { replace: true });
    }
  }, [id, navigate]);

  const totalHeures = absences.reduce((sum, a) => sum + (a.nb_heures || 0), 0);
  const totalAbsences = absences.reduce((sum, a) => sum + parseFloat(a.nb_heures || 0), 0);
  const unjustifiedCount = absences.filter(a => !a.justifiee).length;

  const calculerMoyenne = () => {
    if (notes.length === 0) return null;
    const somme = notes.reduce((acc, note) => acc + parseFloat(note.note), 0);
    return (somme / notes.length).toFixed(2);
  };
  const moyenneGenerale = calculerMoyenne();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getAppreciation = () => {
    if (moyenneGenerale === null) return "Aucune note enregistrée.";
    const moyenne = parseFloat(moyenneGenerale);
    if (moyenne >= 16) return "Excellent travail !";
    if (moyenne >= 14) return "Très bien, encourageant.";
    if (moyenne >= 12) return "Bon, peut mieux faire.";
    if (moyenne >= 10) return "Moyen, des progrès nécessaires.";
    return "Insuffisant, une remise à niveau est conseillée.";
  };

  const getAbsenceAppreciation = () => {
    if (totalHeures === 0) return "Assiduité parfaite.";
    if (totalHeures <= 5) return "Quelques absences, à surveiller.";
    if (totalHeures <= 15) return "Absences fréquentes, justifier impérativement.";
    return "Trop d'absences, risque de non validation.";
  };

  const gradeColor = (avg) => {
    if (avg === null || avg === undefined || isNaN(avg)) return 'text-gray-900 dark:text-slate-100';
    return avg >= 12 ? 'text-green-600 dark:text-green-400'
      : avg >= 10 ? 'text-amber-500 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400';
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resEtudiant = await api.get(`/etudiants/${id}`);
        setEtudiant(resEtudiant.data);
        const resNotes = await api.get(`/etudiants/${id}/notes`);
        setNotes(resNotes.data);
        const resAbsences = await api.get(`/etudiants/${id}/absences`);
        setAbsences(resAbsences.data);
      } catch (error) {
        console.error('Erreur chargement données étudiant', error);
      }
    };
    fetchData();
  }, [id]);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('roleId');
      navigate('/login');
    } catch (error) {
      console.error('Erreur déconnexion', error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setSubmitting(true);
    try {
      await api.post('/change-password', passwordForm);
      setPasswordSuccess('Mot de passe modifié avec succès.');
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (error) {
      const msg = error.response?.data?.message || 'Erreur lors du changement de mot de passe.';
      setPasswordError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const notesByMatiere = notes.reduce((acc, note) => {
      if (!acc[note.matiere]) acc[note.matiere] = [];
      acc[note.matiere].push(note);
      return acc;
    }, {});

    const noteCell = (val) => {
      if (val === '-' || val == null) return '<span style="color:#94a3b8">—</span>';
      const n = parseFloat(val);
      return `<span class="${gradeClass(n)}">${n.toFixed(2)}/20</span>`;
    };

    let notesRows = '';
    for (const [matiere, notesList] of Object.entries(notesByMatiere)) {
      const c1 = notesList.find(n => n.type_controle === 'Contrôle 1');
      const c2 = notesList.find(n => n.type_controle === 'Contrôle 2');
      const c3 = notesList.find(n => n.type_controle === 'Contrôle 3');
      const valides = [c1, c2, c3].filter(c => c && c.note != null);
      let moy = '-';
      if (valides.length > 0) {
        moy = (valides.reduce((s, c) => s + parseFloat(c.note), 0) / valides.length).toFixed(2);
      }
      notesRows += `
        <tr>
          <td>${matiere}</td>
          <td class="tc">${noteCell(c1?.note)}</td>
          <td class="tc">${noteCell(c2?.note)}</td>
          <td class="tc">${noteCell(c3?.note)}</td>
          <td class="tc">${noteCell(moy)}</td>
          <td class="tc">${moy !== '-' ? appreciation(moy) : '—'}</td>
        </tr>
      `;
    }

    const notesHtml = notes.length === 0
      ? '<p style="color:#94a3b8;padding:12px 0">Aucune note disponible.</p>'
      : `<table>
          <thead>
            <tr>
              <th>Matière</th>
              <th class="tc">Contrôle 1</th>
              <th class="tc">Contrôle 2</th>
              <th class="tc">Contrôle 3</th>
              <th class="tc">Moyenne /20</th>
              <th class="tc">Appréciation</th>
            </tr>
          </thead>
          <tbody>${notesRows}</tbody>
        </table>
        ${moyenneGenerale ? `
          <div class="avg-box ${avgBoxClass(moyenneGenerale)}">
            <span>Moyenne générale</span>
            <span>${parseFloat(moyenneGenerale).toFixed(2)}/20 — ${appreciation(moyenneGenerale)}</span>
          </div>` : ''}`;

    const totalH = absences.reduce((s, a) => s + parseFloat(a.nb_heures || 0), 0);
    const absRows = absences.map(a => `
      <tr>
        <td>${formatDate(a.date)}</td>
        <td>${a.enseignant?.matiere || 'Non spécifiée'}</td>
        <td class="tc">${a.nb_heures} h</td>
        <td class="tc">${a.justifiee
          ? '<span class="badge-ok">Justifiée</span>'
          : '<span class="badge-nok">Non justifiée</span>'}</td>
      </tr>
    `).join('');

    const absHtml = absences.length === 0
      ? '<p style="color:#94a3b8;padding:12px 0">Aucune absence enregistrée.</p>'
      : `<table>
          <thead>
            <tr>
              <th>Date</th><th>Matière</th>
              <th class="tc">Heures</th><th class="tc">Statut</th>
            </tr>
          </thead>
          <tbody>${absRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2">Total des absences</td>
              <td class="tc ${totalH >= 15 ? 'gc-low' : ''}">${totalH} h</td>
              <td></td>
            </tr>
          </tfoot>
        </table>`;

    const body = `
      ${makeHeader('RELEVÉ DE NOTES', `${etudiant?.prenom || ''} ${etudiant?.nom || ''}`)}
      <div class="info-grid">
        <div><div class="info-label">Nom complet</div><div class="info-val">${etudiant?.nom || ''} ${etudiant?.prenom || ''}</div></div>
        <div><div class="info-label">Date de naissance</div><div class="info-val">${formatDate(etudiant?.date_naissance) || 'Non renseignée'}</div></div>
        <div><div class="info-label">Classe</div><div class="info-val">${etudiant?.classe?.nom || 'Non définie'}</div></div>
        <div><div class="info-label">Email</div><div class="info-val">${user?.email || ''}</div></div>
      </div>
      <div class="sec">
        <div class="sec-title">Relevé de notes</div>
        ${notesHtml}
      </div>
      <div class="sec" style="margin-top:20px;">
        <div class="sec-title">Absences</div>
        ${absHtml}
      </div>
      <div class="sig-zone">
        <div class="sig-block">
          <div class="sig-title">Le Directeur</div>
          <div class="sig-line">Signature et cachet</div>
        </div>
        <div class="sig-block">
          <div class="sig-title">L'Enseignant référent</div>
          <div class="sig-line">Signature</div>
        </div>
      </div>
      ${makeFooter()}
    `;

    printWindow.document.write(buildPrintDoc({
      title: `Relevé — ${etudiant?.prenom} ${etudiant?.nom}`,
      body,
    }));
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintAttestation = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const date = new Date();
    const formattedDate = date.toLocaleDateString('fr-FR');
    const numAttestation = `ATS-${etudiant?.id}-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}`;

    // Generate QR code using installed qrcode.react
    let qrDataUrl = '';
    try {
      const { createRoot } = await import('react-dom/client');
      const { QRCodeCanvas } = await import('qrcode.react');
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;left:-9999px;visibility:hidden;';
      document.body.appendChild(container);
      const qrRoot = createRoot(container);
      await new Promise(resolve => {
        qrRoot.render(React.createElement(QRCodeCanvas, { value: numAttestation, size: 96 }));
        setTimeout(resolve, 250);
      });
      const canvas = container.querySelector('canvas');
      if (canvas) qrDataUrl = canvas.toDataURL('image/png');
      qrRoot.unmount();
      document.body.removeChild(container);
    } catch (e) {
      console.warn('QR generation skipped:', e);
    }

    const body = `
      ${makeHeader('ATTESTATION DE SCOLARITÉ', `Année scolaire ${SCHOOL.year}`)}
      <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:22px 28px;border-bottom:1px solid #e2e8f0;gap:24px;">
        <div style="flex:1;">
          <div style="font-size:11px;color:#94a3b8;margin-bottom:10px;">N° ${numAttestation}</div>
          <p style="color:#475569;margin-bottom:16px;line-height:1.7;">
            Je soussigné(e), Directeur de l'établissement <strong>${SCHOOL.name}</strong>,
            atteste que l'élève :
          </p>
          <div class="info-grid" style="border-radius:8px;margin-bottom:16px;">
            <div><div class="info-label">Nom</div><div class="info-val">${etudiant?.nom || ''}</div></div>
            <div><div class="info-label">Prénom</div><div class="info-val">${etudiant?.prenom || ''}</div></div>
            <div><div class="info-label">Date de naissance</div><div class="info-val">${formatDate(etudiant?.date_naissance) || 'Non renseignée'}</div></div>
            <div><div class="info-label">Classe</div><div class="info-val">${etudiant?.classe?.nom || 'Non définie'}</div></div>
          </div>
          <p style="color:#374151;line-height:1.7;">
            est régulièrement inscrit(e) dans notre établissement pour l'année scolaire
            <strong>${SCHOOL.year}</strong>.
          </p>
          <div style="margin-top:16px;padding:12px 16px;background:#f0f9ff;border-left:3px solid #4f46e5;border-radius:0 8px 8px 0;font-size:12px;color:#475569;font-style:italic;line-height:1.6;">
            La présente attestation est délivrée à la demande de l'intéressé(e) pour servir et valoir
            ce que de droit. Toute falsification est passible de sanctions conformément à la loi.
          </div>
        </div>
        ${qrDataUrl ? `
          <div style="text-align:center;flex-shrink:0;">
            <img src="${qrDataUrl}" width="96" height="96" alt="QR"
              style="display:block;border:1px solid #e2e8f0;border-radius:6px;padding:4px;" />
            <div style="font-size:9px;color:#94a3b8;margin-top:5px;max-width:96px;line-height:1.4;">
              Vérification d'authenticité
            </div>
          </div>` : ''}
      </div>
      <div class="sig-zone">
        <div class="sig-block">
          <div class="sig-title">Fait à ${SCHOOL.city}, le ${formattedDate}</div>
          <div style="margin-bottom:44px;font-size:12px;font-weight:700;">Le Directeur</div>
          <div class="sig-line">Signature et cachet</div>
        </div>
      </div>
      ${makeFooter(`Document émis le ${formattedDate}`)}
    `;

    printWindow.document.write(buildPrintDoc({
      title: `Attestation — ${etudiant?.prenom} ${etudiant?.nom}`,
      body,
    }));
    printWindow.document.close();
    printWindow.print();
  };

  const navGroups = [
    {
      label: 'Principal',
      items: [
        { id: 'overview', label: "Vue d'ensemble", icon: Home },
      ],
    },
    {
      label: 'Mon Parcours',
      items: [
        { id: 'notes',    label: 'Mes notes',    icon: BookOpen },
        { id: 'absences', label: 'Mes absences', icon: CalendarX },
      ],
    },
    {
      label: 'Documents',
      items: [
        { id: 'attestation', label: 'Attestation', icon: FileText },
      ],
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1">Vue d'ensemble</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">Résumé de votre progression académique</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-gray-200/60 dark:hover:shadow-slate-900/60 transition-all group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Moyenne générale</p>
                    <p className={`text-3xl font-bold mt-2 tabular-nums ${moyenneGenerale ? gradeColor(moyenneGenerale) : 'text-gray-300 dark:text-slate-600'}`}>
                      {moyenneGenerale ? `${moyenneGenerale}` : '—'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Toutes matières · /20</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-md shadow-indigo-600/20 group-hover:shadow-lg transition-shadow shrink-0">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-gray-200/60 dark:hover:shadow-slate-900/60 transition-all group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Heures d'absence</p>
                    <p className={`text-3xl font-bold mt-2 tabular-nums ${totalAbsences >= 15 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-slate-100'}`}>
                      {totalAbsences}<span className="text-lg font-semibold ml-0.5">h</span>
                    </p>
                    <p className={`text-xs mt-1 ${unjustifiedCount > 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-slate-500'}`}>
                      {unjustifiedCount > 0 ? `${unjustifiedCount} non justifiée(s)` : 'Tout justifié'}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-xl shadow-md transition-shadow group-hover:shadow-lg shrink-0 ${totalAbsences >= 15 ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-600/20' : 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-amber-600/20'}`}>
                    <CalendarX className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-gray-200/60 dark:hover:shadow-slate-900/60 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Ma classe</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-2 truncate">{etudiant?.classe?.nom || '—'}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Groupe assigné</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-600/20 group-hover:shadow-lg transition-shadow shrink-0">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => setActiveTab('notes')} className="group flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all text-left">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                  <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Voir mes notes</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Résultats par matière</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              </button>
              <button onClick={() => setActiveTab('absences')} className="group flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-sm transition-all text-left">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
                  <CalendarX className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Voir mes absences</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Suivi des présences</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
              </button>
            </div>
          </div>
        );

      case 'profil':
        return (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Mon profil</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Informations personnelles et scolaires</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-slate-800">
                <div className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {etudiant?.prenom?.charAt(0)}{etudiant?.nom?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">{etudiant?.prenom} {etudiant?.nom}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 mt-1">
                    Étudiant
                  </span>
                </div>
              </div>
              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { label: 'Date de naissance', value: formatDate(etudiant?.date_naissance) || 'Non renseignée' },
                  { label: 'Classe', value: etudiant?.classe?.nom || 'Non définie' },
                  { label: 'Adresse e-mail', value: user?.email },
                ].map(row => (
                  <div key={row.label}>
                    <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1">{row.label}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{row.value}</p>
                  </div>
                ))}
              </div>
              {/* Password button */}
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-800">
                <button onClick={() => setShowPasswordModal(true)} className={btnPrimary}>
                  <Key className="h-3.5 w-3.5" />
                  Changer mon mot de passe
                </button>
              </div>
            </div>
          </div>
        );

      case 'notes': {
        // Regrouper les notes par matière
        const notesByMatiere = notes.reduce((acc, note) => {
          if (!acc[note.matiere]) acc[note.matiere] = [];
          acc[note.matiere].push(note);
          return acc;
        }, {});

        const filteredNotes = notes.filter(n => n.matiere?.toLowerCase().includes(notesSearch.toLowerCase()));
        const filteredNotesByMatiere = filteredNotes.reduce((acc, note) => {
          if (!acc[note.matiere]) acc[note.matiere] = [];
          acc[note.matiere].push(note);
          return acc;
        }, {});

        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Mes notes</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Relevé détaillé par contrôle</p>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-slate-500 pointer-events-none" />
              <input
                value={notesSearch}
                onChange={e => setNotesSearch(e.target.value)}
                placeholder="Filtrer par matière…"
                className="w-full sm:w-56 pl-9 pr-3.5 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
              {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <BookOpen className="h-8 w-8 text-gray-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Aucune note disponible</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Vos notes apparaîtront ici une fois saisies</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
                      <thead className="bg-gray-50 dark:bg-slate-800/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Matière</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30">Contrôle 1</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30">Contrôle 2</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30">Contrôle 3</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Moyenne</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {Object.entries(filteredNotesByMatiere).map(([matiere, notesList]) => {
                          const controle1 = notesList.find(n => n.type_controle === 'Contrôle 1');
                          const controle2 = notesList.find(n => n.type_controle === 'Contrôle 2');
                          const controle3 = notesList.find(n => n.type_controle === 'Contrôle 3');
                          const note1 = controle1 ? controle1.note : '-';
                          const note2 = controle2 ? controle2.note : '-';
                          const note3 = controle3 ? controle3.note : '-';
                          let moyMatiere = '-';
                          const notesValides = [controle1, controle2, controle3].filter(c => c && c.note);
                          if (notesValides.length > 0) {
                            const sum = notesValides.reduce((acc, c) => acc + parseFloat(c.note), 0);
                            moyMatiere = (sum / notesValides.length).toFixed(2);
                          }
                          return (
                            <tr key={matiere} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-slate-100">{matiere}</td>
                              <td className="px-4 py-3.5 text-sm text-center">
                                {note1 !== '-' ? <span className={gradeColor(parseFloat(note1))}>{note1}/20</span> : '-'}
                              </td>
                              <td className="px-4 py-3.5 text-sm text-center">
                                {note2 !== '-' ? <span className={gradeColor(parseFloat(note2))}>{note2}/20</span> : '-'}
                              </td>
                              <td className="px-4 py-3.5 text-sm text-center">
                                {note3 !== '-' ? <span className={gradeColor(parseFloat(note3))}>{note3}/20</span> : '-'}
                              </td>
                              <td className="px-4 py-3.5 text-sm text-center font-semibold">
                                {moyMatiere !== '-' ? (
                                  <span className={gradeColor(parseFloat(moyMatiere))}>{moyMatiere}/20</span>
                                ) : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {moyenneGenerale && (
                    <div className="mt-4 mx-4 mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-slate-400">Moyenne générale</span>
                      <span className={`text-2xl font-bold ${gradeColor(parseFloat(moyenneGenerale))}`}>{moyenneGenerale} <span className="text-base font-normal text-gray-500 dark:text-slate-400">/ 20</span></span>
                    </div>
                  )}
                </>
              )}
            </div>
            {filteredNotesByMatiere && Object.keys(filteredNotesByMatiere).length === 0 && notesSearch && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400 dark:text-slate-500">
                  Aucun résultat pour « {notesSearch} » —{' '}
                  <button onClick={() => setNotesSearch('')} className="text-indigo-600 hover:underline">Effacer</button>
                </p>
              </div>
            )}
          </div>
        );
      }

      case 'absences':
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Mes absences</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Suivi des présences</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
              {absences.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CalendarX className="h-8 w-8 text-gray-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Aucune absence enregistrée</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Votre assiduité est parfaite</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
                      <thead className="bg-gray-50 dark:bg-slate-800/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Matière</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Heures</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Justification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {absences.map((abs) => (
                          <tr key={abs.id} className={`transition-colors ${abs.justifiee ? 'bg-green-50/30 dark:bg-green-950/10 hover:bg-green-50/50' : 'bg-red-50/30 dark:bg-red-950/10 hover:bg-red-50/50'}`}>
                            <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-slate-300">{formatDate(abs.date)}</td>
                            <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-slate-300">{abs.enseignant?.matiere || 'Non spécifiée'}</td>
                            <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-slate-300">{abs.nb_heures} h</td>
                            <td className="px-4 py-3.5 text-sm">
                              {abs.justifiee ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  <CheckCircle className="h-3 w-3" /> Justifiée
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                  <XCircle className="h-3 w-3" /> Non justifiée
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className={`mx-4 mb-4 mt-2 flex items-center justify-between px-4 py-2.5 rounded-lg border ${
                    totalAbsences >= 15
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700'
                  }`}>
                    <span className="text-xs text-gray-500 dark:text-slate-400">Total absences</span>
                    <span className={`text-sm font-bold ${totalAbsences >= 15 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-slate-100'}`}>
                      {totalHeures}h
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'attestation':
        return (
          <div className="max-w-xl space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Attestation scolaire</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Imprimer votre attestation officielle</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800">
                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-1">Attestation de scolarité</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                    Inclut vos informations personnelles, votre classe et les mentions légales nécessaires pour justifier de votre scolarité auprès des autorités compétentes.
                  </p>
                </div>
              </div>
              <button onClick={handlePrintAttestation} className={btnSecondary}>
                <Printer className="h-4 w-4" />
                Imprimer l'attestation
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!etudiant) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
        <aside className="w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800" />
        <div className="flex-1 flex flex-col">
          <div className="h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800" />
          <div className="flex-1 p-6 space-y-4">
            <div className="h-6 w-48 animate-pulse bg-gray-200 dark:bg-slate-800 rounded-lg" />
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 space-y-3">
              {[1,2,3,4].map(i => <div key={i} className={`h-4 animate-pulse bg-gray-100 dark:bg-slate-800 rounded ${i===1?'w-48':i===2?'w-full':i===3?'w-3/4':'w-1/2'}`} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo area */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-gray-200 dark:border-slate-800 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-600/25 flex items-center justify-center shrink-0">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-tight">{SCHOOL.name}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Espace Étudiant</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {navGroups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-5' : 'mt-1'}>
              <p className="px-3 mb-1 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                    className={`w-full ${
                      activeTab === item.id
                        ? 'flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-r-lg border-l-[3px] border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 transition-all'
                        : 'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg border-l-[3px] border-transparent text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-slate-100 transition-all'
                    }`}>
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User at bottom */}
        <div className="shrink-0 border-t border-gray-200 dark:border-slate-800 p-3 space-y-1">
          <button
            onClick={() => { setActiveTab('profil'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors group ${
              activeTab === 'profil'
                ? 'bg-indigo-50 dark:bg-indigo-950/40'
                : 'hover:bg-gray-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm shadow-blue-600/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-gray-900 dark:text-slate-100 truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium truncate">Étudiant</p>
            </div>
            <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-colors ${activeTab === 'profil' ? 'text-indigo-500' : 'text-gray-300 dark:text-slate-600 group-hover:text-gray-400'}`} />
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              {navGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label || (activeTab === 'profil' ? 'Mon profil' : '')}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} title="Imprimer le relevé"
              className={btnSecondary + ' gap-1.5 px-3 py-1.5'}>
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Relevé</span>
            </button>
            <button onClick={toggleDarkMode} aria-label="Basculer le thème"
              className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Content */}
        <main key={activeTab} className="flex-1 overflow-y-auto p-4 sm:p-6 tab-enter">
          {renderContent()}
        </main>
      </div>

      {/* Password modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl shadow-black/20 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-700 to-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-xl"><Key className="h-5 w-5 text-white" /></div>
                <div>
                  <h3 className="text-base font-semibold text-white">Changer le mot de passe</h3>
                  <p className="text-xs text-white/60 mt-0.5">Sécurité du compte</p>
                </div>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className={labelCls}>Mot de passe actuel *</label>
                  <input type="password" placeholder="••••••••" required className={inputCls} value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Nouveau mot de passe *</label>
                  <input type="password" placeholder="••••••••" required className={inputCls} value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Confirmer *</label>
                  <input type="password" placeholder="••••••••" required className={inputCls} value={passwordForm.new_password_confirmation} onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })} />
                </div>
                {passwordError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                  </div>
                )}
                {passwordSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                    <p className="text-sm text-green-600 dark:text-green-400">{passwordSuccess}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                <button type="button" onClick={() => setShowPasswordModal(false)} className={btnSecondary}>Annuler</button>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white text-sm font-semibold rounded-lg shadow-sm active:scale-[0.98] transition-all disabled:opacity-50">
                  {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enregistrement…</> : <><Key className="h-3.5 w-3.5" /> Modifier</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
