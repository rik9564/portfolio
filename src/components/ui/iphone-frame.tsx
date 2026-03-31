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

          {/* Dynamic Island — pill shape */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-20"
            style={{
              top: 8,
              width: 84,
              height: 24,
              borderRadius: 14,
              background: "#000",
            }}
          >
            {/* Front camera */}
            <div
              className="absolute rounded-full"
              style={{
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                width: 7,
                height: 7,
                background:
                  "radial-gradient(circle at 35% 35%, #1e1e4a 0%, #0c0c1e 50%, #000 100%)",
                boxShadow:
                  "inset 0 0 2px rgba(80,80,180,0.4), 0 0 1px rgba(0,0,0,0.8)",
              }}
            />
          </div>

          {/* Status bar — time on left, icons on right */}
          <div
            className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between"
            style={{ height: 44, paddingLeft: 24, paddingRight: 20 }}
          >
            {/* Time */}
            <span
              className="text-white font-semibold"
              style={{ fontSize: 11, letterSpacing: 0.2 }}
            >
              9:41
            </span>

            {/* Right icons: signal, wifi, battery */}
            <div className="flex items-center" style={{ gap: 4 }}>
              {/* Cellular signal — 4 bars */}
              <svg
                width="13"
                height="10"
                viewBox="0 0 17 11"
                fill="none"
              >
                <rect x="0" y="8" width="3" height="3" rx="0.5" fill="white" />
                <rect x="4.5" y="5.5" width="3" height="5.5" rx="0.5" fill="white" />
                <rect x="9" y="3" width="3" height="8" rx="0.5" fill="white" />
                <rect x="13.5" y="0" width="3" height="11" rx="0.5" fill="white" />
              </svg>

              {/* WiFi icon */}
              <svg
                width="12"
                height="10"
                viewBox="0 0 16 12"
                fill="none"
              >
                <path
                  d="M8 11a1.2 1.2 0 100-2.4A1.2 1.2 0 008 11z"
                  fill="white"
                />
                <path
                  d="M5.2 7.8a3.8 3.8 0 015.6 0"
                  stroke="white"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M2.6 5.2a7.2 7.2 0 0110.8 0"
                  stroke="white"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>

              {/* Battery */}
              <svg
                width="22"
                height="10"
                viewBox="0 0 27 13"
                fill="none"
              >
                {/* Battery outline */}
                <rect
                  x="0.5"
                  y="0.5"
                  width="22"
                  height="12"
                  rx="2.5"
                  stroke="white"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.4"
                />
                {/* Battery fill */}
                <rect
                  x="2"
                  y="2"
                  width="16"
                  height="9"
                  rx="1"
                  fill="white"
                />
                {/* Battery nub */}
                <path
                  d="M24 4.5a1 1 0 011 1v2a1 1 0 01-1 1"
                  stroke="white"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.5"
                />
              </svg>
            </div>
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
