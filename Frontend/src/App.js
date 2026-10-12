import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/LoginPage/Login';
import Register from './Pages/Inscription/Inscription';
import Accueil from './Pages/Accueil/Accueil';
import AdminDashboard from './Pages/Administrateur/AdminDashboard';
import EnseignantDashboard from './Pages/Enseignant/EnseignantDashboard';
import EtudiantDashboard from './Pages/Etudiant/EtudiantDashboard';
import NotFound from './Pages/NotFound/NotFound';

// Composant pour protéger les routes avec vérification du rôle
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); 
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && (!role || !allowedRoles.includes(role))) {
    // Rediriger vers une page 404 au lieu de l'accueil
    return <Navigate to="/404" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/404" element={<NotFound />} />
        {/* Page d'accueil accessible à tous les utilisateurs authentifiés */}
        <Route path="/Accueil" element={<ProtectedRoute><Accueil /></ProtectedRoute>} />
        
        {/* Admin uniquement */}
        <Route 
          path="/administrateurs" 
          element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} 
        />
        
        {/* Enseignant uniquement (et peut-être admin si vous voulez, sinon seulement 'enseignant') */}
        <Route 
          path="/enseignant/:id" 
          element={<ProtectedRoute allowedRoles={['enseignant']}><EnseignantDashboard /></ProtectedRoute>} 
        />
        
        {/* Étudiant uniquement */}
        <Route 
          path="/etudiant/:id" 
          element={<ProtectedRoute allowedRoles={['etudiant']}><EtudiantDashboard /></ProtectedRoute>} 
        />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;