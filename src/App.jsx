import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Importa Navigate para redirigir
import DashboardHeader from './components/DashboardHeader';
import DashboardFooter from './components/DashboardFooter';
import DashboardMain from './components/DashboardMain';
import Login from './components/Login';
import VistaOpcion from './components/VistaOpcion';
import ProcesoInscripcion from './pages/PracticasPreprofesionales/ProcesoInscripcion'; 
import ProcesoRevisionInformes from './pages/PracticasPreprofesionales/ProcesoRevisionInformes'; 
import ProcesoConvalidacionExperiencia from './pages/PracticasPreprofesionales/ProcesoConvalidacionExperiencia'; 
import ProcesoFusion from './pages/PracticasPreprofesionales/ProcesoFusion'; 
import Admin from './pages/PracticasPreprofesionales/Admin';
import { Administrador, Proceso2, Proceso3 } from './pages/Admision/ProcesosAdmision'; 
import TerrenoDetalles from './components/TerrenoDetalles'; // Asegúrate de que la ruta sea correcta
import { GoogleOAuthProvider } from '@react-oauth/google';  // Importa el proveedor de Google OAuth

import './styles/Global.css';

// Componente para proteger las rutas
function ProtectedRoute({ element }) {
  const isAuthenticated = localStorage.getItem('authToken'); // Verifica si el token de autenticación está presente
  return isAuthenticated ? element : <Navigate to="/" replace />; // Si no está autenticado, redirige al login
}

function App() {
  return (
    <GoogleOAuthProvider clientId="1070915456741-n664o61eunf4it4f94m52mqvg09h2d3b.apps.googleusercontent.com">
      <Router>
        <Routes>
          {/* Ruta para Login */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Ruta para Dashboard con protección */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                element={
                  <>
                    <DashboardHeader />
                    <DashboardMain />
                    <DashboardFooter />
                  </>
                }
              />
            }
          />

          {/* Rutas dinámicas para las categorías */}
          <Route
            path="/dashboard/:categoria"
            element={
              <ProtectedRoute
                element={
                  <>
                    <DashboardHeader />
                    <DashboardMain />
                    <DashboardFooter />
                  </>
                }
              />
            }
          />

          {/* Otras rutas para las opciones */}
          <Route
            path="/dashboard/:opcion"
            element={
              <ProtectedRoute
                element={
                  <>
                    <DashboardHeader />
                    <VistaOpcion />
                    <DashboardFooter />
                  </>
                }
              />
            }
          >
            {/* Rutas para procesos específicos dentro de la opción */}
            <Route path="revision-inscripcion" element={<ProtectedRoute element={<ProcesoInscripcion />} />} />
            <Route path="revision-informes" element={<ProtectedRoute element={<ProcesoRevisionInformes />} />} />
            <Route path="informefinal-certificado" element={<ProtectedRoute element={<ProcesoFusion />} />} />
            <Route path="Convalidacion-experiencialaboral" element={<ProtectedRoute element={<ProcesoConvalidacionExperiencia />} />} />
            <Route path="Convalidacion-experiencialaboral" element={<ProtectedRoute element={<Admin />} />} />
            <Route path="proceso-1" element={<ProtectedRoute element={<Administrador />} />} />
            <Route path="proceso-2" element={<ProtectedRoute element={<Proceso2 />} />} />
            <Route path="proceso-3" element={<ProtectedRoute element={<Proceso3 />} />} />
          </Route>

          {/* Ruta para los detalles del terreno */}
          <Route
            path="/dashboard/terrenos/:id"
            element={
              <ProtectedRoute
                element={
                  <>
                    <DashboardHeader />
                    <TerrenoDetalles />
                    <DashboardFooter />
                  </>
                }
              />
            }
          />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
