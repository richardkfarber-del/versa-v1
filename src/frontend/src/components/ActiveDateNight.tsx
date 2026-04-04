import React, { useState, useEffect } from 'react';
import styles from './ActiveDateNight.module.css';

export const ActiveDateNight: React.FC = () => {
  const [timer, setTimer] = useState<number>(900); // 15 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.activityTitle}>Current Activity</h2>
      <div 
        className={styles.timer}
        style={{ color: timer <= 60 ? 'var(--color-timer-warning)' : 'inherit' }}
      >
        {formatTime(timer)}
      </div>
      <button className={styles.button}>Next Activity</button>
    </div>
  );
};
