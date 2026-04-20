"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconsApp } from "@/components/icons/Icons";
import styles from "./MultiSelectDropdown.module.css";

type BaseOption = {
  id: string | number;
  label: string;
};

type OptionGroup = {
  key: string;
  label?: string;
  options: BaseOption[];
};

type MultiSelectDropdownProps = {
  placeholder: string;
  selectedCountLabel?: string;
  groups: OptionGroup[];
  selectedIds: Array<string | number>;
  onToggle: (id: string | number) => void;
  disabled?: boolean;
  searchPlaceholder?: string;
  noResultsText?: string;
  icon?: React.ReactNode;
};

export default function MultiSelectDropdown({
  placeholder,
  selectedCountLabel = "seleccionadas",
  groups,
  selectedIds,
  onToggle,
  disabled = false,
  searchPlaceholder = "Buscar...",
  noResultsText = "No hay resultados",
  icon,
}: MultiSelectDropdownProps) {
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

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return groups;

    return groups
      .map((group) => ({
        ...group,
        options: group.options.filter((option) =>
          option.label.toLowerCase().includes(normalizedQuery),
        ),
      }))
      .filter((group) => group.options.length > 0);
  }, [groups, query]);

  const hasOptions = filteredGroups.some((group) => group.options.length > 0);

  const triggerText =
    selectedIds.length > 0
      ? `${selectedIds.length} ${selectedCountLabel}`
      : placeholder;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""} ${
          disabled ? styles.triggerDisabled : ""
        }`}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => {
            if (prev) {
              setQuery("");
              return false;
            }

            return true;
          });
        }}
        disabled={disabled}
      >
        <span className={styles.triggerLeft}>
          {icon}
          <span
            className={`${styles.triggerText} ${
              selectedIds.length > 0 ? "" : styles.placeholder
            }`}
          >
            {triggerText}
          </span>
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
            {!hasOptions ? (
              <div className={styles.empty}>{noResultsText}</div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.key}>
                  {group.label ? (
                    <div className={styles.groupHeader}>{group.label}</div>
                  ) : null}

                  {group.options.map((option) => {
                    const checked = selectedIds.includes(option.id);

                    return (
                      <button
                        key={`${group.key}-${option.id}`}
                        type="button"
                        className={styles.option}
                        onClick={() => onToggle(option.id)}
                      >
                        <span
                          className={`${styles.checkbox} ${
                            checked ? styles.checkboxChecked : ""
                          }`}
                        >
                          {checked ? "✓" : ""}
                        </span>
                        <span className={styles.optionLabel}>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
