import { Button } from '../components/common/Button/Button';
import { Input } from '../components/common/Input/Input';
import { Dropdown } from '../components/common/Dropdown/Dropdown';
import { PropertyCard } from '../components/properties/PropertyCard';
import styles from './Properties.module.css';
import { FiSearch, FiDownload } from 'react-icons/fi';
import { FaRegCalendarPlus } from 'react-icons/fa';
import { MdArrowDropDown } from 'react-icons/md';
import { Drawer } from '@/components/common/Drawer/Drawer';
import { useState, useEffect } from 'react';
import { Property } from '@/components/properties/PropertyDetailsDrawer/PropertyDetailsDrawer';
import { PropertyDetailsDrawer } from '@/components/properties/PropertyDetailsDrawer/PropertyDetailsDrawer';
import { propertyService } from '../services/property.service';
import { generatePropertyReport } from '@/utils/generatePDF'; // Importação da função de geração de relatório
const ITEMS_PER_PAGE = 10; 

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC'>('DESC'); // DESC por padrão (Mais recentes)
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProperty, setselectedProperty] = useState<Property | null>(null);
  
  const fetchProperties = async (search: string, order: 'ASC' | 'DESC') => {
    try {
      setIsLoading(true);
      const response = await propertyService.findAll(1, ITEMS_PER_PAGE, order, search); 

      const transformedProperties = response.data.map(prop => ({
          id: prop.id,
          name: prop.name,
          location: prop.address.split(',').slice(-2).join(',').trim(), 
          talhoes: [], 
          cultivo: prop.mainCrop,
          area: prop.productionArea,
          address: prop.address,
          areaTotal: prop.totalArea,
          areaCultivada: prop.productionArea,
          cultivoPrincipal: prop.mainCrop,
      }));

      setProperties(transformedProperties);
    } catch (err: any) {
      console.error('Erro ao carregar propriedades:', err);
      setError(err.message || 'Erro ao carregar propriedades');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);

      const response = await propertyService.findAll(1, 10000, sortOrder, searchTerm);
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
  };

  const handleViewProperty = (property: Property) => {
    setselectedProperty(property);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setselectedProperty(null), 300);
  };

  const handleDelete = () => {
    console.log('Excluir:', selectedProperty?.id);
    // Adicionar a lógica real de exclusão aqui e recarregar a lista:
    // await propertyService.remove(selectedProperty.id);
    // fetchProperties(searchTerm, sortOrder); 
    handleCloseDrawer();
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProperties(searchTerm, sortOrder);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, sortOrder]);


  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Input
            label="Busque por nome da propriedade"
            name="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<FiSearch size={18} />}
            style={{ borderRadius: '128px', padding: '0.6rem 1rem', width: '95%' }}
          />
        </div>
        <div className={styles.toolbarButtons} >
          <Dropdown
            trigger={
              <Button variant="tertiary" leftIcon={<FaRegCalendarPlus size={18} />} rightIcon={<MdArrowDropDown size={18} />} style={{ borderRadius: '16px', width: 'max-content' }} >
                Ordenar por
              </Button>
            }
          >
            <div className={styles.dropdownMenu}>
              <button
                onClick={() => handleSortChange('DESC')}
                className={styles.dropdownItem}
                style={{ fontWeight: sortOrder === 'DESC' ? 'bold' : 'normal' }}
              >
                Mais recentes
              </button>
              <button
                onClick={() => handleSortChange('ASC')}
                className={styles.dropdownItem}
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
            onClick={handleGenerateReport} 
            disabled={isGeneratingReport} 
          >
            {isGeneratingReport ? 'Gerando...' : 'Gerar relatório'}
          </Button>
        </div>
      </div>

      <div className={styles.grid}>
        {isLoading && <p>Carregando propriedades...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!isLoading && !error && properties.length === 0 && (
          <p>Nenhuma propriedade cadastrada. Crie sua primeira propriedade!</p>
        )}
        {!isLoading && !error && properties.map((prop) => (
          <PropertyCard key={prop.id} property={prop}
            onView={() => handleViewProperty(prop)} />
        ))}
      </div>

      <footer className={styles.footer}>
        <Button variant="quaternary" disabled>Carregar mais</Button> 
      </footer>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title="Visualizar propriedade"
      >
        {selectedProperty && (
          <PropertyDetailsDrawer property={selectedProperty} onDelete={handleDelete} />
        )}
      </Drawer>
    </>
  );
}