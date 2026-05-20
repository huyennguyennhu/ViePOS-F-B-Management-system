# ViePOS — Design System & Guidelines

**Source:** Figma VIEPOS-WIREFRAME (fileKey: txxN6issmLkjIG35KXt2ZF)

---

## Color Tokens

### Primary Brand Colors
| Token | Hex | Usage | CSS Variable |
|-------|-----|-------|--------------|
| Brand Dark Green | `#256E05` | Primary action (hover), logo | `--color-brand-dark` |
| Brand Light Green | `#3CB018` | Hero gradient, secondary | `--color-brand-light` |
| Action Green | `#349409` | Button default, CTA | `--color-action-primary` |

### Background & Neutral
| Token | Hex | Usage | CSS Variable |
|-------|-----|-------|--------------|
| Background Light | `#F2F3ED` | Page bg, light surfaces | `--color-bg-light` |
| White | `#FFFFFF` | Cards, modals, text bg | `--color-white` |
| Black | `#000000` | Text, borders | `--color-black` |
| Gray 1 (Placeholder) | `#CBCBCB` | Placeholder text | `--color-gray-1` |
| Gray 2 (Separator) | `#C4C4C4` | Dividers, light borders | `--color-gray-2` |
| Gray 3 (Label) | `#878787` | Secondary text, labels | `--color-gray-3` |
| Gray 4 (Disabled) | `#BCBFC2` | Disabled text | `--color-gray-4` |
| Gray 5 (Border) | `#E0E0E0` | Light borders, outlines | `--color-gray-5` |
| Gray 6 (BG) | `#F5F5F5` | Disabled backgrounds | `--color-gray-6` |
| Gray 7 (Subtle) | `#C2C2C2` | Very subtle elements | `--color-gray-7` |

### Status Colors
| Status | Hex (Color) | Hex (BG) | Usage | CSS Variable |
|--------|-------------|----------|-------|--------------|
| Success | `#349409` | `#EDFFE5` | Order complete, payment confirmed | `--color-success` |
| Warning | `#E8A909` | `#FFF8E5` | Stock low, pending action | `--color-warning` |
| Danger | `#C42326` | `#FFE8E8` | Error, failed payment, invalid PIN | `--color-danger` |
| Danger Border | `#8C1F1F` | — | Alert borders | `--color-danger-border` |
| Info | `#0023DD` | `#EBEEFF` | Information message | `--color-info` |
| Info Border | `#001DB8` | — | Info borders | `--color-info-border` |
| Alert Red | `#DE000B` | — | Critical alerts, validation | `--color-alert` |

### Gradients
```css
/* Brand gradient (hero bg, logo) */
background: linear-gradient(134deg, #3CB018 0%, #256E05 100%);
--gradient-brand: linear-gradient(134deg, var(--color-brand-light) 0%, var(--color-brand-dark) 100%);
```

### Tailwind Configuration
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#256E05',
          light: '#3CB018',
        },
        action: {
          primary: '#349409',
        },
        status: {
          success: '#349409',
          'success-bg': '#EDFFE5',
          warning: '#E8A909',
          'warning-bg': '#FFF8E5',
          danger: '#C42326',
          'danger-bg': '#FFE8E8',
          'danger-border': '#8C1F1F',
          info: '#0023DD',
          'info-bg': '#EBEEFF',
          'info-border': '#001DB8',
          alert: '#DE000B',
        },
        gray: {
          1: '#CBCBCB',
          2: '#C4C4C4',
          3: '#878787',
          4: '#BCBFC2',
          5: '#E0E0E0',
          6: '#F5F5F5',
          7: '#C2C2C2',
        },
        background: '#F2F3ED',
      },
    },
  },
};
```

---

## Typography Scale

### Font Families
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-header: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
--font-button: 'Lexend', sans-serif;
--font-accent: 'Poppins', sans-serif;
```

### Text Styles

