import { useNavigate } from 'react-router-dom';
import styles from './CultureDetailsDrawer.module.css';
import { Button } from '../../common/Button/Button';
import { InfoBlock } from '../../common/InfoBlock/InfoBlock';
import { Culture } from '../../../types/culture.types';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import { ConfirmationModal } from '@/components/common/ConfirmationModal/ConfirmationModal';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Props = {
  culture: Culture;
  onDelete: () => void;
};

export function CultureDetailsDrawer({ culture, onDelete }: Props) {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleEdit = () => {
    navigate(`/app/cultures/edit/${culture.id}`);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setIsDeleteModalOpen(false);
  };

  // Formatar datas
  const formattedPlantingDate = culture.plantingDate
    ? format(new Date(culture.plantingDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : 'N/A';

  const formattedExpectedHarvest = culture.expectedHarvestDate
    ? format(new Date(culture.expectedHarvestDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : 'N/A';

  return (
    <div className={styles.container}>
      {/* Conteúdo Principal (com scroll) */}
      <div className={styles.mainContent}>
        {/* Seção 1: Dados da cultura */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Dados da cultura</h3>
          <InfoBlock label="Nome da cultura" value={culture.cultureName} />
          <InfoBlock label="Cultivar/Variedade" value={culture.cultivar || 'N/A'} />
          <InfoBlock label="Propriedade" value={culture.property?.name || 'N/A'} />
          <InfoBlock label="Área de plantio (hectares)" value={culture.plantingArea} />
          <InfoBlock label="Ciclo (dias)" value={culture.cycle} />
          <InfoBlock label="Status" value={culture.isActive ? 'Ativo' : 'Não ativo'} />
        </section>

        {/* Seção 2: Informações de plantio */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Informações de plantio</h3>
          <InfoBlock label="Data de plantio" value={formattedPlantingDate} />
          <InfoBlock label="Previsão de colheita" value={formattedExpectedHarvest} />
          <InfoBlock
            label="Dias decorridos"
            value={culture.daysElapsed !== undefined ? culture.daysElapsed : 'N/A'}
          />
          <InfoBlock
            label="Dias restantes"
            value={culture.daysRemaining !== undefined ? culture.daysRemaining : 'N/A'}
          />
          <InfoBlock label="Origem" value={culture.origin || 'N/A'} />
          <InfoBlock label="Fornecedor" value={culture.supplier || 'N/A'} />
        </section>

        {/* Seção 3: Observações */}
        {culture.observations && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Observações</h3>
            <p className={styles.observations}>{culture.observations}</p>
          </section>
        )}

        {/* Seção 4: Atividades vinculadas */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Atividades vinculadas</h3>
          <p className={styles.activitiesInfo}>
            {culture.activitiesCount || 0} atividade(s) vinculada(s) a esta cultura.
          </p>
        </section>
      </div>

      {/* Rodapé Fixo */}
      <footer className={styles.footer}>
        <Button
          variant="tertiary"
          leftIcon={<FiTrash2 />}
          onClick={() => setIsDeleteModalOpen(true)}
        >
          Excluir
        </Button>
        <Button variant="primary" leftIcon={<FiEdit2 />} onClick={handleEdit}>
          Editar
        </Button>
      </footer>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir cultura"
      >
        Tem certeza que deseja excluir esta cultura? Esta ação não pode ser desfeita.
      </ConfirmationModal>
    </div>
  );
}
