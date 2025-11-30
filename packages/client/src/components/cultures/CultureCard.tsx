import styles from './CultureCard.module.css';
import { Button } from '../common/Button/Button';
import { Culture } from '../../types/culture.types';
import { FiCalendar, FiSun } from 'react-icons/fi';
import { PiPlantFill } from 'react-icons/pi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CultureCardProps {
  culture: Culture;
  onView: () => void;
}

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

export function CultureCard({ culture, onView }: CultureCardProps) {
  // Formatar data de plantio
  const formattedDate = culture.plantingDate
    ? format(new Date(culture.plantingDate), "dd/MM/yy", { locale: ptBR })
    : 'N/A';

  return (
    <div className={styles.card}>
      {/* Cabeçalho com emoji e nome */}
      <header className={styles.header}>
        <span className={styles.emoji}>
          {getCultureEmoji(culture.cultureName)}
        </span>
        <span>{culture.cultureName}</span>
        <span
          className={`${styles.badge} ${
            culture.isActive ? styles.badgeActive : styles.badgeInactive
          }`}
        >
          {culture.isActive ? 'Ativo' : 'Não ativo'}
        </span>
      </header>

      {/* Conteúdo */}
      <div className={styles.content}>
        <InfoItem
          icon={<PiPlantFill />}
          title="Talhão X"
          text={culture.cultivar || 'N/A'}
        />
        <InfoItem
          icon={<FiSun />}
          title="Ciclo"
          text={`${culture.cycle} dias`}
        />
        <InfoItem
          icon={<FiCalendar />}
          title="Data de plantio"
          text={formattedDate}
        />
      </div>

      {/* Rodapé */}
      <footer className={styles.footer}>
        <p className={styles.activitiesCount}>
          Atividades vinculadas: {culture.activitiesCount || 0}
        </p>
        <Button
          onClick={onView}
          variant="quaternary"
          style={{ width: '100%' }}
          className={styles.manageButton}
        >
          Gerenciar
        </Button>
      </footer>
    </div>
  );
}

// Mapeia nomes de culturas para emojis
function getCultureEmoji(cultureName: string): string {
  const emojiMap: Record<string, string> = {
    morango: '🍓',
    cenoura: '🥕',
    uva: '🍇',
    milho: '🌽',
    banana: '🍌',
    pepino: '🥒',
    alface: '🥬',
    tomate: '🍅',
    batata: '🥔',
    arroz: '🌾',
    soja: '🌱',
    trigo: '🌾',
    feijão: '🫘',
    café: '☕',
    laranja: '🍊',
    limão: '🍋',
    manga: '🥭',
    abacaxi: '🍍',
    melancia: '🍉',
    melão: '🍈',
    maçã: '🍎',
    pêra: '🍐',
    pêssego: '🍑',
    ameixa: '🫐',
    framboesa: '🫐',
    mirtilo: '🫐',
    abóbora: '🎃',
    abobrinha: '🥒',
    berinjela: '🍆',
    pimentão: '🫑',
    pimenta: '🌶️',
    cebola: '🧅',
    alho: '🧄',
    brócolis: '🥦',
    couve: '🥬',
    repolho: '🥬',
    espinafre: '🥬',
    rúcula: '🥬',
  };

  const lowerName = cultureName.toLowerCase();
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (lowerName.includes(key)) {
      return emoji;
    }
  }
  return '🌱'; // Emoji padrão
}
