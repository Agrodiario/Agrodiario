import { Button } from "../components/common/Button/Button";
import { Input } from "../components/common/Input/Input";
import { Dropdown } from "../components/common/Dropdown/Dropdown";
import { PropertyCard } from "../components/properties/PropertyCard";
import styles from "./Properties.module.css";
import { FiSearch, FiDownload } from "react-icons/fi";
import { FaRegCalendarPlus } from "react-icons/fa";
import { MdArrowDropDown } from "react-icons/md";
import { Drawer } from "@/components/common/Drawer/Drawer";
import { useState, useEffect } from "react";
import { Property } from "@/components/properties/PropertyDetailsDrawer/PropertyDetailsDrawer";
import { PropertyDetailsDrawer } from "@/components/properties/PropertyDetailsDrawer/PropertyDetailsDrawer";
import { propertyService } from "../services/property.service";
import { generatePropertyReport } from "@/utils/generatePDF";

const ITEMS_PER_PAGE = 6; // Igual ao diary

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortOrder, setSortOrder] = useState<"DESC" | "ASC">("DESC");

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );

  const fetchProperties = async (
    pageToLoad: number,
    orderToLoad: "ASC" | "DESC",
    searchToLoad: string,
  ) => {
    try {
      if (pageToLoad === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await propertyService.findAll(
        pageToLoad,
        ITEMS_PER_PAGE,
        orderToLoad,
        searchToLoad,
      );

      const transformedProperties = response.data.map((prop) => ({
        id: prop.id,
        name: prop.name,
        location: prop.address.split(",").slice(-2).join(",").trim(),
        plots: prop.plots || [],
        cultivo: prop.mainCrop,
        area: prop.productionArea,
        address: prop.address,
        areaTotal: prop.totalArea,
        areaCultivada: prop.productionArea,
        cultivoPrincipal: prop.mainCrop,
      }));

      if (pageToLoad === 1) {
        setProperties(transformedProperties);
      } else {
        setProperties((prev) => [...prev, ...transformedProperties]);
      }
      setTotal(response.total || response.data.length);
    } catch (err: any) {
      console.error("Erro ao carregar propriedades:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const response = await propertyService.findAll(
        1,
        1000,
        sortOrder,
        searchTerm,
      );
      const textoFiltro = searchTerm
        ? `Busca por: "${searchTerm}"`
        : "Todos os registros";
      generatePropertyReport(response.data, textoFiltro);
    } catch (error) {
      console.error("Erro ao gerar relatório de propriedades", error);
      alert("Erro ao gerar o relatório. Tente novamente.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSortChange = (newOrder: "ASC" | "DESC") => {
    if (newOrder === sortOrder) return;
    setSortOrder(newOrder);
    setPage(1);
    setProperties([]);
    fetchProperties(1, newOrder, searchTerm);
  };

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedProperty(null), 300);
  };

  const handleDelete = async () => {
    if (!selectedProperty) return;
    await propertyService.remove(selectedProperty.id);
    await fetchProperties(1, sortOrder, searchTerm);
    handleCloseDrawer();
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProperties(nextPage, sortOrder, searchTerm);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchProperties(1, sortOrder, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    fetchProperties(1, sortOrder, searchTerm);
  }, []);

  const hasMore = properties.length < total;

  return (
    <div className={styles.propertiesPage}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Input
            label="Busque por nome da propriedade"
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
                onClick={() => handleSortChange("DESC")}
                style={{
                  fontWeight: sortOrder === "DESC" ? "bold" : "normal",
                  backgroundColor:
                    sortOrder === "DESC"
                      ? "var(--color-bg-light)"
                      : "transparent",
                }}
              >
                Mais recentes
              </button>
              <button
                className={styles.dropdownItem}
                onClick={() => handleSortChange("ASC")}
                style={{
                  fontWeight: sortOrder === "ASC" ? "bold" : "normal",
                  backgroundColor:
                    sortOrder === "ASC"
                      ? "var(--color-bg-light)"
                      : "transparent",
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
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
          >
            <span className={styles.buttonText}>
              {isGeneratingReport ? "Gerando..." : "Gerar relatório"}
            </span>
          </Button>
        </div>
      </div>

      {/* Estados de loading e empty state iguais ao diary */}
      <div className={styles.grid}>
        {loading && page === 1 ? (
          <div className={styles.loadingContainer}>
            <p>Carregando propriedades...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Nenhuma propriedade encontrada.</p>
            {searchTerm && <p>Tente ajustar os termos da busca.</p>}
          </div>
        ) : (
          properties.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onView={() => handleViewProperty(prop)}
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
            {loadingMore ? "Carregando..." : "Carregar mais"}
          </Button>
        )}

        {/* Mensagem quando acaba */}
        {!hasMore && properties.length > 0 && (
          <span className={styles.endMessage}>
            Você chegou ao fim da lista.
          </span>
        )}
      </footer>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title="Visualizar propriedade"
      >
        {selectedProperty && (
          <PropertyDetailsDrawer
            property={selectedProperty}
            onDelete={handleDelete}
          />
        )}
      </Drawer>
    </div>
  );
}
