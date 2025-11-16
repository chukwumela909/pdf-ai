export type Summary = {
  title: string;
  paragraphs: string[];
  quote: string;
  quoteAttribution: string;
};

export type Highlight = {
  title: string;
  detail: string;
};

const normalizeName = (fileName?: string) => {
  if (!fileName) return "Untitled PDF";
  return fileName.replace(/_/g, " ").replace(/\.pdf$/i, "").trim() || "Untitled PDF";
};

export const defaultSummary: Summary = {
  title: "Energy Horizons 2025",
  paragraphs: [
    "PDF Prism read Energy Horizons 2025, a 96-page sustainability status update from Northwind Logistics. The AI distilled each chapter, tagging trends, strategies, and blockers.",
    "The company commits to a 46% emissions reduction by 2030. Capital is shifting toward electrifying fleets, investing in predictive maintenance, and building a supplier transparency exchange.",
  ],
  quote:
    "Supplier accountability is now the number one lever. We are implementing rolling audits and automated attestations.",
  quoteAttribution: "Page 47",
};

export const defaultHighlights: Highlight[] = [
  {
    title: "Executive Summary",
    detail:
      "The sustainability roadmap prioritizes electrifying logistics, modernizing data transparency, and aligning incentives for suppliers.",
  },
  {
    title: "Risks & Watchouts",
    detail:
      "Scope 3 emissions reporting remains fragmented. AI flags three vendors with inconsistent year-over-year disclosures.",
  },
  {
    title: "Instant Action Items",
    detail:
      "Schedule supplier audits, pilot low-carbon packaging, and publish a quarterly transparency bulletin.",
  },
];

export const buildSummaryFromFile = (fileName?: string): Summary => {
  const cleanName = normalizeName(fileName);
  return {
    title: cleanName,
    paragraphs: [
      `${cleanName} was parsed into semantic sections. Prism mapped governance, capital strategy, and operational risk to surface the most decision-ready takeaways.`,
      "AI detected sentiment shifts, corroborated stats against prior filings, and stitched together a narrative that highlights what's changed—not just what's repeated.",
    ],
    quote: `“${cleanName} pushes leadership to treat emissions transparency as an innovation sprint, not a compliance chore.”`,
    quoteAttribution: "Auto-generated pull-quote",
  };
};

export const buildHighlightsFromFile = (fileName?: string): Highlight[] => {
  const cleanName = normalizeName(fileName);
  return [
    {
      title: "Executive Summary",
      detail: `${cleanName} concentrates most impact in supply-chain modernization, telemetry, and incentive realignment across vendors.`,
    },
    {
      title: "Risks & Watchouts",
      detail: `AI flagged contradictory metrics between appendix tables and the main body of ${cleanName}. Pages 38–41 need human review.`,
    },
    {
      title: "Instant Action Items",
      detail:
        "Circulate a supplier transparency memo, open a shared annotation space for Legal, and trigger a scenario brief for Operations.",
    },
  ];
};
