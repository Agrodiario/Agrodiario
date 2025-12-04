import styles from './ProductApplications.module.css'
import { Input } from '../components/common/Input/Input';
import { useState } from 'react';
import {FiDownload, FiEdit, FiSearch, FiTrash2} from 'react-icons/fi';
import { Dropdown } from '../components/common/Dropdown/Dropdown';
import { Button } from '../components/common/Button/Button';
import { FaRegCalendarPlus } from 'react-icons/fa';
import { MdArrowDropDown } from 'react-icons/md';
import { ProductApplication } from '../types/productApplication.types.ts';
import { useNavigate } from 'react-router-dom';
import { productApplicationService } from '../services/productApplication.service.ts';
import {propertyService} from "@/services/property.service.ts";
import {generatePropertyReport} from "@/utils/generatePDF.ts";

export default function ProductApplicationsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [productApplications, setProductApplicarions] = useState<any[]>([]);
  const [selectedProductApplication, setSelectedProductApplication] = useState<ProductApplication | null>(
    null
  )

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const response = await propertyService.findAll(1, 1000, sortOrder, searchTerm);
      const textoFiltro = searchTerm ? `Busca por: "${searchTerm}"` : 'Todos os registros';
      generatePropertyReport(response.data, textoFiltro);
    } catch (error) {
      console.error('Erro ao gerar relatório de propriedades', error);
      alert('Erro ao gerar o relatório. Tente novamente.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSortChange = (newOrder: 'ASC' | 'DESC') => {
    if (newOrder === sortOrder) return;
    setSortOrder(newOrder);
    setPage(1);
    setProductApplicarions([]);
    fetchProperties(1, newOrder, searchTerm);
  };

  const handleEdit = () => {
    navigate(`/cultures/edit/${selectedProductApplication?.id}`);
  }

  const handleDelete = async () => {
    if(!selectedProductApplication) return;
    await productApplicationService.remove(selectedProductApplication.id);
    await loadProductApplications(1, sortOrder, searchTerm);
    handleCloseDrawer();
  }

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

          <Button
            variant="secondary"
            leftIcon={<FiDownload size={18} />}
            className={styles.reportButton}
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
            {productApplications.map((item: any) => (
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
                <td className={styles.cell}>{item.applicationDate}</td>
                <td className={styles.buttonGroup}>
                  <Button
                    variant={"secondary"}
                    leftIcon={<FiEdit size={18}/>}
                    onClick={() => handleEdit()}
                    style={{
                      width: "40px",
                      height: "40px",
                      padding: 0,
                      borderRadius: "50%", // deixa redondo
                    }}
                  ></Button>
                  <Button
                    variant={"quinternary"}
                    rightIcon={<FiTrash2 size={18}/>}
                    onClick={() => handleDelete()}
                    style={{
                      width: "40px",
                      height: "40px",
                      padding: 0,
                      borderRadius: "50%", // deixa redondo
                    }}
                  ></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.counter}>Mostrando 5 de 5 entradas</div>
        <div></div>
      </div>
    </div>
  )
}