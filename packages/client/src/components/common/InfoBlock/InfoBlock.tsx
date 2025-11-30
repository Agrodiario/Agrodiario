// src/components/common/InfoBlock/InfoBlock.tsx
import React from 'react';
import styles from './InfoBlock.module.css';

type InfoBlockProps = {
  label: string;
  value?: string | number;
  icon?: React.ReactNode;
  element?: React.ReactNode;
};

export function InfoBlock({ label, value, icon, element }: InfoBlockProps) {
  return (
    <div className={styles.infoBlock}>
      {icon?
          <div className={styles.infoHeader}>
              <span className={styles.infoIcon}>{icon}</span>
              <span className={styles.infoLabel}>{label}</span>
          </div> 
          :
          <span className={styles.infoLabel}>{label}</span>
      }
      {value?
        <span className={styles.infoValue}>{value}</span>
        : 
        element
      }
    </div>
  );
}