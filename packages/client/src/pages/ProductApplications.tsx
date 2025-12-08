import styles from './ProductApplications.module.css'
import { Input } from '../components/common/Input/Input';
import { useEffect, useState, useCallback } from 'react';
import { FiDownload, FiEdit, FiSearch, FiTrash2 } from 'react-icons/fi';
import { Dropdown } from '../components/common/Dropdown/Dropdown';
import { Button } from '../components/common/Button/Button';
import { FaRegCalendarPlus } from 'react-icons/fa';
import { MdArrowDropDown } from 'react-icons/md';
import { ProductApplication } from '../types/productApplication.types.ts';
import { useNavigate } from 'react-router-dom';
import { productApplicationService } from '../services/productApplication.service.ts';
import { ConfirmationModal } from '../components/common/ConfirmationModal/ConfirmationModal.tsx';

export interface PaginatedProductApplications {
  data: ProductApplication[];
  page: number;
  lastPage: number;
}

export default function ProductApplicationsPage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  // const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const pageNumbers = Array.from({ length: lastPage }, (_, i) => i + 1);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [productApplications, setProductApplications] = useState<ProductApplication[]>([]);
  const [selectedProductApplication, setSelectedProductApplication] = useState<ProductApplication | null>(
    null
  );

  // Se não está usando a função, remova ou comente
  /*
  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);

      const response = await productApplicationService.findAll(
        1,
        1000,
        // sortOrder,
        // searchTerm
      );
      const textoFiltro = searchTerm ? `Busca por: "${searchTerm}"` : 'Todos os registros';
      // generateReport(response.data, textoFiltro);
    } catch (error) {
      console.error('Erro ao gerar relatório', error);
      alert('Erro ao gerar o relatório. Tente novamente.');
    } finally {
      setIsGeneratingReport(false);
    }
  };
  */

  const fetchProductApplications = useCallback(async (page: number, order: 'ASC' | 'DESC') => {
    const response = await productApplicationService.findAll(page, 5, order, '');
    setProductApplications(response.data);
    setPage(response.page);
    setLastPage(response.lastPage);
  }, []);

  const handleSortChange = (order: 'ASC' | 'DESC') => {
    setSortOrder(order);
    setPage(1);
    fetchProductApplications(1, order);
  };

  // EDITAR
  const handleEdit = (id: string) => {
    console.log("Aqui!!")
    console.log(selectedProductApplication);
    navigate(`/products/edit/${id}`);
  }

  // DELETAR
  const handleConfirmDelete = (item: ProductApplication) => {
    setSelectedProductApplication(item);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProductApplication) return;

    try {
      await productApplicationService.remove(selectedProductApplication.id);
      // Defina tipos explicitamente para os parâmetros
      setProductApplications(prev => 
        prev.filter((item: ProductApplication) => item.id !== selectedProductApplication.id)
      );
      setSelectedProductApplication(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert('Erro ao excluir');
    }
  }

  // BUSCA LISTA PAGINADA DE APLICAÇÕES
  useEffect(() => {
    fetchProductApplications(page, sortOrder);
  }, [page, fetchProductApplications, sortOrder]);

  return (
    <div className={styles.applicationPage}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Input
            label="Busque por produto, cultura, status"
            name="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<FiSearch size={18} />}
          />
        </div>

        <div className={styles.toolbarButtons}>
          <Dropdown
            trigger={
              <Button
                variant="tertiary"
                leftIcon={<FaRegCalendarPlus size={18} />}
                rightIcon={<MdArrowDropDown size={18} />}
                className={styles.sortButton}
              >
                <span className={styles.buttonText}>Ordenar por</span>
              </Button>
            }
            >
            <div className={styles.dropdownMenu}>
              <button
                className={styles.dropdownItem}
                onClick={() => handleSortChange('DESC')}
                style={{
                  fontWeight: sortOrder === 'DESC' ? 'bold' : 'normal',
                  backgroundColor: sortOrder === 'DESC' ? 'var(--color-bg-light)' : 'transparent'
                }}
                >
                Mais recentes
              </button>
              <button
                className={styles.dropdownItem}
                onClick={() => handleSortChange('ASC')}
                style={{
                  fontWeight: sortOrder === 'ASC' ? 'bold' : 'normal',
                  backgroundColor: sortOrder === 'ASC' ? 'var(--color-bg-light)' : 'transparent'
                }}
              >
                Mais antigas
              </button>
            </div>
          </Dropdown>

          {/* Botão de relatório - adicione onClick se for usar */}
          <Button
            variant="secondary"
            leftIcon={<FiDownload size={18} />}
            className={styles.reportButton}
            // onClick={handleGenerateReport} // Descomente se for usar
            >
            Gerar relatório
          </Button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.headerCell}>Produto</th>
              <th className={styles.headerCell}>Princípio Ativo</th>
              <th className={styles.headerCell}>Tipo</th>
              <th className={styles.headerCell}>Status</th>
              <th className={styles.headerCell}>Data Aplicação</th>
              <th className={styles.headerCell}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {productApplications.map((item: ProductApplication) => (
              <tr key={item.id} className={styles.row}>
                <td className={styles.cell}>{item.productName}</td>
                <td className={styles.cell}>{item.product.activeIngredients[0]}</td>
                <td className={styles.cell}>{item.product.categories[0]}</td>
                <td>
                  <div
                    className={`${styles.status} ${
                      item.product.organicFarmingProduct ? styles.allowed : styles.denied
                    }`}>
                    {item.product.organicFarmingProduct ? "Permitido" : "Proibido"}
                  </div>
                </td>
                <td className={styles.cell}>
                  {new Date(item.applicationDate).toLocaleDateString("pt-BR")}
                </td>
                <td className={styles.buttonGroup}>
                  <Button
                    variant={"secondary"}
                    leftIcon={<FiEdit size={18}/>}
                    onClick={() => handleEdit(item.id)}
                    style={{
                      width: "40px",
                      height: "40px",
                      padding: 0,
                      borderRadius: "50%",
                    }}
                  ></Button>
                  <Button
                    variant={"quinternary"}
                    rightIcon={<FiTrash2 size={18}/>}
                    onClick={() => handleConfirmDelete(item)}
                    style={{
                      width: "40px",
                      height: "40px",
                      padding: 0,
                      borderRadius: "50%",
                    }}
                  ></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* MODAL DE CONFIRMAÇÃO FORA DO MAP */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Excluir cultura"
        >
          Tem certeza de que deseja excluir esse registro?
        </ConfirmationModal>
        
        <div className={styles.pagination}>
          {pageNumbers.map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={num === page ? styles.activePage : ''}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}