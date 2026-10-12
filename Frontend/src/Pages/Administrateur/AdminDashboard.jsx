import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Api/Api';
import {
  Users, BookOpen, CalendarX, Moon, Sun, LogOut, ChevronDown,
  GraduationCap, Calendar, Mail, Home, Edit, Trash2, Plus, X,
  CheckCircle, XCircle, Eye, Printer, UserPlus, ChevronRight,
  Key, Menu, AlertCircle, Search, Loader2, TrendingUp
} from 'lucide-react';
import { SCHOOL } from '../../config/school';
import { gradeClass, appreciation, avgBoxClass, makeHeader, makeFooter, buildPrintDoc } from '../../utils/printUtils';

// Composants memo optimisés
const gradeColorFn = (v) => {
  const n = parseFloat(v);
  if (isNaN(n)) return 'text-gray-400 dark:text-slate-500';
  return n >= 12 ? 'text-green-600 dark:text-green-400 font-semibold'
    : n >= 10 ? 'text-amber-600 dark:text-amber-400 font-semibold'
    : 'text-red-600 dark:text-red-400 font-semibold';
};

const StudentNotesList = React.memo(({ notes, onEdit, onDelete }) => {
  if (notes.length === 0) return <p className="text-sm text-gray-500 dark:text-slate-400">Aucune note</p>;
  return (
    <div className="space-y-1">
      {notes.map(n => (
        <div key={n.id} className="flex justify-between items-center bg-gray-50 dark:bg-slate-800 rounded px-2 py-1.5 border border-gray-200 dark:border-slate-700">
          <span className="text-sm text-gray-700 dark:text-slate-200">{n.matiere} : <span className={gradeColorFn(n.note)}>{n.note}/20</span></span>
          <div className="flex gap-2">
            <button onClick={() => onEdit(n)} className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Edit size={14} /></button>
            <button onClick={() => onDelete(n.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
});

const StudentAbsencesList = React.memo(({ absences, onEdit, onDelete, formatDate, enseignants }) => {
  if (absences.length === 0) return <p className="text-sm text-gray-500 dark:text-slate-400">Aucune absence</p>;
  return (
    <div className="space-y-1">
      {absences.map(a => {
        const enseignant = enseignants.find(e => e.id === a.enseignant_id);
        return (
          <div key={a.id} className={`flex justify-between items-center rounded px-2 py-1.5 border ${
            a.justifiee
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="text-sm dark:text-slate-200">
              <span className="flex items-center gap-1">
                {a.justifiee
                  ? <CheckCircle size={12} className="text-green-600 dark:text-green-400 shrink-0" />
                  : <XCircle size={12} className="text-red-600 dark:text-red-400 shrink-0" />}
                {formatDate(a.date)} ({a.nb_heures} h)
              </span>
              {enseignant && <span className="text-xs text-gray-500 dark:text-slate-400">{enseignant.matiere}</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(a)} className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Edit size={14} /></button>
              <button onClick={() => onDelete(a.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showClasseModal, setShowClasseModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [currentEtudiant, setCurrentEtudiant] = useState(null);
  const [currentNote, setCurrentNote] = useState(null);
  const [currentAbsence, setCurrentAbsence] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Données
  const [etudiants, setEtudiants] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [administrateurs, setAdministrateurs] = useState([]);
  const [usersNoRole, setUsersNoRole] = useState([]);
  const [classes, setClasses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [contacts, setContacts] = useState([]);

  // États formulaires
  const [userModalType, setUserModalType] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedExistingUser, setSelectedExistingUser] = useState('');
  const [userForm, setUserForm] = useState({ nom: '', prenom: '', email: '', password: '', matiere: '', coefficient: 1, classe_id: '', date_naissance: '' });
  const [classeForm, setClasseForm] = useState({ nom: '', niveau: '' });
  const [currentClasse, setCurrentClasse] = useState(null);
  const [noteForm, setNoteForm] = useState({ etudiant_id: '', matiere: '', type_controle: '', note: '' });
  const [absenceForm, setAbsenceForm] = useState({ etudiant_id: '', date: new Date().toISOString().split('T')[0], nb_heures: 1, justifiee: false, enseignant_id: '' });
  const [assignForm, setAssignForm] = useState({ classe_id: '', enseignant_id: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Search states
  const [etudiantSearch, setEtudiantSearch] = useState('');
  const [enseignantSearch, setEnseignantSearch] = useState('');
  const [adminSearch, setAdminSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Toast
  useEffect(() => {
    if (message.text) setTimeout(() => setMessage({ text: '', type: '' }), 3000);
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
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resEtudiants, resEnseignants, resAdmins, resClasses, resNotes, resAbsences, resContacts, resUsersNoRole] = await Promise.all([
        api.get('/etudiants'), api.get('/enseignants'), api.get('/administrateurs'), api.get('/classes'),
        api.get('/notes'), api.get('/absences'), api.get('/contacts'), api.get('/users/no-role')
      ]);
      setEtudiants(resEtudiants.data);
      setEnseignants(resEnseignants.data);
      setAdministrateurs(resAdmins.data);
      setClasses(resClasses.data);
      setNotes(resNotes.data);
      setAbsences(resAbsences.data);
      setContacts(resContacts.data);
      setUsersNoRole(resUsersNoRole.data);
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erreur de chargement', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

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

  // Mot de passe
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await api.post('/change-password', passwordForm);
      setPasswordSuccess('Mot de passe modifié.');
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Erreur');
    }
  };

  // ========== GESTION UTILISATEURS ==========
  const openAddUser = (type) => {
    setUserModalType(type);
    setCurrentUser(null);
    setSelectedExistingUser('');
    setUserForm({ nom: '', prenom: '', email: '', password: '', matiere: '', coefficient: 1, classe_id: '', date_naissance: '' });
    setShowUserModal(true);
  };
  const openEditUser = (type, userData) => {
    setUserModalType(type);
    setCurrentUser(userData);
    setSelectedExistingUser('');
    if (type === 'etudiant') {
      setUserForm({
        nom: userData.nom || '',
        prenom: userData.prenom || '',
        email: userData.user?.email || '',
        password: '',
        matiere: '',
        coefficient: 1,
        classe_id: userData.classe_id || '',
        date_naissance: userData.date_naissance || ''
      });
    } else if (type === 'enseignant') {
      setUserForm({
        nom: userData.user?.name || userData.nom || '',
        prenom: '',
        email: userData.user?.email || '',
        password: '',
        matiere: userData.matiere || '',
        coefficient: userData.coefficient || 1,
        classe_id: '',
        date_naissance: ''
      });
    } else { // admin
      setUserForm({
        nom: userData.user?.name || '',
        prenom: '',
        email: userData.user?.email || '',
        password: '',
        matiere: '',
        coefficient: 1,
        classe_id: '',
        date_naissance: ''
      });
    }
    setShowUserModal(true);
  };
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '', payload = {};
      if (selectedExistingUser) {
        const existingUser = usersNoRole.find(u => u.id === parseInt(selectedExistingUser));
        if (!existingUser) throw new Error('Utilisateur non trouvé');
        if (userModalType === 'etudiant') {
          endpoint = '/etudiants';
          payload = { user_id: existingUser.id, nom: userForm.nom, prenom: userForm.prenom, date_naissance: userForm.date_naissance || null, classe_id: userForm.classe_id };
        } else if (userModalType === 'enseignant') {
          endpoint = '/enseignants';
          payload = { user_id: existingUser.id, nom: userForm.nom, prenom: userForm.prenom, matiere: userForm.matiere, coefficient: userForm.coefficient };
        } else {
          endpoint = '/administrateurs';
          payload = { user_id: existingUser.id };
        }
        await api.post(endpoint, payload);
        setMessage({ text: `${userModalType} ajouté via utilisateur existant`, type: 'success' });
      } else {
        if (userModalType === 'etudiant') {
          endpoint = '/etudiants';
          payload = { nom: userForm.nom, prenom: userForm.prenom, email: userForm.email, password: userForm.password, date_naissance: userForm.date_naissance || null, classe_id: userForm.classe_id };
        } else if (userModalType === 'enseignant') {
          endpoint = '/enseignants';
          payload = { nom: userForm.nom, prenom: userForm.prenom, email: userForm.email, password: userForm.password, matiere: userForm.matiere, coefficient: userForm.coefficient };
        } else {
          endpoint = '/administrateurs';
          payload = { nom: userForm.nom, email: userForm.email, password: userForm.password };
        }
        if (currentUser) await api.put(`${endpoint}/${currentUser.id}`, payload);
        else await api.post(endpoint, payload);
        setMessage({ text: `${userModalType} ${currentUser ? 'modifié' : 'ajouté'}`, type: 'success' });
      }
      fetchAllData();
      setShowUserModal(false);
    } catch (error) {
      console.error(error);
      setMessage({ text: "Erreur lors de l'opération", type: 'error' });
    }
  };
  const handleDeleteUser = async (type, id) => {
    try {
      let endpoint = '';
      if (type === 'etudiant') endpoint = `/etudiants/${id}`;
      else if (type === 'enseignant') endpoint = `/enseignants/${id}`;
      else if (type === 'administrateur') endpoint = `/administrateurs/${id}`;
      await api.delete(endpoint);
      setMessage({ text: `${type} supprimé`, type: 'success' });
      setConfirmDelete(null);
      fetchAllData();
    } catch (error) { setMessage({ text: 'Erreur suppression', type: 'error' }); }
  };

  // ========== CLASSES ==========
  const openAddClasse = () => {
    setCurrentClasse(null);
    setClasseForm({ nom: '', niveau: '' });
    setShowClasseModal(true);
  };
  const openEditClasse = (classe) => {
    setCurrentClasse(classe);
    setClasseForm({ nom: classe.nom, niveau: classe.niveau || '' });
    setShowClasseModal(true);
  };
  const handleClasseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentClasse) await api.put(`/classes/${currentClasse.id}`, classeForm);
      else await api.post('/classes', classeForm);
      setMessage({ text: `Classe ${currentClasse ? 'modifiée' : 'ajoutée'}`, type: 'success' });
      fetchAllData();
      setShowClasseModal(false);
    } catch (error) { setMessage({ text: 'Erreur', type: 'error' }); }
  };
  const handleDeleteClasse = async (id) => {
    try {
      await api.delete(`/classes/${id}`);
      setMessage({ text: 'Classe supprimée', type: 'success' });
      setConfirmDelete(null);
      fetchAllData();
    } catch (error) { setMessage({ text: 'Erreur', type: 'error' }); }
  };

  // ========== NOTES ==========
  const openAddNote = (etudiant) => {
    setCurrentNote(null);
    setNoteForm({ etudiant_id: etudiant.id, matiere: '', type_controle: '', note: '' });
    setShowNoteModal(true);
  };
  const openEditNote = (note) => {
    setCurrentNote(note);
    setNoteForm({ etudiant_id: note.etudiant_id, matiere: note.matiere, type_controle: note.type_controle || '', note: note.note });
    setShowNoteModal(true);
  };
  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
      fetchAllData();
      setConfirmDelete(null);
      setMessage({ text: 'Note supprimée', type: 'success' });
    } catch (error) { setMessage({ text: 'Erreur', type: 'error' }); }
  };
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...noteForm };
      if (currentNote) await api.put(`/notes/${currentNote.id}`, payload);
      else await api.post('/notes', payload);
      fetchAllData();
      setShowNoteModal(false);
      setMessage({ text: currentNote ? 'Note modifiée' : 'Note ajoutée', type: 'success' });
    } catch (error) { setMessage({ text: 'Erreur', type: 'error' }); }
    finally { setSubmitting(false); }
  };

  // Impression relevé de classe (tous les étudiants, chaque étudiant une page)
  const printAllStudentReports = (classe) => {
    const classStudents = etudiants.filter(e => e.classe_id === classe.id);
    if (classStudents.length === 0) {
      alert('Aucun étudiant dans cette classe.');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les popups.");
      return;
    }

    const noteCell = (v) => v !== '-'
      ? `<span class="${gradeClass(v)}">${parseFloat(v).toFixed(2)}/20</span>`
      : '<span style="color:#94a3b8">—</span>';

    let bulletins = '';

    classStudents.forEach(etudiant => {
      const etudiantNotes = notes.filter(n => n.etudiant_id === etudiant.id);
      const etudiantAbsences = absences.filter(a => a.etudiant_id === etudiant.id);

      const notesByMatiere = {};
      etudiantNotes.forEach(n => {
        if (!notesByMatiere[n.matiere]) notesByMatiere[n.matiere] = {};
        notesByMatiere[n.matiere][n.type_controle] = n.note;
      });

      let totalW = 0, totalC = 0;
      const matieresData = [];
      for (const [matiere, controles] of Object.entries(notesByMatiere)) {
        const n1 = controles['Contrôle 1'] ?? '-';
        const n2 = controles['Contrôle 2'] ?? '-';
        const n3 = controles['Contrôle 3'] ?? '-';
        const valides = [n1, n2, n3].filter(n => n !== '-' && !isNaN(parseFloat(n)));
        let moy = '-';
        if (valides.length > 0) {
          moy = (valides.reduce((a, b) => a + parseFloat(b), 0) / valides.length).toFixed(2);
          totalW += parseFloat(moy);
          totalC++;
        }
        matieresData.push({ matiere, n1, n2, n3, moy });
      }
      const moyGen = totalC > 0 ? (totalW / totalC).toFixed(2) : null;

      const totalH = etudiantAbsences.reduce((s, a) => s + parseFloat(a.nb_heures || 0), 0);
      const justH = etudiantAbsences.filter(a => a.justifiee).reduce((s, a) => s + parseFloat(a.nb_heures || 0), 0);
      const nonJustH = totalH - justH;

      let dob = 'Non renseignée';
      if (etudiant.date_naissance) {
        try { dob = new Date(etudiant.date_naissance).toLocaleDateString('fr-FR'); } catch (e) {}
      }

      const noteRows = matieresData.map(m => `
        <tr>
          <td>${m.matiere}</td>
          <td class="tc">${noteCell(m.n1)}</td>
          <td class="tc">${noteCell(m.n2)}</td>
          <td class="tc">${noteCell(m.n3)}</td>
          <td class="tc">${noteCell(m.moy)}</td>
          <td class="tc">${m.moy !== '-' ? appreciation(m.moy) : '—'}</td>
        </tr>
      `).join('');

      bulletins += `
        <div class="page-item">
          ${makeHeader('BULLETIN DE NOTES', `${etudiant.nom} ${etudiant.prenom} · ${classe.nom}`)}
          <div class="info-grid">
            <div><div class="info-label">Nom complet</div><div class="info-val">${etudiant.nom} ${etudiant.prenom}</div></div>
            <div><div class="info-label">Date de naissance</div><div class="info-val">${dob}</div></div>
            <div><div class="info-label">Classe</div><div class="info-val">${classe.nom}${classe.niveau ? ` (${classe.niveau})` : ''}</div></div>
            <div><div class="info-label">Année scolaire</div><div class="info-val">${SCHOOL.year}</div></div>
          </div>
          <div class="sec">
            <div class="sec-title">Notes</div>
            ${matieresData.length === 0
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
                  <tbody>${noteRows}</tbody>
                </table>
                ${moyGen ? `<div class="avg-box ${avgBoxClass(moyGen)}">
                  <span>Moyenne générale</span>
                  <span>${moyGen}/20 — ${appreciation(moyGen)}</span>
                </div>` : ''}`
            }
          </div>
          <div class="sec" style="margin-top:16px;">
            <div class="sec-title">Absences</div>
            <div style="display:flex;gap:20px;align-items:center;font-size:13px;color:#475569;flex-wrap:wrap;">
              <span>Total : <strong>${totalH} h</strong></span>
              <span class="badge-ok">Justifiées : ${justH} h</span>
              <span class="badge-nok">Non justifiées : ${nonJustH} h</span>
            </div>
          </div>
          <div class="sig-zone">
            <div class="sig-block">
              <div class="sig-title">Le Directeur</div>
              <div class="sig-line">Signature et cachet</div>
            </div>
          </div>
          ${makeFooter()}
        </div>
      `;
    });

    printWindow.document.write(buildPrintDoc({
      title: `Bulletins — ${classe.nom}`,
      body: bulletins,
    }));
    printWindow.document.close();
    printWindow.print();
  };

  // ========== ABSENCES ==========
  const openAddAbsence = (etudiant) => {
    setCurrentEtudiant(etudiant);
    setCurrentAbsence(null);
    setAbsenceForm({
      etudiant_id: etudiant.id,
      date: new Date().toISOString().split('T')[0],
      nb_heures: 1,
      justifiee: false,
      enseignant_id: ''
    });
    setShowAbsenceModal(true);
  };
  const openEditAbsence = (absence) => {
    setCurrentAbsence(absence);
    const etudiant = etudiants.find(e => e.id === absence.etudiant_id);
    setCurrentEtudiant(etudiant);
    setAbsenceForm({
      date: absence.date ? absence.date.split('T')[0] : '',
      justifiee: absence.justifiee,
    });
    setShowAbsenceModal(true);
  };
  const handleDeleteAbsence = async (absId) => {
    try {
      await api.delete(`/absences/${absId}`);
      fetchAllData();
      setConfirmDelete(null);
      setMessage({ text: 'Absence supprimée', type: 'success' });
    } catch (error) { setMessage({ text: 'Erreur', type: 'error' }); }
  };
  const handleAbsenceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentAbsence) {
        await api.put(`/absences/${currentAbsence.id}`, {
          justifiee: absenceForm.justifiee
        });
      } else {
        await api.post('/absences', {
          etudiant_id: absenceForm.etudiant_id,
          date: absenceForm.date,
          nb_heures: parseFloat(absenceForm.nb_heures),
          justifiee: absenceForm.justifiee,
          enseignant_id: absenceForm.enseignant_id
        });
      }
      fetchAllData();
      setShowAbsenceModal(false);
      setMessage({ text: currentAbsence ? 'Absence modifiée' : 'Absence ajoutée', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erreur', type: 'error' });
    }
  };

  // ========== AFFECTATION ENSEIGNANT ↔ CLASSE ==========
  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/classes/${assignForm.classe_id}/assign-teacher`, {
        enseignant_id: assignForm.enseignant_id
      });
      setMessage({ text: 'Enseignant affecté', type: 'success' });
      setShowAssignModal(false);
      fetchAllData();
    } catch (error) { setMessage({ text: 'Erreur affectation', type: 'error' }); }
  };

  const handleDeleteContact = async (id) => {
    try {
      await api.delete(`/contacts/${id}`);
      setMessage({ text: 'Message supprimé', type: 'success' });
      setConfirmDelete(null);
      fetchAllData();
    } catch (error) { setMessage({ text: 'Erreur', type: 'error' }); }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const etudiantsParClasse = useMemo(() => {
    if (!selectedClasse) return [];
    return etudiants.filter(e => e.classe_id === selectedClasse.id);
  }, [etudiants, selectedClasse]);

  const gradeDist = useMemo(() => {
    const dist = { excellent: 0, bien: 0, passable: 0, insuffisant: 0, total: 0 };
    notes.forEach(n => {
      const v = parseFloat(n.note);
      if (!isNaN(v)) {
        dist.total++;
        if (v >= 15) dist.excellent++;
        else if (v >= 12) dist.bien++;
        else if (v >= 10) dist.passable++;
        else dist.insuffisant++;
      }
    });
    return dist;
  }, [notes]);

  const atRisk = useMemo(() => etudiants.filter(e => {
    const en = notes.filter(n => n.etudiant_id === e.id);
    const avg = en.length ? en.reduce((s, n) => s + parseFloat(n.note), 0) / en.length : null;
    const absH = absences.filter(a => a.etudiant_id === e.id && !a.justifiee)
                         .reduce((s, a) => s + parseFloat(a.nb_heures || 0), 0);
    return (avg !== null && avg < 10) || absH >= 15;
  }), [etudiants, notes, absences]);

  const gradeColor = (avg) => {
    if (avg === null || avg === undefined || isNaN(avg)) return '';
    const n = parseFloat(avg);
    return n >= 12 ? 'text-green-600 dark:text-green-400'
      : n >= 10 ? 'text-amber-500 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400';
  };

  const navGroups = [
    {
      label: 'Principal',
      items: [
        { id: 'overview', label: 'Tableau de bord', icon: Home },
      ],
    },
    {
      label: 'Gestion',
      items: [
        { id: 'users',   label: 'Utilisateurs', icon: Users },
        { id: 'classes', label: 'Classes',       icon: GraduationCap },
        { id: 'assign',  label: 'Affectation',   icon: UserPlus },
      ],
    },
    {
      label: 'Académique',
      items: [
        { id: 'notes',    label: 'Notes',    icon: BookOpen },
        { id: 'absences', label: 'Absences', icon: CalendarX },
      ],
    },
    {
      label: 'Support',
      items: [
        { id: 'contacts', label: 'Messages', icon: Mail },
      ],
    },
  ];

  // Design system class strings
  const inputCls = 'w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors';
  const labelCls = 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5';
  const btnPrimary = 'inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-semibold rounded-lg shadow-sm shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-600/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  const btnSecondary = 'inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-colors';

  if (loading && !classes.length) return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 p-3 gap-1.5">
        <div className="h-14 animate-pulse bg-gray-100 dark:bg-slate-800 rounded-lg mb-2" />
        {[1,2,3,4,5,6,7].map(i => <div key={i} className="h-8 animate-pulse bg-gray-100 dark:bg-slate-800 rounded-lg" />)}
      </aside>
      <div className="flex-1 flex flex-col">
        <div className="h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800" />
        <div className="flex-1 p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-24 animate-pulse bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800" />)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
          message.type === 'success'
            ? 'bg-white dark:bg-slate-900 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
          {message.text}
        </div>
      )}

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-gray-200 dark:border-slate-800 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-600/25 flex items-center justify-center shrink-0">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-tight truncate">{SCHOOL.name}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Administration</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {navGroups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-5' : 'mt-1'}>
              <p className="px-3 mb-1 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? 'border-l-[3px] border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold rounded-r-lg'
                        : 'border-l-[3px] border-transparent rounded-lg text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-gray-200 dark:border-slate-800 p-3 space-y-1">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm shadow-purple-600/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-slate-100 truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium truncate">Administrateur</p>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              title="Changer mot de passe"
              className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            >
              <Key className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              {navGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label || ''}
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

        {/* Scrollable content */}
        <main key={activeTab} className="flex-1 overflow-y-auto p-4 sm:p-6 tab-enter">

          {/* ========== ONGLET TABLEAU DE BORD ========== */}
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Utilisateurs', value: etudiants.length + enseignants.length + administrateurs.length + usersNoRole.length, icon: Users, iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-700', shadow: 'shadow-indigo-600/20', sub: usersNoRole.length > 0 ? `${usersNoRole.length} sans rôle` : 'Tous assignés' },
                  { label: 'Étudiants', value: etudiants.length, icon: GraduationCap, iconBg: 'bg-gradient-to-br from-blue-500 to-blue-700', shadow: 'shadow-blue-600/20', sub: `${classes.length} classe(s)` },
                  { label: 'Enseignants', value: enseignants.length, icon: BookOpen, iconBg: 'bg-gradient-to-br from-green-500 to-green-700', shadow: 'shadow-green-600/20', sub: 'Corps pédagogique' },
                  { label: 'Administrateurs', value: administrateurs.length, icon: Users, iconBg: 'bg-gradient-to-br from-purple-500 to-purple-700', shadow: 'shadow-purple-600/20', sub: 'Accès total' },
                  { label: 'Classes', value: classes.length, icon: GraduationCap, iconBg: 'bg-gradient-to-br from-amber-500 to-amber-700', shadow: 'shadow-amber-600/20', sub: `${etudiants.length} étudiants total` },
                  { label: 'Notes saisies', value: notes.length, icon: BookOpen, iconBg: 'bg-gradient-to-br from-cyan-500 to-cyan-700', shadow: 'shadow-cyan-600/20', sub: `${[...new Set(notes.map(n => n.matiere))].length} matière(s)` },
                  { label: 'Absences', value: absences.length, icon: CalendarX, iconBg: 'bg-gradient-to-br from-orange-500 to-orange-700', shadow: 'shadow-orange-600/20', sub: `${absences.filter(a => !a.justifiee).length} non justifiée(s)` },
                  { label: 'Messages', value: contacts.length, icon: Mail, iconBg: 'bg-gradient-to-br from-pink-500 to-pink-700', shadow: 'shadow-pink-600/20', sub: 'Formulaire de contact' },
                ].map(card => (
                  <div key={card.label} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-gray-200/60 dark:hover:shadow-slate-900/60 transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider truncate">{card.label}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-slate-100 mt-2 tabular-nums">{card.value}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 truncate">{card.sub}</p>
                      </div>
                      <div className={`p-2.5 rounded-xl ${card.iconBg} shadow-md ${card.shadow} group-hover:shadow-lg transition-shadow shrink-0 ml-3`}>
                        <card.icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {gradeDist.total > 0 && (
                <div className="mt-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5">
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5" /> Distribution des notes
                  </p>
                  <div className="flex items-end gap-3 h-20">
                    {[
                      { label: '≥15', val: gradeDist.excellent, color: 'bg-green-500' },
                      { label: '12–14', val: gradeDist.bien, color: 'bg-blue-500' },
                      { label: '10–11', val: gradeDist.passable, color: 'bg-amber-500' },
                      { label: '<10', val: gradeDist.insuffisant, color: 'bg-red-500' },
                    ].map(b => {
                      const pct = Math.max(8, (b.val / gradeDist.total) * 100);
                      return (
                        <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">{b.val}</span>
                          <div className={`w-full ${b.color} rounded-t-sm opacity-80`} style={{ height: `${pct}%` }} />
                          <span className="text-[10px] text-gray-400">{b.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {atRisk.length > 0 && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 alert-enter">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 dark:text-red-300">{atRisk.length} étudiant(s) à risque</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Moyenne &lt; 10 ou ≥ 15h d'absences non justifiées</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {atRisk.slice(0, 5).map(e => (
                        <span key={e.id} className="px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs rounded-full">
                          {e.nom} {e.prenom}
                        </span>
                      ))}
                      {atRisk.length > 5 && <span className="text-xs text-red-500 self-center">+{atRisk.length - 5} de plus</span>}
                    </div>
                  </div>
                </div>
              )}

              {usersNoRole.length > 0 && (
                <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{usersNoRole.length} utilisateur(s) sans rôle</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Ces utilisateurs sont inscrits mais n'ont pas encore de rôle (étudiant, enseignant, administrateur). Vous pouvez leur attribuer un rôle depuis l'onglet « Utilisateurs ».</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========== ONGLET UTILISATEURS ========== */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Étudiants */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Étudiants</h3>
                  <button onClick={() => openAddUser('etudiant')} className={btnPrimary}><Plus className="h-3.5 w-3.5" /> Ajouter</button>
                </div>
                <div className="px-5 pt-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-slate-500 pointer-events-none" />
                    <input
                      value={etudiantSearch}
                      onChange={e => setEtudiantSearch(e.target.value)}
                      placeholder="Rechercher un étudiant…"
                      className="w-full sm:w-64 pl-9 pr-3.5 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {(() => {
                    const filteredEtudiants = etudiants.filter(e => `${e.nom} ${e.prenom}`.toLowerCase().includes(etudiantSearch.toLowerCase()));
                    return (
                      <table className="min-w-full">
                        <thead className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Nom</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Prénom</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Classe</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                          {filteredEtudiants.map(e => (
                            <tr key={e.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-200">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {(e.nom || e.user?.name || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-slate-100">{e.nom || e.user?.name?.split(' ')[0] || '-'}</p>
                                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Étudiant</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300">{e.prenom || e.user?.name?.split(' ')[1] || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">{e.user?.email || '-'}</td>
                              <td className="px-4 py-3 text-sm">
                                {e.classe?.nom ? <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-medium rounded-md">{e.classe.nom}</span> : <span className="text-gray-400">—</span>}
                              </td>
                              <td className="px-4 py-3.5 text-sm">
                                {confirmDelete?.type === 'etudiant' && confirmDelete?.id === e.id ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-slate-400">Supprimer ?</span>
                                    <button onClick={() => handleDeleteUser('etudiant', e.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Oui</button>
                                    <button onClick={() => setConfirmDelete(null)} className="text-xs text-gray-500 hover:text-gray-700">Non</button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => openEditUser('etudiant', e)} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                                    <button onClick={() => setConfirmDelete({ type: 'etudiant', id: e.id })} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>

              {/* Enseignants */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Enseignants</h3>
                  <button onClick={() => openAddUser('enseignant')} className={btnPrimary}><Plus className="h-3.5 w-3.5" /> Ajouter</button>
                </div>
                <div className="px-5 pt-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-slate-500 pointer-events-none" />
                    <input
                      value={enseignantSearch}
                      onChange={e => setEnseignantSearch(e.target.value)}
                      placeholder="Rechercher un enseignant…"
                      className="w-full sm:w-64 pl-9 pr-3.5 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {(() => {
                    const filteredEnseignants = enseignants.filter(e => (e.user?.name || '').toLowerCase().includes(enseignantSearch.toLowerCase()));
                    return (
                      <table className="min-w-full">
                        <thead className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Nom</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Matière</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Coefficient</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                          {filteredEnseignants.map(e => (
                            <tr key={e.id} className="hover:bg-green-50/30 dark:hover:bg-green-950/20 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-200">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {(e.user?.name || e.nom || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-slate-100">{e.user?.name || e.nom || '-'}</p>
                                    <span className="text-[10px] text-green-600 dark:text-green-400 font-semibold">Enseignant</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">{e.user?.email || '-'}</td>
                              <td className="px-4 py-3 text-sm">
                                {e.matiere ? <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-medium rounded-md">{e.matiere}</span> : <span className="text-gray-400">—</span>}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-slate-300">{e.coefficient ?? 1}</td>
                              <td className="px-4 py-3.5 text-sm">
                                {confirmDelete?.type === 'enseignant' && confirmDelete?.id === e.id ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-slate-400">Supprimer ?</span>
                                    <button onClick={() => handleDeleteUser('enseignant', e.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Oui</button>
                                    <button onClick={() => setConfirmDelete(null)} className="text-xs text-gray-500 hover:text-gray-700">Non</button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => openEditUser('enseignant', e)} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                                    <button onClick={() => setConfirmDelete({ type: 'enseignant', id: e.id })} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>

              {/* Administrateurs */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Administrateurs</h3>
                  <button onClick={() => openAddUser('admin')} className={btnPrimary}><Plus className="h-3.5 w-3.5" /> Ajouter</button>
                </div>
                <div className="px-5 pt-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-slate-500 pointer-events-none" />
                    <input
                      value={adminSearch}
                      onChange={e => setAdminSearch(e.target.value)}
                      placeholder="Rechercher un administrateur…"
                      className="w-full sm:w-64 pl-9 pr-3.5 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {(() => {
                    const filteredAdmins = administrateurs.filter(a => (a.user?.name || '').toLowerCase().includes(adminSearch.toLowerCase()));
                    return (
                      <table className="min-w-full">
                        <thead className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Nom complet</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                          {filteredAdmins.map(a => (
                            <tr key={a.id} className="hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-200">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {(a.user?.name || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-slate-100">{a.user?.name || '-'}</p>
                                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Administrateur</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">{a.user?.email || '-'}</td>
                              <td className="px-4 py-3.5 text-sm">
                                {confirmDelete?.type === 'administrateur' && confirmDelete?.id === a.id ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-slate-400">Supprimer ?</span>
                                    <button onClick={() => handleDeleteUser('administrateur', a.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Oui</button>
                                    <button onClick={() => setConfirmDelete(null)} className="text-xs text-gray-500 hover:text-gray-700">Non</button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => openEditUser('admin', a)} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                                    <button onClick={() => setConfirmDelete({ type: 'administrateur', id: a.id })} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>

              {/* Utilisateurs sans rôle */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Utilisateurs sans rôle</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Nom</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Assigner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {usersNoRole.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5 text-sm text-gray-900 dark:text-slate-200">{u.name}</td>
                          <td className="px-4 py-3.5 text-sm text-gray-900 dark:text-slate-200">{u.email}</td>
                          <td className="px-4 py-3.5 text-sm">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button onClick={() => { setSelectedExistingUser(u.id); openAddUser('etudiant'); }} className="px-2 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-colors">Étudiant</button>
                              <button onClick={() => { setSelectedExistingUser(u.id); openAddUser('enseignant'); }} className="px-2 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 transition-colors">Enseignant</button>
                              <button onClick={() => { setSelectedExistingUser(u.id); openAddUser('admin'); }} className="px-2 py-1 text-xs font-medium rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800 transition-colors">Admin</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========== ONGLET CLASSES ========== */}
          {activeTab === 'classes' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Classes</h3>
                <button onClick={openAddClasse} className={btnPrimary}><Plus className="h-3.5 w-3.5" /> Nouvelle classe</button>
              </div>
              <div className="p-4 space-y-2">
                {classes.map(classe => (
                  <div key={classe.id} className="border border-gray-200 dark:border-slate-800 border-l-[3px] border-l-amber-500 rounded-xl overflow-hidden">
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setSelectedClasse(selectedClasse?.id === classe.id ? null : classe)}
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{classe.nom}{classe.niveau ? ` (${classe.niveau})` : ''}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{etudiants.filter(e => e.classe_id === classe.id).length} étudiant(s)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(ev) => { ev.stopPropagation(); openEditClasse(classe); }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        {confirmDelete?.type === 'classe' && confirmDelete?.id === classe.id ? (
                          <div className="flex items-center gap-2" onClick={ev => ev.stopPropagation()}>
                            <span className="text-xs text-gray-500">Supprimer ?</span>
                            <button onClick={() => handleDeleteClasse(classe.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Oui</button>
                            <button onClick={() => setConfirmDelete(null)} className="text-xs text-gray-500 hover:text-gray-700">Non</button>
                          </div>
                        ) : (
                        <button
                          onClick={(ev) => { ev.stopPropagation(); setConfirmDelete({ type: 'classe', id: classe.id }); }}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        )}
                        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${selectedClasse?.id === classe.id ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                    {selectedClasse?.id === classe.id && (
                      <div className="border-t border-gray-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
                        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Étudiants</p>
                        <div className="space-y-2">
                          {etudiantsParClasse.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-slate-500">Aucun étudiant dans cette classe.</p>
                          ) : etudiantsParClasse.map(etudiant => (
                            <div key={etudiant.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-800">
                              <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0">
                                {(etudiant.nom || etudiant.prenom || '?').charAt(0).toUpperCase()}
                              </div>
                              <p className="text-sm text-gray-900 dark:text-slate-200">{etudiant.nom} {etudiant.prenom}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== ONGLET NOTES ========== */}
          {activeTab === 'notes' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Notes par classe</h3>
              </div>
              <div className="p-4 space-y-2">
                {classes.map(classe => (
                  <div key={classe.id} className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setSelectedClasse(selectedClasse?.id === classe.id ? null : classe)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{classe.nom}{classe.niveau ? ` (${classe.niveau})` : ''}</span>
                      <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${selectedClasse?.id === classe.id ? 'rotate-90' : ''}`} />
                    </button>
                    {selectedClasse?.id === classe.id && (
                      <div className="border-t border-gray-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Étudiants</p>
                          <button
                            onClick={() => printAllStudentReports(selectedClasse)}
                            className={btnSecondary}
                          >
                            <Printer className="h-3.5 w-3.5" /> Imprimer tous les bulletins
                          </button>
                        </div>
                        <div className="space-y-5">
                          {etudiantsParClasse.map(etudiant => {
                            const etudiantNotes = notes.filter(n => n.etudiant_id === etudiant.id);
                            const notesByMatiere = {};
                            etudiantNotes.forEach(n => {
                              if (!notesByMatiere[n.matiere]) notesByMatiere[n.matiere] = {};
                              notesByMatiere[n.matiere][n.type_controle] = n.note;
                            });
                            return (
                              <div key={etudiant.id} className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{etudiant.nom} {etudiant.prenom}</p>
                                  <button onClick={() => openAddNote(etudiant)} className={btnPrimary}>
                                    <Plus className="h-3.5 w-3.5" /> Ajouter une note
                                  </button>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full">
                                    <thead className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                                      <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Matière</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/30">Contrôle 1</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wider bg-violet-50 dark:bg-violet-950/30">Contrôle 2</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider bg-rose-50 dark:bg-rose-950/30">Contrôle 3</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Moyenne /20</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                      {Object.entries(notesByMatiere).map(([matiere, controles]) => {
                                        const note1 = controles['Contrôle 1'] || '-';
                                        const note2 = controles['Contrôle 2'] || '-';
                                        const note3 = controles['Contrôle 3'] || '-';
                                        let moyenne = '-';
                                        const notesValides = [note1, note2, note3].filter(n => n !== '-' && !isNaN(parseFloat(n)));
                                        if (notesValides.length > 0) {
                                          const somme = notesValides.reduce((acc, n) => acc + parseFloat(n), 0);
                                          moyenne = (somme / notesValides.length).toFixed(2);
                                        }
                                        return (
                                          <tr key={matiere} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-slate-200">{matiere}</td>
                                            <td className={`px-4 py-3.5 text-center text-sm ${note1 !== '-' ? gradeColor(note1) : 'text-gray-400 dark:text-slate-500'}`}>{note1 !== '-' ? note1 + '/20' : '-'}</td>
                                            <td className={`px-4 py-3.5 text-center text-sm ${note2 !== '-' ? gradeColor(note2) : 'text-gray-400 dark:text-slate-500'}`}>{note2 !== '-' ? note2 + '/20' : '-'}</td>
                                            <td className={`px-4 py-3.5 text-center text-sm ${note3 !== '-' ? gradeColor(note3) : 'text-gray-400 dark:text-slate-500'}`}>{note3 !== '-' ? note3 + '/20' : '-'}</td>
                                            <td className={`px-4 py-3.5 text-center text-sm font-semibold ${moyenne !== '-' ? gradeColor(moyenne) : 'text-gray-400 dark:text-slate-500'}`}>{moyenne !== '-' ? moyenne + '/20' : '-'}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== ONGLET ABSENCES ========== */}
          {activeTab === 'absences' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Absences par classe</h3>
              </div>
              <div className="p-4 space-y-2">
                {classes.map(classe => (
                  <div key={classe.id} className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setSelectedClasse(selectedClasse?.id === classe.id ? null : classe)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{classe.nom}{classe.niveau ? ` (${classe.niveau})` : ''}</span>
                      <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${selectedClasse?.id === classe.id ? 'rotate-90' : ''}`} />
                    </button>
                    {selectedClasse?.id === classe.id && (
                      <div className="border-t border-gray-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 space-y-4">
                        {etudiantsParClasse.map(etudiant => (
                          <div key={etudiant.id} className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{etudiant.nom} {etudiant.prenom}</p>
                              <button onClick={() => openAddAbsence(etudiant)} className={btnPrimary}><Plus className="h-3.5 w-3.5" /> Ajouter absence</button>
                            </div>
                            <div className="p-3">
                              <StudentAbsencesList
                                absences={absences.filter(a => a.etudiant_id === etudiant.id)}
                                onEdit={openEditAbsence}
                                onDelete={handleDeleteAbsence}
                                formatDate={formatDate}
                                enseignants={enseignants}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== ONGLET AFFECTATION ========== */}
          {activeTab === 'assign' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Affectations</h3>
                <button onClick={() => setShowAssignModal(true)} className={btnPrimary}><Plus className="h-3.5 w-3.5" /> Nouvelle affectation</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Classe</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Enseignant(s)</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {classes.map(c => {
                      const enseignantsList = c.enseignants || [];
                      const isUnassigned = enseignantsList.length === 0;
                      return (
                        <tr key={c.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors ${isUnassigned ? 'bg-red-50/30 dark:bg-red-950/20' : ''}`}>
                          <td className="px-4 py-3.5 text-sm text-gray-900 dark:text-slate-200">{c.nom}{c.niveau ? ` (${c.niveau})` : ''}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {isUnassigned
                                ? <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-semibold rounded-full">Non affecté</span>
                                : enseignantsList.map(e => (
                                    <span key={e.id} className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 text-xs font-medium rounded-full">
                                      {e.user?.name || e.nom}
                                    </span>
                                  ))
                              }
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm">
                            <button
                              onClick={() => {
                                const firstId = enseignantsList.length > 0 ? enseignantsList[0].id : '';
                                setAssignForm({ classe_id: c.id, enseignant_id: firstId });
                                setShowAssignModal(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========== ONGLET CONTACTS ========== */}
          {activeTab === 'contacts' && (
            <div className="space-y-3">
              {contacts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-8 text-center">
                  <Mail className="h-8 w-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-slate-400">Aucun message reçu.</p>
                </div>
              ) : contacts.map(c => (
                <div key={c.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{c.nom}</p>
                        <span className="text-xs text-gray-400 dark:text-slate-500">·</span>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{c.email}</p>
                      </div>
                      <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">{c.sujet}</p>
                      <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">{c.message}</p>
                    </div>
                    {confirmDelete?.type === 'contact' && confirmDelete?.id === c.id ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-500 dark:text-slate-400">Supprimer ?</span>
                        <button onClick={() => handleDeleteContact(c.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Oui</button>
                        <button onClick={() => setConfirmDelete(null)} className="text-xs text-gray-500 hover:text-gray-700">Non</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete({ type: 'contact', id: c.id })}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      {/* ========== MODALES ========== */}

      {/* Modale utilisateur */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl shadow-black/20 max-w-md w-full overflow-hidden">
            <div className={`px-6 py-4 flex items-center justify-between ${
              userModalType === 'etudiant' ? 'bg-gradient-to-r from-blue-600 to-blue-700'
              : userModalType === 'enseignant' ? 'bg-gradient-to-r from-green-600 to-green-700'
              : 'bg-gradient-to-r from-purple-600 to-purple-700'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-xl">
                  {userModalType === 'etudiant' ? <GraduationCap className="h-5 w-5 text-white" /> : <Users className="h-5 w-5 text-white" />}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {currentUser ? 'Modifier' : 'Ajouter'} {userModalType === 'etudiant' ? 'un étudiant' : userModalType === 'enseignant' ? 'un enseignant' : 'un administrateur'}
                  </h3>
                  <p className="text-xs text-white/70 mt-0.5">Remplissez les informations ci-dessous</p>
                </div>
              </div>
              <button onClick={() => setShowUserModal(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {!currentUser && usersNoRole.length > 0 && (
                <>
                  <div>
                    <label className={labelCls}>Sélectionner un utilisateur existant</label>
                    <select value={selectedExistingUser} onChange={e => setSelectedExistingUser(e.target.value)} className={inputCls}>
                      <option value="">-- Créer un nouvel utilisateur --</option>
                      {usersNoRole.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                    </select>
                  </div>
                  <div className="relative flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                    <span className="text-xs font-medium text-gray-400 dark:text-slate-500">ou</span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                  </div>
                </>
              )}
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>Nom *</label>
                  <input type="text" placeholder="Nom" value={userForm.nom} onChange={e => setUserForm({ ...userForm, nom: e.target.value })} className={inputCls} required />
                </div>
                {(userModalType === 'etudiant' || userModalType === 'enseignant') && (
                  <div>
                    <label className={labelCls}>Prénom *</label>
                    <input type="text" placeholder="Prénom" value={userForm.prenom} onChange={e => setUserForm({ ...userForm, prenom: e.target.value })} className={inputCls} required />
                  </div>
                )}
                {!selectedExistingUser && (
                  <>
                    <div>
                      <label className={labelCls}>Email *</label>
                      <input type="email" placeholder="Email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className={inputCls} required />
                    </div>
                    {!currentUser && (
                      <div>
                        <label className={labelCls}>Mot de passe *</label>
                        <input type="password" placeholder="Mot de passe" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className={inputCls} required />
                      </div>
                    )}
                  </>
                )}
                {userModalType === 'enseignant' && (
                  <>
                    <div>
                      <label className={labelCls}>Matière *</label>
                      <input type="text" placeholder="Matière" value={userForm.matiere} onChange={e => setUserForm({ ...userForm, matiere: e.target.value })} className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>Coefficient</label>
                      <input type="number" step="0.5" min="0.5" max="10" placeholder="Coefficient" value={userForm.coefficient} onChange={e => setUserForm({ ...userForm, coefficient: parseFloat(e.target.value) })} className={inputCls} required />
                    </div>
                  </>
                )}
                {userModalType === 'etudiant' && (
                  <>
                    <div>
                      <label className={labelCls}>Classe *</label>
                      <select value={userForm.classe_id} onChange={e => setUserForm({ ...userForm, classe_id: e.target.value })} className={inputCls} required>
                        <option value="">Choisir une classe</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Date de naissance</label>
                      <input type="date" value={userForm.date_naissance} onChange={e => setUserForm({ ...userForm, date_naissance: e.target.value })} className={inputCls} />
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                  <button type="button" onClick={() => setShowUserModal(false)} className={btnSecondary}>Annuler</button>
                  <button type="submit" className={btnPrimary}><CheckCircle className="h-3.5 w-3.5" /> Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modale classe */}
      {showClasseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl shadow-black/20 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-amber-500 to-amber-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-xl">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{currentClasse ? 'Modifier' : 'Ajouter'} une classe</h3>
                  <p className="text-xs text-white/70 mt-0.5">Groupes et niveaux</p>
                </div>
              </div>
              <button onClick={() => setShowClasseModal(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleClasseSubmit}>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className={labelCls}>Nom *</label>
                  <input type="text" placeholder="Nom de la classe" value={classeForm.nom} onChange={e => setClasseForm({ ...classeForm, nom: e.target.value })} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Niveau</label>
                  <input type="text" placeholder="Niveau (ex: BTS 1)" value={classeForm.niveau} onChange={e => setClasseForm({ ...classeForm, niveau: e.target.value })} className={inputCls} />
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                <button type="button" onClick={() => setShowClasseModal(false)} className={btnSecondary}>Annuler</button>
                <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-amber-600/20 hover:shadow-md active:scale-[0.98] transition-all">
                  <CheckCircle className="h-3.5 w-3.5" /> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale note */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl shadow-black/20 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-xl">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{currentNote ? 'Modifier la note' : 'Saisir une note'}</h3>
                  <p className="text-xs text-white/70 mt-0.5">
                    {noteForm.etudiant_id && etudiants.find(e => e.id === noteForm.etudiant_id)
                      ? `${etudiants.find(e => e.id === noteForm.etudiant_id).nom} ${etudiants.find(e => e.id === noteForm.etudiant_id).prenom}`
                      : 'Résultats académiques'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowNoteModal(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleNoteSubmit}>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className={labelCls}>Matière *</label>
                  <input type="text" placeholder="ex : Mathématiques" value={noteForm.matiere} onChange={e => setNoteForm({ ...noteForm, matiere: e.target.value })} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Type de contrôle *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Contrôle 1', 'Contrôle 2', 'Contrôle 3'].map(c => (
                      <button key={c} type="button" onClick={() => setNoteForm({ ...noteForm, type_controle: c })}
                        className={`py-2.5 px-3 text-sm font-medium rounded-lg border transition-all ${
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
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 dark:text-slate-500 pointer-events-none">/20</span>
                  </div>
                  {noteForm.note && (
                    <p className={`text-xs font-semibold mt-1.5 ${gradeColor(noteForm.note)}`}>
                      {parseFloat(noteForm.note) >= 12 ? 'Bien' : parseFloat(noteForm.note) >= 10 ? 'Passable' : 'Insuffisant'}
                      {' — '}{parseFloat(noteForm.note)}/20
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

      {/* Modale absence */}
      {showAbsenceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl shadow-black/20 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-xl">
                  <CalendarX className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{currentAbsence ? 'Modifier l\'absence' : 'Enregistrer une absence'}</h3>
                  <p className="text-xs text-white/70 mt-0.5">{currentEtudiant?.nom} {currentEtudiant?.prenom}</p>
                </div>
              </div>
              <button onClick={() => setShowAbsenceModal(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleAbsenceSubmit}>
              <div className="px-6 py-5 space-y-4">
                {!currentAbsence && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Date *</label>
                      <input type="date" value={absenceForm.date || ''} onChange={e => setAbsenceForm({ ...absenceForm, date: e.target.value })} className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>Heures *</label>
                      <div className="relative">
                        <input type="number" step="0.5" min="0.5" placeholder="1" value={absenceForm.nb_heures} onChange={e => setAbsenceForm({ ...absenceForm, nb_heures: parseFloat(e.target.value) })} className={`${inputCls} pr-8`} required />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">h</span>
                      </div>
                    </div>
                  </div>
                )}
                {currentAbsence && (
                  <div>
                    <label className={labelCls}>Date</label>
                    <input type="date" value={absenceForm.date || ''} className={inputCls} readOnly />
                  </div>
                )}
                <div>
                  <label className={labelCls}>Statut</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ label: 'Non justifiée', value: false, color: 'red' }, { label: 'Justifiée', value: true, color: 'green' }].map(opt => (
                      <button key={String(opt.value)} type="button" onClick={() => setAbsenceForm({ ...absenceForm, justifiee: opt.value })}
                        className={`py-2.5 px-3 text-sm font-medium rounded-lg border transition-all flex items-center justify-center gap-2 ${
                          absenceForm.justifiee === opt.value
                            ? opt.color === 'green'
                              ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-600/20'
                              : 'bg-red-600 border-red-600 text-white shadow-md shadow-red-600/20'
                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                        }`}>
                        {opt.value ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                {!currentAbsence && (
                  <div>
                    <label className={labelCls}>Enseignant *</label>
                    <select value={absenceForm.enseignant_id} onChange={e => setAbsenceForm({ ...absenceForm, enseignant_id: e.target.value })} className={inputCls} required>
                      <option value="">Choisir un enseignant…</option>
                      {enseignants.map(ens => <option key={ens.id} value={ens.id}>{ens.nom} — {ens.matiere}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                <button type="button" onClick={() => setShowAbsenceModal(false)} className={btnSecondary}>Annuler</button>
                <button type="submit" className={btnPrimary}><CheckCircle className="h-3.5 w-3.5" /> Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale affectation */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl shadow-black/20 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-green-600 to-green-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-xl">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Affecter un enseignant</h3>
                  <p className="text-xs text-white/70 mt-0.5">Liaison classe ↔ enseignant</p>
                </div>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleAssignTeacher}>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className={labelCls}>Classe *</label>
                  <select value={assignForm.classe_id} onChange={e => setAssignForm({ ...assignForm, classe_id: e.target.value })} className={inputCls} required>
                    <option value="">Choisir une classe…</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.nom}{c.niveau ? ` — ${c.niveau}` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Enseignant *</label>
                  <select value={assignForm.enseignant_id} onChange={e => setAssignForm({ ...assignForm, enseignant_id: e.target.value })} className={inputCls} required>
                    <option value="">Choisir un enseignant…</option>
                    {enseignants.map(e => <option key={e.id} value={e.id}>{e.nom} — {e.matiere}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                <button type="button" onClick={() => setShowAssignModal(false)} className={btnSecondary}>Annuler</button>
                <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-semibold rounded-lg shadow-sm shadow-green-600/20 hover:shadow-md active:scale-[0.98] transition-all">
                  <UserPlus className="h-3.5 w-3.5" /> Affecter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale changement mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl shadow-black/20 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-700 to-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-xl">
                  <Key className="h-5 w-5 text-white" />
                </div>
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
                  <input type="password" placeholder="••••••••" value={passwordForm.current_password} onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Nouveau mot de passe *</label>
                  <input type="password" placeholder="••••••••" value={passwordForm.new_password} onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Confirmer *</label>
                  <input type="password" placeholder="••••••••" value={passwordForm.new_password_confirmation} onChange={e => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })} className={inputCls} required />
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
