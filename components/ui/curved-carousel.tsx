"use client";

import React from "react";

export interface CarouselSlide {
  image: {
    src: string;
    srcSet?: string;
    alt?: string;
  };
  title?: string;
}

const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    image: { src: "/imagescarousel/23c9e0a234282c9b7b29e7aa4329ac97.jpg" },
    title: "Teknik & Rekayasa Vokasi",
  },
  {
    image: { src: "/imagescarousel/273d9e225bb8cfe33ed93f1c5750425e.jpg" },
    title: "Multimedia & Desain Kreatif",
  },
  {
    image: { src: "/imagescarousel/93c43cef7f35b7c8036838d5432078ce.jpg" },
    title: "Laboratorium Komputer & RPL",
  },
  {
    image: { src: "/imagescarousel/defde4c93314b4ea841dae7b5e3b75de.jpg" },
    title: "Pengembangan Keahlian Kerja",
  },
  {
    image: { src: "/imagescarousel/f92016fa34ded0b525330b7b19bfd2f4.jpg" },
    title: "Praktik Terpadu Siswa SMK",
  },
  {
    image: { src: "/imagescarousel/23c9e0a234282c9b7b29e7aa4329ac97.jpg" },
    title: "Peluang Karier Industri",
  },
  {
    image: { src: "/imagescarousel/273d9e225bb8cfe33ed93f1c5750425e.jpg" },
    title: "Kreativitas & Seni Digital",
  },
  {
    image: { src: "/imagescarousel/93c43cef7f35b7c8036838d5432078ce.jpg" },
    title: "Ekosistem Belajar Modern",
  },
];

const DEFAULTS = {
  curve: 0.35,
  autoplay: true,
  speed: 28,
  direction: "Left" as "Left" | "Right",
  showCaptions: true,
  showNumbers: true,
  cardWidth: 190,
  cardHeight: 250,
  gap: 24,
  radius: 16,
  momentum: 0.92,
  paper: "#FFFFFF",
  cardBorder: "rgba(0, 0, 0, 0.08)",
  captionSize: 13,
  captionWeight: 500,
  captionColor: "#ffffff",
  numberSize: 11,
  captionPadding: 12,
  captionFade: 0.65,
  width: "100%" as number | string,
  height: 320 as number | string,
  style: undefined as React.CSSProperties | undefined,
};

const PORTABLE_FONT = '"Curved Carousel Inter", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const FONT_FILES = [
  {
    weight: "400",
    url: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf",
  },
  {
    weight: "500",
    url: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf",
  },
];

let fontTask: Promise<void> | null = null;
const imageTasks = new Map<string, Promise<HTMLImageElement | null>>();

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const modulo = (v: number, total: number) => ((v % total) + total) % total;

function dimension(value: number | string | undefined, backup: number | string): number | string {
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : backup;
  if (typeof value === "string") {
    const v = value.trim();
    if (
      !v ||
      /^(auto|fit-content|max-content|min-content|initial|inherit|unset)$/i.test(v) ||
      /^0(?:\.0+)?(?:px|%|em|rem|vh|vw)?$/i.test(v)
    ) {
      return backup;
    }
    return v;
  }
  return backup;
}

function sourceOf(
  value: string | { src: string; alt?: string; srcSet?: string } | undefined,
  fallback: { src: string; alt?: string; srcSet?: string }
) {
  const candidate = typeof value === "string" ? { src: value } : value;
  return candidate?.src && /^(https?:\/\/|data:image\/|blob:|\/|\.\/)/i.test(candidate.src)
    ? candidate
    : fallback;
}

function preloadFont(): Promise<void> {
  if (!fontTask) {
    if (typeof FontFace === "undefined" || typeof document === "undefined") {
      fontTask = Promise.resolve();
    } else {
      fontTask = Promise.all(
        FONT_FILES.map(async (entry) => {
          try {
            const face = new FontFace("Curved Carousel Inter", `url("${entry.url}")`, {
              weight: entry.weight,
              style: "normal",
              display: "swap",
            });
            document.fonts.add(await face.load());
          } catch {
            // graceful fallback to system fonts
          }
        })
      )
        .then(() => undefined)
        .catch(() => undefined);
    }
  }
  return fontTask;
}

