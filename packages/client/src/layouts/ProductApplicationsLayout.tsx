import {Link, Outlet, useLocation} from 'react-router-dom';
import styles from './ProductApplicationsLayout.module.css'
import {FiPlus} from 'react-icons/fi';

export default function ProductApplicationsLayout() {
  const location = useLocation();

  const isNewPage = location.pathname == '/products/new';
  const isEditPage = location.pathname.startsWith('/products/edit');
  const hideButton = isNewPage || isEditPage;

  return (
    <div className={styles.productApplicationsLayout}>
      <header className={styles.header}>
        <h1 className={styles.title}>Aplicações de produtos</h1>
        <div className={styles.actions}>
          {!hideButton && (
            <Link to="new" className={styles.primaryButton}>
              <FiPlus size={18} />
              <span>Nova aplicação</span>
            </Link>
          )}
        </div>
      </header>

      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}