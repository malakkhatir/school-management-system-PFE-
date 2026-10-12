import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Api/Api';
import { GraduationCap, BookOpen, CalendarX, Users, Loader2, Eye, EyeOff, AlertCircle, Mail, Lock } from 'lucide-react';
import { SCHOOL } from '../../config/school';

const features = [
  { icon: BookOpen,  text: 'Suivi des notes par matière et par contrôle' },
  { icon: CalendarX, text: 'Gestion des absences en temps réel' },
  { icon: Users,     text: 'Administration centralisée des comptes' },
];

export default function Login() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.includes('@') || password.length < 6) {
      setError('Veuillez remplir correctement les champs.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const { data } = await api.post('/login', { email, password });
      const { token, user, redirect } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', redirect.type);
      localStorage.setItem('roleId', redirect.id);
      switch (redirect.type) {
        case 'admin':      navigate('/administrateurs'); break;
        case 'enseignant': navigate(`/enseignant/${redirect.id}`); break;
        case 'etudiant':   navigate(`/etudiant/${redirect.id}`); break;
        default:           navigate('/accueil');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        'Identifiants incorrects.'
      );
    } finally {
      setLoading(false);
    }
  };

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
        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">{SCHOOL.name}</span>
        </div>

        {/* Headline */}
        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Gestion des absences<br />et des notes
          </h1>
          <p className="text-indigo-200 text-sm leading-relaxed mb-10 max-w-sm">
            Plateforme centralisée pour le suivi académique des étudiants,
            la gestion des présences et l'administration des établissements.
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
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 bg-white">
        <div className="w-full max-w-sm mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">{SCHOOL.name}</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Connexion</h2>
          <p className="text-sm text-gray-500 mb-8">
            Entrez vos identifiants pour accéder à votre espace personnel.
          </p>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder={SCHOOL.emailPlaceholder}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
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
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className={inputClass + ' pl-10 pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg shadow-md shadow-indigo-600/30 hover:shadow-lg hover:shadow-indigo-600/40 active:scale-[0.98] transition-all"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Connexion en cours…</>
              ) : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-500">
            Pas encore de compte ?{' '}
            <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Créer un compte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
