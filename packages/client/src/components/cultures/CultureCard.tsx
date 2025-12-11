import { useState } from 'react';
import styles from './CultureCard.module.css';
import { Button } from '../common/Button/Button';
import { Culture } from '../../types/culture.types';
import { FiCalendar, FiSun, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { PiPlantFill } from 'react-icons/pi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseDateSafe } from '../../utils/dateUtils';

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
  const [showActivities, setShowActivities] = useState(false);

  // Formatar data de plantio
  const formattedDate = culture.plantingDate
    ? format(parseDateSafe(culture.plantingDate), "dd/MM/yy", { locale: ptBR })
    : 'N/A';

  // Formatar previsão de colheita
  const formattedHarvest = culture.expectedHarvestDate
    ? format(parseDateSafe(culture.expectedHarvestDate), "dd/MM/yy", { locale: ptBR })
    : 'N/A';

  // Determinar o que exibir na linha de propriedade/área
  const propertyLine = culture.plotName 
    ? `${culture.property?.name || 'Propriedade'} - ${culture.plotName}`
    : `${culture.property?.name || 'Propriedade'} - ${culture.plantingArea} ha`;

  const hasActivities = (culture.activitiesCount || 0) > 0;

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
          title={propertyLine}
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
        <InfoItem
          icon={<FiCalendar />}
          title="Previsão de colheita"
          text={formattedHarvest}
        />
      </div>

      {/* Rodapé */}
      <footer className={styles.footer}>
        <div 
          className={styles.activitiesHeader}
          onClick={() => hasActivities && setShowActivities(!showActivities)}
          style={{ cursor: hasActivities ? 'pointer' : 'default' }}
        >
          <p className={styles.activitiesCount}>
            Atividades vinculadas: {culture.activitiesCount || 0}
          </p>
          {hasActivities && (
            <span className={styles.chevron}>
              {showActivities ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </span>
          )}
        </div>
        
        {showActivities && hasActivities && culture.activities && (
          <div className={styles.activitiesList}>
            {culture.activities.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityContent}>
                  <div className={styles.activityHeader}>
                    <span className={styles.activityTitle}>{activity.titulo}</span>
                    <span className={styles.activityDate}>
                      {activity.data ? format(parseDateSafe(activity.data), "dd/MM/yy", { locale: ptBR }) : 'N/A'}
                    </span>
                  </div>
                  {activity.descricao && (
                    <p className={styles.activityDescription}>{activity.descricao}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

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
