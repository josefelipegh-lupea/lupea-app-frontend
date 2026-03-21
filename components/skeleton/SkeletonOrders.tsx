import styles from "./Skeleton.module.css";
import ordersStyles from "../../app/(dashboard)/home/user/orders/Orders.module.css";

export function SkeletonOrders() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className={ordersStyles.card}>
          <div className={ordersStyles.cardHeader}>
            <div className={ordersStyles.providerInfo}>
              <div className={ordersStyles.iconWrapper}>
                <div className={`${styles.skeleton}`} style={{ width: 32, height: 32, borderRadius: 10 }} />
              </div>
              <div className={`${styles.skeleton}`} style={{ width: 120, height: 18 }} />
            </div>
            <div className={`${styles.skeleton}`} style={{ width: 24, height: 24, borderRadius: 6 }} />
          </div>
          <div className={ordersStyles.divider} />

          <div className={ordersStyles.cardBody}>
            <div className={ordersStyles.infoRow}>
              <div className={`${styles.skeleton}`} style={{ width: 80, height: 14 }} />
              <div className={`${styles.skeleton}`} style={{ width: 70, height: 14 }} />
            </div>

            <div className={ordersStyles.infoRow}>
              <div className={`${styles.skeleton}`} style={{ width: 80, height: 24, borderRadius: 12 }} />
              <div className={`${styles.skeleton}`} style={{ width: 60, height: 14 }} />
            </div>

            <div className={ordersStyles.cardDivider} />

            <div className={ordersStyles.priceRow}>
              <div className={`${styles.skeleton}`} style={{ width: 100, height: 20 }} />
              <div className={`${styles.skeleton}`} style={{ width: 60, height: 20 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
