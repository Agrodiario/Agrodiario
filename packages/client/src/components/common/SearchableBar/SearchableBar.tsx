import { useState, useEffect } from "react";
import styles from "./SearchableBar.module.css";
import { IoSearch } from "react-icons/io5";

type SearchBarProps = {
  placeholder: string;
  onSearch: (query: string) => void;
  delay?: number; // tempo de debounce
};

export function SearchBar({
  placeholder,
  onSearch,
  delay = 500,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query);
    }, delay);

    return () => clearTimeout(handler);
  }, [query, delay, onSearch]);

  const hasValue = query.trim() !== "";

  return (
    <div className={styles.wrapper}>
      <label
        className={`${styles.inputLabel} ${
          isFocused || hasValue ? styles.floating : ""
        }`}
      >
        {placeholder}
      </label>
      <input
        type="text"
        className={styles.searchInput}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <IoSearch className={styles.icon} size={18} />
    </div>
  );
}
