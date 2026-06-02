import styles from './Steps.module.css';

export function Step1DatosBasicos({ data, onChange, catalogos }) {
  function handle(e) {
    const { name, value } = e.target;
    onChange(prev => ({ ...prev, [name]: value }));
  }

  return (
    <div className={styles.stepContent}>
      <div className={styles.row2}>
        <div className={styles.field}>
          <label className={styles.label}>Código <span className={styles.req}>*</span></label>
          <input
            className={styles.input}
            name="codigo"
            value={data.codigo}
            onChange={handle}
            placeholder="Ej. PROT-2026-001"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Meta de pacientes</label>
          <input
            className={styles.input}
            name="metaPacientes"
            type="number"
            min="1"
            value={data.metaPacientes}
            onChange={handle}
            placeholder="Ej. 100"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Título <span className={styles.req}>*</span></label>
        <input
          className={styles.input}
          name="titulo"
          value={data.titulo}
          onChange={handle}
          placeholder="Título completo del protocolo"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Objetivos</label>
        <textarea
          className={styles.textarea}
          name="objetivos"
          value={data.objetivos}
          onChange={handle}
          rows={3}
          placeholder="Descripción de los objetivos del protocolo"
        />
      </div>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label className={styles.label}>Fase clínica <span className={styles.req}>*</span></label>
          <select className={styles.select} name="idFase" value={data.idFase} onChange={handle}>
            <option value="">Seleccionar fase…</option>
            {catalogos.fases.map(f => (
              <option key={f.id} value={f.id}>{f.nombre}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Estado inicial <span className={styles.req}>*</span></label>
          <select className={styles.select} name="idEstadoProtocolo" value={data.idEstadoProtocolo} onChange={handle}>
            <option value="">Seleccionar estado…</option>
            {catalogos.estados.map(e => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label className={styles.label}>Fecha de inicio</label>
          <input
            className={styles.input}
            type="date"
            name="fechaInicio"
            value={data.fechaInicio}
            onChange={handle}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Fecha fin estimada</label>
          <input
            className={styles.input}
            type="date"
            name="fechaFinEstimada"
            value={data.fechaFinEstimada}
            onChange={handle}
          />
        </div>
      </div>
    </div>
  );
}
