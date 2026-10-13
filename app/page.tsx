"use client";

import React, { useState, useEffect } from "react";

type ConversionResponse = {
  initNum: number;
  initUnit: string;
  returnNum: number;
  returnUnit: string;
  string: string;
};

const UNIT_INFO: Record<
  string,
  { name: string; category: string; counterpart: string; factor: string }
> = {
  gal: {
    name: "Gallons",
    category: "Liquid Volume",
    counterpart: "L",
    factor: "1 gal = 3.78541 L",
  },
  L: {
    name: "Liters",
    category: "Liquid Volume",
    counterpart: "gal",
    factor: "1 L = 0.26417 gal",
  },
  lbs: {
    name: "Pounds",
    category: "Mass / Weight",
    counterpart: "kg",
    factor: "1 lbs = 0.453592 kg",
  },
  kg: {
    name: "Kilograms",
    category: "Mass / Weight",
    counterpart: "lbs",
    factor: "1 kg = 2.20462 lbs",
  },
  mi: {
    name: "Miles",
    category: "Distance",
    counterpart: "km",
    factor: "1 mi = 1.60934 km",
  },
  km: {
    name: "Kilometers",
    category: "Distance",
    counterpart: "mi",
    factor: "1 km = 0.62137 mi",
  },
};

const SAMPLE_INPUTS = [
  { label: "4 Gallons to Liters", input: "4gal" },
  { label: "Half Kilometer to Miles", input: "1/2km" },
  { label: "Compound Fraction Weight", input: "5.4/3lbs" },
  { label: "Default Unit (1 kg)", input: "kg" },
  { label: "Decimal Distance", input: "3.1mi" },
  { label: "10 Liters to Gallons", input: "10L" },
];

