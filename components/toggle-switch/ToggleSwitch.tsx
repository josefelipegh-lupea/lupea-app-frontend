import styles from "./ToggleSwitch.module.css";

interface ToggleProps {
  isOn: boolean;
  handleToggle: () => void;
}

const ToggleSwitch = ({ isOn, handleToggle }: ToggleProps) => {
  return (
    <div
      className={`${styles.switch} ${isOn ? styles.on : styles.off}`}
      onClick={handleToggle}
    >
      <div className={styles.handle} />
    </div>
  );
};

export default ToggleSwitch;
