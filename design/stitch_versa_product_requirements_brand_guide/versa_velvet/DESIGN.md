# Design System Strategy: The Radiant Sanctuary

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Radiant Sanctuary."** 

Unlike typical wellness apps that rely on clinical whites or muted pastels, this system embraces the depth of the midnight sky and the vibrancy of jewel-toned light. We are moving away from the "template" look of rigid grids and flat boxes. Instead, we treat the interface as an immersive, editorial experience. By using intentional asymmetry—where elements might bleed off the edge or overlap with soft-focus imagery—we create a sense of organic movement. This is a digital luxury spa: high-contrast, deeply safe, and unapologetically sophisticated.

## 2. Colors
Our palette is a celebration of identity through light. We avoid the clichés of standard pride flags in favor of a "Glow on Dark" aesthetic that feels premium and mature.

*   **Foundation:** Deep Midnight (`surface`: #0e0e0e) provides the ultimate canvas for our vibrant accents. Clean Off-White (`inverse_surface`: #fcf9f8) is used sparingly for high-impact editorial moments.
*   **Jewel Accents:** Plum/Magenta (`primary`: #f183ff), Saffron/Mango (`secondary`: #ff9800), and Emerald (`tertiary`: #b8ffbb) are used to draw the eye to interactive elements and progress indicators.
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. We define boundaries through background color shifts. A `surface-container-low` (#131313) card sitting on a `surface` (#0e0e0e) background creates all the definition required.
*   **Glass & Gradient Rule:** To mirror the fluid, overlapping nature of the logo, use Glassmorphism for floating navigation bars or modal headers. Apply a backdrop-blur (12px-20px) to `surface-container` tiers at 80% opacity. 
*   **Signature Textures:** Main CTAs should utilize a subtle radial gradient transitioning from `primary` (#f183ff) to `primary_container` (#e770f8) to mimic the "internal glow" seen in the brand logo.

## 3. Typography
We utilize a dual-typeface system to balance editorial authority with high-performance legibility.

*   **Display & Headlines (Manrope):** Chosen for its geometric modernism and wide apertures. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero moments. This font carries the "Sophisticated" weight of the brand.
*   **Body & Labels (Plus Jakarta Sans):** A high-performance sans-serif that maintains clarity at small scales. The generous x-height ensures readability for long-form wellness content.
*   **Hierarchy as Emotion:** We use dramatic scale shifts. A large `headline-lg` paired directly with a `body-md` creates an editorial "magazine" feel that communicates luxury.

## 4. Elevation & Depth
In a "Radiant Sanctuary," depth is not about shadows—it's about light and layering.

*   **Tonal Layering:** Stack surfaces using the `surface-container` scale. 
    *   *Base:* `surface` (#0e0e0e)
    *   *Section:* `surface-container-low` (#131313)
    *   *Card:* `surface-container-high` (#201f1f)
*   **Ambient Shadows:** When a float is necessary (e.g., a floating action button), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4)`. The shadow should feel like a soft cloud, not a hard edge.
*   **The Ghost Border:** If accessibility requires a stroke (e.g., input fields), use `outline_variant` (#484847) at 20% opacity. Never use 100% opaque borders.
*   **Fluidity:** Incorporate the "Abstract Fluid Shapes" imagery style as background elements that sit *between* layers, partially obscured by glassmorphic containers.

## 5. Components

### Buttons & Interaction
*   **Primary Button:** Uses the Saffron-to-Mango gradient. `xl` (1.5rem) corner radius. Typography is `title-sm` (Plus Jakarta Sans) in `on_secondary` (#4a2800) for maximum contrast.
*   **Secondary/Ghost:** No fill. `outline` (#767575) at 30% opacity.
*   **Chips:** Use `surface-container-highest` (#262626) with `full` (9999px) roundedness. They should look like smooth river stones.

### Data & Inputs
*   **Input Fields:** `surface-container-lowest` (#000000) backgrounds with `title-md` text. No bottom border; use a subtle background shift on focus to `surface-container-high`.
*   **Checkboxes/Radios:** When active, these should "glow" using the `primary_dim` (#e46df5) color and a soft outer blur (glow effect).

### Navigation & Cards
*   **Content Cards:** Forbid dividers. Use `Spacing-8` (2.75rem) to separate vertical content. Use `surface-container-low` to group related items.
*   **The Versa Carousel:** Inspired by the logo’s infinity shape, cards in a carousel should overlap slightly, using semi-transparency to show the content beneath.

### Specialized Components
*   **Mood Tracker:** A fluid, interactive gradient mesh that the user can "distort" with touch, changing colors from Emerald (calm) to Plum (intense).
*   **Breath Pacer:** A soft-focus ambient circle that expands and contracts, utilizing the `secondary_fixed` (#ffc791) glow.

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts. Let imagery push text to the side.
*   **Do** use large amounts of "Breathing Room" (Spacing scale 12 and 16).
*   **Do** embrace the "glow." Interactive elements should feel like they are emitting light against the midnight background.
*   **Do** use line-art that is inclusive and abstract, ensuring it feels like art, not stock iconography.

### Don’t
*   **Don’t** use pure black (#000) for backgrounds; keep to `surface` (#0e0e0e) to maintain the "luxury spa" softness.
*   **Don’t** use standard "Success Green" or "Error Red." Use our `tertiary` Emerald and `error_dim` Plum-Red to keep the palette cohesive.
*   **Don’t** use dividers or 1px lines. They break the fluid, dreamy immersion of the sanctuary.
*   **Don’t** center-align long blocks of text. Keep alignment intentional and editorial (Left-aligned with generous margins).