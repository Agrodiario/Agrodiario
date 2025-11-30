// src/pages/Properties.tsx
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

const mockProperties = [
  {
    id: 1,
    name: 'Sítio Oliveira',
    location: 'Florínea (SP)',
    talhoes: [{ id: 1, name: 'Talhão 1', cultura: 'Aoba', area: 30, status: 'plantado' as 'plantado' }, {id: 5, name: 'Talhão 2', cultura: 'Aoba', area: 15, status: 'em preparo' as 'em preparo'}], // Replace with appropriate Talhao structure
    cultivo: 'Soja',
    area: 45,
    address: 'Rua Principal, 123',
    areaTotal: 50,
    areaCultivada: 45,
    cultivoPrincipal: 'Soja',
  },
  {
    id: 2,
    name: 'Sítio Oliveira',
    location: 'Florínea (SP)',
    talhoes: [{ id: 2, name: 'Talhão 1', cultura: 'Aoba', area: 30, status: 'plantado' as 'plantado' }, { id: 5, name: 'Talhão 2', cultura: 'Aoba', area: 15, status: 'em preparo' as 'em preparo'}],
    cultivo: 'Soja',
    area: 45,
    address: 'Rua Principal, 123',
    areaTotal: 50,
    areaCultivada: 45,
    cultivoPrincipal: 'Soja',
  },
  {
    id: 3,
    name: 'Sítio Oliveira',
    location: 'Florínea (SP)',
    talhoes: [{ id: 3, name: 'Talhão 1', cultura: 'Aoba', area: 30, status: 'plantado' as 'plantado' }, { id: 5, name: 'Talhão 2', cultura: 'Aoba', area: 15, status: 'em preparo' as 'em preparo'}],
    cultivo: 'Soja',
    area: 45,
    address: 'Rua Principal, 123',
    areaTotal: 50,
    areaCultivada: 45,
    cultivoPrincipal: 'Soja',
  },
  {
    id: 4,
    name: 'Sítio Oliveira',
    location: 'Florínea (SP)',
    talhoes: [{ id: 4, name: 'Talhão 1', cultura: 'Aoba', area: 30, status: 'plantado' as 'plantado' }, { id: 5, name: 'Talhão 2', cultura: 'Aoba', area: 15, status: 'em preparo' as 'em preparo' }],
    cultivo: 'Soja',
    area: 45,
    address: 'Rua Principal, 123',
    areaTotal: 50,
    areaCultivada: 45,
    cultivoPrincipal: 'Soja',
  },
  {
    id: 5,
    name: 'Sítio Oliveira',
    location: 'Florínea (SP)',
    talhoes: [{ id: 5, name: 'Talhão 1', cultura: 'Aoba', area: 30, status: 'plantado' as 'plantado' }, {id: 5, name: 'Talhão 2', cultura: 'Aoba', area: 15, status: 'em preparo' as 'em preparo'}],
    cultivo: 'Soja',
    area: 45,
    address: 'Rua Principal, 123',
    areaTotal: 50,
    areaCultivada: 45,
    cultivoPrincipal: 'Soja',
  },
];

export default function PropertiesPage() {
    const [properties, setProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch properties from API
    useEffect(() => {
      const fetchProperties = async () => {
        try {
          setIsLoading(true);
          const response = await propertyService.findAll(1, 100);

          // Transform backend properties to match frontend format
          const transformedProperties = response.data.map(prop => ({
            id: prop.id,
            name: prop.name,
            location: prop.address.split(',').slice(-2).join(',').trim(), // Extract city/state from address
            talhoes: [], // No talhoes in simplified version
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

      fetchProperties();
    }, []);

    const handleSortNewest = () => {
        console.log('Ordenando por mais recentes');
      };

      const handleSortOldest = () => {
        console.log('Ordenando por mais antigas');
      };

      const [isDrawerOpen, setIsDrawerOpen] = useState(false);
      const [selectedProperty, setselectedProperty] = useState<Property | null>(
        null
      );
    
      const handleViewProperty = (property: Property) => {
        setselectedProperty(property);
        setIsDrawerOpen(true);
      };
    
      const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setselectedProperty(null), 300); 
      };

      const handleEdit = () => {
        console.log('Editar:', selectedProperty?.id);
        // navigate(`edit/${selectedActivity?.id}`)
      };
    
      const handleDelete = () => {
        console.log('Excluir:', selectedProperty?.id);
        handleCloseDrawer(); 
      };

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Input
            label="Busque por nome da propriedade"
            name="search"
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
                onClick={handleSortNewest}
                className={styles.dropdownItem}
              >
                Mais recentes
              </button>
              <button
                onClick={handleSortOldest}
                className={styles.dropdownItem}
              >
                Mais antigas
              </button>
            </div>
          </Dropdown>
          <div></div>
          <Button variant="secondary" leftIcon={<FiDownload size={18} />} style={{ borderRadius: '32px' }} >
            Gerar relatório
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
          onView={() => handleViewProperty(prop)}/>
        ))}
      </div>

      <footer className={styles.footer}>
        <Button variant="outlined">Carregar mais</Button>
      </footer>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title="Visualizar atividade"
      >
        {selectedProperty && (
          <PropertyDetailsDrawer property={selectedProperty} onDelete={handleDelete} />
        )}
      </Drawer>
    </>
  );
}