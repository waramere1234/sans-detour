import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuditTrail } from "../src/components/AuditTrail";
import {
  anScrutinViewAriaLabel, DEMO_FALLBACK_SHORT_LABEL,
  AUDIT_TRAIL_LABEL_DIVIDED, AUDIT_TRAIL_LABEL_ALIGNED,
  AUDIT_TRAIL_LABEL_PARTIAL, AUDIT_TRAIL_LABEL_OPPOSED,
  type GroupAlignment, type Scrutin, type SessionVote,
  type GroupCode, type GroupPosition,
} from "../src/types";

// AuditTrail is the per-group breakdown panel that opens under each
// PartyRow on /result. It accumulates several non-trivial invariants:
//  - vote filtering (skip excluded)
//  - score → icon/color/label mapping (4 branches: divisé null, perfect=1,
//    partial=0.5, conflict=0)
//  - region landmark with aria-labelledby pointing at a heading id
//  - demo fallback for missing url_an_officielle (AN link else "démo" span)
//  - concrete bullet from contexte via extractConcrete

function mkScrutin(
  id: string,
  groupPos: GroupPosition | undefined,
  group: GroupCode = "LFI",
  overrides: Partial<Scrutin> = {},
): Scrutin {
  return {
    id,
    numero: parseInt(id.replace(/\D/g, ""), 10) || 1,
    date: "2024-06-15",
    dossier_id: `D${id}`,
    dossier_titre: "T",
    chapeau: "FISCALITÉ · LOI X",
    titre_brut: "Vote sur l'ensemble",
    titre_pedago: `Titre pédago ${id}`,
    position_par_groupe: (groupPos
      ? { [group]: groupPos } as Scrutin["position_par_groupe"]
      : {} as Scrutin["position_par_groupe"]),
    votes_bruts: {} as Scrutin["votes_bruts"],
    url_an_officielle: "https://an.example/" + id,
    est_solennel: true,
    pedago_relu: false,
    ...overrides,
  };
}

function mkAlign(group: GroupCode = "LFI", overrides: Partial<GroupAlignment> = {}): GroupAlignment {
  return {
    group,
    pct: 50,
    counted: 4,
    perfect: 2, partial: 1, conflict: 1,
    divided_excluded: 0,
    ...overrides,
  };
}

describe("AuditTrail — region landmark", () => {
  it("renders as a region with aria-labelledby pointing at the heading", () => {
    render(<AuditTrail alignment={mkAlign()} scrutins={[]} votes={[]} />);
    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("aria-labelledby", "audit-heading-LFI");
    // The h3 with that id contains the group code + party name.
    expect(document.getElementById("audit-heading-LFI")).not.toBeNull();
  });

  it("uses the optional `id` prop on the section (aria-controls pairing)", () => {
    render(<AuditTrail alignment={mkAlign()} scrutins={[]} votes={[]} id="audit-trail-LFI" />);
    expect(screen.getByRole("region")).toHaveAttribute("id", "audit-trail-LFI");
  });
});

