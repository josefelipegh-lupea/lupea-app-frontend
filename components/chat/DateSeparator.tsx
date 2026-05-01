import styles from "./DateSeparator.module.css";

interface DateSeparatorProps {
  label: string;
}

export default function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <div className={styles.separator}>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
