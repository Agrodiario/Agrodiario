// src/components/properties/PropertyDetailsDrawer/PropertyDetailsDrawer.tsx
import { useNavigate } from 'react-router-dom';
import styles from './PropertyDetailsDrawer.module.css';
import { Button } from '../../common/Button/Button';
import { InfoBlock } from '../../common/InfoBlock/InfoBlock'; // Importe o novo InfoBlock
import { TalhaoCard } from '../TalhaoCard/TalhaoCard';
import { FiTrash2, FiEdit2, FiMap, FiPlus } from 'react-icons/fi';
import { ConfirmationModal } from '@/components/common/ConfirmationModal/ConfirmationModal';
import { useState } from 'react';
import { Plot } from '@/types/property.types';

export type Property = {
  id: string;
  name: string;
  address: string;
  areaTotal: number;
  areaCultivada: number;
  cultivoPrincipal: string;
  plots?: Plot[];
};

type Props = {
  property: Property;
  onDelete: () => void;
};

export function PropertyDetailsDrawer({ property, onDelete }: Props) {
  const navigate = useNavigate();

  // 3. Estado para controlar o modal de exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleEdit = () => {
    navigate(`/properties/edit/${property.id}`);
  };

  const handleAddTalhao = () => {
    console.log('Adicionar novo talhão:', property.id);
  };

  // 4. Handler para confirmar a exclusão
  const handleConfirmDelete = () => {
    onDelete(); // Chama a função que realmente exclui (vinda do componente pai)
    setIsDeleteModalOpen(false); // Fecha o modal
  };

  return (
    <div className={styles.container}>
      {/* Conteúdo Principal (com scroll) */}
      <div className={styles.mainContent}>
        
        {/* Seção 1: Dados da propriedade */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Dados da propriedade</h3>
          <InfoBlock label="Nome da propriedade" value={property.name} />
          <InfoBlock label="Endereço (estrada, município, estado)" value={property.address} />
          <InfoBlock label="Área total (hectares)" value={property.areaTotal} />
          <InfoBlock label="Área cultivada (hectares)" value={property.areaCultivada} />
          <InfoBlock label="Tipo de cultivo principal" value={property.cultivoPrincipal} />
          
          <Button variant="quaternary" leftIcon={<FiMap />} style={{ width: '100%' }}>
            Ver mapa
          </Button>
        </section>

        {/* Seção 2: Talhões */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Talhões</h3>

          {!property.plots || property.plots.length === 0 ? (
            // Estado Vazio
            <p className={styles.emptyState}>
              Nenhum talhão cadastrado. Que tal adicionar?
            </p>
          ) : (
            // Lista de Talhões
            <div className={styles.talhoesList}>
              {property.plots.map((plot, index) => (
                <TalhaoCard
                  key={index}
                  talhao={{
                    id: index,
                    name: plot.name,
                    cultura: plot.culture,
                    area: plot.area,
                    status: plot.situacao === 'preparo' ? 'em preparo' : plot.situacao === 'producao' ? 'plantado' : 'colhido',
                  }}
                />
              ))}
            </div>
          )}

          {/* Botão "Adicionar novo talhão" */}
          <button className={styles.addTalhaoButton} onClick={handleAddTalhao}>
            <FiPlus /> Adicionar novo talhão
          </button>
        </section>
      </div>

      {/* Rodapé Fixo */}
      <footer className={styles.footer}>
        <Button variant="tertiary" leftIcon={<FiTrash2 />} onClick={() => setIsDeleteModalOpen(true)}>
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
        title="Excluir propriedade"
      >
        Tem certeza que deseja excluir esta propriedade?
      </ConfirmationModal>
    </div>
  );
}