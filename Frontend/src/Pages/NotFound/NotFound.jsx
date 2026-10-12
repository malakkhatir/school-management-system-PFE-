import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { SCHOOL } from '../../config/school';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-4 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:24px_24px]">
      <div className="relative text-center max-w-md w-full">
        {/* Giant 404 behind card */}
        <p className="text-[10rem] font-black leading-none text-indigo-100 select-none pointer-events-none mb-0">
          404
        </p>

        {/* Frosted content card */}
        <div className="-mt-12 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 px-10 py-10 shadow-xl shadow-indigo-100/40 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl shadow-lg shadow-indigo-200/40 mb-5">
            <GraduationCap className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Erreur 404</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Page introuvable</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-7">
            Vous n'avez pas l'autorisation d'accéder à cette page,
            ou elle n'existe pas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/35 active:scale-[0.98] transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
            <Link
              to="/accueil"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-sm font-semibold rounded-lg border border-gray-200 hover:border-gray-300 shadow-sm transition-all"
            >
              Tableau de bord
            </Link>
          </div>
        </div>
      </div>
      <p className="mt-10 text-xs text-gray-400">{SCHOOL.copyright}</p>
    </div>
  );
}
