import { useAuth } from '../../hooks/useAuth';
import { ReportesComite }      from './comite/ReportesComite';
import { ReportesMedico }      from './medico/ReportesMedico';
import { ReportesCoordinador } from './coordinador/ReportesCoordinador';

export function ReportesPage() {
  const { user } = useAuth();
  const rol = user?.rol ?? '';

  if (rol.includes('Ética') || rol.includes('Etica') || rol === 'Comité de Ética') {
    return <ReportesComite />;
  }
  if (rol.includes('Médico') || rol.includes('Medico')) {
    return <ReportesMedico />;
  }
  if (rol === 'Coordinador de Reclutamiento') {
    return <ReportesCoordinador />;
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>
      No hay reportes disponibles para tu rol.
    </div>
  );
}
