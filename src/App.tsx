import type { ReactNode } from "react";
import { Footer } from "./components/Footer";

export default function App({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg)",
      color: "var(--ink)",
    }}>
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
