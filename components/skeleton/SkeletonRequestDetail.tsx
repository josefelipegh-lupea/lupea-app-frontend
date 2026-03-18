import styles from "./Skeleton.module.css";
import detailStyles from "../../app/(dashboard)/home/vendor/[id]/RequestDetail.module.css";

export const SkeletonRequestDetail = () => {
  return (
    <div className={detailStyles.pageWrapper}>
      <div className={detailStyles.mainContainer}>
        <div className={styles.backButtonSkeleton} />

        <div className={styles.headerSkeleton}>
          <div className={`${styles.skeleton} ${styles.title}`} />
          <div className={`${styles.skeleton} ${styles.text}`} />
        </div>

        <div className={detailStyles.card}>
          <div className={`${styles.skeleton} ${styles.cardTitle}`} />
          <div className={styles.vehicleRow}>
            <div className={`${styles.skeleton} ${styles.iconCircle}`} />
            <div className={styles.vehicleText}>
              <div className={`${styles.skeleton} ${styles.text}`} />
              <div className={`${styles.skeleton} ${styles.textSmall}`} />
            </div>
          </div>
        </div>

        <div className={detailStyles.card}>
          <div className={`${styles.skeleton} ${styles.cardTitle}`} />
          <div className={styles.locationRow}>
            <div className={`${styles.skeleton} ${styles.smallIcon}`} />
            <div className={styles.locationText}>
              <div className={`${styles.skeleton} ${styles.text}`} />
              <div className={`${styles.skeleton} ${styles.text}`} />
              <div className={`${styles.skeleton} ${styles.textSmall}`} />
            </div>
          </div>
        </div>

        <div className={detailStyles.card}>
          <div className={`${styles.skeleton} ${styles.cardTitle}`} />
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.itemRow}>
              <div className={`${styles.skeleton} ${styles.itemIcon}`} />
              <div className={styles.itemText}>
                <div className={`${styles.skeleton} ${styles.text}`} />
                <div className={`${styles.skeleton} ${styles.textSmall}`} />
              </div>
            </div>
          ))}
        </div>

        <div className={detailStyles.card}>
          <div className={`${styles.skeleton} ${styles.cardTitle}`} />
          <div className={styles.criteriaGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${styles.skeleton} ${styles.criteriaItem}`} />
            ))}
          </div>
        </div>

        <div className={styles.actionsContainer}>
          <div className={`${styles.skeleton} ${styles.button}`} />
        </div>
      </div>
    </div>
  );
};
