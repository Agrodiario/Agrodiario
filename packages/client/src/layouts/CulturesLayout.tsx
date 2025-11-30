import { Outlet, Link, useLocation } from 'react-router-dom';
import styles from './CulturesLayout.module.css';
import { FiPlus } from 'react-icons/fi';

export default function CulturesLayout() {
  const location = useLocation();

  // Oculta o botão se estivermos em 'new' ou 'edit'
  const isNewPage = location.pathname === '/app/cultures/new';
  const isEditPage = location.pathname.startsWith('/app/cultures/edit');
  const hideButton = isNewPage || isEditPage;

  return (
    <div className={styles.culturesLayout}>
      <header className={styles.header}>
        <h1 className={styles.title}>Minhas culturas</h1>
        <div className={styles.actions}>
          {!hideButton && (
            <Link to="new" className={styles.linkButton}>
              <FiPlus size={18} />
              <span>Novo cultura</span>
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
