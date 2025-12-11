// src/components/properties/TalhaoCard/TalhaoCard.tsx
import styles from "./TalhaoCard.module.css";
import { TagToggle } from "../../common/TagToggle/TagToggle";
// import { FiPlus } from 'react-icons/fi';

// Tipo para os dados do talhão
export type Talhao = {
  id: number;
  name: string;
  cultura: string;
  area: number;
  status: "em preparo" | "plantado" | "colhido"; // Adicione outros status se necessário
};

type Props = {
  talhao: Talhao;
};

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function TalhaoCard({ talhao }: Props) {
  return (
    <div className={styles.card}>
      <header className={styles.header}>
        <span className={styles.title}>{talhao.name}</span>
        {/* Usamos o TagToggle apenas para visualização */}
        <TagToggle
          color="green"
          isActive={true}
          style={{
            cursor: "default",
            fontSize: "0.75rem",
            padding: "4px 10px",
          }}
        >
          {talhao.status === "em preparo"
            ? "✓ Em preparo"
            : capitalize(talhao.status)}
        </TagToggle>
      </header>

      <div className={styles.content}>
        {talhao.cultura && (
          <p>
            <strong>Cultura atual:</strong> {talhao.cultura}
          </p>
        )}
        <p>
          <strong>Área:</strong> {talhao.area}
        </p>
      </div>

      {/* <button className={styles.viewAreaButton}>
        <FiPlus /> Ver área
      </button> */}
    </div>
  );
}