function preloadImage(src: string): Promise<HTMLImageElement | null> {
  const cached = imageTasks.get(src);
  if (cached) return cached;
  const pending = new Promise<HTMLImageElement | null>((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }
    const image = new Image();
    image.decoding = "async";
    const done = (result: HTMLImageElement | null) => {
      image.onload = null;
      image.onerror = null;
      resolve(result);
    };
    image.onload = () => done(image.naturalWidth && image.naturalHeight ? image : null);
    image.onerror = () => done(null);
    image.src = src;
  });
  imageTasks.set(src, pending);
  if (imageTasks.size > 64) imageTasks.delete(imageTasks.keys().next().value!);
  return pending;
}

function colorIn(host: HTMLElement, value: string): string {
  const probe = document.createElement("span");
  probe.style.color = value;
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  host.appendChild(probe);
  const result = getComputedStyle(probe).color;
  probe.remove();
  return result;
}

function outline(ctx: CanvasRenderingContext2D, x: number, w: number, h: number, radius: number) {
  const r = clamp(radius, 0, Math.min(w, h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, 0);
  ctx.lineTo(x + w - r, 0);
  ctx.quadraticCurveTo(x + w, 0, x + w, r);
  ctx.lineTo(x + w, h - r);
  ctx.quadraticCurveTo(x + w, h, x + w - r, h);
  ctx.lineTo(x + r, h);
  ctx.quadraticCurveTo(x, h, x, h - r);
  ctx.lineTo(x, r);
  ctx.quadraticCurveTo(x, 0, x + r, 0);
  ctx.closePath();
}

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  margin: 0,
};

export interface CurvedCarouselProps {
  items?: CarouselSlide[];
  curve?: number;
  autoplay?: boolean;
  speed?: number;
  direction?: "Left" | "Right";
  showCaptions?: boolean;
  showNumbers?: boolean;
  cardWidth?: number;
  cardHeight?: number;
  gap?: number;
  radius?: number;
  momentum?: number;
  paper?: string;
  cardBorder?: string;
  captionSize?: number;
  captionWeight?: number;
  captionColor?: string;
  numberSize?: number;
  captionPadding?: number;
  captionFade?: number;
  className?: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
}

