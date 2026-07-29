import { useState } from "react";
import { Delete } from "lucide-react";

type ButtonType = "number" | "operator" | "function" | "equal" | "clear" | "special";

interface CalcButton {
  label: string;
  value: string;
  type: ButtonType;
  span?: number;
}

const BUTTONS: CalcButton[][] = [
  [
    { label: "Rad", value: "rad", type: "special" },
    { label: "Deg", value: "deg", type: "special" },
    { label: "sin", value: "Math.sin(", type: "function" },
    { label: "cos", value: "Math.cos(", type: "function" },
    { label: "tan", value: "Math.tan(", type: "function" },
  ],
  [
    { label: "x!", value: "factorial(", type: "function" },
    { label: "ln", value: "Math.log(", type: "function" },
    { label: "log", value: "Math.log10(", type: "function" },
    { label: "√", value: "Math.sqrt(", type: "function" },
    { label: "x²", value: "**2", type: "operator" },
  ],
  [
    { label: "π", value: "Math.PI", type: "special" },
    { label: "e", value: "Math.E", type: "special" },
    { label: "(", value: "(", type: "operator" },
    { label: ")", value: ")", type: "operator" },
    { label: "^", value: "**", type: "operator" },
  ],
  [
    { label: "AC", value: "clear", type: "clear" },
    { label: "⌫", value: "back", type: "clear" },
    { label: "%", value: "/100", type: "operator" },
    { label: "÷", value: "/", type: "operator" },
    { label: "", value: "", type: "number" }, // placeholder
  ],
  [
    { label: "7", value: "7", type: "number" },
    { label: "8", value: "8", type: "number" },
    { label: "9", value: "9", type: "number" },
    { label: "×", value: "*", type: "operator" },
    { label: "", value: "", type: "number" }, // placeholder
  ],
  [
    { label: "4", value: "4", type: "number" },
    { label: "5", value: "5", type: "number" },
    { label: "6", value: "6", type: "number" },
    { label: "−", value: "-", type: "operator" },
    { label: "", value: "", type: "number" }, // placeholder
  ],
  [
    { label: "1", value: "1", type: "number" },
    { label: "2", value: "2", type: "number" },
    { label: "3", value: "3", type: "number" },
    { label: "+", value: "+", type: "operator" },
    { label: "=", value: "=", type: "equal", span: 1 },
  ],
  [
    { label: "0", value: "0", type: "number", span: 2 },
    { label: ".", value: ".", type: "number" },
    { label: "Ans", value: "ans", type: "special" },
  ],
];

function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export default function ScientificCalculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [angleMode, setAngleMode] = useState<"rad" | "deg">("deg");
  const [ans, setAns] = useState<number>(0);

  const toRad = (x: number) => (angleMode === "deg" ? (x * Math.PI) / 180 : x);

  const evaluate = () => {
    try {
      // Replace trig functions to handle deg/rad
      let expr = expression
        .replace(/Math\.sin\(/g, `Math.sin(${angleMode === "deg" ? "(Math.PI/180)*" : ""}`)
        .replace(/Math\.cos\(/g, `Math.cos(${angleMode === "deg" ? "(Math.PI/180)*" : ""}`)
        .replace(/Math\.tan\(/g, `Math.tan(${angleMode === "deg" ? "(Math.PI/180)*" : ""}`)
        .replace(/factorial\(/g, "factorial(");

      // eslint-disable-next-line no-new-func
      const fn = new Function("Math", "factorial", "ans", `"use strict"; return (${expr})`);
      const res = fn(Math, factorial, ans);
      const resNum = typeof res === "number" ? res : NaN;
      if (isNaN(resNum) || !isFinite(resNum)) {
        setResult("خطأ");
      } else {
        const formatted = parseFloat(resNum.toPrecision(10)).toString();
        setResult(formatted);
        setAns(resNum);
      }
    } catch {
      setResult("خطأ");
    }
  };

  const handleButton = (btn: CalcButton) => {
    if (!btn.value) return;

    if (btn.value === "clear") {
      setExpression("");
      setResult(null);
      return;
    }
    if (btn.value === "back") {
      setExpression((prev) => prev.slice(0, -1));
      return;
    }
    if (btn.value === "=") {
      evaluate();
      return;
    }
    if (btn.value === "rad") {
      setAngleMode("rad");
      return;
    }
    if (btn.value === "deg") {
      setAngleMode("deg");
      return;
    }
    if (btn.value === "ans") {
      setExpression((prev) => prev + ans.toString());
      return;
    }
    setExpression((prev) => prev + btn.value);
  };

  const getButtonStyle = (type: ButtonType, value: string) => {
    const base = "rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center select-none cursor-pointer ";
    if (value === "=" ) return base + "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md text-xl";
    if (type === "clear") return base + "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40";
    if (type === "operator") return base + "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200";
    if (type === "function" || type === "special") return base + "bg-muted text-muted-foreground hover:bg-muted/80 text-xs";
    if (type === "number") return base + "bg-card border border-border text-foreground hover:bg-muted shadow-sm";
    return base + "bg-muted";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-sm mx-auto" dir="ltr">
      <div className="text-right" dir="rtl">
        <h1 className="text-2xl font-extrabold">الآلة الحاسبة العلمية</h1>
        <p className="text-sm text-muted-foreground">وضع الزاوية: {angleMode === "deg" ? "درجات" : "راديان"}</p>
      </div>

      {/* Display */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-1 shadow-sm min-h-[100px] flex flex-col justify-end">
        <div className="text-muted-foreground text-sm min-h-[24px] break-all text-right overflow-hidden" dir="ltr">
          {expression || "0"}
        </div>
        {result !== null && (
          <div className={`text-3xl font-bold text-right ${result === "خطأ" ? "text-destructive" : "text-primary"}`}>
            = {result}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        {BUTTONS.map((row, ri) => (
          <div key={ri} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${row.reduce((s, b) => s + (b.span ?? 1), 0)}, 1fr)` }}>
            {row.map((btn, bi) => {
              if (!btn.label && !btn.value) return <div key={bi} />;
              return (
                <button
                  key={bi}
                  onClick={() => handleButton(btn)}
                  className={getButtonStyle(btn.type, btn.value) + " h-12"}
                  style={btn.span && btn.span > 1 ? { gridColumn: `span ${btn.span}` } : {}}
                >
                  {btn.label === "⌫" ? <Delete className="w-4 h-4" /> : btn.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
