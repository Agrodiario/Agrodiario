import { Product } from "src/types/product.types.ts";
import { FiCheck } from "react-icons/fi";
import styles from "./ProductCardList.module.css";

interface ProductCardListProps {
  products: Product[];
  value?: string;
  onSelect: (product: Product) => void;
}

export function ProductCardList({
  products,
  value,
  onSelect,
}: ProductCardListProps) {
  if (products.length === 0)
    return (
      <div className={styles.emptyMessage}>Nenhum produto encontrado.</div>
    );

  return (
    <div className={styles.list}>
      {products.map((product) => (
        <div
          key={product.registrationNumber}
          className={`${styles.item} ${value === product.registrationNumber ? styles.selected : ""}`}
          onClick={() => onSelect(product)}
        >
          <div className={styles.itemContent}>
            <div className={styles.itemHeader}>
              <span className={styles.itemTitle}>
                {product.commercialNames[0]}
              </span>
              {product.organicFarmingProduct && (
                <FiCheck
                  className={styles.organicIcon}
                  title="Permitido em sistemas orgânicos"
                />
              )}
            </div>
            <span className={styles.itemCategory}>{product.categories[0]}</span>
          </div>
          {value === product.registrationNumber && (
            <FiCheck className={styles.checkIcon} />
          )}
        </div>
      ))}
    </div>
  );
}
