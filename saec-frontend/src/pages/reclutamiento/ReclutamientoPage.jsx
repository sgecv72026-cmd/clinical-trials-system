import { useAuth } from '../../hooks/useAuth';
import { ReclutamientoCoordinador } from './coordinador/ReclutamientoCoordinador';
import { ReclutamientoInvestigador } from './investigador/ReclutamientoInvestigador';
import { ReclutamientoMedico }       from './medico/ReclutamientoMedico';
import styles from './ReclutamientoPage.module.css';

/**
 * Punto de entrada para /reclutamiento.
 * Renderiza la vista adecuada según el rol del usuario autenticado.
 */
export function ReclutamientoPage() {
  const { user } = useAuth();
  const rol = user?.rol ?? '';

  if (rol === 'Coordinador de Reclutamiento') {
    return <ReclutamientoCoordinador />;
  }

  if (rol === 'Investigador Principal') {
    return <ReclutamientoInvestigador vistaInicial="pendientes" />;
  }

  if (rol.includes('Médico') || rol.includes('Medico')) {
    return <ReclutamientoMedico />;
  }

  return (
    <div className={styles.noAcceso}>
      <div className={styles.noAccesoIcon}>🔒</div>
      <p className={styles.noAccesoMsg}>
        Su rol no tiene acceso a esta sección del módulo de reclutamiento.
      </p>
    </div>
  );
}
