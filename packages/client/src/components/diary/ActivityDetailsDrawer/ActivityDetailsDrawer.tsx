// src/components/diary/ActivityDetailsDrawer/ActivityDetailsDrawer.tsx
import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ActivityDetailsDrawer.module.css';
import { Button } from '../../common/Button/Button';
import { TagToggle } from '../../common/TagToggle/TagToggle';
import { ConfirmationModal } from '../../common/ConfirmationModal/ConfirmationModal';
import { FiTrash2, FiEdit2, FiEye } from 'react-icons/fi';
import { UPLOADS_URL } from '../../../config/api.client'; 
import { BsCalendar4Event } from 'react-icons/bs';
import { InfoBlock } from '@/components/common/InfoBlock/InfoBlock';
import { RiHome8Line } from 'react-icons/ri';

type Activity = {
  id: string;
  date: string;
  propriedade: string;
  tipo: string; 
  descricao: string;
  responsavel: string;
  insumoNome?: string;
  insumoQuantidade?: string;
  insumoUnidade?: string;
  anexos?: string[];
};

type Props = {
  activity: Activity;
  onDelete: () => void;
};


export function ActivityDetailsDrawer({ activity, onDelete }: Props) {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const getTagColor = (type: string) => {
    const normalizedType = type.toLowerCase();
    if (normalizedType.includes('preparo')) return 'red';
    if (normalizedType.includes('aplicacao') || normalizedType.includes('aplicação')) return 'blue';
    if (normalizedType.includes('colheita')) return 'green';
    if (normalizedType.includes('manejo')) return 'orange';
    return 'red';
  };

  const handleEditClick = () => {
    navigate(`/diary/edit/${activity.id}`);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setIsDeleteModalOpen(false);
  };

  const handleViewAnexo = (fileName: string) => {
    window.open(`${UPLOADS_URL}/${fileName}`, '_blank');
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Detalhes da atividade</h3>
          <InfoBlock label="Data da atividade" value={new Date(activity.date).toLocaleDateString('pt-BR')} icon={<BsCalendar4Event color='#006a35' />}/>
          <InfoBlock label="Propriedade associada" value={activity.propriedade} icon={<RiHome8Line color='#006a35' size={18} />} />
          
          <div className={styles.infoBlock}>
            <InfoBlock label="Tipo de atividade" element={
              <TagToggle
                color={getTagColor(activity.tipo)}
                isActive={true}
                style={{ cursor: 'default' }}
              >
                {activity.tipo}
              </TagToggle>
            } />
          </div>
          
          <InfoBlock label="Descrição" value={activity.descricao} />
          <InfoBlock label="Responsável" value={activity.responsavel} />
        </section>

        {activity.insumoNome && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Insumos Utilizados</h3>
            <InfoBlock label="Produto" value={activity.insumoNome} />
            <InfoBlock 
              label="Quantidade" 
              value={`${activity.insumoQuantidade || ''} ${activity.insumoUnidade || ''}`} 
            />
          </section>
        )}

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Anexos</h3>
          
          {(!activity.anexos || activity.anexos.length === 0) && (
            <p style={{ color: '#667085', fontSize: '0.9rem' }}>Nenhum anexo.</p>
          )}

          {activity.anexos?.map((fileName, index) => (
            console.log('Anexo:', activity.anexos), (
            <div key={index} className={styles.anexoItem}>
              <span className={styles.fileName} title={fileName}>
                {fileName}
              </span>
              <button 
                onClick={() => handleViewAnexo(fileName)} 
                className={styles.viewButton}
                title="Visualizar"
              >
                <FiEye size={18} />
              </button>
            </div>
          )))}
        </section>
      </div>

      <footer className={styles.footer}>
        <Button variant="tertiary" leftIcon={<FiTrash2 />} onClick={() => setIsDeleteModalOpen(true)}>
          Excluir
        </Button>
        <Button variant="primary" leftIcon={<FiEdit2 />} onClick={handleEditClick}>
          Editar
        </Button>
      </footer>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir atividade"
      >
        Tem certeza que deseja excluir esta atividade?
      </ConfirmationModal>
    </div>
  );
}