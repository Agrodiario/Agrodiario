import styles from './PropertyCard.module.css';
import { Button } from '../common/Button/Button';
import {
  FiHome,
  FiMapPin,
  FiGrid, // Para Talhões
  FiMap, // Para Área
} from 'react-icons/fi';
import { PiTreeEvergreen } from 'react-icons/pi'; // Para Cultivo

// Componente auxiliar
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

export function PropertyCard({ property, onView }: any) {
  const numTalhoes = Array.isArray(property.plots)
    ? property.plots.length
    : 0;
  return (
    <div className={styles.card}>
      {/* Cabeçalho */}
      <header className={styles.header}>
        <FiHome size={18} />
        <span>{property.name}</span>
      </header>

      {/* Conteúdo */}
      <div className={styles.content}>
        <InfoItem
          icon={<FiMapPin />}
          title="Estrada da Lavoura"
          text={property.location}
        />
        <InfoItem
          icon={<FiGrid />}
          title="Talhões"
          text={numTalhoes}
        />
        <InfoItem
          icon={<PiTreeEvergreen />}
          title="Cultivo principal"
          text={property.cultivo}
        />
        <InfoItem
          icon={<FiMap />}
          title="Área total"
          text={`${property.area} ha`}
        />
      </div>

      {/* Rodapé */}
      <footer className={styles.footer}>
        {/* Este link leva para a página de Visualizar/Gerenciar */}
        <Button
          onClick={onView}
          variant="quaternary"
          style={{ width: '100%' }}
          className={styles.manageButtonLink}
        >
          Gerenciar
        </Button>
      </footer>
    </div>
  );
}