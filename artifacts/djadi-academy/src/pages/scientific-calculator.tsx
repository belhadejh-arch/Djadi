import { useState, useCallback } from "react";
import { Delete, RotateCcw } from "lucide-react";

// ── Expression evaluator ──────────────────────────────────────────────────
function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function evalExpr(expr: string, deg: boolean): number {
  const D = Math.PI / 180;
  const toR = (x: number) => (deg ? x * D : x);
  const fromR = (x: number) => (deg ? x / D : x);

  // Tokenize: replace user-facing operators with JS equivalents
  let e = expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/π/g, String(Math.PI))
    .replace(/e(?![0-9])/g, String(Math.E));

  // Inject trig adjustments
  e = e
    .replace(/sin⁻¹\(/g, `__asin(`)
    .replace(/cos⁻¹\(/g, `__acos(`)
    .replace(/tan⁻¹\(/g, `__atan(`)
    .replace(/sin\(/g, deg ? `__sin(` : `Math.sin(`)
    .replace(/cos\(/g, deg ? `__cos(` : `Math.cos(`)
    .replace(/tan\(/g, deg ? `__tan(` : `Math.tan(`)
    .replace(/log\(/g, `Math.log10(`)
    .replace(/ln\(/g, `Math.log(`)
    .replace(/√\(/g, `Math.sqrt(`)
    .replace(/∛\(/g, `Math.cbrt(`)
    .replace(/abs\(/g, `Math.abs(`)
    .replace(/!/g, `__fact`)
    .replace(/__fact([0-9.]+)/g, (_, n) => String(factorial(+n)));

  // eslint-disable-next-line no-new-func
  const fn = new Function(
    "Math", "__sin", "__cos", "__tan", "__asin", "__acos", "__atan", "__fact",
    `"use strict"; return (${e})`
  );
  return fn(
    Math,
    (x: number) => Math.sin(toR(x)),
    (x: number) => Math.cos(toR(x)),
    (x: number) => Math.tan(toR(x)),
    (x: number) => fromR(Math.asin(x)),
    (x: number) => fromR(Math.acos(x)),
    (x: number) => fromR(Math.atan(x)),
    (n: number) => factorial(n),
  );
}

// ── Button definitions ────────────────────────────────────────────────────
type BtnKind = "sci" | "op" | "num" | "eq" | "clear" | "ctrl";

interface Btn {
  label: string;
  label2?: string; // shown when shift is active
  value: string;
  value2?: string;
  kind: BtnKind;
  wide?: boolean;
}

const ROWS: Btn[][] = [
  // Row 0 – mode + inverse trig
  [
    { label: "Rad", value: "__rad", kind: "ctrl" },
    { label: "2ⁿᵈ", value: "__shift", kind: "ctrl" },
    { label: "sin", label2: "sin⁻¹", value: "sin(", value2: "sin⁻¹(", kind: "sci" },
    { label: "cos", label2: "cos⁻¹", value: "cos(", value2: "cos⁻¹(", kind: "sci" },
    { label: "tan", label2: "tan⁻¹", value: "tan(", value2: "tan⁻¹(", kind: "sci" },
  ],
  // Row 1
  [
    { label: "x²", label2: "x³", value: "²", value2: "³", kind: "sci" },
    { label: "xʸ", value: "**", kind: "sci" },
    { label: "√", label2: "∛", value: "√(", value2: "∛(", kind: "sci" },
    { label: "log", label2: "10ˣ", value: "log(", value2: "10**(", kind: "sci" },
    { label: "ln", label2: "eˣ", value: "ln(", value2: "e**(", kind: "sci" },
  ],
  // Row 2
  [
    { label: "π", value: "π", kind: "sci" },
    { label: "e", value: "e", kind: "sci" },
    { label: "( )", value: "__paren", kind: "sci" },
    { label: "n!", value: "!", kind: "sci" },
    { label: "1/x", value: "1/(", kind: "sci" },
  ],
  // Row 3
  [
    { label: "AC", value: "__ac", kind: "clear" },
    { label: "⌫", value: "__back", kind: "clear" },
    { label: "%", value: "/100", kind: "op" },
    { label: "÷", value: "÷", kind: "op" },
    { label: "Ans", value: "__ans", kind: "ctrl" },
  ],
  // Row 4
  [
    { label: "7", value: "7", kind: "num" },
    { label: "8", value: "8", kind: "num" },
    { label: "9", value: "9", kind: "num" },
    { label: "×", value: "×", kind: "op" },
    { label: "(", value: "(", kind: "op" },
  ],
  // Row 5
  [
    { label: "4", value: "4", kind: "num" },
    { label: "5", value: "5", kind: "num" },
    { label: "6", value: "6", kind: "num" },
    { label: "−", value: "−", kind: "op" },
    { label: ")", value: ")", kind: "op" },
  ],
  // Row 6
  [
    { label: "1", value: "1", kind: "num" },
    { label: "2", value: "2", kind: "num" },
    { label: "3", value: "3", kind: "num" },
    { label: "+", value: "+", kind: "op" },
    { label: "=", value: "__eq", kind: "eq" },
  ],
  // Row 7
  [
    { label: "0", value: "0", kind: "num", wide: true },
    { label: ".", value: ".", kind: "num" },
    { label: "+/−", value: "__neg", kind: "ctrl" },
  ],
];

// ── Button styling ────────────────────────────────────────────────────────
function btnCls(kind: BtnKind, active = false): string {
  const base =
    "relative flex items-center justify-center select-none cursor-pointer rounded-2xl font-bold transition-all active:scale-95 touch-none ";
  if (kind === "eq")   return base + "bg-primary text-primary-foreground shadow-lg text-xl hover:brightness-110";
  if (kind === "clear") return base + "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200";
  if (kind === "op")   return base + "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200";
  if (kind === "sci")  return base + (active
    ? "bg-primary/20 text-primary"
    : "bg-muted text-foreground hover:bg-muted/70 text-sm");
  if (kind === "ctrl") return base + (active
    ? "bg-primary text-primary-foreground"
    : "bg-muted text-muted-foreground hover:bg-muted/70 text-xs");
  // num
  return base + "bg-card border border-border text-foreground hover:bg-muted shadow-sm text-lg";
}

// ─────────────────────────────────────────────────────────────────────────
export default function ScientificCalculator() {
  const [expr, setExpr]       = useState("");
  const [result, setResult]   = useState<string | null>(null);
  const [error, setError]     = useState(false);
  const [deg, setDeg]         = useState(true);   // true = degrees
  const [shift, setShift]     = useState(false);
  const [ans, setAns]         = useState(0);
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);

  // Count open parens to decide what ( ) inserts
  const openParens = (expr.match(/\(/g) || []).length - (expr.match(/\)/g) || []).length;

  const press = useCallback((btn: Btn) => {
    const v = shift && btn.value2 ? btn.value2 : btn.value;

    // Special actions
    if (v === "__rad") { setDeg((d) => !d); return; }
    if (v === "__shift") { setShift((s) => !s); return; }
    if (v === "__ac") { setExpr(""); setResult(null); setError(false); return; }
    if (v === "__back") { setExpr((p) => p.slice(0, -1)); return; }
    if (v === "__ans") { setExpr((p) => p + String(ans)); return; }
    if (v === "__neg") {
      setExpr((p) => p.startsWith("-") ? p.slice(1) : "-" + p);
      return;
    }
    if (v === "__paren") {
      setExpr((p) => p + (openParens > 0 && /[\d.π)eE]$/.test(p) ? ")" : "("));
      return;
    }
    if (v === "__eq") {
      try {
        const r = evalExpr(expr, deg);
        if (isNaN(r) || !isFinite(r)) throw new Error("NaN");
        const formatted = parseFloat(r.toPrecision(10)).toString();
        setResult(formatted);
        setAns(r);
        setHistory((h) => [{ expr, result: formatted }, ...h.slice(0, 9)]);
        setError(false);
      } catch {
        setResult("خطأ");
        setError(true);
      }
      setShift(false);
      return;
    }

    // Power shorthand ²  ³
    if (v === "²") { setExpr((p) => p + "**2"); setShift(false); return; }
    if (v === "³") { setExpr((p) => p + "**3"); setShift(false); return; }

    setExpr((p) => p + v);
    setShift(false);
  }, [expr, shift, deg, ans, openParens]);

  return (
    <div className="flex flex-col h-[calc(100dvh-11rem)] md:h-[calc(100dvh-6rem)] max-h-[780px] min-h-[380px] animate-in fade-in duration-300" dir="ltr">

      {/* ── Display ────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl px-4 py-3 mb-3 shadow-sm flex-shrink-0 min-h-[110px] flex flex-col justify-between">
        {/* Mode indicator */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {deg ? "DEG" : "RAD"}
          </span>
          {history.length > 0 && (
            <button
              onClick={() => setHistory([])}
              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> clear history
            </button>
          )}
        </div>

        {/* History (last 2) */}
        <div className="space-y-0.5 mt-1">
          {history.slice(0, 2).map((h, i) => (
            <p key={i} className="text-[10px] text-muted-foreground/60 text-right truncate font-mono">
              {h.expr} = {h.result}
            </p>
          ))}
        </div>

        {/* Expression */}
        <p className="text-right text-base text-muted-foreground font-mono truncate mt-1 min-h-[22px]">
          {expr || "0"}
        </p>

        {/* Result */}
        <p className={`text-right font-extrabold text-3xl leading-tight min-h-[38px] ${
          error ? "text-red-500" : result !== null ? "text-primary" : "text-foreground/20"
        }`}>
          {result !== null ? (error ? "خطأ" : `= ${result}`) : ""}
        </p>
      </div>

      {/* ── Button Grid ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1.5 flex-1 min-h-0">
            {row.map((btn) => {
              const isShifted = shift && !!btn.value2;
              const displayLabel = isShifted ? btn.label2! : btn.label;
              const isRad = btn.value === "__rad";
              const isShiftBtn = btn.value === "__shift";
              const active = (isRad && !deg) || (isShiftBtn && shift);

              return (
                <button
                  key={btn.value + btn.label}
                  onPointerDown={(e) => { e.preventDefault(); press(btn); }}
                  className={
                    btnCls(btn.kind, active) +
                    (btn.wide ? " flex-[2]" : " flex-1")
                  }
                >
                  {btn.value === "__back"
                    ? <Delete className="w-4 h-4" />
                    : <span className={isShifted ? "text-primary text-xs" : ""}>{displayLabel}</span>
                  }
                  {btn.label2 && !shift && (
                    <span className="absolute top-1 right-1.5 text-[8px] text-muted-foreground/50 font-normal leading-none">
                      {btn.label2}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
