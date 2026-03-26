import styles from "./Skeleton.module.css";

export function SkeletonSendQuote() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: 20,
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
          border: "1px solid #e8e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div className={styles.skeleton} style={{ width: 40, height: 40, borderRadius: 12 }} />
          <div className={styles.skeleton} style={{ width: 150, height: 20, borderRadius: 8 }} />
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div className={styles.skeleton} style={{ width: "60%", height: 12, marginBottom: 8 }} />
            <div className={styles.skeleton} style={{ width: "40%", height: 16 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className={styles.skeleton} style={{ width: "50%", height: 12, marginBottom: 8 }} />
            <div className={styles.skeleton} style={{ width: "70%", height: 16 }} />
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
          border: "1px solid #e8e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div className={styles.skeleton} style={{ width: 32, height: 32, borderRadius: 10 }} />
          <div className={styles.skeleton} style={{ width: 120, height: 16, borderRadius: 6 }} />
        </div>
        <div className={styles.skeleton} style={{ height: 1, marginBottom: 12 }} />

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <div className={styles.skeleton} style={{ flex: 1, height: 14 }} />
          <div className={styles.skeleton} style={{ flex: 1, height: 14 }} />
        </div>

        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              padding: "12px 0",
              borderTop: "1px solid #e8e8f0",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <div className={styles.skeleton} style={{ width: 40, height: 40, borderRadius: 10 }} />
              <div style={{ flex: 1 }}>
                <div className={styles.skeleton} style={{ width: "70%", height: 14, marginBottom: 4 }} />
                <div className={styles.skeleton} style={{ width: "50%", height: 12 }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div className={styles.skeleton} style={{ width: 60, height: 40, borderRadius: 12 }} />
              <div className={styles.skeleton} style={{ flex: 1, height: 40, borderRadius: 12 }} />
              <div className={styles.skeleton} style={{ flex: 1, height: 40, borderRadius: 12 }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div className={styles.skeleton} style={{ flex: 1, height: 40, borderRadius: 12 }} />
              <div className={styles.skeleton} style={{ flex: 1, height: 40, borderRadius: 12 }} />
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
          border: "1px solid #e8e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div className={styles.skeleton} style={{ width: 32, height: 32, borderRadius: 10 }} />
          <div className={styles.skeleton} style={{ width: 140, height: 16, borderRadius: 6 }} />
        </div>
        <div className={styles.skeleton} style={{ height: 1, marginBottom: 16 }} />

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeleton} style={{ flex: 1, height: 36, borderRadius: 20 }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {[1, 2].map((i) => (
            <div key={i} className={styles.skeleton} style={{ flex: 1, height: 36, borderRadius: 20 }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div className={styles.skeleton} style={{ width: "60%", height: 12, marginBottom: 8 }} />
            <div className={styles.skeleton} style={{ height: 40, borderRadius: 12 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className={styles.skeleton} style={{ width: "50%", height: 12, marginBottom: 8 }} />
            <div className={styles.skeleton} style={{ height: 40, borderRadius: 12 }} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div className={styles.skeleton} style={{ width: "50%", height: 12, marginBottom: 8 }} />
          <div className={styles.skeleton} style={{ height: 80, borderRadius: 20 }} />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
          border: "1px solid #e8e8f0",
        }}
      >
        <div className={styles.skeleton} style={{ width: 120, height: 20 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <div className={styles.skeleton} style={{ width: 100, height: 48, borderRadius: 14 }} />
          <div className={styles.skeleton} style={{ width: 140, height: 48, borderRadius: 14 }} />
        </div>
      </div>
    </div>
  );
}