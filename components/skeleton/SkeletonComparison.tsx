import styles from "./Skeleton.module.css";

export function SkeletonComparison() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            borderRadius: 28,
            padding: 20,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)",
            border: "1px solid #f1f1f1",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                className={styles.skeleton}
                style={{ width: 40, height: 40, borderRadius: 10 }}
              />
              <div className={styles.skeleton} style={{ width: 120, height: 18 }} />
            </div>
            <div className={styles.skeleton} style={{ width: 24, height: 24, borderRadius: 6 }} />
          </div>

          <div className={styles.skeleton} style={{ width: "60%", height: 14, marginBottom: 12 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {[1, 2].map((j) => (
              <div
                key={j}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 10px",
                  background: "#f9f9fb",
                  borderRadius: 12,
                }}
              >
                <div className={styles.skeleton} style={{ width: 24, height: 24, borderRadius: 8 }} />
                <div style={{ flex: 1 }}>
                  <div className={styles.skeleton} style={{ width: "80%", height: 14, marginBottom: 4 }} />
                  <div className={styles.skeleton} style={{ width: "50%", height: 12 }} />
                </div>
                <div className={styles.skeleton} style={{ width: 60, height: 20 }} />
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 12,
              borderTop: "1px solid #18144033",
            }}
          >
            <div className={styles.skeleton} style={{ width: 100, height: 20 }} />
            <div className={styles.skeleton} style={{ width: 80, height: 24 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
