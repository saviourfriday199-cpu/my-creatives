/**
 * A stylised living-room illustration drawn in the brand palette.
 * Rendered twice by the Before/After slider: `before` is dim and untidy,
 * `after` is warm, ordered and quietly sparkling. Same composition in both
 * states, so the comparison reads honestly.
 */
export function RoomScene({ variant }: { variant: "before" | "after" }) {
  const after = variant === "after";

  const wall = after ? "#f7f2e8" : "#d9d5cd";
  const wallShade = after ? "#efe7d8" : "#ccc7bd";
  const floor = after ? "#e4d5bd" : "#c4b7a2";
  const floorLine = after ? "#d5c3a6" : "#b3a58e";
  const sofa = after ? "#0f172a" : "#2a3247";
  const cushion = after ? "#0f766e" : "#4a5568";
  const rug = after ? "#0f766e" : "#6b7280";
  const rugInner = after ? "#14b8a6" : "#7d8694";
  const leaf = after ? "#0f766e" : "#5a6b60";
  const frame = after ? "#f59e0b" : "#8a8577";
  const glass = after ? "#eaf6f4" : "#c9cdc9";

  return (
    <svg
      viewBox="0 0 800 500"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={after ? "The same living room after cleaning: bright, ordered and spotless" : "A living room before cleaning: dim and untidy"}
    >
      {/* Walls & floor */}
      <rect width="800" height="360" fill={wall} />
      <rect y="80" width="800" height="10" fill={wallShade} />
      <rect y="360" width="800" height="140" fill={floor} />
      {[400, 440, 480].map((y) => (
        <line key={y} x1="0" y1={y} x2="800" y2={y} stroke={floorLine} strokeWidth="2" />
      ))}
      {[140, 320, 520, 700].map((x, i) => (
        <line key={x} x1={x - 30} y1="360" x2={x - 60} y2="500" stroke={floorLine} strokeWidth="2" opacity={0.6 + (i % 2) * 0.2} />
      ))}

      {/* Window */}
      <g>
        <rect x="70" y="70" width="190" height="220" rx="6" fill={glass} stroke={after ? "#0f172a" : "#565d6b"} strokeWidth="8" />
        <line x1="165" y1="74" x2="165" y2="286" stroke={after ? "#0f172a" : "#565d6b"} strokeWidth="6" />
        <line x1="74" y1="180" x2="256" y2="180" stroke={after ? "#0f172a" : "#565d6b"} strokeWidth="6" />
        {after ? (
          /* Sunbeam pouring across the room */
          <path d="M260 80 L640 500 L360 500 L260 200 Z" fill="#f59e0b" opacity="0.12" />
        ) : (
          /* Smudges on the glass */
          <g fill="#9aa0a6" opacity="0.55">
            <ellipse cx="115" cy="130" rx="18" ry="9" transform="rotate(-18 115 130)" />
            <ellipse cx="215" cy="235" rx="14" ry="7" transform="rotate(12 215 235)" />
            <ellipse cx="130" cy="245" rx="10" ry="5" transform="rotate(-30 130 245)" />
          </g>
        )}
      </g>

      {/* Curtain */}
      <path
        d={after ? "M262 60 q30 120 8 250 l30 0 q14 -130 -6 -250 Z" : "M262 60 q42 120 24 250 l34 0 q6 -130 -22 -250 Z"}
        fill={after ? "#f1e6cf" : "#bdb6a8"}
      />

      {/* Wall art */}
      <g transform={after ? "translate(430 110)" : "translate(430 110) rotate(-7 60 40)"}>
        <rect width="120" height="84" rx="4" fill="none" stroke={frame} strokeWidth="6" />
        <path d="M14 62 L46 30 L70 52 L88 38 L106 56" fill="none" stroke={frame} strokeWidth="4" strokeLinecap="round" />
      </g>
      <g transform={after ? "translate(590 130)" : "translate(590 130) rotate(4 30 30)"}>
        <rect width="64" height="64" rx="4" fill="none" stroke={frame} strokeWidth="5" />
        <circle cx="32" cy="32" r="14" fill="none" stroke={frame} strokeWidth="4" />
      </g>

      {/* Rug */}
      <ellipse cx="430" cy="430" rx="240" ry="46" fill={rug} opacity={after ? 0.9 : 0.55} />
      <ellipse cx="430" cy="430" rx="180" ry="32" fill={rugInner} opacity={after ? 0.5 : 0.4} />
      {!after && (
        <g fill="#4b5563" opacity="0.5">
          <ellipse cx="360" cy="440" rx="22" ry="8" />
          <ellipse cx="520" cy="425" rx="16" ry="6" />
        </g>
      )}

      {/* Sofa */}
      <g>
        <rect x="310" y="270" width="250" height="86" rx="16" fill={sofa} />
        <rect x="296" y="250" width="34" height="110" rx="12" fill={sofa} />
        <rect x="540" y="250" width="34" height="110" rx="12" fill={sofa} />
        <rect x="322" y="228" width="226" height="54" rx="12" fill={sofa} />
        {/* Cushions — plumped vs slumped */}
        <g>
          <rect
            x="340"
            y="238"
            width="60"
            height="48"
            rx="10"
            fill={cushion}
            transform={after ? undefined : "rotate(-10 370 262)"}
          />
          <rect
            x="412"
            y="238"
            width="60"
            height="48"
            rx="10"
            fill={after ? "#f59e0b" : "#6d7484"}
            transform={after ? undefined : "rotate(14 442 286) translate(6 14)"}
          />
          <rect
            x="484"
            y="238"
            width="60"
            height="48"
            rx="10"
            fill={cushion}
            transform={after ? undefined : "rotate(-6 514 262) translate(-4 8)"}
          />
        </g>
        <rect x="330" y="356" width="12" height="26" fill={sofa} />
        <rect x="528" y="356" width="12" height="26" fill={sofa} />
        {!after && (
          /* Throw dropped over the arm */
          <path d="M540 250 q26 6 30 40 q4 34 -8 62 l-26 0 q10 -30 6 -60 q-3 -28 -2 -42 Z" fill="#8b8fa0" opacity="0.8" />
        )}
      </g>

      {/* Plant — upright vs drooping */}
      <g transform="translate(680 250)">
        <path d="M-4 110 h48 l-8 -44 h-32 Z" fill={after ? "#0f172a" : "#4a5261"} />
        <g stroke={leaf} strokeWidth="9" strokeLinecap="round" fill="none">
          {after ? (
            <>
              <path d="M20 70 Q20 20 4 -6" />
              <path d="M20 70 Q22 24 42 2" />
              <path d="M20 70 Q34 40 58 32" />
              <path d="M20 70 Q6 44 -16 40" />
            </>
          ) : (
            <>
              <path d="M20 70 Q16 34 -8 34" />
              <path d="M20 70 Q28 40 50 48" />
              <path d="M20 70 Q20 40 12 24" />
            </>
          )}
        </g>
      </g>

      {/* Side table + lamp */}
      <g transform="translate(140 300)">
        <rect x="0" y="34" width="90" height="10" rx="4" fill={after ? "#0f172a" : "#4a5261"} />
        <rect x="10" y="44" width="8" height="56" fill={after ? "#0f172a" : "#4a5261"} />
        <rect x="72" y="44" width="8" height="56" fill={after ? "#0f172a" : "#4a5261"} />
        <rect x="38" y="-24" width="6" height="58" fill={after ? "#0f172a" : "#4a5261"} />
        <path d="M18 -24 h46 l-8 -30 h-30 Z" fill={after ? "#f59e0b" : "#9b9484"} opacity={after ? 0.95 : 0.8} />
        {after && <ellipse cx="41" cy="-38" rx="52" ry="30" fill="#f59e0b" opacity="0.14" />}
        {!after && (
          /* Forgotten cup and papers */
          <g>
            <rect x="52" y="16" width="14" height="18" rx="3" fill="#8a8577" />
            <g fill="#e8e4da" stroke="#b3ada0" strokeWidth="1.5">
              <rect x="-56" y="88" width="44" height="26" rx="2" transform="rotate(-14 -34 101)" />
              <rect x="-30" y="96" width="44" height="26" rx="2" transform="rotate(9 -8 109)" />
            </g>
          </g>
        )}
      </g>

      {/* Before: drifting dust  /  After: gentle sparkles */}
      {after ? (
        <g fill="#f59e0b">
          {[
            [300, 210, 1],
            [620, 300, 0.8],
            [230, 330, 0.9],
            [520, 200, 0.7],
          ].map(([x, y, s], i) => (
            <path
              key={i}
              className="twinkle"
              style={{ animationDelay: `${i * 0.7}s` }}
              transform={`translate(${x} ${y}) scale(${s})`}
              d="M0 -10 L2.4 -2.4 L10 0 L2.4 2.4 L0 10 L-2.4 2.4 L-10 0 L-2.4 -2.4 Z"
            />
          ))}
        </g>
      ) : (
        <g fill="#6b7280" opacity="0.5">
          {[
            [320, 160], [370, 200], [600, 180], [650, 240], [280, 250],
            [480, 170], [560, 320], [200, 200], [720, 320], [420, 380],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3 : 2} />
          ))}
          {/* Dust bunnies along the skirting */}
          <ellipse cx="120" cy="368" rx="16" ry="6" opacity="0.7" />
          <ellipse cx="770" cy="372" rx="14" ry="5" opacity="0.7" />
        </g>
      )}

      {/* Dim film over the whole "before" room */}
      {!after && <rect width="800" height="500" fill="#334155" opacity="0.14" />}
    </svg>
  );
}