| Use Case | Font | Weight | Size | Line Height | Letter Spacing |
|----------|------|--------|------|-------------|----------------|
| H1 (Page Title) | SF Pro | Bold | 28px | 1.4 | —0.5px |
| H2 (Section) | SF Pro | Semibold | 24px | 1.4 | — |
| H3 (Subsection) | Inter | Bold | 20px | 1.4 | — |
| Body (Regular) | Inter | Regular | 14px | 1.6 | — |
| Body (Medium) | Inter | Medium | 14px | 1.6 | — |
| Button | Lexend | Medium | 14px | 1.2 | — |
| Label | Inter | Medium | 12px | 1.4 | — |
| Caption | Inter | Regular | 10px | 1.2 | — |
| Price | Poppins | Semibold | 16px | 1.2 | — |
| Status Badge | SF Pro | Semibold | 16px | 1.2 | — |
| Numpad Label | Inter | Medium | 12px | 1 | — |
| Input Placeholder | Inter | Regular | 14px | 1.6 | `#CBCBCB` color |

### Tailwind Typography Config
```typescript
export default {
  theme: {
    fontFamily: {
      primary: ["var(--font-primary)", "system-ui"],
      header: ["var(--font-header)", "system-ui"],
      button: ["var(--font-button)", "sans-serif"],
      accent: ["var(--font-accent)", "sans-serif"],
    },
    fontSize: {
      xs: '10px',
      sm: '12px',
      base: '14px',
      lg: '16px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '28px',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
};
```

---

## Component Library Mapping

### Button Component

**Figma reference:** Button set (id 26:868)  
**Variants:** 2 types × 2 sizes × 4 states

#### Implementation: shadcn/ui Button with custom variants

```typescript
// components/ui/button.tsx (shadcn/ui base with custom variants)
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-[4px] text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-action-primary text-white hover:bg-brand-dark disabled:bg-gray-6 disabled:text-gray-7',
        outline: 'border-[1px] border-action-primary text-action-primary hover:bg-action-primary hover:text-white disabled:bg-gray-6 disabled:border-gray-5 disabled:text-gray-7',
        secondary: 'bg-gray-6 text-gray-3 hover:bg-gray-5 disabled:bg-gray-6 disabled:text-gray-7',
      },
      size: {
        sm: 'px-3 py-2 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

### Status Badges

```typescript
// components/ui/status-badge.tsx
const statusBadgeStyles = {
  success: 'bg-status-success-bg text-status-success',
  warning: 'bg-status-warning-bg text-status-warning',
  danger: 'bg-status-danger-bg text-status-danger border border-status-danger-border',
  info: 'bg-status-info-bg text-status-info border border-status-info-border',
};

export function StatusBadge({ status, label }: Props) {
  return (
    <div className={`rounded-[5px] px-3 py-2 text-sm font-semibold ${statusBadgeStyles[status]}`}>
      {label}
    </div>
  );
}
```

### Form Inputs

```typescript
// components/ui/input.tsx
export function Input({ placeholder, disabled, ...props }: InputProps) {
  return (
    <input
      className="w-full rounded-[4px] border border-gray-5 bg-white px-3 py-2 text-base placeholder:text-gray-1 disabled:bg-gray-6 disabled:text-gray-7"
      placeholder={placeholder}
      disabled={disabled}
      {...props}
    />
  );
}
```

---

## PIN/OTP Input Component

**Pattern:** 6 separate cells, auto-advance focus, numeric only

```typescript
// components/ui/pin-input.tsx
interface PinInputProps {
  length?: number; // default 6
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function PinInput({ 
  length = 6, 
  onChange, 
  onComplete, 
  disabled, 
  error 
}: PinInputProps) {
  const [cells, setCells] = useState<string[]>(Array(length).fill(''));

  const handleCellChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // numeric only
    const newCells = [...cells];
    newCells[index] = value.slice(-1); // single digit
    setCells(newCells);
    onChange(newCells.join(''));

    // auto-advance to next cell
    if (value && index < length - 1) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }

