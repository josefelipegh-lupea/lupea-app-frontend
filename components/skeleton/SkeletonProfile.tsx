import styles from "./Skeleton.module.css";

const SkeletonProfile = () => {
  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      {/* Imitamos un título */}
      <div className={`${styles.skeleton} styles.title`} />

      {/* Imitamos líneas de texto */}
      <div className={`${styles.skeleton} ${styles.text}`} />
      <div className={`${styles.skeleton} ${styles.text}`} />
      <div
        className={`${styles.skeleton} ${styles.text}`}
        style={{ width: "80%" }}
      />

      {/* Imitamos el botón de acción */}
      <div className={`${styles.skeleton} ${styles.button}`} />
    </div>
  );
};

export default SkeletonProfile;
