"use client";

import React, { useEffect, useRef, useState } from "react";

export default function GlassIrisDashboard() {
  const [activeMode, setActiveMode] = useState<"chat" | "overview">("chat");
  const [selectedChip, setSelectedChip] = useState<string>("Normal");
  const [deepThinkActive, setDeepThinkActive] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState("");
  const [conversations, setConversations] = useState([
    {
      q: "Can I afford the $2,400 Tokyo flight this month?",
      t: "Today, 09:24 AM",
    },
    {
      q: "Analyze my recurring subscriptions and find duplicates",
      t: "Yesterday, 04:15 PM",
    },
    {
      q: "Adjust emergency fund target to 6 months of expenses",
      t: "Nov 14, 11:02 AM",
    },
    {
      q: "Compare Vanguard S&P 500 ETF returns vs Treasury yield",
      t: "Nov 11, 02:40 PM",
    },
  ]);

  const orbCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ─── 1. Living Glass Orb Animation (Canvas Still Plate & Loop) ───
  useEffect(() => {
    const canvas = orbCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const renderOrb = (time: number) => {
      const elapsed = time - startTime;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = width * 0.44;

      ctx.clearRect(0, 0, width, height);

      // Base deep dark plate
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      bgGrad.addColorStop(0, "#080b14");
      bgGrad.addColorStop(0.75, "#040508");
      bgGrad.addColorStop(1, "#000000");
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Swirling Core rotation (4s loop)
      const loopNorm = (elapsed % 4000) / 4000;
      const rot = prefersReducedMotion ? 0 : loopNorm * Math.PI * 2;
      const pulse = prefersReducedMotion
        ? 1.0
        : 1.0 + 0.06 * Math.sin(loopNorm * Math.PI * 2);

      // Swirling inner blue-violet lobes
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);

      // Blue lobe
      const blueCore = ctx.createRadialGradient(
        radius * 0.18 * pulse,
        -radius * 0.12 * pulse,
        0,
        0,
        0,
        radius * 0.72 * pulse
      );
      blueCore.addColorStop(0, "rgba(47, 107, 255, 0.95)");
      blueCore.addColorStop(0.45, "rgba(65, 88, 248, 0.65)");
      blueCore.addColorStop(1, "rgba(14, 14, 14, 0)");
      ctx.fillStyle = blueCore;
      ctx.beginPath();
      ctx.ellipse(
        radius * 0.15,
        -radius * 0.1,
        radius * 0.6 * pulse,
        radius * 0.38 * pulse,
        0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Violet lobe
      const violetCore = ctx.createRadialGradient(
        -radius * 0.2 * pulse,
        radius * 0.15 * pulse,
        0,
        0,
        0,
        radius * 0.68 * pulse
      );
      violetCore.addColorStop(0, "rgba(124, 72, 240, 0.9)");
      violetCore.addColorStop(0.5, "rgba(90, 76, 245, 0.55)");
      violetCore.addColorStop(1, "rgba(14, 14, 14, 0)");
      ctx.fillStyle = violetCore;
      ctx.beginPath();
      ctx.ellipse(
        -radius * 0.15,
        radius * 0.12,
        radius * 0.55 * pulse,
        radius * 0.35 * pulse,
        -0.4,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Cyan specular glint
      const cyanGlint = ctx.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        radius * 0.25 * pulse
      );
      cyanGlint.addColorStop(0, "rgba(180, 230, 255, 0.9)");
      cyanGlint.addColorStop(0.6, "rgba(0, 210, 255, 0.35)");
      cyanGlint.addColorStop(1, "transparent");
      ctx.fillStyle = cyanGlint;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.25 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Clear Glass Sphere Shell (Refraction, Fresnel & Specular Rim)
      // Top caustic reflection from electric-blue top light
      const topCaustic = ctx.createLinearGradient(
        cx,
        cy - radius,
        cx,
        cy + radius
      );
      topCaustic.addColorStop(0, "rgba(255, 255, 255, 0.65)");
      topCaustic.addColorStop(0.12, "rgba(140, 190, 255, 0.4)");
      topCaustic.addColorStop(0.4, "rgba(47, 107, 255, 0.05)");
      topCaustic.addColorStop(0.85, "rgba(124, 72, 240, 0.2)");
      topCaustic.addColorStop(1, "rgba(255, 255, 255, 0.35)");

      ctx.strokeStyle = topCaustic;
      ctx.lineWidth = width * 0.022;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.98, 0, Math.PI * 2);
      ctx.stroke();

      // Specular top curved highlight
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy - radius * 0.62,
        radius * 0.45,
        radius * 0.18,
        0,
        0,
        Math.PI * 2
      );
      const specGrad = ctx.createRadialGradient(
        cx,
        cy - radius * 0.62,
        0,
        cx,
        cy - radius * 0.62,
        radius * 0.45
      );
      specGrad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
      specGrad.addColorStop(0.45, "rgba(160, 210, 255, 0.35)");
      specGrad.addColorStop(1, "transparent");
      ctx.fillStyle = specGrad;
      ctx.fill();
      ctx.restore();

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(renderOrb);
      }
    };

    animId = requestAnimationFrame(renderOrb);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  // ─── 2. Entrance Web Animations Timeline ───
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Rail tiles rise in
    const railItems = document.querySelectorAll(".rail-item");
    railItems.forEach((el, i) => {
      el.animate(
        [
          { opacity: 0, transform: "translateY(14px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: 450,
          delay: 50 + i * 40,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards",
        }
      );
    });

    // Top bar items rise in
    const topBar = document.querySelector(".top-bar");
    topBar?.animate(
      [
        { opacity: 0, transform: "translateY(-10px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 400,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards",
      }
    );

    // Orb opens with circular clip and scales from .92 to 1
    const orbContainer = document.querySelector(".orb-container");
    orbContainer?.animate(
      [
        {
          opacity: 0,
          clipPath: "circle(0% at 50% 50%)",
          transform: "scale(0.92)",
        },
        {
          opacity: 1,
          clipPath: "circle(100% at 50% 50%)",
          transform: "scale(1)",
        },
      ],
      {
        duration: 800,
        delay: 200,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards",
      }
    );

    // Headline words rise out of masks
    const headline = document.querySelector(".hero-headline");
    headline?.animate(
      [
        { opacity: 0, transform: "translateY(100%)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 550,
        delay: 450,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards",
      }
    );

    // Subline, composer, cards settle in
    const elementsToSettle = [
      document.querySelector(".hero-subline"),
      document.querySelector(".composer-box"),
      document.querySelector(".quick-cards"),
      document.querySelector(".recent-conversations"),
    ];

    elementsToSettle.forEach((el, idx) => {
      el?.animate(
        [
          { opacity: 0, transform: "translateY(16px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: 500,
          delay: 550 + idx * 80,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards",
        }
      );
    });
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const now = "Just now";
    setConversations((prev) => [
      { q: inputValue.trim(), t: now },
      ...prev.slice(0, 3),
    ]);
    setInputValue("");
  };

  const handleQuickCardClick = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <div className="dashboard-shell">
      {/* ── Top Ambient Light Glow ── */}
      <div className="top-glow" />

      {/* ── Left Rail (48u wide) ── */}
      <aside className="left-rail">
        <div className="rail-group">
          {/* Logo Tile */}
          <div className="logo-tile rail-item" title="FinAI Assistant">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>

          {/* Grouped 32u Icon Tiles */}
          <button className="icon-tile rail-item" title="Home">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </button>

          <button className="icon-tile active rail-item" title="AI Assistant">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          <button className="icon-tile rail-item" title="Analytics">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </button>

          <button className="icon-tile rail-item" title="Portfolio & Wallet">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </button>
        </div>

        {/* Bottom Rail: User & Settings */}
        <div className="rail-group">
          <button className="icon-tile rail-item" title="Settings">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>

          <button className="icon-tile rail-item" title="User Profile">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main Canvas (Fills spare space) ── */}
      <div className="main-canvas">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <button className="nav-tile" title="Back">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="nav-tile" title="Forward">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <nav className="breadcrumbs">
              <span className="crumb-muted">Home</span>
              <span className="crumb-sep">›</span>
              <span className="crumb-active">AI Assistant</span>
            </nav>
          </div>

          <div className="top-bar-right">
            <div className="search-field">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search Anything..." />
            </div>

            <button className="action-tile" title="Notifications">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>

            <div className="avatar-tile" title="Jason">
              J
            </div>
          </div>
        </header>

        {/* Sub-bar / Mode Switcher */}
        <div className="sub-bar">
          <div className="segmented-toggle">
            <button
              className={`segmented-btn ${activeMode === "chat" ? "active" : ""}`}
              onClick={() => setActiveMode("chat")}
            >
              Chat Mode
            </button>
            <button
              className={`segmented-btn ${activeMode === "overview" ? "active" : ""}`}
              onClick={() => setActiveMode("overview")}
            >
              Overview
            </button>
          </div>

          <div className="status-pill">
            <span className="status-dot" />
            <span>AI Agents Running</span>
            <span className="status-count">17</span>
          </div>
        </div>

        {/* ── Hero Centred Column (708u wide) ── */}
        <main className="hero-column">
          {/* Living Glass Orb Layer (145u with -30.5u margin) */}
          <div className="orb-container">
            {/* Canvas Still Plate & Swirling Core */}
            <canvas
              ref={orbCanvasRef}
              width={290}
              height={290}
              className="orb-canvas"
            />
            {/* Inline looping muted video with loadeddata fade-in */}
            <video
              ref={videoRef}
              className="orb-video loaded"
              autoPlay
              loop
              muted
              playsInline
              src="https://assets.mixkit.co/videos/preview/mixkit-futuristic-holographic-sphere-animation-41444-large.mp4"
              onLoadedData={() => videoRef.current?.classList.add("loaded")}
            />
          </div>

          {/* Hero Text */}
          <p className="hero-greeting">Good Morning, Jason</p>

          <div className="headline-mask">
            <h1 className="hero-headline">WHAT&apos;S ON YOUR MIND?</h1>
          </div>

          <p className="hero-subline">
            Get personalized financial insights, smarter recommendations.
          </p>

          {/* Composer (114u tall, 14u radius, 1.2u gradient hairline border) */}
          <div className="composer-box">
            <input
              type="text"
              className="composer-input"
              placeholder="Ask Anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />

            <div className="composer-chips">
              <div className="chips-left">
                <button className="chip-btn chip-icon-only" title="Attach file">
                  +
                </button>
                <button
                  className="chip-btn"
                  onClick={() =>
                    setSelectedChip((prev) =>
                      prev === "Normal" ? "Creative" : "Normal"
                    )
                  }
                >
                  <span>{selectedChip}</span>
                  <span style={{ fontSize: "9px" }}>▾</span>
                </button>
                <button
                  className={`chip-btn ${deepThinkActive ? "active" : ""}`}
                  style={
                    deepThinkActive
                      ? {
                          borderColor: "var(--accent-blue)",
                          color: "var(--accent-blue)",
                        }
                      : {}
                  }
                  onClick={() => setDeepThinkActive(!deepThinkActive)}
                >
                  <span>Deep Think</span>
                  <span style={{ fontSize: "9px" }}>▾</span>
                </button>
              </div>

              <div className="chips-right">
                <button className="chip-btn chip-icon-only" title="Voice Input">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>

                <button
                  className="send-btn"
                  onClick={handleSend}
                  title="Send message"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Three Quick-Action Cards */}
          <div className="quick-cards">
            {/* Card 1: Smart Budget Plan */}
            <div
              className="quick-card"
              onClick={() =>
                handleQuickCardClick("Create a smart monthly budget plan based on my cash flow")
              }
            >
              <div className="quick-card-top">
                <span className="quick-card-title">Smart Budget Plan</span>
                <div className="quick-card-icon icon-blue">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                  </svg>
                </div>
              </div>
              <span className="quick-card-sub">Create My Budget</span>
            </div>

            {/* Card 2: Set a Saving Goal */}
            <div
              className="quick-card"
              onClick={() =>
                handleQuickCardClick("Help me set up an automated saving goal for emergency funds")
              }
            >
              <div className="quick-card-top">
                <span className="quick-card-title">Set a Saving Goal</span>
                <div className="quick-card-icon icon-violet">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
              </div>
              <span className="quick-card-sub">Set a Goal</span>
            </div>

            {/* Card 3: Track My Expenses */}
            <div
              className="quick-card"
              onClick={() =>
                handleQuickCardClick("Show my recent spending trends and flag any unusual expenses")
              }
            >
              <div className="quick-card-top">
                <span className="quick-card-title">Track My Expenses</span>
                <div className="quick-card-icon icon-indigo">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
              </div>
              <span className="quick-card-sub">Monitor Spending</span>
            </div>
          </div>

          {/* Recent Conversations */}
          <div className="recent-conversations">
            <div className="history-tree">
              {conversations.map((item, idx) => (
                <div
                  key={idx}
                  className="history-item"
                  onClick={() => handleQuickCardClick(item.q)}
                >
                  <span className="history-question">{item.q}</span>
                  <span className="history-time">{item.t}</span>
                </div>
              ))}
            </div>

            <a className="see-more-link" onClick={() => alert("Showing all history")}>
              <span>See More</span>
              <span>→</span>
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
