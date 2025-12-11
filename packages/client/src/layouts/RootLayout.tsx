// src/layouts/RootLayout.tsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar/Sidebar"; // Importe a Sidebar
import styles from "./RootLayout.module.css"; // Importe o novo CSS

export default function RootLayout() {
  return (
    <div className={styles.appLayout}>
      {/* 1. A Sidebar fixa */}
      <Sidebar />

      {/* 2. A área de conteúdo que muda */}
      <main className={styles.contentArea}>
        {/* O Outlet renderiza a rota filha (Home, Diary, etc.) */}
        <Outlet />
      </main>
    </div>
  );
}
