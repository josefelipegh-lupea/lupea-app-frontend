"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconsApp } from "@/components/icons/Icons";
import styles from "./SearchableSelect.module.css";

type SearchableSelectOption = {
  id: string | number;
  label: string;
};

type SearchableSelectProps = {
  placeholder: string;
  value: string | number | null | undefined;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  searchPlaceholder?: string;
  noResultsText?: string;
};

export default function SearchableSelect({
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
  searchPlaceholder = "Buscar...",
  noResultsText = "No hay resultados",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const closePanel = () => {
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        closePanel();
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);

    return () => clearTimeout(timeout);
  }, [open]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery)
    );
  }, [options, query]);

  const selectedOption = options.find((option) => String(option.id) === String(value));

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""} ${
          disabled ? styles.triggerDisabled : ""
        }`}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
        }}
        disabled={disabled}
      >
        <span
          className={`${styles.triggerText} ${
            selectedOption ? "" : styles.placeholder
          }`}
        >
          {selectedOption?.label || placeholder}
        </span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
          <IconsApp.DownArrow />
        </span>
      </button>

      {open && !disabled && (
        <div className={styles.panel}>
          <div className={styles.searchBox}>
            <input
              ref={searchInputRef}
              className={styles.searchInput}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className={styles.options}>
            {filteredOptions.length === 0 ? (
              <div className={styles.empty}>{noResultsText}</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = String(option.id) === String(value);

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`${styles.option} ${
                      isSelected ? styles.optionSelected : ""
                    }`}
                    onClick={() => {
                      onChange(String(option.id));
                      closePanel();
                    }}
                  >
                    <span className={styles.optionLabel}>{option.label}</span>
                    <span className={styles.optionCheck}>{isSelected ? "✓" : ""}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
