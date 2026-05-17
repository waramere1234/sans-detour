import { CARD_FACE_BOX_SHADOW } from "./Card";

export function CardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Chargement des scrutins"
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 22,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: CARD_FACE_BOX_SHADOW,
      }}
    >
      <div className="skeleton-shimmer" style={{ width: "60%", height: 12 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
        <div className="skeleton-shimmer" style={{ width: "85%", height: 18 }} />
        <div className="skeleton-shimmer" style={{ width: "55%", height: 18, marginBottom: 16 }} />
        <div className="skeleton-shimmer" style={{ width: "70%", height: 10 }} />
        <div className="skeleton-shimmer" style={{ width: "75%", height: 10 }} />
        <div className="skeleton-shimmer" style={{ width: "50%", height: 10 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: 14 }}>
        <div className="skeleton-shimmer" style={{ width: 80, height: 10 }} />
        <div className="skeleton-shimmer" style={{ width: 40, height: 10 }} />
      </div>
    </div>
  );
}
