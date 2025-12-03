// src/layouts/PropertiesLayout.tsx
import { Link, Outlet, useLocation } from 'react-router-dom';
import styles from './PropertiesLayout.module.css'; // Vamos criar este CSS
import { FiPlus } from 'react-icons/fi';

export default function PropertiesLayout() {
  const location = useLocation();

  // Oculta o botão se estivermos em 'new' ou 'edit'
  const isNewPage = location.pathname === '/properties/new';
  const isEditPage = location.pathname.startsWith('/properties/edit');
  const hideButton = isNewPage || isEditPage;

  return (
    <div className={styles.propertiesLayout}>
      <header className={styles.header}>
        <h1 className={styles.title}>Minhas propriedades</h1>
        <div className={styles.actions}>
          {!hideButton && (
            <Link to="new" className={styles.linkButton}>
              <FiPlus size={18} />
              <span>Nova propriedade</span>
            </Link>
          )}
        </div>
      </header>

      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}