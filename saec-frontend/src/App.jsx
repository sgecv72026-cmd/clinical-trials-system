import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider }    from './context/AuthContext';
import { ProtectedRoute }  from './routes/ProtectedRoute';

/* Páginas públicas */
import { LoginPage } from './pages/LoginPage';
import { SinAcceso } from './pages/SinAcceso';

/* Layouts */
import { AdminLayout }  from './layouts/AdminLayout/AdminLayout';
import { MainLayout }   from './layouts/MainLayout/MainLayout';

/* Módulo Mi Perfil */
import { ProfilePage } from './pages/profile/ProfilePage';

/* Módulo Administrador */
import { DashboardAdminPage }              from './pages/admin/DashboardAdminPage';
import { UsuariosPage }                    from './pages/admin/UsuariosPage';
import { RolesPage }                       from './pages/admin/RolesPage';
import { CentrosPage }                     from './pages/admin/CentrosPage';
import { AuditoriaPage }                   from './pages/admin/AuditoriaPage';
import { ReportesPage as AdminReportesPage } from './pages/admin/ReportesPage';

/* Módulo Investigador Principal */
import { ProtocolosListPage }  from './pages/investigador/protocolos/ProtocolosListPage';
import { ProtocoloDetailPage } from './pages/investigador/protocolos/ProtocoloDetailPage';
import { MedicamentosPage }    from './pages/investigador/medicamentos/MedicamentosPage';

/* Módulo Reclutamiento */
import { ReclutamientoPage }   from './pages/reclutamiento/ReclutamientoPage';
import { HistorialPage }       from './pages/reclutamiento/investigador/HistorialPage';
import { EvaluacionCandidato } from './pages/reclutamiento/medico/EvaluacionCandidato';

/* Módulo Pacientes */
import { PacientesPage }   from './pages/pacientes/PacientesPage';
import { FichaPaciente }   from './pages/pacientes/medico/FichaPaciente';
import { VisitasPaciente } from './pages/pacientes/medico/VisitasPaciente';
import { VisitaDetalle }   from './pages/pacientes/medico/VisitaDetalle';

/* Módulo Reportes */
import { ReportesPage } from './pages/reportes/ReportesPage';

/* Placeholder */
import { ModuloEnDesarrollo } from './pages/ModuloEnDesarrollo';

/* Redirección raíz */
import { RootRedirect } from './routes/RootRedirect';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Públicas ─────────────────────────────────────────── */}
          <Route path="/login"      element={<LoginPage />} />
          <Route path="/sin-acceso" element={<SinAcceso />} />
          <Route path="/"           element={<RootRedirect />} />

          {/* ── Administrador ────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/perfil"              element={<ProfilePage />} />
              <Route path="/admin"               element={<DashboardAdminPage />} />
              <Route path="/admin/usuarios"      element={<UsuariosPage />} />
              <Route path="/admin/roles"         element={<RolesPage />} />
              <Route path="/admin/centros"       element={<CentrosPage />} />
              <Route path="/admin/auditoria"     element={<AuditoriaPage />} />
              <Route path="/admin/reportes"      element={<AdminReportesPage />} />
              <Route path="/admin/protocolos"    element={<ModuloEnDesarrollo />} />
              <Route path="/admin/pacientes"     element={<ModuloEnDesarrollo />} />
              <Route path="/admin/postulaciones" element={<ModuloEnDesarrollo />} />
              <Route path="/admin/visitas"       element={<ModuloEnDesarrollo />} />
            </Route>
          </Route>

          {/* ── MainLayout — un solo layout para todos los módulos ── */}
          {/*    Roles: Médico, Coordinador, Investigador, Comité      */}
          {/*    El sidebar NO se desmonta al navegar entre secciones  */}
          <Route element={<ProtectedRoute allowedRoles={[
            'Médico Tratante',
            'Coordinador de Reclutamiento',
            'Investigador Principal',
            'Comité de Ética',
          ]} />}>
            <Route element={<MainLayout />}>

              {/* Perfil */}
              <Route path="/reclutamiento/perfil" element={<ProfilePage />} />
              <Route path="/reportes/perfil"      element={<ProfilePage />} />

              {/* ── Investigador Principal ── */}
              <Route path="/investigador"
                element={<Navigate to="/investigador/protocolos" replace />} />
              <Route path="/investigador/protocolos"     element={<ProtocolosListPage />} />
              <Route path="/investigador/protocolos/:id" element={<ProtocoloDetailPage />} />
              <Route path="/investigador/medicamentos"   element={<MedicamentosPage />} />

              {/* ── Reclutamiento ── */}
              <Route path="/reclutamiento"                   element={<ReclutamientoPage />} />
              <Route path="/reclutamiento/historial"         element={<HistorialPage />} />
              <Route path="/reclutamiento/evaluacion/:id"    element={<EvaluacionCandidato />} />

              {/* ── Pacientes ── */}
              {/* /pacientes/visitas antes que /pacientes/:id para evitar colisión */}
              <Route path="/pacientes"                          element={<PacientesPage />} />
              <Route path="/pacientes/visitas"
                element={<Navigate to="/pacientes" replace />} />
              <Route path="/pacientes/:id"                      element={<FichaPaciente />} />
              <Route path="/pacientes/:id/visitas"              element={<VisitasPaciente />} />
              <Route path="/pacientes/:id/visitas/:visitaId"    element={<VisitaDetalle />} />

              {/* ── Reportes ── */}
              <Route path="/reportes" element={<ReportesPage />} />

            </Route>
          </Route>

          {/* ── Catch-all ────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
