import { useState, useEffect } from "react";

const ACCENT = "#FF6B2C";

const themes = {
  light: {
    bg: "#FAFAF8", surface: "#FFFFFF", elevated: "#F0F0EC",
    border: "#E2E2DC", borderActive: "#D0D0C8",
    text: "#1A1A18", textSec: "#6A6A62", textTri: "#9A9A90",
    accentDim: "rgba(255,107,44,0.06)", accentBorder: "rgba(255,107,44,0.18)",
    dangerDim: "rgba(235,87,87,0.06)", dangerBorder: "rgba(235,87,87,0.15)",
    warnDim: "rgba(242,153,74,0.06)", warnBorder: "rgba(242,153,74,0.15)",
    successDim: "rgba(111,207,151,0.06)", successBorder: "rgba(111,207,151,0.15)",
  },
  dark: {
    bg: "#111110", surface: "#1A1A18", elevated: "#222220",
    border: "#2A2A26", borderActive: "#3A3A34",
    text: "#EAEAE6", textSec: "#8A8A82", textTri: "#5A5A52",
    accentDim: "rgba(255,107,44,0.12)", accentBorder: "rgba(255,107,44,0.28)",
    dangerDim: "rgba(235,87,87,0.10)", dangerBorder: "rgba(235,87,87,0.25)",
    warnDim: "rgba(242,153,74,0.10)", warnBorder: "rgba(242,153,74,0.25)",
    successDim: "rgba(111,207,151,0.10)", successBorder: "rgba(111,207,151,0.25)",
  },
};

const TOKENS = [
  { token: "ETH", chain: "Ethereum", balance: "412.3", usd: 1247000, cls: "core" },
  { token: "ENS", chain: "Ethereum", balance: "18,420", usd: 245000, cls: "core" },
  { token: "USDC", chain: "Ethereum", balance: "189,000", usd: 189000, cls: "core" },
  { token: "GRT", chain: "Ethereum", balance: "14,200", usd: 1623, cls: "recoverable" },
  { token: "SAFE", chain: "Ethereum", balance: "890", usd: 1487, cls: "recoverable" },
  { token: "PUSH", chain: "Ethereum", balance: "22,100", usd: 1012, cls: "recoverable" },
  { token: "BAL", chain: "Ethereum", balance: "310", usd: 987, cls: "recoverable" },
  { token: "WETH", chain: "Arbitrum", balance: "0.28", usd: 847, cls: "recoverable" },
  { token: "LINK", chain: "Ethereum", balance: "38", usd: 532, cls: "recoverable" },
  { token: "REQ", chain: "Ethereum", balance: "4,500", usd: 315, cls: "recoverable" },
  { token: "SHIB", chain: "Ethereum", balance: "24M", usd: 2.41, cls: "dust" },
  { token: "BAT", chain: "Ethereum", balance: "12.4", usd: 2.38, cls: "dust" },
  { token: "FAKE_DROP", chain: "Ethereum", balance: "1M", usd: 0, cls: "unsafe" },
];

function CountUp({ end, duration = 900, prefix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration]);
  return <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{prefix}{val.toLocaleString()}</span>;
}

function Pill({ cls, t }) {
  const map = {
    core: { bg: t.elevated, border: t.border, color: t.textTri, label: "CORE" },
    recoverable: { bg: t.accentDim, border: t.accentBorder, color: ACCENT, label: "RECOVERABLE" },
    dust: { bg: t.elevated, border: t.border, color: t.textSec, label: "DUST" },
    unsafe: { bg: t.dangerDim, border: t.dangerBorder, color: "#EB5757", label: "UNSAFE" },
  };
  const s = map[cls];
  return (
    <span style={{
      display: "inline-block", padding: "2px 7px", borderRadius: 3,
      fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
    }}>{s.label}</span>
  );
}

function HygieneBar({ score, t }) {
  const color = score >= 80 ? "#6FCF97" : score >= 50 ? "#F2994A" : "#EB5757";
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 5, borderRadius: 2,
          background: i < Math.round(score / 10) ? color : t.elevated,
        }} />
      ))}
    </div>
  );
}

