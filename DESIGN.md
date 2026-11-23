# KeraVokasi AI Chatbot — Semantic Design System (DESIGN.md)

## 1. Visual Atmosphere & Philosophy
- **Density:** Balanced (5/10). Ample whitespace around chat bubbles with compact, high-efficiency sidebar controls.
- **Tone:** Ultra-clean, authoritative, modern monochrome aesthetic inspired by high-end developer tools and minimalist editorial typography.
- **Variance:** Asymmetric dock sidebar on the left, centered fluid chat stream with floating pill inputs.
- **Lighting:** Deep dark canvas (`#0A0A0B`) with subtle border tiers (`#2E2E2F`, `#3F3F3F`) for depth instead of colored drop shadows.

## 2. Color Calibration & Palette
All colors follow a strict monochrome palette with zero neon or rainbow gradients:
- **Canvas / Background:** `#0A0A0B`
- **Surface Elevation 1 (Card/Dock Base):** `#141515`
- **Surface Elevation 2 (Active/User Bubble):** `#1E1F1F`
- **Border Default:** `#2E2E2F`
- **Border Active / Subtle Accent:** `#3F3F3F`
- **Muted Text / Secondary:** `#5F5C5D`
- **Body Text / Neutral:** `#B3B2B2`
- **Sub-heading / Light Muted:** `#E0E0E0`
- **Primary / Active Highlight:** `#FFFFFF`
- **Off-White Accent:** `#F0F0F0`

*Banned Patterns:* No neon gradients, no purple or cyan AI glows, no colored pill buttons, no pure `#000000` canvas.

## 3. Typography Architecture
- **Font Stack:** `Geist Sans`, `Inter`, -apple-system, BlinkMacSystemFont, sans-serif.
- **Monospace Stack (Numbers/Tokens/Timestamps):** `Geist Mono`, ui-monospace, SFMono-Regular, Menlo, monospace.
- **Scale:**
  - `h1`: 24px - 32px, font-weight 700, tracking-tight.
  - `h2`: 18px - 20px, font-weight 600, tracking-tight.
  - `body`: 13px - 14px, font-weight 400, leading-relaxed, max line length 65ch.
  - `caption / timestamp`: 10px - 11px, font-weight 500, font-mono, text-[#5F5C5D].
  - `badge / tag`: 9px - 11px, font-weight 600, tracking-wide uppercase.

## 4. Component Behaviors
### Sidebar Dock Menu
- Floating vertical dock on the left with rounded-2xl (16px) contour.
- Compact state (64px) shows logo, user avatar with quota badge, "+ Obrolan Baru" button, and utility icons.
- Expanded state (272px) reveals user credentials, quota progress, "+ Obrolan Baru" full-width CTA, and an interactive scrollable list of recent conversation threads with trash icons on hover.
- Items feature borderless floating design with smooth spring animations.

### Chat Interface
- Assistant messages: Rendered inside `#141515` card with `#2E2E2F` border, clean markdown formatting, and verified knowledge source badges with school attribution.
- User messages: Align to the right in `#1E1F1F` pill with `#2E2E2F` border and bright `#FFFFFF` text.
- Typing indicator: 3 bouncing monochrome dots inside `#141515` container.
- Input Box: Floating bottom bar with placeholders-and-vanish effect, dark pill button with high-contrast text and visible loading states.

## 5. Interaction & Motion Philosophy
- Spring physics: `stiffness: 400, damping: 32` for dock expansions.
- Micro-interactions: 150ms ease-out transitions on hover, scale-105 on icon hover.
- Zero layout shift during stream generation or loading.
