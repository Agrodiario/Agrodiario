import { Product } from 'src/types/product.types.ts';
import { FiCheck, FiX } from 'react-icons/fi';
import styles from './ProductCardList.module.css';

interface ProductCardListProps {
  products: Product[];
  value?: string;
  onSelect: (product: Product) => void;
}

export function ProductCardList({ products, value, onSelect }: ProductCardListProps) {
  if (products.length === 0) return <div className={styles.emptyMessage}>Nenhum produto encontrado.</div>;

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <div
          key={product.registrationNumber}
          className={`${styles.card} ${value === product.registrationNumber ? styles.selected : ''}`}
          onClick={() => onSelect(product)}
        >
          <h4>{product.commercialNames[0]}</h4>
          <p>{product.categories[0]}</p>
          <p
            className={`${styles.status} ${
              product.organicFarmingProduct ? styles.allowed : styles.denied
            }`}> {product.organicFarmingProduct ? (
            <>
              <FiCheck className={styles.icon} />
              Permitido em sistemas orgânicos
            </> ) : ( <>
              <FiX className={styles.icon} />
              Não permitido em sistemas orgânicos
          </> )
          } </p>
        </div>
      ))}
    </div>
  )
}