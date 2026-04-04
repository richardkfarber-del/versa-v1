import React from 'react';
import styles from './MatchReveal.module.css';

const MatchReveal = ({ matches }) => {
  return (
    <div className={styles.container}>
      <h2>Matches Found</h2>
      <ul>
        {matches.map((match, index) => (
          <li key={index} className={styles.matchItem}>
            <span>{match}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MatchReveal;