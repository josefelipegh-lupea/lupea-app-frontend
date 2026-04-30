import skeletonStyles from "./Skeleton.module.css";
import styles from "./SkeletonComparison.module.css";

export function SkeletonComparison() {
  return (
    <div className={styles.container}>
      {[1, 2, 3].map((i) => (
        <div key={i} className={styles.card}>
          <div className={styles.providerRow}>
            <div className={styles.providerLeft}>
              <div className={`${skeletonStyles.skeleton} ${styles.iconSkeleton}`} />
              <div className={`${skeletonStyles.skeleton} ${styles.nameSkeleton}`} />
            </div>
            <div className={`${skeletonStyles.skeleton} ${styles.filterSkeleton}`} />
          </div>

          <div className={`${skeletonStyles.skeleton} ${styles.partsSkeleton}`} />

          <div className={styles.itemsList}>
            {[1, 2].map((j) => (
              <div key={j} className={styles.itemRow}>
                <div className={`${skeletonStyles.skeleton} ${styles.checkboxSkeleton}`} />
                <div className={styles.itemContent}>
                  <div className={`${skeletonStyles.skeleton} ${styles.itemNameSkeleton}`} />
                  <div className={`${skeletonStyles.skeleton} ${styles.itemSubSkeleton}`} />
                </div>
                <div className={`${skeletonStyles.skeleton} ${styles.priceSkeleton}`} />
              </div>
            ))}
          </div>

          <div className={styles.cardFooter}>
            <div className={`${skeletonStyles.skeleton} ${styles.timeSkeleton}`} />
            <div className={`${skeletonStyles.skeleton} ${styles.totalSkeleton}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
