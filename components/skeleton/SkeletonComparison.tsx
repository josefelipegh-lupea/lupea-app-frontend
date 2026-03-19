import styles from "./Skeleton.module.css";
import comparisonStyles from "../../app/(dashboard)/home/user/request/[id]/comparison/Comparison.module.css";

export function SkeletonComparison() {
  return (
    <div className={comparisonStyles.pageWrapper}>
      <div className={comparisonStyles.mainContainer}>
        <div className={comparisonStyles.header}>
          <div className={`${styles.skeleton} ${styles.backButtonSkeleton}`} />
        </div>

        <div className={comparisonStyles.requestSelectorRow}>
          <div
            className={`${styles.skeleton}`}
            style={{ width: 120, height: 20 }}
          />
          <div
            className={`${styles.skeleton}`}
            style={{ width: 80, height: 20 }}
          />
        </div>

        <div className={comparisonStyles.searchFilterRow}>
          <div
            className={`${styles.skeleton}`}
            style={{ width: 100, height: 36, borderRadius: 25 }}
          />
          <div
            className={`${styles.skeleton}`}
            style={{ width: 24, height: 24 }}
          />
        </div>

        <div className={comparisonStyles.infoBox}>
          <div
            className={`${styles.skeleton}`}
            style={{ width: 22, height: 22, borderRadius: "50%" }}
          />
          <div style={{ flex: 1 }}>
            <div
              className={`${styles.skeleton}`}
              style={{ width: "100%", height: 16, marginBottom: 8 }}
            />
            <div
              className={`${styles.skeleton}`}
              style={{ width: "70%", height: 16 }}
            />
          </div>
        </div>

        <div className={comparisonStyles.quotesList}>
          <div className={comparisonStyles.quoteCard}>
            <div className={comparisonStyles.cardHeader}>
              <div
                className={`${styles.skeleton}`}
                style={{ width: 100, height: 14 }}
              />
            </div>
            <div className={comparisonStyles.cardBody}>
              <div className={comparisonStyles.providerRow}>
                <div
                  className={`${styles.skeleton}`}
                  style={{ width: 120, height: 40, borderRadius: 10 }}
                />
                <div
                  className={`${styles.skeleton}`}
                  style={{ width: 60, height: 24, borderRadius: 12 }}
                />
              </div>
              <div
                className={`${styles.skeleton}`}
                style={{ width: 150, height: 16, marginBottom: 15 }}
              />

              <div className={comparisonStyles.partsList}>
                {[1, 2].map((i) => (
                  <div key={i} className={comparisonStyles.partItem}>
                    <div
                      className={`${styles.skeleton}`}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 8,
                        marginRight: 15,
                      }}
                    />
                    <div
                      className={`${styles.skeleton}`}
                      style={{ flex: 1, height: 40 }}
                    />
                    <div
                      className={`${styles.skeleton}`}
                      style={{ width: 50, height: 24 }}
                    />
                  </div>
                ))}
              </div>

              <div className={comparisonStyles.cardFooter}>
                <div
                  className={`${styles.skeleton}`}
                  style={{ width: 80, height: 20 }}
                />
                <div
                  className={`${styles.skeleton}`}
                  style={{ width: 60, height: 24 }}
                />
              </div>

              <div className={comparisonStyles.buttonContainer}>
                <div
                  className={`${styles.skeleton}`}
                  style={{ width: "100%", height: 48, borderRadius: 14 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
