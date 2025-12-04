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
import { generateCultureReport } from '@/utils/generatePDF';

const ITEMS_PER_PAGE = 6; // Igual ao diary

export default function CulturesPage() {
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null);

  const fetchCultures = async (
    pageToLoad: number, 
    searchToLoad: string, 
    sortByToLoad: string, 
    orderToLoad: 'ASC' | 'DESC'
  ) => {
    try {
      if (pageToLoad === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await cultureService.findAll(
        pageToLoad,
        ITEMS_PER_PAGE,
        searchToLoad || undefined,
        sortByToLoad || undefined,
        orderToLoad
      );

      if (pageToLoad === 1) {
        setCultures(response.data);
      } else {
        setCultures((prev) => [...prev, ...response.data]);
      }
      setTotal(response.total || response.data.length);
    } catch (err: any) {
      console.error('Erro ao carregar culturas:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === 'ASC' ? 'DESC' : 'ASC';
    
    setSortBy(field);
    setSortOrder(newOrder);
    setPage(1);
    setCultures([]);
    
    fetchCultures(1, searchTerm, field, newOrder);
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
      fetchCultures(1, searchTerm, sortBy, sortOrder);
    } catch (err: any) {
      console.error('Erro ao excluir cultura:', err);
      alert('Erro ao excluir cultura');
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);

      const response = await cultureService.findAll(
        1,
        1000,
        searchTerm || undefined,
        sortBy || undefined,
        sortOrder
      );

      const textoFiltro = searchTerm
        ? `Busca por: "${searchTerm}"`
        : sortBy
          ? `Ordenado por: ${sortBy} (${sortOrder === 'ASC' ? 'Crescente' : 'Decrescente'})`
          : 'Todas as culturas';

      await generateCultureReport(response.data, textoFiltro);

    } catch (error) {
      console.error('Erro ao gerar relatório', error);
      alert('Erro ao gerar o relatório. Tente novamente.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCultures(nextPage, searchTerm, sortBy, sortOrder);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      setCultures([]);
      fetchCultures(1, searchTerm, sortBy, sortOrder);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    fetchCultures(1, searchTerm, sortBy, sortOrder);
  }, []);

  const hasMore = cultures.length < total;

  return (
    <div className={styles.culturesPage}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Input
            label="Busque por cultura, variedade ou propriedade"
            name="search"
            value={searchTerm}
            onChange={handleSearchChange}
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
                onClick={() => handleSort('plantingDate')}
                className={styles.dropdownItem}
                style={{ 
                  fontWeight: sortBy === 'plantingDate' ? 'bold' : 'normal',
                  backgroundColor: sortBy === 'plantingDate' ? 'var(--color-bg-light)' : 'transparent'
                }}
              >
                Data de plantio {sortBy === 'plantingDate' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('cultureName')}
                className={styles.dropdownItem}
                style={{ 
                  fontWeight: sortBy === 'cultureName' ? 'bold' : 'normal',
                  backgroundColor: sortBy === 'cultureName' ? 'var(--color-bg-light)' : 'transparent'
                }}
              >
                Nome da cultura {sortBy === 'cultureName' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('plantingArea')}
                className={styles.dropdownItem}
                style={{ 
                  fontWeight: sortBy === 'plantingArea' ? 'bold' : 'normal',
                  backgroundColor: sortBy === 'plantingArea' ? 'var(--color-bg-light)' : 'transparent'
                }}
              >
                Área de plantio {sortBy === 'plantingArea' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('propertyName')}
                className={styles.dropdownItem}
                style={{ 
                  fontWeight: sortBy === 'propertyName' ? 'bold' : 'normal',
                  backgroundColor: sortBy === 'propertyName' ? 'var(--color-bg-light)' : 'transparent'
                }}
              >
                Nome da propriedade {sortBy === 'propertyName' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('cycle')}
                className={styles.dropdownItem}
                style={{ 
                  fontWeight: sortBy === 'cycle' ? 'bold' : 'normal',
                  backgroundColor: sortBy === 'cycle' ? 'var(--color-bg-light)' : 'transparent'
                }}
              >
                Ciclo {sortBy === 'cycle' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('daysRemaining')}
                className={styles.dropdownItem}
                style={{ 
                  fontWeight: sortBy === 'daysRemaining' ? 'bold' : 'normal',
                  backgroundColor: sortBy === 'daysRemaining' ? 'var(--color-bg-light)' : 'transparent'
                }}
              >
                Dias restantes {sortBy === 'daysRemaining' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('daysElapsed')}
                className={styles.dropdownItem}
                style={{ 
                  fontWeight: sortBy === 'daysElapsed' ? 'bold' : 'normal',
                  backgroundColor: sortBy === 'daysElapsed' ? 'var(--color-bg-light)' : 'transparent'
                }}
              >
                Dias decorridos {sortBy === 'daysElapsed' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </button>
            </div>
          </Dropdown>

          <Button
            variant="secondary"
            leftIcon={<FiDownload size={18} />}
            className={styles.reportButton}
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
          >
            <span className={styles.buttonText}>
              {isGeneratingReport ? 'Gerando...' : 'Gerar relatório'}
            </span>
          </Button>
        </div>
      </div>

      {/* Estados de loading e empty state iguais ao diary */}
      <div className={styles.grid}>
        {loading && page === 1 ? (
          <div className={styles.loadingContainer}>
            <p>Carregando culturas...</p>
          </div>
        ) : cultures.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Nenhuma cultura encontrada.</p>
            {searchTerm && (
              <p>Tente ajustar os termos da busca.</p>
            )}
          </div>
        ) : (
          cultures.map((culture) => (
            <CultureCard
              key={culture.id}
              culture={culture}
              onView={() => handleViewCulture(culture)}
            />
          ))
        )}
      </div>

      <footer className={styles.footer}>
        {hasMore && (
          <Button 
            variant="quaternary" 
            className={styles.loadMoreButton}
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Carregando...' : 'Carregar mais'}
          </Button>
        )}
        
        {/* Mensagem quando acaba */}
        {!hasMore && cultures.length > 0 && (
          <span className={styles.endMessage}>
            Você chegou ao fim da lista.
          </span>
        )}
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
    </div>
  );
}