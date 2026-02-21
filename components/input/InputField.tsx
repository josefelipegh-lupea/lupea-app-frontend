import React from "react";
import styles from "./InputField.module.css";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  name: string;
  rightElement?: React.ReactNode;
  isEditing?: boolean;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  name,
  rightElement,
  isEditing = true,
  className,
  ...props
}) => {
  return (
    <div className={`${styles.fieldContainer} ${className || ""}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        <input
          name={name}
          disabled={!isEditing}
          className={`${styles.input}  ${icon ? styles.withIcon : ""} ${
            !isEditing ? styles.disabled : ""
          }`}
          {...props}
        />
        {rightElement && (
          <div className={styles.rightElement}>{rightElement}</div>
        )}
      </div>
    </div>
  );
};

export default InputField;
