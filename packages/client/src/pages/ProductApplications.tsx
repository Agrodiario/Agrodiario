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

export default function ProductApplicationsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [productApplications, setProductApplicarions] = useState<ProductApplication[]>([]);
  const [selectedProductApplication, setSelectedProductApplication] = useState<ProductApplication | null>(
    null
  )

  const handleSortChange = (newOrder: 'ASC' | 'DESC') => {
    if (newOrder === sortOrder) return;
  }

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
    <>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Input
            label="Busque por produto, cultura, status"
            name="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<FiSearch size={18} />}
            style={{ borderRadius: '128px', padding: '0.6rem 1rem', width: '95%' }}
          />
        </div>
        <div className={styles.toolbarButtons}>
          <Dropdown
            trigger={
              <Button
                variant="tertiary"
                leftIcon={<FaRegCalendarPlus size={18} />}
                rightIcon={<MdArrowDropDown size={18} />}
                style={{ borderRadius: '16px', width: 'max-content' }}
                >
                Ordenar por
              </Button>
            }
            >
            <div className={styles.dropdownMenu}>
              <button
                className={styles.dropdownItem}
                onClick={() => handleSortChange('DESC')}
                style={{ fontWeight: sortOrder === 'DESC' ? 'bold' : 'normal' }}
                >
                Mais recentes
              </button>
              <button
                className={styles.dropdownItem}
                onClick={() => handleSortChange('ASC')}
                style={{ fontWeight: sortOrder === 'ASC' ? 'bold' : 'normal' }}
                >
                Mais antigas
              </button>
            </div>
          </Dropdown>
          <div></div>
          <Button
            variant="secondary"
            leftIcon={<FiDownload size={18} />}
            style={{ borderRadius: '32px' }}
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
    </>
  )
}