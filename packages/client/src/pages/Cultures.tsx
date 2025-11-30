import { Button } from '../components/common/Button/Button';
import { Input } from '../components/common/Input/Input';
import { Dropdown } from '../components/common/Dropdown/Dropdown';
import { CultureCard } from '../components/cultures/CultureCard';
import styles from './Cultures.module.css';
import { FiSearch, FiDownload } from 'react-icons/fi';
import { FaRegCalendarPlus } from 'react-icons/fa';
import { MdArrowDropDown } from 'react-icons/md';
import { Drawer } from '@/components/common/Drawer/Drawer';
import { useState, useEffect } from 'react';
import { Culture } from '@/types/culture.types';
import { CultureDetailsDrawer } from '@/components/cultures/CultureDetailsDrawer/CultureDetailsDrawer';
import { cultureService } from '../services/culture.service';
import { useNavigate } from 'react-router-dom';

export default function CulturesPage() {
  const navigate = useNavigate();
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null);

  // Fetch cultures from API
  useEffect(() => {
    fetchCultures();
  }, [searchTerm, sortBy, sortOrder]);

  const fetchCultures = async () => {
    try {
      setIsLoading(true);
      const response = await cultureService.findAll(
        1,
        100,
        searchTerm || undefined,
        sortBy || undefined,
        sortOrder
      );
      setCultures(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar culturas:', err);
      setError(err.message || 'Erro ao carregar culturas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const handleViewCulture = (culture: Culture) => {
    setSelectedCulture(culture);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedCulture(null), 300);
  };

  const handleDelete = async () => {
    if (!selectedCulture) return;

    try {
      await cultureService.remove(selectedCulture.id);
      handleCloseDrawer();
      fetchCultures(); // Refresh list
    } catch (err: any) {
      console.error('Erro ao excluir cultura:', err);
      alert('Erro ao excluir cultura');
    }
  };

  const handleNewCulture = () => {
    navigate('/app/cultures/new');
  };

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Input
            label="Busque por cultura, variedade ou propriedade"
            name="search"
            value={searchTerm}
            onChange={handleSearchChange}
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
                onClick={() => handleSort('plantingDate')}
                className={styles.dropdownItem}
              >
                Data de plantio
              </button>
              <button
                onClick={() => handleSort('cultureName')}
                className={styles.dropdownItem}
              >
                Nome da cultura
              </button>
              <button
                onClick={() => handleSort('plantingArea')}
                className={styles.dropdownItem}
              >
                Área de plantio
              </button>
              <button
                onClick={() => handleSort('propertyName')}
                className={styles.dropdownItem}
              >
                Nome da propriedade
              </button>
              <button
                onClick={() => handleSort('cycle')}
                className={styles.dropdownItem}
              >
                Ciclo
              </button>
              <button
                onClick={() => handleSort('daysRemaining')}
                className={styles.dropdownItem}
              >
                Dias restantes
              </button>
              <button
                onClick={() => handleSort('daysElapsed')}
                className={styles.dropdownItem}
              >
                Dias decorridos
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

      <div className={styles.grid}>
        {isLoading && <p>Carregando culturas...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!isLoading && !error && cultures.length === 0 && (
          <p>Nenhuma cultura cadastrada. Crie sua primeira cultura!</p>
        )}
        {!isLoading &&
          !error &&
          cultures.map((culture) => (
            <CultureCard
              key={culture.id}
              culture={culture}
              onView={() => handleViewCulture(culture)}
            />
          ))}
      </div>

      <footer className={styles.footer}>
        <Button variant="outlined">Carregar mais</Button>
      </footer>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title="Visualizar cultura"
      >
        {selectedCulture && (
          <CultureDetailsDrawer culture={selectedCulture} onDelete={handleDelete} />
        )}
      </Drawer>
    </>
  );
}