export function CurvedCarousel(props: CurvedCarouselProps) {
  const supplied = Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== null && value !== undefined)
  );
  const p = { ...DEFAULTS, ...supplied };

  const slides = React.useMemo(() => {
    const input = Array.isArray(props.items) && props.items.length ? props.items : DEFAULT_SLIDES;
    return input.slice(0, 30).map((slide, i) => {
      const fallback = DEFAULT_SLIDES[i % DEFAULT_SLIDES.length];
      return {
        title: slide?.title ?? fallback.title ?? "Kegiatan SMK",
        image: sourceOf(slide?.image, fallback.image),
      };
    });
  }, [props.items]);

  const root = React.useRef<HTMLDivElement>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const texture = React.useRef<{
    image: HTMLCanvasElement;
    scale: number;
    width: number;
    height: number;
  } | null>(null);
  const drawing = React.useRef<() => void>(() => {});
  const motion = React.useRef({
    offset: 0,
    velocity: 0,
    pointer: -1,
    x: 0,
    time: 0,
    resume: 0,
    keyboard: false,
  });

  const [size, setSize] = React.useState({ width: 1200, height: 320 });
  const [ready, setReady] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [focusVisible, setFocusVisible] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);
  const [inView, setInView] = React.useState(true);
  const [pageVisible, setPageVisible] = React.useState(true);

  const instructions = React.useId();

  const scale = Math.min(
    1,
    Math.max(100, size.width * 0.6) / Math.max(1, p.cardWidth),
    Math.max(90, size.height - 40) / Math.max(1, p.cardHeight)
  );

  const w = Math.max(80, p.cardWidth * scale);
  const h = Math.max(90, p.cardHeight * scale);
  const pitch = w + Math.max(8, p.gap * scale);
  const total = slides.length * pitch;
  const inset = Math.max(0, p.captionPadding);
  const fadeHeight = Math.max(
    80,
    inset + Math.max(p.showCaptions ? p.captionSize : 0, p.showNumbers ? p.numberSize : 0) + 32
  );

  // Cache projection geometry
  const projection = React.useMemo(() => {
    const columns = Math.ceil(size.width);
    const rows = new Float64Array(columns * 4);
    const half = Math.max(260, size.width / 2);
    const bend = clamp(p.curve, 0, 1.5);
    const perspective = Math.max(900, size.width * 1.15);
    const lift = Math.min(bend * 80, Math.max(0, (size.height - h) / 2 + 10));
    const arc = (x: number) => x * (1 + bend * 0.18 * Math.pow(x / half, 2));

    for (let column = 0; column < columns; column++) {
      const x = column - size.width / 2;
      const normal = (x + 0.5) / half;
      const projected = perspective / (perspective + bend * 210 * normal * normal);
      const i = column * 4;
      rows[i] = arc(x) + w / 2;
      rows[i + 1] = arc(x + 1) - arc(x);
      rows[i + 2] = size.height / 2 - lift * normal * normal - h * 0.5 * projected;
      rows[i + 3] = h * projected;
    }
    return rows;
  }, [size.width, size.height, w, h, p.curve]);

  drawing.current = () => {
    const surface = canvas.current;
    const atlas = texture.current;
    if (!surface || !atlas) return;
    const ctx = surface.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, (typeof window !== "undefined" && window.devicePixelRatio) || 1);
    const pw = Math.max(1, Math.round(size.width * dpr));
    const ph = Math.max(1, Math.round(size.height * dpr));
    if (surface.width !== pw) surface.width = pw;
    if (surface.height !== ph) surface.height = ph;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    for (let x = 0, i = 0; i < projection.length; x++, i += 4) {
      const source = modulo(projection[i] - motion.current.offset, atlas.width);
      const span = projection[i + 1];
      const first = Math.min(span, atlas.width - source);
      const destination = first / span;

      ctx.drawImage(
        atlas.image,
        source * atlas.scale,
        0,
        first * atlas.scale,
        atlas.image.height,
        x,
        projection[i + 2],
        destination + 0.12,
        projection[i + 3]
      );

      if (first < span) {
        ctx.drawImage(
          atlas.image,
          0,
          0,
          (span - first) * atlas.scale,
          atlas.image.height,
          x + destination,
          projection[i + 2],
          1 - destination + 0.12,
          projection[i + 3]
        );
      }
    }
  };

  // Build Atlas texture
  React.useEffect(() => {
    const host = root.current;
    if (!host) return;
    let cancelled = false;
    let repaint = 0;

    const atlas = document.createElement("canvas");
    const density = Math.min(2, 8192 / Math.max(1, total), 2048 / Math.max(1, h));
    atlas.width = Math.max(1, Math.round(total * density));
    atlas.height = Math.max(1, Math.round(h * density));
    const ctx = atlas.getContext("2d");
    if (!ctx) return;

    const paper = colorIn(host, p.paper);
    const ink = colorIn(host, p.captionColor);
    const border = colorIn(host, p.cardBorder);
    const family = getComputedStyle(host).fontFamily || PORTABLE_FONT;

    const paint = (images: (HTMLImageElement | null)[]) => {
      if (cancelled) return;
      ctx.setTransform(density, 0, 0, density, 0, 0);
      ctx.clearRect(0, 0, total, h);

      slides.forEach((slide, index) => {
        const x = index * pitch;
        ctx.save();
        outline(ctx, x, w, h, p.radius);
        ctx.clip();
        ctx.fillStyle = paper;
        ctx.fillRect(x, 0, w, h);

        const image = images[index];
        if (image) {
          const cover = Math.max(w / image.naturalWidth, h / image.naturalHeight);
          const cw = w / cover;
          const ch = h / cover;
          ctx.drawImage(
            image,
            (image.naturalWidth - cw) / 2,
            (image.naturalHeight - ch) / 2,
            cw,
            ch,
            x,
            0,
            w,
            h
          );
        }

        if (p.showCaptions || p.showNumbers) {
          const fade = ctx.createLinearGradient(0, h - fadeHeight, 0, h);
          fade.addColorStop(0, "rgba(0,0,0,0)");
          fade.addColorStop(1, `rgba(0,0,0,${clamp(p.captionFade, 0, 1)})`);
          ctx.fillStyle = fade;
          ctx.fillRect(x, h - fadeHeight, w, fadeHeight);

          ctx.fillStyle = ink;
          ctx.textBaseline = "alphabetic";

          if (p.showCaptions) {
            ctx.font = `${p.captionWeight} ${p.captionSize}px ${family}`;
            ctx.textAlign = "left";
            const allowance = w - inset * 2 - (p.showNumbers ? Math.max(25, p.numberSize * 2 + 8) : 0);
            const original = slide.title || "SMK";
            let label = original;
            while (label.length > 1 && ctx.measureText(label).width > allowance) {
              label = label.slice(0, -1);
            }
            if (label !== original) label += "…";
            ctx.fillText(label, x + inset, h - inset - ctx.measureText(label).actualBoundingBoxDescent);
          }

          if (p.showNumbers) {
            ctx.font = `400 ${p.numberSize}px ${family}`;
            ctx.textAlign = "right";
            const number = String((index % slides.length) + 1).padStart(2, "0");
            ctx.fillText(number, x + w - inset, h - inset - ctx.measureText(number).actualBoundingBoxDescent);
          }
        }

        ctx.strokeStyle = border;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });

      texture.current = {
        image: atlas,
        scale: density,
        width: total,
        height: h,
      };

      drawing.current();
      setReady(true);
    };

    const pictures = slides.map((slide) => preloadImage(slide.image.src || ""));
    Promise.all([Promise.all(pictures), preloadFont()]).then(([images]) => {
      if (!cancelled) {
        repaint = requestAnimationFrame(() => paint(images));
      }
    });

    return () => {
      cancelled = true;
      if (repaint) cancelAnimationFrame(repaint);
      if (texture.current?.image === atlas) texture.current = null;
    };
  }, [
    slides,
    w,
    h,
    pitch,
    total,
    p.radius,
    p.paper,
    p.cardBorder,
    p.captionColor,
    p.captionSize,
    p.captionWeight,
    p.numberSize,
    p.showCaptions,
    p.showNumbers,
    inset,
    p.captionFade,
    fadeHeight,
  ]);

  // Handle Resize and Visibility
  React.useEffect(() => {
    const host = root.current;
    if (!host) return;

    const measure = () => {
      const width = host.clientWidth || 1200;
      const height = host.clientHeight || 320;
      setSize((old) => (old.width === width && old.height === height ? old : { width, height }));
    };

    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(host);

    const intersection = new IntersectionObserver((entries) => {
      setInView(entries[0]?.isIntersecting ?? true);
    });
    intersection.observe(host);

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionPreference = () => setReduced(media.matches);
    const visibility = () => setPageVisible(!document.hidden);

    motionPreference();
    visibility();

    media.addEventListener("change", motionPreference);
    document.addEventListener("visibilitychange", visibility);

    return () => {
      resize.disconnect();
      intersection.disconnect();
      media.removeEventListener("change", motionPreference);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  React.useEffect(() => {
    drawing.current();
  }, [projection, ready]);

  // RequestAnimationFrame motion tick loop
  React.useEffect(() => {
    if (!inView || !pageVisible || !ready) return;
    let frame = 0;
    let last = 0;

    const tick = (now: number) => {
      const dt = last ? Math.min(0.04, (now - last) / 1000) : 1 / 60;
      last = now;
      const m = motion.current;

      if (m.pointer < 0) {
        const automatic = p.autoplay && !paused && !reduced && !m.keyboard && now > m.resume;
        const target = automatic ? clamp(p.speed, 0, 300) * (p.direction === "Left" ? -1 : 1) : 0;
        m.velocity = reduced ? 0 : m.velocity + (target - m.velocity) * (1 - Math.pow(clamp(p.momentum, 0.7, 0.98), dt * 60));

        if (Math.abs(m.velocity) > 0.01) {
          m.offset = modulo(m.offset + m.velocity * dt, total);
          drawing.current();
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, pageVisible, ready, paused, reduced, p.autoplay, p.speed, p.direction, p.momentum, total]);

  // User interaction handlers
  const press = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !event.isPrimary) return;
    Object.assign(motion.current, {
      pointer: event.pointerId,
      x: event.clientX,
      time: performance.now(),
      velocity: 0,
      keyboard: false,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    setFocusVisible(false);
  };

  const drag = (event: React.PointerEvent<HTMLDivElement>) => {
    const m = motion.current;
    if (m.pointer !== event.pointerId) return;
    const now = performance.now();
    const dx = event.clientX - m.x;
    m.offset = modulo(m.offset + dx, total);
    m.velocity = clamp(0.35 * m.velocity + (0.65 * dx) / (Math.max(8, now - m.time) / 1000), -2200, 2200);
    m.x = event.clientX;
    m.time = now;
    drawing.current();
  };

  const release = (event: React.PointerEvent<HTMLDivElement>) => {
    const m = motion.current;
    if (m.pointer !== event.pointerId) return;
    if (event.type !== "pointerup" || performance.now() - m.time > 100 || reduced) {
      m.velocity = 0;
    }
    m.pointer = -1;
    m.resume = performance.now() + 1100;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const key = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      motion.current.offset = modulo(
        motion.current.offset + (event.key === "ArrowLeft" ? pitch : -pitch),
        total
      );
      motion.current.velocity = 0;
      motion.current.resume = performance.now() + 1800;
      drawing.current();
    } else if (event.key === " ") {
      event.preventDefault();
      setPaused((value) => !value);
    }
  };

  const copies = Math.max(1, Math.ceil((size.width + pitch * 4) / total));
  const fallbackCount = slides.length * copies;

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label="KeraVokasi Gallery Carousel"
      aria-describedby={instructions}
      tabIndex={0}
      onPointerDown={press}
      onPointerMove={drag}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onKeyDown={key}
      onFocus={(event) => {
        const visible = event.currentTarget.matches(":focus-visible");
        motion.current.keyboard = visible;
        if (visible) motion.current.velocity = 0;
        setFocusVisible(visible);
      }}
      onBlur={() => {
        motion.current.keyboard = false;
        setFocusVisible(false);
      }}
      className={props.className}
      style={{
        background: "transparent",
        color: p.captionColor,
        fontFamily: PORTABLE_FONT,
        fontSize: p.captionSize,
        fontWeight: 400,
        fontStyle: "normal",
        lineHeight: 1,
        letterSpacing: "normal",
        textTransform: "none",
        direction: "ltr",
        ...p.style,
        width: dimension(p.style?.width ?? p.width, "100%"),
        height: dimension(p.style?.height ?? p.height, 320),
        display: "block",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        isolation: "isolate",
        userSelect: "none",
        touchAction: "pan-y",
        cursor: dragging ? "grabbing" : "grab",
        outline: focusVisible ? `2px solid ${p.captionColor}` : "none",
        outlineOffset: -4,
      }}
    >
      <canvas
        ref={canvas}
        aria-hidden="true"
        style={{
          display: "block",
          position: "relative",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      {/* Fallback layout before canvas initialization */}
      {!ready && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          {Array.from({ length: fallbackCount }, (_, i) => {
            const slide = slides[i % slides.length];
            const x =
              modulo(i * pitch + (fallbackCount * pitch) / 2, fallbackCount * pitch) -
              (fallbackCount * pitch) / 2;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: w,
                  height: h,
                  marginLeft: x - w / 2,
                  marginTop: -h / 2,
                  borderRadius: p.radius,
                  overflow: "hidden",
                  background: p.paper,
                  border: `1px solid ${p.cardBorder}`,
                  boxSizing: "border-box",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.image.src}
                  srcSet={slide.image.srcSet}
                  alt={slide.image.alt || slide.title}
                  draggable={false}
                  decoding="async"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                {(p.showCaptions || p.showNumbers) && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: fadeHeight,
                      padding: inset,
                      boxSizing: "border-box",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      gap: 8,
                      fontSize: p.captionSize,
                      lineHeight: `${p.captionSize}px`,
                      fontWeight: p.captionWeight,
                      background: `linear-gradient(transparent, rgba(0,0,0,${clamp(p.captionFade, 0, 1)}))`,
                    }}
                  >
                    {p.showCaptions && (
                      <span
                        style={{
                          minWidth: 0,
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {slide.title}
                      </span>
                    )}
                    {p.showNumbers && (
                      <span
                        style={{
                          marginLeft: "auto",
                          flexShrink: 0,
                          fontSize: p.numberSize,
                          fontWeight: 400,
                        }}
                      >
                        {String((i % slides.length) + 1).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ul style={srOnly}>
        {slides.map((slide, i) => (
          <li key={i}>
            {slide.title}. {slide.image.alt}
          </li>
        ))}
      </ul>
      <p id={instructions} style={srOnly}>
        Drag left or right to explore. Use left and right arrow keys when focused. Space pauses or resumes automatic motion.
      </p>
    </div>
  );
}

export default CurvedCarousel;