function Dashboard({ mode }) {
  const t = themes[mode];
  const [filter, setFilter] = useState("all");
  const [checkedIds, setCheckedIds] = useState(
    () => new Set(TOKENS.filter(tk => tk.cls === "recoverable").map((_, i) => i))
  );

  const filtered = filter === "all" ? TOKENS : TOKENS.filter(tk => tk.cls === filter);
  const recovTotal = TOKENS.filter(tk => tk.cls === "recoverable").reduce((s, tk) => s + tk.usd, 0);
  const totalBal = TOKENS.reduce((s, tk) => s + tk.usd, 0);
  const counts = { core: 0, recoverable: 0, dust: 0, unsafe: 0 };
  TOKENS.forEach(tk => counts[tk.cls]++);

  const selectedCount = [...checkedIds].filter(id => {
    const tk = TOKENS[id];
    return tk && (tk.cls === "recoverable" || tk.cls === "dust");
  }).length;

  const toggleCheck = (idx) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const alerts = [
    { sev: "danger", title: "Unlimited Approval", desc: "USDC → 0xdead...beef · Unlimited", act: "Revoke" },
    { sev: "warn", title: "Stranded Asset", desc: "USDC on Optimism · No gas token", act: "Write Off" },
  ];

  return (
    <div style={{
      background: t.bg,
      borderRadius: 14,
      border: `1px solid ${t.border}`,
      overflow: "hidden",
      fontFamily: "'Satoshi', -apple-system, sans-serif",
      position: "relative",
    }}>
      {/* Topbar */}
      <div style={{
        height: 48,
        borderBottom: `1px solid ${t.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: t.surface,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT }} />
          <span style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 17,
            color: t.text,
          }}>[Product]</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            fontSize: 11, color: t.textTri,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>{mode}</span>
          <div style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            color: ACCENT,
            background: t.accentDim,
            padding: "4px 10px",
            borderRadius: 5,
            border: `1px solid ${t.accentBorder}`,
          }}>0x1a2b...9f8e</div>
        </div>
      </div>

      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <div style={{
          width: 160,
          borderRight: `1px solid ${t.border}`,
          padding: "16px 0",
          background: t.surface,
          flexShrink: 0,
        }}>
          {["Overview", "Alerts", "Pool", "History"].map((item, i) => (
            <div key={item} style={{
              padding: "8px 16px",
              fontSize: 13,
              color: i === 0 ? ACCENT : t.textSec,
              borderLeft: i === 0 ? `3px solid ${ACCENT}` : "3px solid transparent",
              background: i === 0 ? t.accentDim : "transparent",
              fontWeight: i === 0 ? 500 : 400,
            }}>{item}</div>
          ))}
          <div style={{
            margin: "12px 16px",
            borderTop: `1px solid ${t.border}`,
          }} />
          {["Settings", "Docs ↗"].map(item => (
            <div key={item} style={{
              padding: "6px 16px",
              fontSize: 12,
              color: t.textTri,
            }}>{item}</div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "24px 28px", minWidth: 0 }}>
          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
            {[
              { label: "TOTAL BALANCE", val: totalBal, sub: `${TOKENS.length} tokens`, accent: false },
              { label: "RECOVERABLE", val: recovTotal, sub: `${counts.recoverable} positions`, accent: true },
              { label: "CLEANUP COST", val: 1200, sub: "47 transactions", accent: false, prefix: "~$" },
              { label: "HYGIENE", val: null, sub: null, accent: false, custom: true },
            ].map((card, i) => (
              <div key={i} style={{
                background: t.surface,
                border: `1px solid ${card.accent ? t.accentBorder : t.border}`,
                borderRadius: 10,
                padding: "16px 18px",
              }}>
                <div style={{
                  fontSize: 9, fontWeight: 600, letterSpacing: "0.08em",
                  color: t.textTri, textTransform: "uppercase", marginBottom: 10,
                }}>{card.label}</div>
                {card.custom ? (
                  <>
                    <div style={{
                      fontSize: 22, fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 500, color: "#F2994A", marginBottom: 6,
                    }}>72</div>
                    <HygieneBar score={72} t={t} />
                  </>
                ) : (
                  <>
                    <div style={{
                      fontSize: 22, fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 500, color: card.accent ? ACCENT : t.text, lineHeight: 1.1, marginBottom: 4,
                    }}>
                      {card.prefix || "$"}<CountUp end={card.val} />
                    </div>
                    <div style={{ fontSize: 11, color: t.textSec }}>{card.sub}</div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {[
              { key: "all", label: "All", count: TOKENS.length },
              { key: "core", label: "Core", count: counts.core },
              { key: "recoverable", label: "Recoverable", count: counts.recoverable },
              { key: "dust", label: "Dust", count: counts.dust },
              { key: "unsafe", label: "Unsafe", count: counts.unsafe },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: "pointer",
                border: `1px solid ${filter === f.key ? t.borderActive : t.border}`,
                background: filter === f.key ? t.elevated : "transparent",
                color: filter === f.key ? t.text : t.textSec,
                transition: "all 0.15s ease",
              }}>
                {f.label} <span style={{ opacity: 0.4 }}>{f.count}</span>
              </button>
            ))}
          </div>

          {/* Token Table */}
          <div style={{
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 24,
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "28px 1fr 80px 90px 90px 90px",
              padding: "10px 16px",
              background: t.surface,
              borderBottom: `1px solid ${t.border}`,
              fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", color: t.textTri,
              textTransform: "uppercase",
            }}>
              <div></div><div>Token</div><div>Chain</div>
              <div style={{ textAlign: "right" }}>Balance</div>
              <div style={{ textAlign: "right" }}>USD</div>
              <div style={{ textAlign: "center" }}>Class</div>
            </div>

            {filtered.map((tk, i) => {
              const globalIdx = TOKENS.indexOf(tk);
              const canCheck = tk.cls === "recoverable" || tk.cls === "dust";
              return (
                <div key={`${tk.token}-${tk.chain}-${i}`} style={{
                  display: "grid",
                  gridTemplateColumns: "28px 1fr 80px 90px 90px 90px",
                  padding: "9px 16px",
                  background: i % 2 === 0 ? t.bg : t.surface,
                  borderBottom: i < filtered.length - 1 ? `1px solid ${t.border}` : "none",
                  fontSize: 13, alignItems: "center",
                }}>
                  <div>
                    {canCheck ? (
                      <input
                        type="checkbox"
                        checked={checkedIds.has(globalIdx)}
                        onChange={() => toggleCheck(globalIdx)}
                        style={{ accentColor: ACCENT, cursor: "pointer", width: 13, height: 13 }}
                      />
                    ) : tk.cls === "unsafe" ? (
                      <span style={{ fontSize: 11, color: "#EB5757" }}>🔒</span>
                    ) : (
                      <span style={{ color: t.textTri }}>—</span>
                    )}
                  </div>
                  <div style={{ fontWeight: 500, color: t.text }}>{tk.token}</div>
                  <div style={{ fontSize: 11, color: t.textSec }}>{tk.chain}</div>
                  <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: t.textSec }}>{tk.balance}</div>
                  <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: tk.usd === 0 ? t.textTri : t.text }}>
                    {tk.usd === 0 ? "—" : `$${tk.usd.toLocaleString()}`}
                  </div>
                  <div style={{ textAlign: "center" }}><Pill cls={tk.cls} t={t} /></div>
                </div>
              );
            })}
          </div>

          {/* Alerts preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {alerts.map((a, i) => {
              const borderCol = a.sev === "danger" ? "#EB5757" : "#F2994A";
              const dimBg = a.sev === "danger" ? t.dangerDim : t.warnDim;
              return (
                <div key={i} style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  borderLeft: `3px solid ${borderCol}`,
                  borderRadius: 8,
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: borderCol, marginBottom: 2 }}>{a.title}</div>
                    <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: t.textSec }}>{a.desc}</div>
                  </div>
                  <button style={{
                    padding: "4px 12px", borderRadius: 5, fontSize: 10, fontWeight: 600, cursor: "pointer",
                    background: dimBg,
                    border: `1px solid ${a.sev === "danger" ? t.dangerBorder : t.warnBorder}`,
                    color: borderCol,
                  }}>{a.act}</button>
                </div>
              );
            })}
          </div>

          {/* Opportunity Cost */}
          <div style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            padding: "18px 20px",
            marginBottom: 20,
          }}>
            <div style={{
              fontSize: 9, fontWeight: 600, letterSpacing: "0.08em",
              color: t.textTri, textTransform: "uppercase", marginBottom: 14,
            }}>Lost to Entropy (90 Days)</div>
            <div style={{ display: "flex", gap: 32, alignItems: "baseline" }}>
              <div>
                <div style={{ fontSize: 11, color: t.textSec, marginBottom: 3 }}>Current</div>
                <div style={{ fontSize: 18, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: t.text }}>${recovTotal.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: t.textSec, marginBottom: 3 }}>If consolidated</div>
                <div style={{ fontSize: 18, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: t.text }}>${(recovTotal + 1065).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: t.textSec, marginBottom: 3 }}>Left behind</div>
                <div style={{ fontSize: 18, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: ACCENT }}>+$1,065</div>
              </div>
            </div>
          </div>

          {/* Sticky CTA */}
          {selectedCount > 0 && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 20px",
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 10,
            }}>
              <span style={{ fontSize: 13, color: t.textSec }}>
                <strong style={{ color: t.text }}>{selectedCount} tokens</strong> selected
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{
                  padding: "8px 18px", borderRadius: 7,
                  border: `1px solid ${t.border}`,
                  background: "transparent", color: t.textSec,
                  fontSize: 12, cursor: "pointer",
                }}>Send to Pool</button>
                <button style={{
                  padding: "8px 18px", borderRadius: 7,
                  border: "none",
                  background: ACCENT, color: "#1A1A18",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>Consolidate → USDC</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FinalBrand() {
  const [mode, setMode] = useState("light");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#09090B",
      color: "#E8EAED",
      fontFamily: "-apple-system, sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 40px 60px" }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36,
        }}>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
              color: "#5A5F66", textTransform: "uppercase", marginBottom: 10,
            }}>Final Brand System</div>
            <div style={{
              fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6,
              fontFamily: "'Satoshi', sans-serif",
            }}>Direction D + Neon Orange</div>
            <div style={{ fontSize: 14, color: "#8B9098", lineHeight: 1.6 }}>
              Instrument Serif · Satoshi · JetBrains Mono · <span style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>#FF6B2C</span>
            </div>
          </div>

          {/* Mode toggle */}
          <div style={{
            display: "flex", gap: 4, background: "#1A1D24", borderRadius: 8, padding: 3,
          }}>
            {["light", "dark"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 500,
                background: mode === m ? "#2A2D34" : "transparent",
                color: mode === m ? "#E8EAED" : "#5A5F66",
                transition: "all 0.15s ease",
              }}>{m === "light" ? "☀ Light" : "☾ Dark"}</button>
            ))}
          </div>
        </div>

        {/* Brand Elements Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
          {/* Logo */}
          <div style={{
            background: mode === "light" ? "#FAFAF8" : "#111110",
            border: `1px solid ${mode === "light" ? "#E2E2DC" : "#2A2A26"}`,
            borderRadius: 12, padding: 28,
            display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16,
          }}>
            <div style={{
              fontSize: 9, fontWeight: 600, letterSpacing: "0.1em",
              color: mode === "light" ? "#9A9A90" : "#5A5A52",
              textTransform: "uppercase", alignSelf: "flex-start",
            }}>Logo</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: ACCENT }} />
              <span style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 28,
                color: mode === "light" ? "#1A1A18" : "#EAEAE6",
              }}>[Product]</span>
            </div>
          </div>

          {/* Accent */}
          <div style={{
            background: mode === "light" ? "#FAFAF8" : "#111110",
            border: `1px solid ${mode === "light" ? "#E2E2DC" : "#2A2A26"}`,
            borderRadius: 12, padding: 28,
          }}>
            <div style={{
              fontSize: 9, fontWeight: 600, letterSpacing: "0.1em",
              color: mode === "light" ? "#9A9A90" : "#5A5A52",
              textTransform: "uppercase", marginBottom: 14,
            }}>Accent</div>
            <div style={{
              width: "100%", height: 48, borderRadius: 8, background: ACCENT, marginBottom: 10,
            }} />
            <div style={{
              fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
              color: mode === "light" ? "#6A6A62" : "#8A8A82",
            }}>Neon Orange · #FF6B2C</div>
          </div>

          {/* Buttons */}
          <div style={{
            background: mode === "light" ? "#FAFAF8" : "#111110",
            border: `1px solid ${mode === "light" ? "#E2E2DC" : "#2A2A26"}`,
            borderRadius: 12, padding: 28,
          }}>
            <div style={{
              fontSize: 9, fontWeight: 600, letterSpacing: "0.1em",
              color: mode === "light" ? "#9A9A90" : "#5A5A52",
              textTransform: "uppercase", marginBottom: 14,
            }}>Components</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button style={{
                padding: "8px 20px", borderRadius: 7, border: "none",
                background: ACCENT, color: "#1A1A18", fontSize: 13, fontWeight: 600,
                fontFamily: "'Satoshi', sans-serif", cursor: "pointer", textAlign: "center",
              }}>Consolidate</button>
              <button style={{
                padding: "8px 20px", borderRadius: 7,
                border: `1px solid ${mode === "light" ? "#E2E2DC" : "#2A2A26"}`,
                background: "transparent",
                color: mode === "light" ? "#6A6A62" : "#8A8A82",
                fontSize: 13, fontFamily: "'Satoshi', sans-serif", cursor: "pointer", textAlign: "center",
              }}>Send to Pool</button>
              <button style={{
                padding: "8px 20px", borderRadius: 7,
                background: mode === "light" ? "rgba(235,87,87,0.06)" : "rgba(235,87,87,0.10)",
                border: `1px solid ${mode === "light" ? "rgba(235,87,87,0.15)" : "rgba(235,87,87,0.25)"}`,
                color: "#EB5757",
                fontSize: 13, fontFamily: "'Satoshi', sans-serif", cursor: "pointer", textAlign: "center",
              }}>Revoke</button>
            </div>
          </div>
        </div>

        {/* Full Dashboard */}
        <Dashboard mode={mode} />
      </div>
    </div>
  );
}
