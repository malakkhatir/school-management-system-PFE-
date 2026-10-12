// src/pages/EnseignantDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../Api/Api';
import { SCHOOL } from '../../config/school';
import { gradeClass, appreciation, makeHeader, makeFooter, buildPrintDoc } from '../../utils/printUtils';
import {
  Users, BookOpen, CalendarX, Moon, Sun, LogOut, ChevronDown,
  GraduationCap, Calendar, CheckCircle, XCircle, Plus, Eye, X,
  ChevronRight, Home, Edit, Trash2, User, Key, Printer, Menu,
  Search, TrendingUp, Loader2
} from 'lucide-react';

export default function EnseignantDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [enseignant, setEnseignant] = useState(null);
  const [classes, setClasses] = useState([]);
  const [enseignantsList, setEnseignantsList] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('profil');
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [currentEtudiant, setCurrentEtudiant] = useState(null);
  const [currentNote, setCurrentNote] = useState(null);
  const [currentAbsence, setCurrentAbsence] = useState(null);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCreateClasseModal, setShowCreateClasseModal] = useState(false);
  const [selectedEtudiantNotes, setSelectedEtudiantNotes] = useState(null);
  const [selectedEtudiantAbsences, setSelectedEtudiantAbsences] = useState(null);
  const [studentNotes, setStudentNotes] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [absenceForm, setAbsenceForm] = useState({
    etudiant_id: '',
    date: new Date().toISOString().split('T')[0],
    nb_heures: 1,
    justifiee: false
  });
  const [noteForm, setNoteForm] = useState({
    etudiant_id: '',
    matiere: '',
    type_controle: 'Contrôle 1',
    note: ''
  });
  const [newClasse, setNewClasse] = useState({
    nom: '',
    niveau: '',
    enseignant_id: parseInt(id)
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notesStudentSearch, setNotesStudentSearch] = useState('');
  const [absenceStudentSearch, setAbsenceStudentSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Design system class strings
  const inputCls = 'w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors';
  const labelCls = 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5';
  const btnPrimary = 'inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-semibold rounded-lg shadow-sm shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-600/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  const btnSecondary = 'inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 transition-colors';
  const btnDanger = 'inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-semibold rounded-lg shadow-sm shadow-red-600/20 active:scale-[0.98] transition-all';

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    const storedRoleId = localStorage.getItem('roleId');
    const token = localStorage.getItem('token');

    if (!token || storedRole !== 'enseignant' || storedRoleId !== id) {
      navigate('/404', { replace: true });
    }
  }, [id, navigate]);

  // Toast auto
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Thème
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

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resEnseignant = await api.get(`/enseignants/${id}`);
        setEnseignant(resEnseignant.data);
      } catch (error) { console.error(error); }

      try {
        const resClasses = await api.get('/classes');
        setClasses(resClasses.data);
      } catch (error) { console.error(error); }

      try {
        const resEnseignantsList = await api.get('/enseignants');
        setEnseignantsList(resEnseignantsList.data);
      } catch (error) { console.warn("Liste enseignants non disponible"); setEnseignantsList([]); }

      try {
        const resEtudiants = await api.get('/etudiants');
        setEtudiants(resEtudiants.data);
      } catch (error) { console.error(error); }

      try {
        const resAbsences = await api.get('/absences');
        setAbsences(resAbsences.data);
      } catch (error) { console.error(error); }

      try {
        const resNotes = await api.get('/notes');
        setNotes(resNotes.data);
      } catch (error) { console.error(error); }
    };
    fetchData();
  }, [id]);

  // Charger les notes spécifiques de l'étudiant sélectionné (matière de l'enseignant)
  useEffect(() => {
    const fetchStudentNotes = async () => {
      if (selectedEtudiantNotes && enseignant) {
        try {
          const res = await api.get(`/etudiants/${selectedEtudiantNotes.id}/notes/matiere`);
          setStudentNotes(res.data);
        } catch (error) {
          console.error("Erreur chargement notes étudiant", error);
          setStudentNotes([]);
        }
      } else {
        setStudentNotes([]);
      }
    };
    fetchStudentNotes();
  }, [selectedEtudiantNotes, enseignant]);

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // --- Changement mot de passe ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await api.post('/change-password', passwordForm);
      setPasswordSuccess('Mot de passe modifié avec succès.');
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (error) {
      const msg = error.response?.data?.message || 'Erreur lors du changement.';
      setPasswordError(msg);
    }
  };

  // ---------- Absences ----------
  const openAddAbsence = (etudiant) => {
    setCurrentEtudiant(etudiant);
    setCurrentAbsence(null);
    setAbsenceForm({
      etudiant_id: etudiant.id,
      date: new Date().toISOString().split('T')[0],
      nb_heures: 1,
      justifiee: false
    });
    setShowAbsenceModal(true);
  };

  const openEditAbsence = (absence) => {
    setCurrentAbsence(absence);
    setAbsenceForm({
      etudiant_id: absence.etudiant_id,
      date: absence.date.split('T')[0],
      nb_heures: absence.nb_heures,
      justifiee: absence.justifiee
    });
    setShowAbsenceModal(true);
  };

  const handleAbsenceSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (currentAbsence) {
        await api.put(`/absences/${currentAbsence.id}`, absenceForm);
        setMessage({ text: 'Absence modifiée', type: 'success' });
      } else {
        await api.post('/absences', absenceForm);
        setMessage({ text: 'Absence ajoutée', type: 'success' });
      }
      const res = await api.get('/absences');
      setAbsences(res.data);
      setShowAbsenceModal(false);
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erreur', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAbsence = async (absenceId) => {
    try {
      await api.delete(`/absences/${absenceId}`);
      const res = await api.get('/absences');
      setAbsences(res.data);
      setConfirmDelete(null);
      setMessage({ text: 'Absence supprimée', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erreur suppression', type: 'error' });
    }
  };

  // ---------- Notes (avec type_controle) ----------
  const openAddNote = (etudiant) => {
    setCurrentEtudiant(etudiant);
    setCurrentNote(null);
    setNoteForm({
      etudiant_id: etudiant.id,
      matiere: enseignant?.matiere || '',
      type_controle: 'Contrôle 1',
      note: ''
    });
    setShowNoteModal(true);
  };

  const openEditNote = (note) => {
    setCurrentNote(note);
    setNoteForm({
      etudiant_id: note.etudiant_id,
      matiere: note.matiere,
      type_controle: note.type_controle || 'Contrôle 1',
      note: note.note
    });
    setShowNoteModal(true);
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
      const res = await api.get('/notes');
      setNotes(res.data);
      if (selectedEtudiantNotes) {
        const resStudent = await api.get(`/etudiants/${selectedEtudiantNotes.id}/notes/matiere`);
        setStudentNotes(resStudent.data);
      }
      setConfirmDelete(null);
      setMessage({ text: 'Note supprimée', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erreur suppression', type: 'error' });
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        etudiant_id: noteForm.etudiant_id,
        matiere: noteForm.matiere,
        type_controle: noteForm.type_controle,
        note: parseFloat(noteForm.note)
      };
      if (currentNote) {
        await api.put(`/notes/${currentNote.id}`, payload);
        setMessage({ text: 'Note modifiée', type: 'success' });
      } else {
        await api.post('/notes', payload);
        setMessage({ text: 'Note ajoutée', type: 'success' });
      }
      const resNotes = await api.get('/notes');
      setNotes(resNotes.data);
      if (selectedEtudiantNotes) {
        const resStudent = await api.get(`/etudiants/${selectedEtudiantNotes.id}/notes/matiere`);
        setStudentNotes(resStudent.data);
      }
      setShowNoteModal(false);
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erreur', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Impression du relevé de notes
  const printClassReport = async (classe) => {
    const classStudents = etudiants.filter(e => e.classe_id === classe.id);
    if (classStudents.length === 0) {
      alert('Aucun étudiant dans cette classe.');
      return;
    }

    const studentData = await Promise.all(classStudents.map(async (etudiant) => {
      try {
        const res = await api.get(`/etudiants/${etudiant.id}/notes/matiere`);
        const etudiantNotes = res.data;
        const note1 = etudiantNotes.find(n => n.type_controle === 'Contrôle 1')?.note || '-';
        const note2 = etudiantNotes.find(n => n.type_controle === 'Contrôle 2')?.note || '-';
        const note3 = etudiantNotes.find(n => n.type_controle === 'Contrôle 3')?.note || '-';
        let moyenne = '-';
        const notesValides = [note1, note2, note3].filter(n => n !== '-');
        if (notesValides.length > 0) {
          const sum = notesValides.reduce((acc, n) => acc + parseFloat(n), 0);
          moyenne = (sum / notesValides.length).toFixed(2);
        }
        return {
          nom: [etudiant.nom, etudiant.prenom].filter(Boolean).join(' '),
          controle1: note1,
          controle2: note2,
          controle3: note3,
          moyenne
        };
      } catch (error) {
        console.error(error);
        return {
          nom: [etudiant.nom, etudiant.prenom].filter(Boolean).join(' '),
          controle1: '-',
          controle2: '-',
          controle3: '-',
          moyenne: '-'
        };
      }
    }));

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setMessage({ text: "Autorisez les popups pour imprimer.", type: 'error' });
      return;
    }

    const noteCell = (v) => v !== '-'
      ? `<span class="${gradeClass(v)}">${parseFloat(v).toFixed(2)}/20</span>`
      : '<span style="color:#94a3b8">—</span>';

    const validStudents = studentData.filter(s => s.moyenne !== '-');
    const classMoy = validStudents.length
      ? (validStudents.reduce((sum, s) => sum + parseFloat(s.moyenne), 0) / validStudents.length).toFixed(2)
      : '-';

    const rows = studentData.map(s => `
      <tr>
        <td><strong>${s.nom}</strong></td>
        <td class="tc">${noteCell(s.controle1)}</td>
        <td class="tc">${noteCell(s.controle2)}</td>
        <td class="tc">${noteCell(s.controle3)}</td>
        <td class="tc">${noteCell(s.moyenne)}</td>
        <td class="tc">${s.moyenne !== '-' ? appreciation(s.moyenne) : '—'}</td>
      </tr>
    `).join('');

    const body = `
      ${makeHeader('RELEVÉ DE NOTES', `${classe.nom}${classe.niveau ? ` · ${classe.niveau}` : ''} · ${enseignant.matiere} (Coeff. ${enseignant.coefficient || 1})`)}
      <div class="info-grid">
        <div><div class="info-label">Classe</div><div class="info-val">${classe.nom}${classe.niveau ? ` (${classe.niveau})` : ''}</div></div>
        <div><div class="info-label">Matière</div><div class="info-val">${enseignant.matiere}</div></div>
        <div><div class="info-label">Coefficient</div><div class="info-val">${enseignant.coefficient || 1}</div></div>
        <div><div class="info-label">Enseignant</div><div class="info-val">${[enseignant.nom, enseignant.prenom].filter(Boolean).join(' ')}</div></div>
      </div>
      <div class="sec">
        <div class="sec-title">Résultats par étudiant</div>
        ${studentData.length === 0
          ? '<p style="color:#94a3b8;padding:12px 0">Aucun étudiant.</p>'
          : `<table>
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th class="tc">Contrôle 1</th>
                  <th class="tc">Contrôle 2</th>
                  <th class="tc">Contrôle 3</th>
                  <th class="tc">Moyenne /20</th>
                  <th class="tc">Appréciation</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
              <tfoot>
                <tr>
                  <td><strong>Moyenne de la classe</strong></td>
                  <td></td><td></td><td></td>
                  <td class="tc ${classMoy !== '-' ? gradeClass(classMoy) : ''}">
                    ${classMoy !== '-' ? `${classMoy}/20` : '—'}
                  </td>
                  <td class="tc">${classMoy !== '-' ? appreciation(classMoy) : '—'}</td>
                </tr>
              </tfoot>
            </table>`
        }
      </div>
      <div class="sig-zone">
        <div class="sig-block">
          <div class="sig-title">L'Enseignant</div>
          <div class="sig-line">Signature</div>
        </div>
      </div>
      ${makeFooter()}
    `;

    printWindow.document.write(buildPrintDoc({
      title: `Relevé de notes — ${classe.nom}`,
      body,
    }));
    printWindow.document.close();
    printWindow.print();
  };

  // ---------- Classes ----------
  const handleCreateClasse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/classes', newClasse);
      const res = await api.get('/classes');
      setClasses(res.data);
      setShowCreateClasseModal(false);
      setNewClasse({ nom: '', niveau: '', enseignant_id: parseInt(id) });
      setMessage({ text: 'Classe créée', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erreur création', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Utilitaires d'affichage
  const etudiantsParClasse = selectedClasse
    ? etudiants.filter(e => e.classe_id === selectedClasse.id)
    : [];

  const getAbsencesForEtudiant = (etudiantId) => absences.filter(a => a.etudiant_id === etudiantId);
  const mesAbsences = absences.filter(a => a.enseignant_id === parseInt(id));
  const mesNotes = notes.filter(n => {
    if (!enseignant?.matiere) return false;
    return n.matiere?.trim().toLowerCase() === enseignant.matiere.trim().toLowerCase();
  });

  // Grade color helper
  const gradeColor = (avg) => {
    if (avg === null || avg === undefined || isNaN(avg)) return 'text-gray-900 dark:text-slate-100';
    const n = parseFloat(avg);
    return n >= 12 ? 'text-green-600 dark:text-green-400'
      : n >= 10 ? 'text-amber-500 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400';
  };

  if (enseignant === null) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
        <aside className="w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 p-3 space-y-1.5">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-8 animate-pulse bg-gray-100 dark:bg-slate-800 rounded-lg" />)}
        </aside>
        <div className="flex-1 flex flex-col">
          <div className="h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800" />
          <div className="flex-1 p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 content-start">
            {[1,2,3,4].map(i => <div key={i} className="h-24 animate-pulse bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800" />)}
          </div>
        </div>
      </div>
    );
  }

  const navGroups = [
    {
      label: 'Principal',
      items: [
        { id: 'overview', label: 'Tableau de bord', icon: Home },
      ],
    },
    {
      label: 'Mes Classes',
      items: [
        { id: 'classes', label: 'Mes classes', icon: GraduationCap },
      ],
    },
    {
      label: 'Académique',
      items: [
        { id: 'notes',    label: 'Notes',    icon: BookOpen },
        { id: 'absences', label: 'Absences', icon: CalendarX },
      ],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
          message.type === 'success'
            ? 'bg-white dark:bg-slate-900 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {message.type === 'success'
            ? <CheckCircle className="h-4 w-4 shrink-0" />
            : <XCircle className="h-4 w-4 shrink-0" />}
          {message.text}
        </div>
      )}

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-5 h-14 border-b border-gray-200 dark:border-slate-800 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-600/25 flex items-center justify-center shrink-0">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-tight truncate">{SCHOOL.name}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Espace Enseignant</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {navGroups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-5' : 'mt-1'}>
              <p className="px-3 mb-1 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                    className={activeTab === item.id
                      ? 'w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-r-lg border-l-[3px] border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 transition-all'
                      : 'w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg border-l-[3px] border-transparent text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-slate-100 transition-all'
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="shrink-0 border-t border-gray-200 dark:border-slate-800 p-3 space-y-1">
          <button
            onClick={() => { setActiveTab('profil'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors group ${
              activeTab === 'profil'
                ? 'bg-indigo-50 dark:bg-indigo-950/40'
                : 'hover:bg-gray-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm transition-colors ${
              activeTab === 'profil'
                ? 'bg-gradient-to-br from-green-500 to-green-700 shadow-green-600/20'
                : 'bg-gradient-to-br from-green-500 to-green-700 shadow-green-600/20 group-hover:from-green-600 group-hover:to-green-800'
            }`}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-gray-900 dark:text-slate-100 truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] text-green-600 dark:text-green-400 font-medium truncate">Enseignant</p>
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

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              {navGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label || (activeTab === 'profil' ? 'Mon profil' : '')}
            </h1>
          </div>
          <button
            onClick={toggleDarkMode}
            aria-label="Basculer le thème"
            className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </header>

        <main key={activeTab} className="flex-1 overflow-y-auto p-4 sm:p-6 tab-enter">

          {/* Tableau de bord */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Vue d'ensemble</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Résumé de votre activité</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Classes', value: classes.length, icon: GraduationCap, iconBg: 'bg-gradient-to-br from-amber-500 to-amber-700', shadow: 'shadow-amber-600/20', sub: classes.length > 0 ? `${classes.length} groupe(s) actif(s)` : 'Aucun groupe', subColor: '' },
                  { label: 'Étudiants', value: etudiants.length, icon: Users, iconBg: 'bg-gradient-to-br from-blue-500 to-blue-700', shadow: 'shadow-blue-600/20', sub: etudiants.length > 0 ? `${etudiants.length} inscrit(s)` : 'Aucun étudiant', subColor: '' },
                  { label: 'Notes saisies', value: mesNotes.length, icon: BookOpen, iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-700', shadow: 'shadow-indigo-600/20', sub: `${[...new Set(mesNotes.map(n => n.matiere))].length} matière(s)`, subColor: 'text-indigo-500 dark:text-indigo-400' },
                  { label: 'Absences', value: mesAbsences.length, icon: CalendarX, iconBg: 'bg-gradient-to-br from-red-500 to-red-700', shadow: 'shadow-red-600/20', sub: `${mesAbsences.filter(a => !a.justifiee).length} non justifiée(s)`, subColor: 'text-red-500 dark:text-red-400' },
                ].map(card => (
                  <div key={card.label} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-gray-200/60 dark:hover:shadow-slate-900/60 transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{card.label}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-slate-100 mt-2 tabular-nums">{card.value}</p>
                        <p className={`text-xs mt-1 ${card.subColor || 'text-gray-400 dark:text-slate-500'}`}>{card.sub}</p>
                      </div>
                      <div className={`p-2.5 rounded-xl ${card.iconBg} shadow-md ${card.shadow} group-hover:shadow-lg transition-shadow shrink-0 ml-3`}>
                        <card.icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mon profil */}
          {activeTab === 'profil' && (
            <div className="space-y-5 max-w-2xl">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                      {enseignant?.nom?.charAt(0)}{enseignant?.prenom?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                        {[enseignant?.prenom, enseignant?.nom].filter(Boolean).join(' ')}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                          {enseignant?.matiere}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400">
                          Coeff. {enseignant?.coefficient || 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { label: 'Nom complet', value: [enseignant?.nom, enseignant?.prenom].filter(Boolean).join(' ') },
                    { label: 'Email', value: user?.email },
                    { label: 'Matière enseignée', value: enseignant?.matiere },
                    { label: 'Nombre de classes', value: classes.length }
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-6">
                  <button onClick={() => setShowPasswordModal(true)} className={btnPrimary}>
                    <Key className="h-4 w-4" />
                    Changer mon mot de passe
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mes classes */}
          {activeTab === 'classes' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Mes classes</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Liste des classes et étudiants</p>
                </div>
                <button onClick={() => setShowCreateClasseModal(true)} className={btnPrimary}>
                  <Plus className="h-4 w-4" />
                  Nouvelle classe
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map(classe => (
                  <div key={classe.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                    <div
                      className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                      onClick={() => setSelectedClasse(selectedClasse?.id === classe.id ? null : classe)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-slate-100">{classe.nom}</h4>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Niveau : {classe.niveau || '—'}</p>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                          {etudiants.filter(e => e.classe_id === classe.id).length} élèves
                        </span>
                      </div>
                    </div>
                    {selectedClasse?.id === classe.id && (
                      <div className="border-t border-gray-100 dark:border-slate-800 p-4 bg-gray-50 dark:bg-slate-800/30">
                        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Étudiants</p>
                        <div className="space-y-1.5">
                          {etudiants.filter(e => e.classe_id === classe.id).map(e => (
                            <div key={e.id} className="flex items-center gap-2.5 py-1.5 text-sm text-gray-700 dark:text-slate-300">
                              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-slate-300 shrink-0">
                                {e.nom?.charAt(0)}
                              </div>
                              {[e.nom, e.prenom].filter(Boolean).join(' ')}
                            </div>
                          ))}
                          {etudiants.filter(e => e.classe_id === classe.id).length === 0 && (
                            <p className="text-xs text-gray-400 dark:text-slate-500 py-1">Aucun étudiant</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {classes.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-400 dark:text-slate-500 text-sm">
                    Aucune classe disponible.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Gérer les notes</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Saisir, modifier ou supprimer les notes de vos étudiants</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left: classes + students */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Choisir une classe</h4>
                  </div>
                  <div className="p-4 space-y-2">
                    {classes.map(classe => (
                      <div key={classe.id} className="rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                        <button
                          onClick={() => { setSelectedClasse(selectedClasse?.id === classe.id ? null : classe); setNotesStudentSearch(''); }}
                          className="w-full flex justify-between items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                        >
                          <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{classe.nom}</span>
                          <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${selectedClasse?.id === classe.id ? 'rotate-90' : ''}`} />
                        </button>
                        {selectedClasse?.id === classe.id && (
                          <div className="border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30 p-3">
                            <div className="flex items-center justify-between mb-2.5">
                              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Étudiants</p>
                              <button
                                onClick={async () => await printClassReport(selectedClasse)}
                                className={btnSecondary + ' text-xs px-2.5 py-1.5'}
                              >
                                <Printer className="h-3.5 w-3.5" />
                                Imprimer le relevé
                              </button>
                            </div>
                            <div className="relative mb-2">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                              <input
                                value={notesStudentSearch}
                                onChange={e => setNotesStudentSearch(e.target.value)}
                                placeholder="Chercher étudiant…"
                                className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-1">
                              {etudiantsParClasse
                                .filter(etudiant =>
                                  notesStudentSearch === '' ||
                                  `${etudiant.nom} ${etudiant.prenom}`.toLowerCase().includes(notesStudentSearch.toLowerCase())
                                )
                                .map(etudiant => (
                                <div
                                  key={etudiant.id}
                                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                    selectedEtudiantNotes?.id === etudiant.id
                                      ? 'bg-indigo-50 dark:bg-indigo-900/30'
                                      : 'hover:bg-gray-100 dark:hover:bg-slate-700/50'
                                  }`}
                                  onClick={() => setSelectedEtudiantNotes(etudiant)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-slate-300 shrink-0">
                                      {etudiant.nom?.charAt(0)}
                                    </div>
                                    <span className="text-sm text-gray-800 dark:text-slate-200">{[etudiant.nom, etudiant.prenom].filter(Boolean).join(' ')}</span>
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); openAddNote(etudiant); }}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md transition-colors"
                                  >
                                    <Plus className="h-3 w-3" /> Note
                                  </button>
                                </div>
                              ))}
                              {etudiantsParClasse.length === 0 && (
                                <p className="text-xs text-gray-400 dark:text-slate-500 py-1 px-3">Aucun étudiant</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {classes.length === 0 && (
                      <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">Aucune classe disponible.</p>
                    )}
                  </div>
                </div>

                {/* Right: student notes */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      {selectedEtudiantNotes
                        ? `Notes — ${[selectedEtudiantNotes.nom, selectedEtudiantNotes.prenom].filter(Boolean).join(' ')}`
                        : 'Notes de l\'étudiant'}
                    </h4>
                    {selectedEtudiantNotes && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{enseignant.matiere}</p>
                    )}
                  </div>
                  <div className="p-5">
                    {!selectedEtudiantNotes ? (
                      <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">Sélectionnez un étudiant pour voir ses notes.</p>
                    ) : (
                      (() => {
                        const note1 = studentNotes.find(n => n.type_controle === 'Contrôle 1');
                        const note2 = studentNotes.find(n => n.type_controle === 'Contrôle 2');
                        const note3 = studentNotes.find(n => n.type_controle === 'Contrôle 3');
                        let moyenne = null;
                        const notesValides = [note1, note2, note3].filter(n => n);
                        if (notesValides.length > 0) {
                          const somme = notesValides.reduce((acc, n) => acc + parseFloat(n.note), 0);
                          moyenne = (somme / notesValides.length).toFixed(2);
                        }
                        return (
                          <div className="space-y-4">
                            <div className="rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-800">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Contrôle</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Note /20</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                  {[
                                    { label: 'Contrôle 1', note: note1 },
                                    { label: 'Contrôle 2', note: note2 },
                                    { label: 'Contrôle 3', note: note3 }
                                  ].map(({ label, note }) => (
                                    <tr key={label} className="bg-white dark:bg-slate-900">
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-slate-100">{label}</td>
                                      <td className={`px-4 py-3 text-sm font-semibold ${note ? gradeColor(note.note) : ''}`}>
                                        {note ? `${note.note}/20` : <span className="text-gray-400 dark:text-slate-500 text-xs font-normal">non saisie</span>}
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        {note ? (
                                          <div className="flex justify-end items-center gap-1">
                                            <button
                                              onClick={() => openEditNote(note)}
                                              className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                            >
                                              <Edit className="h-3.5 w-3.5" />
                                            </button>
                                            {confirmDelete?.id === note.id && confirmDelete?.type === 'note' ? (
                                              <div className="flex items-center gap-1">
                                                <span className="text-[11px] text-gray-500 dark:text-slate-400">Supprimer ?</span>
                                                <button onClick={() => handleDeleteNote(note.id)} className="text-[11px] text-red-600 hover:text-red-700 font-medium">Oui</button>
                                                <button onClick={() => setConfirmDelete(null)} className="text-[11px] text-gray-400 hover:text-gray-600">Non</button>
                                              </div>
                                            ) : (
                                              <button
                                                onClick={() => setConfirmDelete({ type: 'note', id: note.id })}
                                                className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                              >
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </button>
                                            )}
                                          </div>
                                        ) : null}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                              moyenne !== null
                                ? parseFloat(moyenne) >= 12 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : parseFloat(moyenne) >= 10 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700'
                            }`}>
                              <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">Moyenne générale</span>
                              <span className={`text-lg font-bold ${gradeColor(moyenne)}`}>{moyenne !== null ? `${moyenne}/20` : '—'}</span>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Absences */}
          {activeTab === 'absences' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Gérer les absences</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Suivre les présences et gérer les justifications</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left: classes + students */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Choisir une classe</h4>
                  </div>
                  <div className="p-4 space-y-2">
                    {classes.map(classe => (
                      <div key={classe.id} className="rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                        <button
                          onClick={() => { setSelectedClasse(selectedClasse?.id === classe.id ? null : classe); setAbsenceStudentSearch(''); }}
                          className="w-full flex justify-between items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                        >
                          <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{classe.nom}</span>
                          <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${selectedClasse?.id === classe.id ? 'rotate-90' : ''}`} />
                        </button>
                        {selectedClasse?.id === classe.id && (
                          <div className="border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30 p-3 space-y-1">
                            <div className="relative mb-2">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                              <input
                                value={absenceStudentSearch}
                                onChange={e => setAbsenceStudentSearch(e.target.value)}
                                placeholder="Chercher étudiant…"
                                className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                              />
                            </div>
                            {etudiantsParClasse
                              .filter(etudiant =>
                                absenceStudentSearch === '' ||
                                `${etudiant.nom} ${etudiant.prenom}`.toLowerCase().includes(absenceStudentSearch.toLowerCase())
                              )
                              .map(etudiant => (
                              <div
                                key={etudiant.id}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                  selectedEtudiantAbsences?.id === etudiant.id
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30'
                                    : 'hover:bg-gray-100 dark:hover:bg-slate-700/50'
                                }`}
                                onClick={() => setSelectedEtudiantAbsences(etudiant)}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-slate-300 shrink-0">
                                    {etudiant.nom?.charAt(0)}
                                  </div>
                                  <span className="text-sm text-gray-800 dark:text-slate-200">{[etudiant.nom, etudiant.prenom].filter(Boolean).join(' ')}</span>
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); openAddAbsence(etudiant); }}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md transition-colors"
                                >
                                  <Plus className="h-3 w-3" /> Absence
                                </button>
                              </div>
                            ))}
                            {etudiantsParClasse.length === 0 && (
                              <p className="text-xs text-gray-400 dark:text-slate-500 py-1 px-3">Aucun étudiant</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {classes.length === 0 && (
                      <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">Aucune classe disponible.</p>
                    )}
                  </div>
                </div>

                {/* Right: student absences */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      {selectedEtudiantAbsences
                        ? `Absences — ${[selectedEtudiantAbsences.nom, selectedEtudiantAbsences.prenom].filter(Boolean).join(' ')}`
                        : 'Absences de l\'étudiant'}
                    </h4>
                  </div>
                  <div className="p-5">
                    {!selectedEtudiantAbsences ? (
                      <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">Sélectionnez un étudiant pour voir ses absences.</p>
                    ) : getAbsencesForEtudiant(selectedEtudiantAbsences.id).length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">Aucune absence enregistrée.</p>
                    ) : (
                      <div className="space-y-2">
                        {getAbsencesForEtudiant(selectedEtudiantAbsences.id).map(a => (
                          <div key={a.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-800 last:border-0">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                {formatDate(a.date)} &bull; {a.nb_heures}h
                              </p>
                              <span className={`inline-flex items-center gap-1 text-xs font-medium mt-0.5 ${
                                a.justifiee
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-500 dark:text-red-400'
                              }`}>
                                {a.justifiee
                                  ? <><CheckCircle className="h-3 w-3" /> Justifiée</>
                                  : <><XCircle className="h-3 w-3" /> Non justifiée</>}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditAbsence(a)}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              {confirmDelete?.id === a.id && confirmDelete?.type === 'absence' ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-[11px] text-gray-500 dark:text-slate-400">Supprimer ?</span>
                                  <button onClick={() => handleDeleteAbsence(a.id)} className="text-[11px] text-red-600 hover:text-red-700 font-medium">Oui</button>
                                  <button onClick={() => setConfirmDelete(null)} className="text-[11px] text-gray-400 hover:text-gray-600">Non</button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDelete({ type: 'absence', id: a.id })}
                                  className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Modal: Créer une classe */}
      {showCreateClasseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl shadow-black/20 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-amber-500 to-amber-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-xl"><GraduationCap className="h-5 w-5 text-white" /></div>
                <div>
                  <h3 className="text-base font-semibold text-white">Créer une classe</h3>
                  <p className="text-xs text-white/70 mt-0.5">Nouveau groupe d'étudiants</p>
                </div>
              </div>
              <button onClick={() => setShowCreateClasseModal(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleCreateClasse}>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className={labelCls}>Nom de la classe *</label>
                  <input type="text" placeholder="ex : Terminale BTS SIO" required className={inputCls} value={newClasse.nom} onChange={e => setNewClasse({ ...newClasse, nom: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Niveau</label>
                  <input type="text" placeholder="ex : BTS 1, Terminale…" className={inputCls} value={newClasse.niveau} onChange={e => setNewClasse({ ...newClasse, niveau: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                <button type="button" onClick={() => setShowCreateClasseModal(false)} className={btnSecondary}>Annuler</button>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm active:scale-[0.98] transition-all disabled:opacity-50">
                  {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Création…</> : <><CheckCircle className="h-3.5 w-3.5" /> Créer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Absence */}
      {showAbsenceModal && currentEtudiant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl shadow-black/20 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-xl"><CalendarX className="h-5 w-5 text-white" /></div>
                <div>
                  <h3 className="text-base font-semibold text-white">{currentAbsence ? 'Modifier l\'absence' : 'Enregistrer une absence'}</h3>
                  <p className="text-xs text-white/70 mt-0.5">{[currentEtudiant.nom, currentEtudiant.prenom].filter(Boolean).join(' ')}</p>
                </div>
              </div>
              <button onClick={() => setShowAbsenceModal(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleAbsenceSubmit}>
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Date *</label>
                    <input type="date" value={absenceForm.date} onChange={e => setAbsenceForm({ ...absenceForm, date: e.target.value })} className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Heures *</label>
                    <div className="relative">
                      <input type="number" step="0.5" min="0.5" value={absenceForm.nb_heures} onChange={e => setAbsenceForm({ ...absenceForm, nb_heures: parseFloat(e.target.value) })} className={`${inputCls} pr-8`} required />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">h</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Statut</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ label: 'Non justifiée', value: false }, { label: 'Justifiée', value: true }].map(opt => (
                      <button key={String(opt.value)} type="button" onClick={() => setAbsenceForm({ ...absenceForm, justifiee: opt.value })}
                        className={`py-2.5 text-sm font-medium rounded-lg border transition-all flex items-center justify-center gap-2 ${
                          absenceForm.justifiee === opt.value
                            ? opt.value ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-600/20' : 'bg-red-600 border-red-600 text-white shadow-md shadow-red-600/20'
                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                        }`}>
                        {opt.value ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                <button type="button" onClick={() => setShowAbsenceModal(false)} className={btnSecondary}>Annuler</button>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-lg shadow-sm active:scale-[0.98] transition-all disabled:opacity-50">
                  {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enregistrement…</> : <><CheckCircle className="h-3.5 w-3.5" /> Enregistrer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Note */}
      {showNoteModal && currentEtudiant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl shadow-black/20 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-xl"><BookOpen className="h-5 w-5 text-white" /></div>
                <div>
                  <h3 className="text-base font-semibold text-white">{currentNote ? 'Modifier la note' : 'Saisir une note'}</h3>
                  <p className="text-xs text-white/70 mt-0.5">{[currentEtudiant.nom, currentEtudiant.prenom].filter(Boolean).join(' ')} — {enseignant?.matiere}</p>
                </div>
              </div>
              <button onClick={() => setShowNoteModal(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleNoteSubmit}>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className={labelCls}>Type de contrôle</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Contrôle 1', 'Contrôle 2', 'Contrôle 3'].map(c => (
                      <button key={c} type="button" onClick={() => setNoteForm({ ...noteForm, type_controle: c })}
                        className={`py-2.5 px-2 text-sm font-medium rounded-lg border transition-all ${
                          noteForm.type_controle === c
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20'
                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Note *</label>
                  <div className="relative">
                    <input type="number" step="0.25" min="0" max="20" placeholder="0.00"
                      value={noteForm.note} onChange={e => setNoteForm({ ...noteForm, note: e.target.value })}
                      className={`${inputCls} pr-14 text-lg font-semibold`} required />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pointer-events-none">/20</span>
                  </div>
                  {noteForm.note && (
                    <p className={`text-xs font-semibold mt-1.5 ${
                      parseFloat(noteForm.note) >= 12 ? 'text-green-600 dark:text-green-400'
                      : parseFloat(noteForm.note) >= 10 ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                    }`}>
                      {parseFloat(noteForm.note) >= 12 ? 'Bien' : parseFloat(noteForm.note) >= 10 ? 'Passable' : 'Insuffisant'} — {parseFloat(noteForm.note)}/20
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                <button type="button" onClick={() => setShowNoteModal(false)} className={btnSecondary}>Annuler</button>
                <button type="submit" disabled={submitting} className={btnPrimary}>
                  {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enregistrement…</> : <><CheckCircle className="h-3.5 w-3.5" /> Enregistrer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Mot de passe */}
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
              <button onClick={() => setShowPasswordModal(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className={labelCls}>Mot de passe actuel *</label>
                  <input type="password" placeholder="••••••••" required className={inputCls} value={passwordForm.current_password} onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Nouveau mot de passe *</label>
                  <input type="password" placeholder="••••••••" required className={inputCls} value={passwordForm.new_password} onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Confirmation *</label>
                  <input type="password" placeholder="••••••••" required className={inputCls} value={passwordForm.new_password_confirmation} onChange={e => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })} />
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
                <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white text-sm font-semibold rounded-lg shadow-sm active:scale-[0.98] transition-all">
                  <Key className="h-3.5 w-3.5" /> Modifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
