"use client";

/**
 * Realistic iPhone 15 Pro frame with Dynamic Island, status bar,
 * and home indicator. Accepts children (e.g. a live iframe) as
 * the screen content.
 *
 * Screen area: 270 x 570 px (inside the bezel).
 * Children should render at a mobile viewport (e.g. 375×812)
 * and scale down to fit — the parent handles overflow clipping.
 */

export function IPhoneFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: 290, height: 590 }}
    >
      {/* Outer shell — the phone body */}
      <div
        className="absolute inset-0 rounded-[3rem] shadow-2xl"
        style={{
          background:
            "linear-gradient(145deg, #2a2a2e 0%, #1c1c1e 50%, #141416 100%)",
          boxShadow:
            "0 0 0 1.5px #3a3a3c, 0 0 0 3px #1a1a1c, 0 25px 60px -12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Side buttons */}
        {/* Left: silent switch */}
        <div
          className="absolute"
          style={{
            left: -2.5,
            top: 88,
            width: 2.5,
            height: 16,
            background: "linear-gradient(180deg, #48484a, #2c2c2e)",
            borderRadius: "2px 0 0 2px",
          }}
        />
        {/* Left: volume up */}
        <div
          className="absolute"
          style={{
            left: -2.5,
            top: 120,
            width: 2.5,
            height: 26,
            background: "linear-gradient(180deg, #48484a, #2c2c2e)",
            borderRadius: "2px 0 0 2px",
          }}
        />
        {/* Left: volume down */}
        <div
          className="absolute"
          style={{
            left: -2.5,
            top: 156,
            width: 2.5,
            height: 26,
            background: "linear-gradient(180deg, #48484a, #2c2c2e)",
            borderRadius: "2px 0 0 2px",
          }}
        />
        {/* Right: power button */}
        <div
          className="absolute"
          style={{
            right: -2.5,
            top: 138,
            width: 2.5,
            height: 44,
            background: "linear-gradient(180deg, #48484a, #2c2c2e)",
            borderRadius: "0 2px 2px 0",
          }}
        />

        {/* Inner screen bezel */}
        <div
          className="absolute overflow-hidden"
          style={{
            top: 10,
            left: 10,
            right: 10,
            bottom: 10,
            borderRadius: "2.2rem",
            background: "#000",
          }}
        >
          {/* Screen content area — fills entire screen */}
          <div className="absolute inset-0 overflow-hidden">
            {children}
          </div>

          {/* Home indicator bar */}
          <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 z-20">
            <div
              className="rounded-full bg-white/40"
              style={{ width: 96, height: 4 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
