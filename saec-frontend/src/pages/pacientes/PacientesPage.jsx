import { useAuth } from '../../hooks/useAuth';
import { PacientesMedico }        from './medico/PacientesMedico';
import { PacientesInvestigador }  from './investigador/PacientesInvestigador';
import { PacientesCoordinador }   from './coordinador/PacientesCoordinador';
import { SinAcceso }              from '../SinAcceso';

export function PacientesPage() {
  const { user } = useAuth();
  const rol = user?.rol ?? '';

  if (rol.includes('Médico') || rol.includes('Medico')) return <PacientesMedico />;
  if (rol === 'Investigador Principal')                  return <PacientesInvestigador />;
  if (rol === 'Coordinador de Reclutamiento')            return <PacientesCoordinador />;
  return <SinAcceso />;
}
