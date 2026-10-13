"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";

type ConversionData = {
  initNum: number;
  initUnit: string;
  returnNum: number;
  returnUnit: string;
  string: string;
};

type HistoryItem = {
  input: string;
  resultString: string;
  timestamp: string;
  isError: boolean;
};

const UNIT_SPECS: Record<
  string,
  {
    name: string;
    system: "Imperial" | "Metric";
    category: "Liquid Volume" | "Mass & Weight" | "Distance";
    targetUnit: string;
    factorText: string;
    mathOperation: string;
    symbol: string;
  }
> = {
  gal: {
    name: "Gallons",
    system: "Imperial",
    category: "Liquid Volume",
    targetUnit: "L",
    factorText: "1 gal = 3.78541 L",
    mathOperation: "× 3.78541",
    symbol: "🫗",
  },
  L: {
    name: "Liters",
    system: "Metric",
    category: "Liquid Volume",
    targetUnit: "gal",
    factorText: "1 L = 0.264172 gal",
    mathOperation: "÷ 3.78541",
    symbol: "💧",
  },
  lbs: {
    name: "Pounds",
    system: "Imperial",
    category: "Mass & Weight",
    targetUnit: "kg",
    factorText: "1 lbs = 0.453592 kg",
    mathOperation: "× 0.453592",
    symbol: "⚖️",
  },
  kg: {
    name: "Kilograms",
    system: "Metric",
    category: "Mass & Weight",
    targetUnit: "lbs",
    factorText: "1 kg = 2.20462 lbs",
    mathOperation: "÷ 0.453592",
    symbol: "🏋️",
  },
  mi: {
    name: "Miles",
    system: "Imperial",
    category: "Distance",
    targetUnit: "km",
    factorText: "1 mi = 1.60934 km",
    mathOperation: "× 1.60934",
    symbol: "🧭",
  },
  km: {
    name: "Kilometers",
    system: "Metric",
    category: "Distance",
    targetUnit: "mi",
    factorText: "1 km = 0.621371 mi",
    mathOperation: "÷ 1.60934",
    symbol: "🛣️",
  },
};

const SAMPLE_PRESETS = [
  { label: "4 gal", query: "4gal", desc: "Volume (Imperial → Metric)" },
  { label: "10 L", query: "10L", desc: "Volume (Metric → Imperial)" },
  { label: "3/4 mi", query: "3/4mi", desc: "Fractional Distance" },
  { label: "5.4/3 lbs", query: "5.4/3lbs", desc: "Decimal Fraction Weight" },
  { label: "kg", query: "kg", desc: "Default Unit (1 kg)" },
  { label: "42.195 km", query: "42.195km", desc: "Marathon Distance" },
];

const INITIAL_DEFAULT_DATA: ConversionData = {
  initNum: 4,
  initUnit: "gal",
  returnNum: 15.14164,
  returnUnit: "L",
  string: "4 gallons converts to 15.14164 liters",
};

// URL parameter listener wrapped in Suspense for static prerendering compatibility
function UrlParamListener({
  onParamFound,
}: {
  onParamFound: (query: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const input = searchParams.get("input");
    if (input) {
      onParamFound(input);
    }
  }, [searchParams, onParamFound]);

  return null;
}