export default function Home() {
  const [inputVal, setInputVal] = useState("4gal");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ConversionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"card" | "json">("card");
  const [copied, setCopied] = useState(false);

  // Quick converter state
  const [quickAmount, setQuickAmount] = useState("1");
  const [quickUnit, setQuickUnit] = useState("gal");

  const handleConvert = async (queryInput?: string) => {
    const raw = queryInput !== undefined ? queryInput : inputVal;
    if (!raw.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/convert?input=${encodeURIComponent(raw.trim())}`);
      const text = await res.text();

      // Check if response is error string
      if (
        text === "invalid number" ||
        text === "invalid unit" ||
        text === "invalid number and unit"
      ) {
        setErrorMessage(text);
        setData(null);
      } else {
        try {
          const json: ConversionResponse = JSON.parse(text);
          setData(json);
          setErrorMessage(null);
        } catch {
          setErrorMessage(text || "Unknown parsing error");
          setData(null);
        }
      }
    } catch (err) {
      setErrorMessage("Failed to connect to the conversion service.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleConvert("4gal");
  }, []);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = `${quickAmount}${quickUnit}`;
    setInputVal(query);
    handleConvert(query);
  };

  const swapQuickUnit = () => {
    const target = UNIT_INFO[quickUnit]?.counterpart || "L";
    setQuickUnit(target);
    const query = `${quickAmount}${target}`;
    setInputVal(query);
    handleConvert(query);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-stone-900">
      {/* Top Banner / Classic Header Border */}
      <div className="border-b border-stone-200 bg-[#f7f3ec] py-2 text-center text-xs tracking-widest text-stone-600 uppercase font-mono">
        Standard Weights & Measures • Metric / Imperial System
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Title Section */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-800/20 bg-amber-50 px-3 py-1 text-xs font-semibold tracking-wider text-amber-900 uppercase">
            <span>⚖️ Standard Conversion Engine</span>
          </div>

          <h1 className="mt-4 font-classic-serif text-4xl sm:text-5xl font-normal tracking-tight text-stone-900">
            Metric <span className="text-amber-800 italic">&amp;</span> Imperial
          </h1>
          <p className="mt-3 text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
            A precision unit converter designed with classical typography and modern digital craftsmanship.
            Compliant with international physical measurement benchmarks.
          </p>
        </header>

        {/* Dual Mode Switcher / Interface Card */}
        <div className="rounded-2xl border border-stone-300 bg-white shadow-xl shadow-stone-200/50 overflow-hidden">
          {/* Header Bar */}
          <div className="border-b border-stone-200 bg-stone-50/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-600"></span>
              <h2 className="font-classic-serif font-bold text-stone-800 text-lg">
                Conversion Workshop
              </h2>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-stone-500">
              <span>GET /api/convert</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Quick Interactive Converter */}
            <div className="rounded-xl border border-amber-900/10 bg-[#faf7f2] p-5 sm:p-6">
              <span className="text-xs font-semibold tracking-wider text-amber-900/70 uppercase font-mono block mb-3">
                Quick Interactive Dial
              </span>

              <form onSubmit={handleQuickSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="w-full sm:flex-1 relative">
                  <label htmlFor="quick-amount" className="sr-only">Amount</label>
                  <input
                    id="quick-amount"
                    type="text"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    placeholder="e.g. 10 or 3/4 or 5.4"
                    className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-800 font-mono text-base focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                  <span className="absolute right-3 top-3 text-xs text-stone-400 font-mono">Qty</span>
                </div>

                <div className="w-full sm:w-44">
                  <label htmlFor="quick-unit" className="sr-only">Unit</label>
                  <select
                    id="quick-unit"
                    value={quickUnit}
                    onChange={(e) => setQuickUnit(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-800 text-base font-medium focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
                  >
                    <option value="gal">Gallons (gal)</option>
                    <option value="L">Liters (L)</option>
                    <option value="lbs">Pounds (lbs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="mi">Miles (mi)</option>
                    <option value="km">Kilometers (km)</option>
                  </select>
                </div>

                {/* Swap Button */}
                <button
                  type="button"
                  onClick={swapQuickUnit}
                  title="Swap with counterpart unit"
                  className="w-full sm:w-auto px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 active:scale-95 transition-all text-sm font-semibold flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Swap</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto rounded-lg bg-stone-900 px-6 py-2.5 text-white font-medium hover:bg-amber-900 transition-colors active:scale-95"
                >
                  {loading ? "Calculating..." : "Convert"}
                </button>
              </form>
            </div>

            {/* Direct Query Formula Input (freeCodeCamp Specification) */}
            <div>
              <label htmlFor="raw-input" className="block text-xs font-semibold tracking-wider text-stone-500 uppercase font-mono mb-2">
                Raw Query Expression (freeCodeCamp API Format)
              </label>

              <form
                id="convertForm"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConvert();
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <input
                    id="convertField"
                    name="input"
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="e.g. 10L, 4gal, 3/4mi, 5.4/3lbs, kg"
                    className="w-full rounded-lg border border-stone-300 bg-stone-50/50 px-4 py-3 font-mono text-base text-stone-900 shadow-inner focus:border-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-800"
                  />
                  <span className="absolute right-3 top-3.5 text-xs text-stone-400 font-mono">
                    input
                  </span>
                </div>

                <button
                  id="convert"
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-lg bg-amber-800 px-7 py-3 font-medium text-white shadow-sm hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-800/40 active:scale-95 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      Converting...
                    </span>
                  ) : (
                    "Convert!"
                  )}
                </button>
              </form>

              {/* Sample Chips */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-stone-400 font-mono mr-1">Presets:</span>
                {SAMPLE_INPUTS.map((sample) => (
                  <button
                    key={sample.input}
                    type="button"
                    onClick={() => {
                      setInputVal(sample.input);
                      handleConvert(sample.input);
                    }}
                    className="rounded-md border border-stone-200 bg-stone-50 px-2 py-1 font-mono text-stone-600 hover:border-amber-700/50 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                  >
                    {sample.input}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Display */}
            <div className="border-t border-stone-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-classic-serif text-lg font-bold text-stone-900">
                  Result
                </h3>

                <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-100 p-0.5 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setActiveTab("card")}
                    className={`rounded-md px-3 py-1 transition-all ${
                      activeTab === "card"
                        ? "bg-white text-stone-900 shadow-sm font-semibold"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    Visual Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("json")}
                    className={`rounded-md px-3 py-1 transition-all ${
                      activeTab === "json"
                        ? "bg-white text-stone-900 shadow-sm font-semibold"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    JSON Response
                  </button>
                </div>
              </div>

              {/* Error Message Display */}
              {errorMessage && (
                <div className="rounded-xl border border-rose-300 bg-rose-50/80 p-5 text-rose-900">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-wider text-rose-600 font-bold">
                        API Error Returned
                      </p>
                      <p id="result" className="font-mono text-lg font-bold text-rose-950 mt-0.5">
                        {errorMessage}
                      </p>
                      <p className="text-xs text-rose-700 mt-1">
                        Please review the numerical fraction or unit symbol (allowed: gal, L, mi, km, lbs, kg).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Result View */}
              {!errorMessage && data && (
                <div>
                  {activeTab === "card" ? (
                    <div className="rounded-xl border border-stone-200 bg-gradient-to-br from-white to-stone-50/60 p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-100">
                        <div>
                          <span className="text-xs font-mono text-stone-400 uppercase tracking-widest">
                            Initial Value
                          </span>
                          <div className="font-mono text-2xl font-semibold text-stone-800">
                            {data.initNum} <span className="text-amber-800">{data.initUnit}</span>
                          </div>
                        </div>

                        <div className="hidden sm:flex text-stone-300 text-xl font-classic-serif">
                          ⇄
                        </div>

                        <div className="sm:text-right">
                          <span className="text-xs font-mono text-stone-400 uppercase tracking-widest">
                            Converted Equivalent
                          </span>
                          <div className="font-mono text-3xl font-bold text-emerald-800">
                            {data.returnNum}{" "}
                            <span className="text-emerald-700 text-2xl">{data.returnUnit}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p id="result" className="font-classic-serif text-lg text-stone-800 italic">
                          &ldquo;{data.string}&rdquo;
                        </p>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(data.string)}
                          className="self-start sm:self-auto rounded-md border border-stone-200 bg-white px-3 py-1 text-xs font-mono text-stone-600 hover:bg-stone-50 transition-colors shadow-2xs"
                        >
                          {copied ? "Copied!" : "Copy Text"}
                        </button>
                      </div>

                      {/* Formula Footnote */}
                      <div className="mt-4 rounded-lg bg-stone-100/70 p-3 text-xs text-stone-600 flex items-center justify-between">
                        <span className="font-mono text-stone-500">Benchmark Factor:</span>
                        <span className="font-mono font-medium text-stone-800">
                          {UNIT_INFO[data.initUnit]?.factor || "Precision Multiplier"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-xl border border-stone-800 bg-stone-900 p-5 text-stone-100 font-mono text-xs overflow-x-auto">
                      <div className="flex justify-between items-center pb-2 border-b border-stone-800 mb-3">
                        <span className="text-stone-400">Response Object</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
                          className="rounded border border-stone-700 px-2 py-0.5 text-stone-300 hover:bg-stone-800 text-[11px]"
                        >
                          {copied ? "Copied!" : "Copy JSON"}
                        </button>
                      </div>
                      <pre id="jsonResult" className="text-emerald-400">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Measurement Standards Table */}
        <section className="mt-12 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="font-classic-serif text-xl font-bold text-stone-900 mb-2">
            Physical Measurement Standards
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mb-6">
            Supported conversions are computed to five decimal places per freeCodeCamp Quality Assurance standards.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 font-mono text-stone-400 uppercase text-[11px]">
                  <th className="py-2.5 pr-4">Metric</th>
                  <th className="py-2.5 px-4">Imperial</th>
                  <th className="py-2.5 px-4">Measurement Type</th>
                  <th className="py-2.5 px-4">Exact Baseline Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700 font-mono">
                <tr>
                  <td className="py-3 pr-4 font-semibold text-stone-900">Liters (L)</td>
                  <td className="py-3 px-4 font-semibold text-stone-900">Gallons (gal)</td>
                  <td className="py-3 px-4 text-stone-500 font-sans">Liquid Volume</td>
                  <td className="py-3 px-4 text-amber-900">1 gal = 3.78541 L</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-stone-900">Kilograms (kg)</td>
                  <td className="py-3 px-4 font-semibold text-stone-900">Pounds (lbs)</td>
                  <td className="py-3 px-4 text-stone-500 font-sans">Mass / Weight</td>
                  <td className="py-3 px-4 text-amber-900">1 lbs = 0.453592 kg</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-stone-900">Kilometers (km)</td>
                  <td className="py-3 px-4 font-semibold text-stone-900">Miles (mi)</td>
                  <td className="py-3 px-4 text-stone-500 font-sans">Distance</td>
                  <td className="py-3 px-4 text-amber-900">1 mi = 1.60934 km</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-stone-400 font-mono">
          <p>Full-Stack JavaScript App built with Next.js App Router &amp; Tailwind CSS.</p>
        </footer>
      </main>
    </div>
  );
}
