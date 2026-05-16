export function ResultSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Chargement de ton résultat"
      style={{
        padding: "24px var(--gutter) 32px",
        maxWidth: "var(--max-content)", margin: "0 auto",
        display: "flex", flexDirection: "column", gap: 18,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="skeleton-shimmer" style={{ width: 120, height: 10 }} />
        <div className="skeleton-shimmer" style={{ width: "85%", height: 28 }} />
        <div className="skeleton-shimmer" style={{ width: "50%", height: 12 }} />
      </header>

      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 14px",
          border: "1px solid var(--line)", borderRadius: 4,
        }}>
          <div className="skeleton-shimmer" style={{ width: 12, height: 12, borderRadius: "50%" }} />
          <div className="skeleton-shimmer" style={{ flex: 1, height: 13 }} />
          <div className="skeleton-shimmer" style={{ width: 36, height: 13 }} />
        </div>
      ))}
    </section>
  );
}
