import { GROUP_CODES, SKELETON_RESULT_LOADING_LABEL, SKELETON_SHIMMER_CLASS } from "../types";

// Row count anchored on GROUP_CODES.length so the skeleton renders as many
// placeholders as the real Result page (which maps `ranked.map(...)` over all
// 11 groups). Hardcoded 6 used to ship a layout shift of ~5 rows when the
// real list took over — ~250px CLS push on the buttons below.
export function ResultSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label={SKELETON_RESULT_LOADING_LABEL}
      style={{
        padding: "24px var(--gutter) 32px",
        maxWidth: "var(--max-content)", margin: "0 auto",
        display: "flex", flexDirection: "column", gap: 18,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className={SKELETON_SHIMMER_CLASS} style={{ width: 120, height: 10 }} />
        <div className={SKELETON_SHIMMER_CLASS} style={{ width: "85%", height: 28 }} />
        <div className={SKELETON_SHIMMER_CLASS} style={{ width: "50%", height: 12 }} />
      </header>

      {Array.from({ length: GROUP_CODES.length }).map((_, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 14px",
          border: "1px solid var(--line)", borderRadius: 4,
        }}>
          <div className={SKELETON_SHIMMER_CLASS} style={{ width: 12, height: 12, borderRadius: "50%" }} />
          <div className={SKELETON_SHIMMER_CLASS} style={{ flex: 1, height: 13 }} />
          <div className={SKELETON_SHIMMER_CLASS} style={{ width: 36, height: 13 }} />
        </div>
      ))}
    </section>
  );
}
