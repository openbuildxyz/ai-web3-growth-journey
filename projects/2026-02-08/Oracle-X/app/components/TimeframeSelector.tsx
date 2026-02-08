'use client';

import styles from './TimeframeSelector.module.css';

interface TimeframeSelectorProps {
  value: string;
  onChange: (interval: string) => void;
}

const TIMEFRAMES = [
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
];

export default function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return (
    <div className={styles.container}>
      {TIMEFRAMES.map(tf => (
        <button
          key={tf.value}
          className={`${styles.btn} ${value === tf.value ? styles.active : ''}`}
          onClick={() => onChange(tf.value)}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
}
