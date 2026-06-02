import styles from './ProtocoloStatsCards.module.css';

export function ProtocoloStatsCards({ stats, loading }) {
  const cards = [
    { label: 'Total',       value: stats?.total,       icon: <TotalIcon />,      accent: 'blue'   },
    { label: 'Activos',     value: stats?.activos,     icon: <ActiveIcon />,     accent: 'green'  },
    { label: 'Finalizados', value: stats?.finalizados, icon: <CheckIcon />,      accent: 'purple' },
  ];

  return (
    <div className={styles.grid}>
      {cards.map(card => (
        <div key={card.label} className={`${styles.card} ${styles[card.accent]}`}>
          <div className={styles.cardIcon}>{card.icon}</div>
          <div className={styles.cardBody}>
            <span className={styles.cardValue}>
              {loading ? '—' : (card.value ?? 0)}
            </span>
            <span className={styles.cardLabel}>{card.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TotalIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H6l-3 9h18L18 3h-3"/><path d="M3 12l9 9 9-9"/></svg>;
}
function ActiveIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function CheckIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
