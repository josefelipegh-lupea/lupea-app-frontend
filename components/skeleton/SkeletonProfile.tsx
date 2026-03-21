import styles from "./Skeleton.module.css";

const SkeletonProfile = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className={styles.skeleton} style={{ width: "60%", height: 24, marginBottom: 8 }} />
      <div className={styles.skeleton} style={{ width: "100%", height: 54, borderRadius: 16, marginBottom: 16 }} />
      <div className={styles.skeleton} style={{ width: "100%", height: 54, borderRadius: 16, marginBottom: 16 }} />
      <div className={styles.skeleton} style={{ width: "100%", height: 54, borderRadius: 16, marginBottom: 16 }} />
      
      <div style={{ marginTop: 20 }}>
        <div className={styles.skeleton} style={{ width: "40%", height: 16, marginBottom: 24 }} />
        <div className={styles.skeleton} style={{ width: "100%", height: 54, borderRadius: 16, marginBottom: 16 }} />
        <div className={styles.skeleton} style={{ width: "100%", height: 54, borderRadius: 16 }} />
      </div>

      <div className={styles.skeleton} style={{ width: "100%", height: 56, borderRadius: 18, marginTop: 20 }} />
    </div>
  );
};

export default SkeletonProfile;