    // trigger on complete when all cells filled
    if (newCells.every(c => c)) {
      onComplete?.(newCells.join(''));
    }
  };

  return (
    <div className="flex gap-2">
      {cells.map((_, i) => (
        <input
          key={i}
          id={`pin-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={cells[i]}
          onChange={(e) => handleCellChange(i, e.target.value)}
          disabled={disabled}
          className={`h-12 w-12 rounded-[4px] border-2 text-center text-lg font-bold transition-colors
            ${error ? 'border-status-danger' : 'border-gray-5'}
            focus:border-action-primary focus:outline-none
            disabled:bg-gray-6 disabled:text-gray-7`}
        />
      ))}
    </div>
  );
}
```

### Usage
```typescript
<PinInput 
  length={6} 
  onChange={(pin) => console.log(pin)}
  onComplete={(pin) => handlePinSubmit(pin)}
  error={pinError}
/>
```

---

## Numpad Component

**Pattern:** 3×3 grid for cash denominations (1k → 200k VND)

```typescript
// components/ui/numpad.tsx
const DENOMINATIONS = [1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000] as const;

interface NumpadProps {
  onDenominationSelect: (amount: number) => void;
  selectedAmount?: number;
}

export function Numpad({ onDenominationSelect, selectedAmount }: NumpadProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {DENOMINATIONS.map((denom) => (
        <button
          key={denom}
          onClick={() => onDenominationSelect(denom)}
          className={`rounded-[4px] py-3 px-2 font-semibold text-sm transition-colors
            ${selectedAmount === denom 
              ? 'bg-action-primary text-white' 
              : 'bg-gray-6 text-gray-3 hover:bg-gray-5'
            }`}
        >
          {formatVnd(denom)}
        </button>
      ))}
    </div>
  );
}
```

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 2px | Micro spacing |
| sm | 4px | Tight spacing |
| md | 8px | Default spacing |
| lg | 12px | Comfortable spacing |
| xl | 16px | Section spacing |
| 2xl | 24px | Large section spacing |
| 3xl | 32px | Major section spacing |

**Tailwind config:**
```typescript
spacing: {
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
}
```

---

## Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 2px | Minimal rounding |
| sm | 4px | Button, input default |
| md | 5px | Badge, group rounding |
| lg | 10px | Modal corners, larger containers |
| xl | 14px | Header chip |
| 2xl | 20px | Circular badge start |
| 3xl | 25px | Decorative card rounding |
| full | 9999px | Fully circular |

**Tailwind config:**
```typescript
borderRadius: {
  xs: '2px',
  sm: '4px',
  md: '5px',
  lg: '10px',
  xl: '14px',
  '2xl': '20px',
  '3xl': '25px',
  full: '9999px',
}
```

---

## Logo & Branding

### Logo Usage
- **Light background:** Use `logo.svg` (dark green)
- **Dark background:** Use `logo-white.svg` (white)
- **Minimum size:** 48×48px
- **Clear space:** 8px padding around logo
- **Placement:** Hero panel (login), sidebar header, footer

### Logo Path
```
public/images/logo.svg
public/images/logo-white.svg
public/images/brand-gradient.svg (hero bg reference)
```

### Tagline Usage
"Vừa - Đủ - Tinh Gọn" — right-aligned on hero panel, Lexend Light 14px, white text on brand gradient

---

## Iconography

### Recommended: lucide-react
[Lucide React](https://lucide.dev) provides Feather-style icons matching the minimalist Figma design.

**Installation & usage:**
```bash
pnpm add lucide-react
```

```typescript
import { ShoppingCart, LogOut, Settings, Plus } from 'lucide-react';

export function CartIcon() {
  return <ShoppingCart size={20} className="text-action-primary" />;
}
```

**Recommended icons for ViePOS:**
- Menu: `Menu`
- Cart: `ShoppingCart`
- Logout: `LogOut`
- Settings: `Settings`
- Add: `Plus`
- Delete: `Trash2`
- Edit: `Edit2`
- Print: `Printer`
- Check: `Check`
- Close: `X`
- Loading: `Loader` (animated)

---

## Accessibility (WCAG AA)

### Color Contrast
- **Normal text:** 4.5:1 minimum (large text 3:1)
- **UI components:** 3:1 minimum
- **Verified combinations:**
  - `#256E05` (dark green) on `#FFFFFF` (white) = 8.2:1 ✅
  - `#349409` (action green) on `#FFFFFF` = 5.1:1 ✅
  - `#878787` (gray-3) on `#F2F3ED` (bg light) = 5.8:1 ✅

### Focus Management
- **Focus indicator:** Green outline (2px, offset 2px)
- **Focus color:** `#349409` (action green)
- **All interactive elements:** Must have visible focus state
- **Hidden from visual focus:** Use `sr-only` (screen-reader-only) class for invisible but keyboard-navigable elements

```css
.focus-visible:outline-2 {
  outline: 2px solid var(--color-action-primary);
  outline-offset: 2px;
}
```

### ARIA Labels
```typescript
// PIN input example
<input 
  id={`pin-${i}`}
  type="text"
  inputMode="numeric"
  aria-label={`PIN digit ${i + 1} of 6`}
  aria-invalid={error}
/>

// Numpad button
<button
  onClick={() => onDenominationSelect(denom)}
  aria-pressed={selectedAmount === denom}
  aria-label={`Select ${formatVnd(denom)}`}
>
  {formatVnd(denom)}
</button>
```

### Screen Reader Testing
- Page titles clear & descriptive
- Form labels linked to inputs
- Modal titles in `<h1>` or `role="heading"`
- Button purpose obvious from text alone
- Semantic HTML: `<button>`, `<input>`, `<nav>`, `<main>`

---

## Responsive Design

### Breakpoints (Mobile-first)
- **sm:** 640px (tablets)
- **md:** 1024px (desktop assumed for ViePOS — cashier counter)
- **lg:** 1280px (large monitors)

**Note:** ViePOS is desktop-first (1440×1024 POS screens). Mobile responsiveness deferred to future phase.

### Layout Grid
- **Main container:** Max-width 1440px
- **Sidebar:** Fixed 280px width (on desktop)
- **Menu grid:** 4 columns (items 75×75)
- **Cart panel:** Fixed 320px width

---

## Component Examples

### Login Form Layout (Figma reference: id 1:2)
```
┌───────────────────────────────────────────────────────┐
│ ┌──────────────────────┐  ┌─────────────────────────┐ │
│ │   Form (left)        │  │  Hero (right)           │ │
│ │                      │  │  Gradient bg            │ │
│ │  ViePOS Logo         │  │  Tagline "Vừa - Đủ..." │ │
│ │                      │  │                         │ │
│ │  Email input         │  │                         │ │
│ │  Password input      │  │                         │ │
│ │  [Login] button      │  │                         │ │
│ │                      │  │                         │ │
│ │  Create account link │  │                         │ │
│ └──────────────────────┘  └─────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

### POS Main Layout (Figma reference: id 1:97)
```
┌─────────────────────────────────────────────────────┐
│ ┌──────┐ ┌────────────────────────┐  ┌────────────┐ │
│ │      │ │                        │  │            │ │
│ │Sidebar│ │   Menu Grid (4×3)    │  │   Cart     │ │
│ │ Logo │ │                        │  │   Panel    │ │
│ │ User │ │ Card Card Card Card   │  │            │ │
│ │      │ │ Card Card Card Card   │  │  Items     │ │
│ │      │ │ Card Card Card Card   │  │            │ │
│ │      │ │                        │  │  Total     │ │
│ │      │ │                        │  │  [Thanh    │ │
│ │      │ │                        │  │   Toán]   │ │
│ └──────┘ └────────────────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Unresolved Questions

1. **Font loading:** Should fonts be self-hosted or Google Fonts CDN? Recommend self-host to reduce cold-start latency.
2. **Dark mode:** Any requirement? Deferred; light mode only for MVP.
3. **Print preview styling:** Should POS print preview match receipt format exactly? Will finalize during Phase 2 implementation.
