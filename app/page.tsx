"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  Highlight,
  Summary,
  buildHighlightsFromFile,
  buildSummaryFromFile,
  defaultHighlights,
  defaultSummary,
} from "@/lib/summarizer";

type Status = "idle" | "uploading" | "processing" | "ready";

type SummarizePayload = {
  summary: Summary;
  highlights: Highlight[];
};

const workflow = [
  {
    label: "1",
    title: "Upload or drag a PDF",
    copy: "Drop any research paper, report, or playbook up to 200 pages.",
  },
  {
    label: "2",
    title: "AI distills context",
    copy: "We map every paragraph, detect key entities, and rank insights by novelty.",
  },
  {
    label: "3",
    title: "Summaries you can trust",
    copy: "Receive digestible sections, action items, and pull-quotes with citations.",
  },
];

const loveNote = "Milimo.ai is just me shipping commits that say I adore you—let's keep building.";

const statusCopy: Record<Status, string> = {
  idle: "Awaiting upload",
  uploading: "Uploading PDF",
  processing: "Generating summary",
  ready: "Summary ready",
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
};

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const [, base64Payload] = result.split(",");
        if (base64Payload) {
          resolve(base64Payload);
          return;
        }
      }
      if (result instanceof ArrayBuffer) {
        resolve(arrayBufferToBase64(result));
        return;
      }
      reject(new Error("Unable to read file."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });

