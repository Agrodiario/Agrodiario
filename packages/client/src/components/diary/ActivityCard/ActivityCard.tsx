// src/components/diary/ActivityCard/ActivityCard.tsx
import styles from './ActivityCard.module.css';
import { Button } from '../../common/Button/Button';
import {
  FiCalendar,
  FiDroplet, 
  FiUser, 
} from 'react-icons/fi';
import { GiThreeLeaves } from 'react-icons/gi';

type ActivityCardProps = {
  activity: {
    id: number;
    titulo: string;
    date: string;
    preparo: string;
    aplicacao: string;
    responsavel: string;
    operacao: string;
    tipo: string;

    insumoNome?: string;
    insumoQuantidade?: string;
    insumoUnidade?: string;
  };
  onView: () => void; 
};

function InfoItem({ icon, title, text }: any) {
  return (
    <div className={styles.infoItem}>
      <span className={styles.infoIcon}>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

  export function ActivityCard({ activity, onView }: ActivityCardProps) {

    const formattedDate = new Date(activity.date).toLocaleDateString('pt-BR');

    const tipoTexto = activity.operacao || activity.tipo.charAt(0).toUpperCase() + activity.tipo.slice(1);

    const insumoTexto = `${activity.insumoNome} ${activity.insumoQuantidade ? `(${activity.insumoQuantidade} ${activity.insumoUnidade})` : ''}`;

    console.log('Card ID:', activity.id, 'Insumo:', activity.insumoNome);

    return (
      <div className={styles.card}>
        <header className={styles.header}>
          <FiCalendar />
          <span>
            {formattedDate} – {activity.titulo || 'Sem título'}
          </span>
        </header>
  
        <div className={styles.content}>
          
          <InfoItem 
            icon={<GiThreeLeaves />} 
            title={activity.tipo.charAt(0).toUpperCase() + activity.tipo.slice(1)} 
            text={activity.operacao || '-'} 
          />
  
          {activity.insumoNome && (
            <InfoItem 
              icon={<FiDroplet />} 
              title="Aplicação" 
              text={insumoTexto} 
            />
          )}
  
          <InfoItem icon={<FiUser />} title="Responsável" text={activity.responsavel} />
        </div>
  
        <footer className={styles.footer}>
          <Button variant="quaternary" style={{ width: '100%' }} onClick={onView}>
            Visualizar
          </Button>
        </footer>
      </div>
    );
  }