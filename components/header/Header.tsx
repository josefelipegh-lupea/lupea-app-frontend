import React from "react";
import styles from "./Header.module.css";
import { IconsApp } from "../icons/Icons";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction }) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <header className={styles.header}>
      <button
        className={styles.backButton}
        onClick={handleBack}
        aria-label="Volver"
      >
        <IconsApp.RightArrow />
      </button>

      <h1 className={styles.headerTitle}>{title}</h1>

      <div className={styles.headerAction}>{rightAction}</div>
    </header>
  );
};

export default Header;