const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const precision = size >= 10 || unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [dynamicSummary, setDynamicSummary] = useState<Summary>(defaultSummary);
  const [dynamicHighlights, setDynamicHighlights] = useState<Highlight[]>(defaultHighlights);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [levitating, setLevitating] = useState(false);
  const levitateTimerRef = useRef<number | null>(null);

  const summarizeFile = useCallback(async (candidate: File) => {
    try {
      setIsSubmitting(true);
      setStatus("uploading");
      setDynamicSummary(defaultSummary);
      setDynamicHighlights(defaultHighlights);

      const base64Data = await fileToBase64(candidate);

      setStatus("processing");
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: candidate.name,
          base64Data,
        }),
      });

      const payload = (await response.json()) as SummarizePayload & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to summarize PDF right now.");
      }

      setDynamicSummary(payload.summary ?? buildSummaryFromFile(candidate.name));
      setDynamicHighlights(payload.highlights ?? buildHighlightsFromFile(candidate.name));
      setStatus("ready");
      setError("");
    } catch (summarizeError) {
      console.error(summarizeError);
      setStatus("idle");
      setError(
        summarizeError instanceof Error
          ? summarizeError.message
          : "Something went wrong while summarizing."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }

      if (isSubmitting) {
        setError("Hang tight—still processing the previous PDF.");
        return;
      }

      const candidate = files[0];
      const isPdf = candidate.type === "application/pdf" || candidate.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        setError("Please choose a PDF file.");
        return;
      }

      setFile(candidate);
      setError("");
      void summarizeFile(candidate);
    },
    [isSubmitting, summarizeFile]
  );

  const handleButtonClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const triggerLevitation = useCallback(() => {
    setLevitating(true);
    if (levitateTimerRef.current) {
      window.clearTimeout(levitateTimerRef.current);
    }
    levitateTimerRef.current = window.setTimeout(() => {
      setLevitating(false);
    }, 900);
  }, []);

  useEffect(() => {
    return () => {
      if (levitateTimerRef.current) {
        window.clearTimeout(levitateTimerRef.current);
      }
    };
  }, []);

  const activeSummary = status === "ready" && file ? dynamicSummary : defaultSummary;
  const activeHighlights = status === "ready" && file ? dynamicHighlights : defaultHighlights;
  const statusLabel = statusCopy[status];
  const progress =
    status === "idle" ? 0 : status === "uploading" ? 0.35 : status === "processing" ? 0.75 : 1;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#010104] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-32 left-24 h-80 w-80 rounded-full bg-cyan-500/30 blur-[120px]" />
        <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-[140px]" />
        <div className="absolute bottom-[-120px] right-[10%] h-[420px] w-[420px] rounded-full bg-indigo-600/20 blur-[200px]" />
      </div>

      <main className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16 lg:gap-24 lg:px-10">
        <header className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-white/70">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Milimo.ai
            </div>
            <div className="space-y-6">
                <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
                Welcome to <span className="text-fuchsia-300">Milimo.ai</span>
                </h1>
              <div className="max-w-2xl text-lg text-zinc-200">
                <TextGenerateEffect
                  words={loveNote}
                  className="font-normal text-left text-zinc-100"
                  filter={false}
                  duration={0.4}
                />
              </div>
            </div>
            {/* <div className="flex flex-wrap gap-4 text-sm text-zinc-300">
              {featureStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-white/60">{stat.label}</p>
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="text-white/60">{stat.sub}</p>
                </div>
              ))}
            </div> */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={triggerLevitation}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Launch milimo.ai
              </button>
              {/* <button className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/60">
              Watch demo
              </button>
              <p className="text-sm text-white/60">No credit card required.</p> */}
            </div>
          </div>

          <div
            className={`relative transform transition-all duration-500 ease-out ${
              levitating ? "-translate-y-4 scale-[1.02] drop-shadow-[0_30px_80px_rgba(59,130,246,0.35)]" : ""
            }`}
          >
            <div className="absolute inset-4 rounded-4xl bg-linear-to-br from-cyan-400/40 to-fuchsia-500/40 blur-3xl" />
            <div className="relative rounded-4xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
              <div
                className={`rounded-3xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
                  dragActive ? "border-cyan-300 bg-cyan-400/10" : "border-white/30 bg-black/30"
                }`}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "copy";
                  setDragActive(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                  handleFiles(event.dataTransfer.files);
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(event) => handleFiles(event.target.files)}
                />
                <p className="text-sm text-white/70">
                  {dragActive ? "Release to import" : "Drop PDF here"}
                </p>
                <button
                  type="button"
                  onClick={handleButtonClick}
                  disabled={isSubmitting}
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-white px-6 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Working..." : "Upload manuscript"}
                </button>
                <p className="mt-3 text-xs text-white/50">or paste a public link</p>
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/50">{statusLabel}</p>
                {file && (
                  <div className="mt-4 text-left text-sm text-white/80">
                    <div className="flex items-center justify-between gap-4">
                      <p className="truncate font-medium" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-white/60">{formatFileSize(file.size)}</p>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${
                          status === "ready" ? "bg-emerald-300" : "bg-white"
                        } transition-all duration-500`}
                        style={{ width: `${Math.round(progress * 100)}%` }}
                      />
                    </div>
                    {status !== "idle" && (
                      <p className="mt-2 text-xs text-white/60">
                        {status === "processing"
                          ? "Distilling paragraphs and citing insights..."
                          : status === "ready"
                          ? "Summary ready for review"
                          : "Encrypted upload in progress"}
                      </p>
                    )}
                  </div>
                )}
                {error && <p className="mt-4 text-xs text-rose-300">{error}</p>}
              </div>
              <div className="mt-6 space-y-4 text-sm">
                {workflow.map((step) => (
                  <div
                    key={step.label}
                    className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/5 p-4"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                      {step.label}
                    </span>
                    <div>
                      <p className="font-medium text-white">{step.title}</p>
                      <p className="text-white/60">
                        {step.label === "1" && file ? `${statusLabel}…` : step.copy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-8 rounded-[40px] border border-white/5 bg-white/5 p-8 backdrop-blur-xl lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.2em] text-white/60">Live summary preview</p>
            <div className="space-y-6 rounded-3xl bg-black/40 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
                <p>
                  {status === "ready" && file
                    ? `Summary for ${activeSummary.title}`
                    : "Sample summary preview"}
                </p>
                {file && (
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${
                      status === "ready"
                        ? "border-emerald-400/40 text-emerald-200"
                        : "border-white/20 text-white/70"
                    }`}
                  >
                    {statusLabel}
                  </span>
                )}
              </div>
              {status === "idle" && !file ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-white/50">
                  Upload a PDF to generate a personalized briefing here.
                </div>
              ) : file && status !== "ready" ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                  {status === "uploading"
                    ? "Uploading securely..."
                    : "Reasoning over sections, ranking insights..."}
                </div>
              ) : (
                <article className="space-y-4 text-base text-zinc-200">
                  {activeSummary.paragraphs.map((paragraph, index) => (
                    <p key={`${activeSummary.title}-${index}`}>{paragraph}</p>
                  ))}
                </article>
              )}
              <div className="grid gap-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-4">
                <p className="text-sm font-semibold text-emerald-200">Signal Boost</p>
                <p className="text-sm text-emerald-50">
                  {`${activeSummary.quote} — ${activeSummary.quoteAttribution}`}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.2em] text-white/60">Highlights generated</p>
            <div className="space-y-4">
              {activeHighlights.map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">{item.title}</p>
                  <p className="mt-3 text-base text-zinc-100">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* <section className="space-y-8">
          <div className="flex flex-col gap-4 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Flow</p>
            <h2 className="text-3xl font-semibold text-white">Your AI co-pilot for every PDF maze.</h2>
            <p className="mx-auto max-w-2xl text-base text-zinc-300">
              Each upload spins up a private reasoning graph. Meticulous citations keep legal, research, and ops teams confident enough to ship decisions fast.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {workflow.map((step) => (
              <div key={step.label} className="rounded-3xl border border-white/5 bg-white/5 p-6">
                <span className="text-sm font-semibold text-white/60">Step {step.label}</span>
                <p className="mt-3 text-lg font-semibold text-white">{step.title}</p>
                <p className="mt-2 text-sm text-white/60">
                  {step.label === "1" && file ? `${statusLabel}…` : step.copy}
                </p>
              </div>
            ))}
          </div>
        </section> */}

        {/* <section className="rounded-4xl border border-cyan-400/30 bg-linear-to-r from-cyan-500/20 via-transparent to-fuchsia-600/20 p-px">
          <div className="rounded-[30px] bg-black/70 px-6 py-10 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">Ready to skim smarter?</p>
            <h3 className="mt-4 text-3xl font-semibold text-white">Invite the AI summarizer built for modern teams.</h3>
            <p className="mt-3 text-base text-zinc-300">
              Unlimited collaborators, SOC2 controls, and citations that click back to the PDF page.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200">
                Launch Prism
              </button>
              <button className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/60">
                Explore templates
              </button>
            </div>
          </div>
        </section> */}
      </main>
    </div>
  );
}
