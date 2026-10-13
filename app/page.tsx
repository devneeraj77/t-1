"use client";

import { FormEvent, useState } from "react";

type ApiResult = {
  initNum?: number;
  initUnit?: string;
  returnNum?: number;
  returnUnit?: string;
  string?: string;
  error?: string;
};

const examples = [
  { input: "10L", label: "10 liters" },
  { input: "5gal", label: "5 gallons" },
  { input: "3.5mi", label: "3.5 miles" },
  { input: "100lbs", label: "100 pounds" },
  { input: "1/2kg", label: "Half a kilogram" },
];

export default function HomePage() {
  const [input, setInput] = useState("10L");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `/api/convert?input=${encodeURIComponent(input.trim())}`
      );

      const data: ApiResult = await response.json();
      setResult(data);
    } catch {
      setResult({ error: "Unable to connect to the conversion API." });
    } finally {
      setLoading(false);
    }
  }

  async function convertExample(value: string) {
    setInput(value);
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/convert?input=${encodeURIComponent(value)}`
      );

      const data: ApiResult = await response.json();
      setResult(data);
    } catch {
      setResult({ error: "Unable to connect to the conversion API." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:py-20">
      <div className="mx-auto max-w-3xl">
        <header className="mb-12 text-center">
          <div className="mb-5 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
            FreeCodeCamp Project
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Metric
            <span className="text-cyan-400"> ↔ </span>
            Imperial
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            Convert measurements instantly. Enter a number followed by a unit,
            and get the converted value in seconds.
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 sm:p-8">
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="conversion-input"
              className="mb-3 block text-sm font-semibold text-slate-200"
            >
              Enter a measurement
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="conversion-input"
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="e.g. 10L, 1/2kg, 3.5mi"
                autoComplete="off"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-lg outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-xl bg-cyan-400 px-7 py-4 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Converting..." : "Convert"}
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Supports decimals, fractions, and all six supported units.
            </p>
          </form>

          {result && (
            <div
              aria-live="polite"
              className="mt-8 rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-6"
            >
              {"error" in result && result.error ? (
                <>
                  <p className="text-sm font-medium text-rose-400">
                    Conversion error
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {result.error}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-cyan-300">
                    Conversion result
                  </p>

                  <p className="mt-3 break-words text-2xl font-bold leading-relaxed sm:text-3xl">
                    {result.returnNum}{" "}
                    <span className="text-cyan-400">{result.returnUnit}</span>
                  </p>

                  <div className="mt-5 border-t border-white/10 pt-4">
                    <p className="text-sm text-slate-400">Full conversion</p>
                    <p className="mt-2 break-words text-slate-200">
                      {result.string}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/[0.04] p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Original
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        {result.initNum} {result.initUnit}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/[0.04] p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Converted
                      </p>
                      <p className="mt-2 break-words text-lg font-semibold">
                        {result.returnNum} {result.returnUnit}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Try an example</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {examples.map((example) => (
              <button
                key={example.input}
                type="button"
                onClick={() => convertExample(example.input)}
                disabled={loading}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-cyan-400/50 hover:bg-cyan-400/5 disabled:opacity-50"
              >
                <span>
                  <span className="block font-semibold text-white">
                    {example.input}
                  </span>
                  <span className="mt-1 block text-sm text-slate-500">
                    {example.label}
                  </span>
                </span>
                <span className="text-xl text-cyan-400">↗</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold">Supported units</h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { unit: "gal ↔ L", description: "Gallons and liters" },
              { unit: "mi ↔ km", description: "Miles and kilometers" },
              { unit: "lbs ↔ kg", description: "Pounds and kilograms" },
            ].map((item) => (
              <div
                key={item.unit}
                className="rounded-xl border border-white/10 p-4"
              >
                <p className="font-bold text-cyan-300">{item.unit}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-14 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
          Built with Next.js, TypeScript, and Tailwind CSS.
        </footer>
      </div>
    </main>
  );
}