describe("AuditTrail — vote → icon mapping", () => {
  const scrutins = [
    mkScrutin("s-aligne", "pour", "LFI"),       // user pour + group pour → score 1
    mkScrutin("s-partiel", "abstention", "LFI"), // user pour + group abstention → score 0.5
    mkScrutin("s-oppose", "contre", "LFI"),     // user pour + group contre → score 0
    mkScrutin("s-divise", "divisé", "LFI"),     // group divisé → score null
    mkScrutin("s-skip", "pour", "LFI"),          // user skip → filtered out
  ];

  it("renders the aligned row with ✓ + 'Aligné' label", () => {
    const votes: SessionVote[] = [{ scrutin_id: "s-aligne", choice: "pour", voted_at: 1 }];
    render(<AuditTrail alignment={mkAlign()} scrutins={scrutins} votes={votes} />);
    expect(screen.getByLabelText(AUDIT_TRAIL_LABEL_ALIGNED)).toBeInTheDocument();
  });

  it("renders the partial row with ≈ + 'Partiel' label", () => {
    const votes: SessionVote[] = [{ scrutin_id: "s-partiel", choice: "pour", voted_at: 1 }];
    render(<AuditTrail alignment={mkAlign()} scrutins={scrutins} votes={votes} />);
    expect(screen.getByLabelText(AUDIT_TRAIL_LABEL_PARTIAL)).toBeInTheDocument();
  });

  it("renders the opposed row with ✕ + 'Opposé' label", () => {
    const votes: SessionVote[] = [{ scrutin_id: "s-oppose", choice: "pour", voted_at: 1 }];
    render(<AuditTrail alignment={mkAlign()} scrutins={scrutins} votes={votes} />);
    expect(screen.getByLabelText(AUDIT_TRAIL_LABEL_OPPOSED)).toBeInTheDocument();
  });

  it("renders the divided row with ÷ + 'Groupe divisé, non compté' label", () => {
    const votes: SessionVote[] = [{ scrutin_id: "s-divise", choice: "pour", voted_at: 1 }];
    render(<AuditTrail alignment={mkAlign()} scrutins={scrutins} votes={votes} />);
    expect(screen.getByLabelText(AUDIT_TRAIL_LABEL_DIVIDED)).toBeInTheDocument();
  });

  it("filters skip votes (no row rendered for them)", () => {
    const votes: SessionVote[] = [{ scrutin_id: "s-skip", choice: "skip", voted_at: 1 }];
    render(<AuditTrail alignment={mkAlign()} scrutins={scrutins} votes={votes} />);
    // No icon labels render, only the breakdown chips at the top.
    expect(screen.queryByLabelText(AUDIT_TRAIL_LABEL_ALIGNED)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(AUDIT_TRAIL_LABEL_OPPOSED)).not.toBeInTheDocument();
  });

  it("silently drops votes whose scrutin_id is unknown to the pool", () => {
    const votes: SessionVote[] = [{ scrutin_id: "missing", choice: "pour", voted_at: 1 }];
    render(<AuditTrail alignment={mkAlign()} scrutins={scrutins} votes={votes} />);
    expect(screen.queryByLabelText(AUDIT_TRAIL_LABEL_ALIGNED)).not.toBeInTheDocument();
  });

  it("drops votes when the group is missing from position_par_groupe", () => {
    const noGroup = mkScrutin("s-nogroup", undefined);
    const votes: SessionVote[] = [{ scrutin_id: "s-nogroup", choice: "pour", voted_at: 1 }];
    render(<AuditTrail alignment={mkAlign()} scrutins={[noGroup]} votes={votes} />);
    expect(screen.queryByLabelText(AUDIT_TRAIL_LABEL_ALIGNED)).not.toBeInTheDocument();
  });
});

describe("AuditTrail — AN link vs demo fallback", () => {
  it("renders an external AN link when url_an_officielle is set", () => {
    const sc = mkScrutin("s1", "pour", "LFI", { url_an_officielle: "https://an.example/123" });
    const votes: SessionVote[] = [{ scrutin_id: "s1", choice: "pour", voted_at: 1 }];
    render(<AuditTrail alignment={mkAlign()} scrutins={[sc]} votes={votes} />);
    // Round-trip via anScrutinViewAriaLabel — a regression that changes
    // the aria-label template would surface here instead of silently
    // breaking the AN link a11y. Take the prefix before the numero
    // interpolation so the regex matches any scrutin number.
    const labelPrefix = anScrutinViewAriaLabel(0).split(" n°")[0]; // "Voir le scrutin"
    const link = screen.getByRole("link", { name: new RegExp(labelPrefix) });
    expect(link).toHaveAttribute("href", "https://an.example/123");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the 'démo' fallback when url_an_officielle is empty", () => {
    const sc = mkScrutin("s2", "pour", "LFI", { url_an_officielle: "" });
    const votes: SessionVote[] = [{ scrutin_id: "s2", choice: "pour", voted_at: 1 }];
    render(<AuditTrail alignment={mkAlign()} scrutins={[sc]} votes={votes} />);
    expect(screen.getByText(DEMO_FALLBACK_SHORT_LABEL)).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("AuditTrail — breakdown chips (plural rule, sessions 78-83)", () => {
  // The chip text is split across nested spans (a colored count span +
  // the adjective text), so getByText on a single text node misses it.
  // Use toHaveTextContent on the region landmark, which concatenates
  // all descendant text nodes — that's what an SR user actually hears.

  it("singularises each chip when the count is exactly 1", () => {
    const align = mkAlign("LFI", {
      perfect: 1, partial: 1, conflict: 1, divided_excluded: 1, counted: 3,
    });
    render(<AuditTrail alignment={align} scrutins={[]} votes={[]} />);
    const region = screen.getByRole("region");
    expect(region).toHaveTextContent(/1 aligné(?!s)/);
    expect(region).toHaveTextContent(/1 partiel(?!s)/);
    expect(region).toHaveTextContent(/1 opposé(?!s)/);
    expect(region).toHaveTextContent(/1 divisé non compté(?!s)/);
  });

  it("pluralises 'divisé non comptés' when count >= 2 (both adjectives agree)", () => {
    const align = mkAlign("LFI", { divided_excluded: 5 });
    render(<AuditTrail alignment={align} scrutins={[]} votes={[]} />);
    expect(screen.getByRole("region")).toHaveTextContent(/5 divisés non comptés/);
  });
});
