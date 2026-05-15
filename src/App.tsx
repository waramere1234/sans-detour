import type { ReactNode } from "react";
import { TopBar } from "./components/TopBar";

export default function App({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg)",
      color: "var(--ink)",
    }}>
      <TopBar />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
