import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Api/Api';
import { SCHOOL } from '../../config/school';
import {
  Home,
  Calendar,
  Users,
  BookOpen,
  Phone,
  Moon,
  Sun,
  LogOut,
  School,
  Shield,
  GraduationCap,
  Mail,
  PhoneCall,
  MapPin,
  Loader2,
  Send,
  Menu,
  CheckCircle,
  Award,
  ChevronDown,
  Search,
} from 'lucide-react';

const inputCls =
  'w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors';

const articles = [
  { title: 'Article 1 – Assiduité et ponctualité', text: 'La présence à tous les cours, travaux pratiques et examens est obligatoire. Tout retard ou absence doit être justifié dans les 48 heures par un billet des parents ou un certificat médical. Au-delà de 3 absences non justifiées par trimestre, une mesure disciplinaire peut être prise.' },
  { title: 'Article 2 – Respect du matériel et des locaux', text: "Les salles de classe, laboratoires, bibliothèque et équipements informatiques sont mis à disposition des élèves. Toute dégradation volontaire entraînera une réparation à la charge de l'élève ou de ses responsables légaux." },
  { title: 'Article 3 – Utilisation des appareils électroniques', text: 'Le téléphone portable est strictement interdit pendant les cours, les évaluations et les études surveillées. Il doit être éteint ou en mode silencieux et rangé dans le sac.' },
  { title: 'Article 4 – Tenue vestimentaire et comportement', text: 'Une tenue correcte et décente est exigée. Le respect mutuel entre élèves, enseignants et personnel est fondamental. Tout comportement violent, harcèlement ou discrimination sera sanctionné conformément à la loi.' },
  { title: 'Article 5 – Sanctions disciplinaires', text: 'En fonction de la gravité des faits, les sanctions suivantes peuvent être appliquées : avertissement, blâme, exclusion temporaire (1 à 8 jours), exclusion définitive.' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [activeTab, setActiveTab] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [contactForm, setContactForm] = useState({ sujet: '', message: '' });
  const [contactStatus, setContactStatus] = useState({ type: '', message: '' });
  const [sending, setSending] = useState(false);

  const [openArticle, setOpenArticle] = useState(null);
  const [classSearch, setClassSearch] = useState('');

  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setContactStatus({ type: '', message: '' });
    try {
      await api.post('/contacts', contactForm);
      setContactStatus({ type: 'success', message: 'Votre message a bien été envoyé.' });
      setContactForm({ sujet: '', message: '' });
    } catch (error) {
      console.error(error);
      setContactStatus({ type: 'error', message: "Erreur lors de l'envoi. Veuillez réessayer." });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/classes');
        setClasses(response.data);
      } catch (error) {
        console.error('Erreur chargement des classes', error);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

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

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Erreur déconnexion', error);
    }
  };

  const navItems = [
    { id: 'home',        label: 'Accueil',            icon: Home },
    { id: 'schedule',    label: 'Emploi du temps',    icon: Calendar },
    { id: 'groups',      label: 'Groupes étudiants',  icon: Users },
    { id: 'regulations', label: 'Règlement intérieur', icon: BookOpen },
    { id: 'contact',     label: 'Contact',             icon: Phone },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-5 max-w-3xl">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                Bienvenue, {user?.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                {SCHOOL.tagline}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg">
                  <School className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Notre École</h3>
              </div>
              <div className="text-sm text-gray-600 dark:text-slate-300 space-y-3 leading-relaxed">
                <p>
                  Fondée en 2005,{' '}
                  <strong>{SCHOOL.name}</strong>{' '}
                  est un établissement d'enseignement général et technologique reconnu pour son excellence
                  académique et son accompagnement personnalisé. Nous accueillons plus de{' '}
                  <strong>1 200 élèves</strong> de la 6ème à la Terminale, répartis dans des classes à
                  effectifs réduits.
                </p>
                <p>
                  <strong>Notre système de fonctionnement</strong> repose sur trois piliers :
                  l'<strong>innovation pédagogique</strong>, le{' '}
                  <strong>suivi personnalisé</strong> et l'
                  <strong>épanouissement extrascolaire</strong>.
                </p>
                <p>
                  Grâce à notre plateforme, les étudiants, enseignants et parents peuvent consulter en
                  temps réel les notes, absences, emplois du temps et ressources pédagogiques.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-slate-800">
                {[
                  { icon: GraduationCap, value: '98 %',  label: 'Taux de réussite' },
                  { icon: Users,         value: '80+',   label: 'Enseignants' },
                  { icon: Award,         value: 'Label', label: 'École numérique' },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 leading-none">{value}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'schedule': {
        const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
        const slots = [
          { label: '08:00 - 09:30', duration: '1h30' },
          { label: '09:45 - 11:15', duration: '1h30' },
          { label: '11:30 - 13:00', duration: '1h30' },
          { label: '14:00 - 15:30', duration: '1h30' },
          { label: '15:45 - 17:15', duration: '1h30' },
        ];
        const scheduleGrid = {
          lundi:    [{ subject: 'Java', room: 'A103' }, { subject: 'Agile', room: 'B202' }, { subject: 'Cloud Computing', room: 'Lab 3' }, { subject: 'Anglais', room: 'C101' }, { subject: 'Linux', room: 'Lab 2' }],
          mardi:    [{ subject: 'React', room: 'A105' }, { subject: 'POO (Java)', room: 'A103' }, { subject: 'Bases de données (SQL)', room: 'Lab 1' }, { subject: 'Français', room: 'C102' }, { subject: 'Docker', room: 'Lab 3' }],
          mercredi: [{ subject: 'Laravel', room: 'A105' }, { subject: 'Angular', room: 'A107' }, { subject: 'Entrepreneuriat', room: 'C201' }, { subject: 'JEE', room: 'A103' }, { subject: 'NoSQL (MongoDB)', room: 'Lab 1' }],
          jeudi:    [{ subject: 'Cloud Computing (TP)', room: 'Lab 3' }, { subject: 'React (TP)', room: 'Lab 2' }, { subject: 'Anglais (Projet)', room: 'C101' }, { subject: 'Linux (Scripting)', room: 'Lab 2' }, { subject: 'POO (Avancé)', room: 'A103' }],
          vendredi: [{ subject: 'Agile (Scrum)', room: 'B202' }, { subject: 'Laravel (API)', room: 'A105' }, { subject: 'Français (Rédaction)', room: 'C102' }, { subject: 'JEE (Spring)', room: 'A103' }, { subject: 'Docker (CI/CD)', room: 'Lab 3' }],
          samedi:   [{ subject: 'Entrepreneuriat (Projet)', room: 'C201' }, { subject: 'Angular (Composants)', room: 'A107' }, { subject: 'Bases de données (SQL avancé)', room: 'Lab 1' }, { subject: 'NoSQL (TP)', room: 'Lab 1' }, { subject: 'Cloud (Déploiement)', room: 'Lab 3' }],
        };
        const days = [
          { key: 'lundi', label: 'Lundi' }, { key: 'mardi', label: 'Mardi' },
          { key: 'mercredi', label: 'Mercredi' }, { key: 'jeudi', label: 'Jeudi' },
          { key: 'vendredi', label: 'Vendredi' }, { key: 'samedi', label: 'Samedi' },
        ];

        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Emploi du temps</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Semaine du 20 juillet 2026</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-[800px] w-full">
                  <thead className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="sticky left-0 bg-gray-50 dark:bg-slate-800/80 z-10 px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        Horaires
                      </th>
                      {days.map(day => (
                        <th key={day.key} className={`px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider ${day.key === today ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400'}`}>
                          {day.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {slots.map((slot, idx) => (
                      <tr key={idx} className="group hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-gray-50 dark:group-hover:bg-slate-800/40 z-10 px-4 py-3 text-sm font-medium text-gray-600 dark:text-slate-300 border-r border-gray-100 dark:border-slate-800 whitespace-nowrap">
                          {slot.label}
                          <span className="block text-xs text-gray-400 dark:text-slate-500">{slot.duration}</span>
                        </td>
                        {days.map(day => {
                          const course = scheduleGrid[day.key]?.[idx];
                          const isToday = day.key === today;
                          return (
                            <td key={day.key} className={`px-2 py-2.5 align-top text-center${isToday ? ' bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}>
                              {course ? (
                                <div className="rounded-lg p-2 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800">
                                  <div className="font-medium text-indigo-800 dark:text-indigo-300 text-xs leading-snug">{course.subject}</div>
                                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Salle {course.room}</div>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-300 dark:text-slate-700">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30 text-xs text-gray-400 dark:text-slate-500 flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700" />
                Cours présentiel
              </div>
            </div>
          </div>
        );
      }

      case 'groups': {
        const filteredClasses = classes.filter(c => c.nom.toLowerCase().includes(classSearch.toLowerCase()));
        return (
          <div className="space-y-4 max-w-2xl">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Classes et effectifs</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Liste des groupes disponibles</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-slate-500 pointer-events-none" />
                <input
                  value={classSearch}
                  onChange={e => setClassSearch(e.target.value)}
                  placeholder="Rechercher une classe…"
                  className="w-full sm:w-64 pl-9 pr-3.5 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              {loadingClasses ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 animate-pulse bg-gray-100 dark:bg-slate-800 rounded-lg" />
                  ))}
                </div>
              ) : filteredClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-8 w-8 text-gray-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Aucune classe disponible</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Les classes apparaîtront ici une fois créées</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredClasses.map((classe) => (
                    <div key={classe.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 cursor-pointer hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-slate-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all border-l-[3px] border-amber-500">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-slate-100 text-sm">{classe.nom}</p>
                        {classe.niveau && (
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{classe.niveau}</p>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                        {classe.etudiants_count || 0} étudiants
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'regulations':
        return (
          <div className="space-y-4 max-w-3xl">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Règlement intérieur</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Règles et obligations de la communauté éducative</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 space-y-5">
              <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-1">Préambule</p>
                  <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                    Le présent règlement intérieur s'applique à tous les membres de la communauté éducative.
                    Il a pour but de garantir un climat scolaire serein, respectueux et propice aux apprentissages.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {articles.map((article, i) => (
                  <div key={i} className="border-b border-gray-100 dark:border-slate-800 last:border-0">
                    <button
                      onClick={() => setOpenArticle(openArticle === i ? null : i)}
                      className="w-full flex items-center justify-between py-3.5 text-left group"
                    >
                      <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {article.title}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${openArticle === i ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openArticle === i ? 'max-h-96' : 'max-h-0'}`}>
                      <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed pb-4 px-4">
                        {article.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm italic text-gray-700 dark:text-slate-300 leading-relaxed">
                  "Le règlement intérieur est accepté par chaque élève et sa famille lors de l'inscription.
                  Toute infraction engage la responsabilité de l'élève."
                </p>
                <p className="text-right text-xs text-gray-400 dark:text-slate-500 mt-2">— La direction</p>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4 max-w-4xl">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Contactez-nous</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                Envoyez-nous un message, nous vous répondrons rapidement.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Form card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">Envoyer un message</h3>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                      Sujet
                    </label>
                    <input
                      type="text"
                      name="sujet"
                      value={contactForm.sujet}
                      onChange={handleContactChange}
                      required
                      placeholder="Objet de votre message"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      value={contactForm.message}
                      onChange={handleContactChange}
                      required
                      placeholder="Votre message…"
                      className={inputCls}
                    />
                  </div>

                  {contactStatus.message && (
                    <div className={`flex items-start gap-2.5 text-sm px-4 py-3 rounded-lg border ${
                      contactStatus.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                        : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                    }`}>
                      {contactStatus.type === 'success'
                        ? <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        : <span className="mt-0.5 shrink-0">⚠</span>}
                      {contactStatus.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {sending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Envoi en cours…</>
                    ) : (
                      <><Send className="h-4 w-4" />Envoyer</>
                    )}
                  </button>
                </form>
              </div>

              {/* Contact info card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">Coordonnées</h3>
                <div className="space-y-3">
                  {[
                    { icon: MapPin,    text: SCHOOL.address },
                    { icon: PhoneCall, text: SCHOOL.phone },
                    { icon: Mail,      text: SCHOOL.email },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-start text-sm text-gray-600 dark:text-slate-300">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg mr-3 shrink-0">
                        <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="mt-1.5">{text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">
                    Horaires d'ouverture
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Lundi – Samedi : 8h00 – 18h00</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-gray-200 dark:border-slate-800 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-600/25 flex items-center justify-center shrink-0">
            <School className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-tight truncate">{SCHOOL.name}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{SCHOOL.tagline}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full ${
                activeTab === item.id
                  ? 'flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-r-lg border-l-[3px] border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 transition-all'
                  : 'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg border-l-[3px] border-transparent text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-slate-100 transition-all'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="shrink-0 p-3 border-t border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 p-2 rounded-lg">
            <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-slate-100 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
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
              {navItems.find(i => i.id === activeTab)?.label || ''}
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
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