export default function Home() {
  const [inputVal, setInputVal] = useState("4gal");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ConversionData | null>(INITIAL_DEFAULT_DATA);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rawTextOutput, setRawTextOutput] = useState<string>(
    JSON.stringify(INITIAL_DEFAULT_DATA, null, 2)
  );
  const [activeTab, setActiveTab] = useState<"dashboard" | "json" | "curl">("dashboard");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "volume" | "mass" | "distance">("all");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>("");

  // Sync current base URL in browser environment
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.origin);
    }
  }, []);

  // Load history from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("converter_history_log");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const saveToHistory = (query: string, resultStr: string, isErr: boolean) => {
    const newItem: HistoryItem = {
      input: query,
      resultString: resultStr,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      isError: isErr,
    };
    setHistory((prev) => {
      const updated = [newItem, ...prev.filter((i) => i.input !== query)].slice(0, 6);
      try {
        localStorage.setItem("converter_history_log", JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const updateBrowserSearchUrl = (query: string) => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (query.trim()) {
        url.searchParams.set("input", query.trim());
      } else {
        url.searchParams.delete("input");
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  const executeConversion = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setErrorMessage(null);
    updateBrowserSearchUrl(trimmed);

    try {
      const res = await fetch(`/api/convert?input=${encodeURIComponent(trimmed)}`);
      const text = await res.text();
      setRawTextOutput(text);

      if (
        text === "invalid number" ||
        text === "invalid unit" ||
        text === "invalid number and unit"
      ) {
        setErrorMessage(text);
        setData(null);
        saveToHistory(trimmed, text, true);
      } else {
        try {
          const parsed: ConversionData = JSON.parse(text);
          setData(parsed);
          setErrorMessage(null);
          saveToHistory(trimmed, parsed.string, false);
        } catch {
          setErrorMessage(text || "Could not parse response");
          setData(null);
          saveToHistory(trimmed, text, true);
        }
      }
    } catch {
      const err = "Failed to connect to conversion engine.";
      setErrorMessage(err);
      setRawTextOutput(err);
      setData(null);
      saveToHistory(trimmed, err, true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUrlParamFound = useCallback((param: string) => {
    setInputVal(param);
    executeConversion(param);
  }, [executeConversion]);

  const copySnippet = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("converter_history_log");
    } catch {
      // Ignore
    }
  };

  // Quick unit applicator
  const applyQuickUnit = (unit: string) => {
    const match = inputVal.match(/^([^a-zA-Z]*)/);
    const existingNum = match ? match[1].trim() : "1";
    const nextVal = `${existingNum || "1"}${unit}`;
    setInputVal(nextVal);
    executeConversion(nextVal);
  };

  // Quick fraction appender
  const appendFractionChar = (char: string) => {
    if (char === "CLEAR") {
      setInputVal("");
    } else {
      setInputVal((prev) => prev + char);
    }
  };

  const spec = data ? UNIT_SPECS[data.initUnit] : null;
  const targetSpec = data ? UNIT_SPECS[data.returnUnit] : null;

  // Visual ratio calculation for the visual gauge
  let ratioPercentage = 50;
  if (data && data.initNum > 0 && data.returnNum > 0) {
    const maxVal = Math.max(data.initNum, data.returnNum);
    ratioPercentage = Math.min(100, Math.max(10, Math.round((data.returnNum / maxVal) * 100)));
  }

  const directSearchUrl = `${currentUrl}/?input=${encodeURIComponent(inputVal || "4gal")}`;
  const directApiUrl = `${currentUrl}/api/convert?input=${encodeURIComponent(inputVal || "4gal")}`;

  return (
    <div className="min-h-screen bg-[#090d16] text-zinc-100 bg-grid-pattern relative pb-20 selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Search URL Parameter Synchronizer */}
      <Suspense fallback={null}>
        <UrlParamListener onParamFound={handleUrlParamFound} />
      </Suspense>

      {/* Top Telemetry Status Bar - Standalone, strictly NO navigation menu */}
      <div className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-2.5">
        <div className="mx-auto max-w-5xl flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-semibold tracking-wider uppercase text-[11px]">
              ENGINE ONLINE • 5-DECIMAL CALIBRATED
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400">
            <span>QA BENCHMARK: ISO/FCC</span>
            <span className="text-slate-700">|</span>
            <span className="text-cyan-400">ROUTER: NEXT.JS APP TS</span>
          </div>
        </div>
      </div>

      {/* Main Console Container */}
      <main className="mx-auto max-w-5xl px-4 pt-10 sm:pt-14 sm:px-6">
        {/* Header Hero Section */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-mono text-cyan-300 tracking-wider">
            <span className="text-cyan-400">⚡</span>
            <span>PRECISION MEASUREMENT WORKSTATION</span>
          </div>

          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-white">
            METRIC <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400">⇄</span> IMPERIAL
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            High-precision physical conversion engine compliant with international metrology standards.
            Direct search URL parameter integration for automated workflows.
          </p>
        </section>

        {/* Primary Interactive Workstation Card */}
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Workstation Top Bar */}
          <div className="border-b border-slate-800 bg-slate-950/60 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-400 glow-emerald"></div>
              <h2 className="text-sm font-semibold text-slate-200 tracking-wide font-mono uppercase">
                Direct Conversion Console
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  activeCategory === "all"
                    ? "bg-slate-700 text-white font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("volume")}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  activeCategory === "volume"
                    ? "bg-cyan-900/60 text-cyan-300 border border-cyan-700/50"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🫗 Volume
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("mass")}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  activeCategory === "mass"
                    ? "bg-amber-900/60 text-amber-300 border border-amber-700/50"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ⚖️ Mass
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("distance")}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  activeCategory === "distance"
                    ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🧭 Distance
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Conversion Form (Includes required freeCodeCamp IDs: convertForm, convertField, convert) */}
            <div>
              <form
                id="convertForm"
                action="/"
                method="GET"
                onSubmit={(e) => {
                  e.preventDefault();
                  executeConversion(inputVal);
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-sm">
                    &gt;
                  </div>
                  <input
                    id="convertField"
                    name="input"
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Enter query e.g. 10L, 4gal, 3/4mi, 5.4/3lbs, kg"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 pl-8 pr-20 py-3.5 font-mono text-base text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-1.5">
                    {inputVal && (
                      <button
                        type="button"
                        onClick={() => setInputVal("")}
                        className="text-xs font-mono text-slate-500 hover:text-slate-300 p-1"
                        title="Clear input"
                      >
                        ✕
                      </button>
                    )}
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      Query
                    </span>
                  </div>
                </div>

                <button
                  id="convert"
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 px-8 py-3.5 font-mono text-sm font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Computing...</span>
                    </>
                  ) : (
                    <>
                      <span>Convert!</span>
                      <span className="text-base">↵</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Math / Fraction Helper Bar */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-500 text-[11px] mr-1">Helper Pad:</span>
                  {["1/2", "3/4", "5/8", "2.5", "/", "."].map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => appendFractionChar(sym)}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 px-2 py-1 text-slate-400 hover:text-cyan-300 hover:border-cyan-600/50 transition-colors"
                    >
                      {sym}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => appendFractionChar("CLEAR")}
                    className="rounded-lg border border-slate-800 bg-slate-950/70 px-2 py-1 text-rose-400 hover:text-rose-300 hover:border-rose-600/50 transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {/* Quick Unit Selector */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-500 text-[11px] mr-1">Units:</span>
                  {(activeCategory === "all" || activeCategory === "volume") && (
                    <>
                      <button
                        type="button"
                        onClick={() => applyQuickUnit("gal")}
                        className="rounded-lg border border-cyan-800/40 bg-cyan-950/30 px-2 py-1 text-cyan-300 hover:bg-cyan-900/50 transition-colors"
                      >
                        gal
                      </button>
                      <button
                        type="button"
                        onClick={() => applyQuickUnit("L")}
                        className="rounded-lg border border-blue-800/40 bg-blue-950/30 px-2 py-1 text-blue-300 hover:bg-blue-900/50 transition-colors"
                      >
                        L
                      </button>
                    </>
                  )}
                  {(activeCategory === "all" || activeCategory === "mass") && (
                    <>
                      <button
                        type="button"
                        onClick={() => applyQuickUnit("lbs")}
                        className="rounded-lg border border-amber-800/40 bg-amber-950/30 px-2 py-1 text-amber-300 hover:bg-amber-900/50 transition-colors"
                      >
                        lbs
                      </button>
                      <button
                        type="button"
                        onClick={() => applyQuickUnit("kg")}
                        className="rounded-lg border border-orange-800/40 bg-orange-950/30 px-2 py-1 text-orange-300 hover:bg-orange-900/50 transition-colors"
                      >
                        kg
                      </button>
                    </>
                  )}
                  {(activeCategory === "all" || activeCategory === "distance") && (
                    <>
                      <button
                        type="button"
                        onClick={() => applyQuickUnit("mi")}
                        className="rounded-lg border border-emerald-800/40 bg-emerald-950/30 px-2 py-1 text-emerald-300 hover:bg-emerald-900/50 transition-colors"
                      >
                        mi
                      </button>
                      <button
                        type="button"
                        onClick={() => applyQuickUnit("km")}
                        className="rounded-lg border border-teal-800/40 bg-teal-950/30 px-2 py-1 text-teal-300 hover:bg-teal-900/50 transition-colors"
                      >
                        km
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Presets Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mr-1">
                Standard Presets:
              </span>
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.query}
                  type="button"
                  onClick={() => {
                    setInputVal(preset.query);
                    executeConversion(preset.query);
                  }}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs font-mono text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span className="text-cyan-400 font-semibold">{preset.label}</span>
                  <span className="text-slate-600 text-[10px] hidden md:inline">({preset.desc})</span>
                </button>
              ))}
            </div>

            {/* View Tab Selector */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-slate-400">Results Inspector</span>
              </div>

              <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveTab("dashboard")}
                  className={`rounded-lg px-3 py-1 transition-all ${
                    activeTab === "dashboard"
                      ? "bg-slate-800 text-cyan-300 font-medium shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Telemetry
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("json")}
                  className={`rounded-lg px-3 py-1 transition-all ${
                    activeTab === "json"
                      ? "bg-slate-800 text-cyan-300 font-medium shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  JSON Object
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("curl")}
                  className={`rounded-lg px-3 py-1 transition-all ${
                    activeTab === "curl"
                      ? "bg-slate-800 text-cyan-300 font-medium shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  HTTP / cURL
                </button>
              </div>
            </div>

            {/* ERROR DISPLAY (Contains required freeCodeCamp test targets: id="result" and id="jsonResult") */}
            {errorMessage && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-6 text-rose-200 glow-rose">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-rose-500/20 p-2.5 text-rose-400 text-xl shrink-0">
                    ⚠️
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
                        API Error Returned
                      </span>
                      <span className="text-xs font-mono text-rose-400/80">HTTP 200 • Text Response</span>
                    </div>

                    {/* Official required FCC test target: #result */}
                    <p id="result" className="font-mono text-xl font-bold text-rose-100 mt-1">
                      {errorMessage}
                    </p>

                    <p className="text-xs text-rose-300/80 mt-2 font-mono">
                      Allowed units: <code className="bg-rose-950/60 px-1 py-0.5 rounded text-white">gal, L, mi, km, lbs, kg</code>. Single fractions (e.g. 3/4) allowed; double fractions (e.g. 3/2/3) disallowed.
                    </p>

                    {/* Official required FCC test target: #jsonResult */}
                    <div className="mt-4 pt-3 border-t border-rose-900/50">
                      <span className="text-[11px] font-mono text-rose-400/70 block mb-1">
                        Raw API Body Output:
                      </span>
                      <pre className="text-xs font-mono bg-slate-950/80 p-3 rounded-xl border border-rose-900/40 text-rose-300 overflow-x-auto">
                        <code id="jsonResult">{JSON.stringify(rawTextOutput)}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUCCESS DASHBOARD VIEW */}
            {!errorMessage && data && (
              <div className="space-y-6">
                {activeTab === "dashboard" && (
                  <div className="space-y-6">
                    {/* Visual Comparison Card */}
                    <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-950/90 to-slate-900/60 p-6 sm:p-7 shadow-inner">
                      {/* Metric & Imperial Dual Gauge Display */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        {/* Initial Unit Side */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 relative overflow-hidden">
                          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                            <span className="uppercase tracking-widest flex items-center gap-1.5">
                              <span>{spec?.symbol}</span>
                              <span>Initial Input ({spec?.system})</span>
                            </span>
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                              {spec?.category}
                            </span>
                          </div>

                          <div className="flex items-baseline gap-3 mt-3">
                            <span className="font-mono text-4xl sm:text-5xl font-black text-white tracking-tight">
                              {data.initNum}
                            </span>
                            <span className="font-mono text-2xl font-bold text-cyan-400">
                              {data.initUnit}
                            </span>
                          </div>

                          <div className="mt-2 text-xs text-slate-400 font-mono">
                            {spec?.name}
                          </div>
                        </div>

                        {/* Converted Equivalent Side */}
                        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 relative overflow-hidden glow-emerald">
                          <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-2">
                            <span className="uppercase tracking-widest flex items-center gap-1.5">
                              <span>{targetSpec?.symbol}</span>
                              <span>Converted ({targetSpec?.system})</span>
                            </span>
                            <span className="bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded text-[10px] border border-emerald-700/50">
                              Target Metric
                            </span>
                          </div>

                          <div className="flex items-baseline gap-3 mt-3">
                            <span className="font-mono text-4xl sm:text-5xl font-black text-emerald-300 tracking-tight">
                              {data.returnNum}
                            </span>
                            <span className="font-mono text-2xl font-bold text-emerald-400">
                              {data.returnUnit}
                            </span>
                          </div>

                          <div className="mt-2 text-xs text-emerald-400/80 font-mono">
                            {targetSpec?.name}
                          </div>
                        </div>
                      </div>

                      {/* Visual Ratio Gauge Bar */}
                      <div className="mt-6 pt-5 border-t border-slate-800/80">
                        <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
                          <span>Physical Scale Ratio</span>
                          <span className="text-cyan-400">{spec?.factorText}</span>
                        </div>
                        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${ratioPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Official FCC Test Target: #result */}
                      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-0.5">
                            Spelled-out Conversion Result
                          </span>
                          <p id="result" className="font-mono text-base sm:text-lg text-emerald-300 font-semibold">
                            {data.string}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => copySnippet(data.string, "sentence")}
                          className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800 transition-all shrink-0 active:scale-95 cursor-pointer"
                        >
                          {copiedKey === "sentence" ? "✓ Copied!" : "Copy Sentence"}
                        </button>
                      </div>

                      {/* Formula Step Explanation */}
                      <div className="mt-4 rounded-xl bg-slate-950/50 border border-slate-800/50 p-3.5 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Operation:</span>
                          <span className="text-slate-200">
                            {data.initNum} {spec?.mathOperation} = {data.returnNum} {data.returnUnit}
                          </span>
                        </div>
                        <span className="text-slate-500 text-[11px]">
                          Precision: 5 Decimal Places
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* JSON OBJECT TAB (Must include id="jsonResult" for FCC testing) */}
                {activeTab === "json" && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 relative">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800 text-xs font-mono">
                      <span className="text-slate-400">Response Payload (`GET /api/convert`)</span>
                      <button
                        type="button"
                        onClick={() => copySnippet(JSON.stringify(data, null, 2), "json")}
                        className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        {copiedKey === "json" ? "✓ Copied JSON" : "Copy JSON"}
                      </button>
                    </div>

                    <pre className="font-mono text-xs text-emerald-400 overflow-x-auto p-2">
                      <code id="jsonResult">{JSON.stringify(data, null, 2)}</code>
                    </pre>
                  </div>
                )}

                {/* HTTP / CURL TAB */}
                {activeTab === "curl" && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>cURL Command Snippet</span>
                      <button
                        type="button"
                        onClick={() =>
                          copySnippet(`curl "${directApiUrl}"`, "curl")
                        }
                        className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        {copiedKey === "curl" ? "✓ Copied cURL" : "Copy cURL"}
                      </button>
                    </div>

                    <pre className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 text-xs font-mono text-cyan-300 overflow-x-auto">
                      <code>{`curl "${directApiUrl}"`}</code>
                    </pre>

                    <div className="pt-2">
                      <span className="text-xs font-mono text-slate-400 block mb-2">JavaScript Fetch</span>
                      <pre className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 text-xs font-mono text-slate-300 overflow-x-auto">
                        <code>{`fetch("${directApiUrl}")
  .then(res => res.json())
  .then(data => console.log(data));`}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* Always keep #jsonResult accessible even if dashboard tab is active */}
                {activeTab !== "json" && (
                  <div className="sr-only">
                    <code id="jsonResult">{JSON.stringify(data)}</code>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* DIRECT SEARCH URL BASE WIDGET (Direct URL parameter sharing & discovery) */}
        <section className="mt-8 rounded-3xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 text-sm">🔗</span>
                <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
                  Direct Search URL Base
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Direct browser URL deep-link. Any parameter in the search URL automatically executes immediately on load.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copySnippet(directSearchUrl, "searchUrl")}
                className="rounded-xl border border-cyan-800/50 bg-cyan-950/40 px-3.5 py-2 text-xs font-mono text-cyan-300 hover:bg-cyan-900/40 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <span>{copiedKey === "searchUrl" ? "✓ Copied!" : "Copy Page URL"}</span>
              </button>

              <button
                type="button"
                onClick={() => copySnippet(directApiUrl, "apiUrl")}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <span>{copiedKey === "apiUrl" ? "✓ Copied!" : "Copy API URL"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3 flex items-center justify-between gap-3 text-xs font-mono text-slate-300 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-cyan-400 shrink-0 font-bold">PAGE:</span>
                <span className="text-slate-300 truncate">{directSearchUrl}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3 flex items-center justify-between gap-3 text-xs font-mono text-slate-300 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-emerald-400 shrink-0 font-bold">API:</span>
                <span className="text-slate-300 truncate">{directApiUrl}</span>
              </div>
            </div>
          </div>
        </section>

        {/* RECENT LOCAL HISTORY SECTION */}
        {history.length > 0 && (
          <section className="mt-8 rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-sm">⏱️</span>
                <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
                  Session Conversion History
                </h3>
              </div>

              <button
                type="button"
                onClick={clearHistory}
                className="text-xs font-mono text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Clear Log
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.map((item, idx) => (
                <button
                  key={`${item.input}-${idx}`}
                  type="button"
                  onClick={() => {
                    setInputVal(item.input);
                    executeConversion(item.input);
                  }}
                  className="text-left rounded-2xl border border-slate-800/90 bg-slate-950/60 p-3.5 hover:border-slate-700 hover:bg-slate-900/60 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {item.input}
                    </span>
                    <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                  </div>
                  <p
                    className={`text-xs font-mono truncate ${
                      item.isError ? "text-rose-400" : "text-slate-400"
                    }`}
                  >
                    {item.resultString}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Physical Conversion Benchmarks Reference Table */}
        <section className="mt-8 rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md p-6 sm:p-8">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-2">
            Metrology Standards & Conversion Constants
          </h3>
          <p className="text-xs text-slate-400 mb-6 font-mono">
            Compliant with ISO / NIST international benchmarks. Conversion output rounded to 5 decimal places.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[11px]">
                  <th className="pb-3 pr-4">Dimension</th>
                  <th className="pb-3 px-4">Imperial Unit</th>
                  <th className="pb-3 px-4">Metric Unit</th>
                  <th className="pb-3 px-4">Standard Formula Benchmark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                <tr>
                  <td className="py-3.5 pr-4 text-cyan-400 font-semibold">Liquid Volume</td>
                  <td className="py-3.5 px-4">Gallons (gal)</td>
                  <td className="py-3.5 px-4">Liters (L)</td>
                  <td className="py-3.5 px-4 text-slate-400">1 gal = 3.78541 L</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 text-amber-400 font-semibold">Mass / Weight</td>
                  <td className="py-3.5 px-4">Pounds (lbs)</td>
                  <td className="py-3.5 px-4">Kilograms (kg)</td>
                  <td className="py-3.5 px-4 text-slate-400">1 lbs = 0.453592 kg</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 text-emerald-400 font-semibold">Distance / Length</td>
                  <td className="py-3.5 px-4">Miles (mi)</td>
                  <td className="py-3.5 px-4">Kilometers (km)</td>
                  <td className="py-3.5 px-4 text-slate-400">1 mi = 1.60934 km</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer (No navigation menu, clean telemetry footer) */}
        <footer className="mt-12 text-center text-xs font-mono text-slate-600">
          <p>Full-Stack Next.js App Router • Metric-Imperial Measurement Engine</p>
        </footer>
      </main>
    </div>
  );
}
