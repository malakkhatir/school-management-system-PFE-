import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Api/Api';
import { GraduationCap, BookOpen, CalendarX, Users, Loader2, Eye, EyeOff, CheckCircle, AlertCircle, Mail, Lock, User } from 'lucide-react';
import { SCHOOL } from '../../config/school';

const features = [
  { icon: BookOpen,  text: 'Consultez vos notes et relevés en ligne' },
  { icon: CalendarX, text: 'Suivez vos absences et justificatifs' },
  { icon: Users,     text: 'Communiquez avec l\'administration' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [showPwd, setShowPwd]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [alert, setAlert]       = useState({ type: '', message: '' });
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setAlert({ type: '', message: '' });
      const { name, email, password, password_confirmation } = form;
      const response = await api.post('/register', { name, email, password, password_confirmation });
      console.log(response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/login', { state: { successMessage: 'Inscription réussie !' } });
    } catch (error) {
      console.error(error);
      setAlert({ type: 'error', message: error.response?.data?.message || "Erreur lors de l'inscription." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (alert.message) {
      const t = setTimeout(() => setAlert({ type: '', message: '' }), 5000);
      return () => clearTimeout(t);
    }
  }, [alert]);

  const inputClass =
    'w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors';

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white relative overflow-hidden">
        {/* Dot grid texture */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">{SCHOOL.name}</span>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Rejoignez la<br />plateforme {SCHOOL.name}
          </h1>
          <p className="text-indigo-200 text-sm leading-relaxed mb-10 max-w-sm">
            Créez votre compte pour accéder à tous les outils de suivi académique
            mis à disposition des étudiants, enseignants et administrateurs.
          </p>
          <ul className="space-y-3">
            {features.map(f => (
              <li key={f.text} className="flex items-center gap-3 text-sm text-indigo-100">
                <div className="w-7 h-7 bg-white/20 shadow-sm shadow-indigo-950/20 rounded-lg flex items-center justify-center shrink-0">
                  <f.icon className="h-3.5 w-3.5 text-white" />
                </div>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-indigo-300 text-xs">{SCHOOL.copyright}</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 bg-white overflow-y-auto">
        <div className="w-full max-w-sm mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">{SCHOOL.name}</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Créer un compte</h2>
          <p className="text-sm text-gray-500 mb-8">
            Remplissez le formulaire pour rejoindre la plateforme.
          </p>

          {alert.message && (
            <div className={`alert-enter mb-5 flex items-start gap-2.5 text-sm px-4 py-3 rounded-lg border ${
              alert.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {alert.type === 'success'
                ? <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
              {alert.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Prénom Nom"
                  className={inputClass + ' pl-10'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder={SCHOOL.emailPlaceholder}
                  className={inputClass + ' pl-10'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimum 8 caractères"
                  className={inputClass + ' pl-10 pr-10'}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmation du mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type={showConf ? 'text' : 'password'}
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className={inputClass + ' pl-10 pr-10'}
                />
                <button type="button" onClick={() => setShowConf(!showConf)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                  {showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password && form.password_confirmation && (
                <p className={`text-xs font-medium mt-1.5 flex items-center gap-1 ${
                  form.password === form.password_confirmation
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {form.password === form.password_confirmation
                    ? <><CheckCircle className="h-3 w-3" /> Mots de passe identiques</>
                    : <><AlertCircle className="h-3 w-3" /> Ne correspondent pas</>
                  }
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg shadow-md shadow-indigo-600/30 hover:shadow-lg hover:shadow-indigo-600/40 active:scale-[0.98] transition-all mt-2"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Création en cours…</>
              ) : "Créer mon compte"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-500">
            Vous avez déjà un compte ?{' '}
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
