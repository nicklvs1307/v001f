---
name: frontend-ui-design
description: UI/UX design guidelines for React + MUI projects. Covers accessibility, responsive design, color palettes, typography, animations, form patterns, navigation, and dark mode. Use when creating pages, components, reviewing UI code, or making visual design decisions.
license: MIT
compatibility: opencode
metadata:
  audience: frontend-developers
  stack: react,mui,recharts
  version: "1.0.0"
---

# Frontend UI Design Guide

Design system and UI/UX guidelines for React + MUI (Material UI 5) applications. Reference these rules when building, reviewing, or refactoring any visual element.

## When to Apply

### Must Use

- Creating new pages or layouts (dashboards, forms, modals, tables)
- Building or refactoring UI components (buttons, inputs, cards, nav)
- Choosing colors, spacing, typography, or elevation
- Reviewing UI code for accessibility or visual consistency
- Implementing responsive behavior or mobile layouts
- Adding animations, transitions, or micro-interactions
- Implementing dark mode or theme switching

### Recommended

- UI feedback says it looks "off" or "unprofessional"
- Pre-launch visual quality optimization
- Aligning cross-platform design consistency

### Skip

- Pure backend logic, API design, database work
- Non-visual scripts, DevOps, infrastructure

## Priority Reference

| Priority | Category | Impact |
|----------|----------|--------|
| 1 | Accessibility | CRITICAL |
| 2 | Touch & Interaction | CRITICAL |
| 3 | Responsive Layout | HIGH |
| 4 | Typography & Color | HIGH |
| 5 | Forms & Feedback | MEDIUM |
| 6 | Navigation | HIGH |
| 7 | Animation | MEDIUM |
| 8 | Dark Mode | MEDIUM |

---

## 1. Accessibility (CRITICAL)

### Color & Contrast
- Minimum 4.5:1 contrast ratio for normal text (3:1 for large text)
- Never convey information by color alone — add icon or text
- Test both light and dark mode contrast independently

### Focus & Keyboard
- Visible focus rings on all interactive elements (2-4px outline)
- Tab order must match visual order
- Full keyboard support for modals, menus, dropdowns
- Skip-to-content link for keyboard users

### Semantic HTML & ARIA
- Use semantic elements (`<nav>`, `<main>`, `<section>`, `<button>`)
- `aria-label` for icon-only buttons (MUI: `aria-label` prop on IconButton)
- `aria-live="polite"` for toasts and dynamic content updates
- `role="alert"` for form error messages
- Sequential heading hierarchy (h1 → h2 → h3, no skips)

### Dynamic Type
- Support system text scaling without layout breakage
- Avoid truncation as text grows — prefer wrapping with ellipsis + tooltip

### Reduced Motion
- Respect `prefers-reduced-motion: reduce`
- Disable or reduce animations when requested

### MUI-Specific
- Use `TextField` with proper `label` prop (not placeholder-only)
- Use `InputLabel` + `Input` pattern for accessible forms
- MUI `Tooltip` needs `arrow` prop for better discoverability
- Use `Snackbar` with `autoHideDuration` for accessible toasts

---

## 2. Touch & Interaction (CRITICAL)

### Touch Targets
- Minimum 44×44px interactive area (iOS) / 48×48dp (Android)
- Minimum 8px gap between adjacent touch targets
- Extend hit area beyond visual bounds if icon is small (`sx: { p: 1.5 }` on IconButton)

### Interaction Patterns
- Primary interactions use click/tap — never rely on hover alone
- Disable buttons during async operations; show CircularProgress
- Clear visual feedback within 100ms of tap (ripple, opacity change)
- Use `cursor: pointer` for clickable elements
- Use `touch-action: manipulation` to eliminate 300ms tap delay

### MUI-Specific
- Use MUI `Button` with `loading` prop for async states
- MUI `IconButton` needs adequate padding: `sx={{ p: 1.5 }}`
- Use `LoadingButton` from `@mui/lab` for submit buttons

---

## 3. Responsive Layout (HIGH)

### Breakpoints
- Mobile-first approach: design for 375px, scale up
- Systematic breakpoints: 375 / 768 / 1024 / 1280 / 1440
- Use MUI breakpoints: `theme.breakpoints.up('sm')`, `theme.breakpoints.down('md')`

### Spacing & Grid
- Use MUI spacing system (4px base unit): `spacing={2}` = 8px
- 8dp incremental spacing scale
- Consistent container max-width: `maxWidth="lg"` or `"xl"`
- No horizontal scroll on mobile

### Viewport
- `width=device-width, initial-scale=1` (never disable zoom)
- Minimum 16px body text on mobile (avoids iOS auto-zoom)
- Respect safe areas on mobile (notch, gesture bar)
- Use `min-h-dvh` instead of `100vh` where applicable

### Content Strategy
- Show core content first on mobile
- Fold or hide secondary content (use MUI `Collapse`, `Drawer`)
- Sidebar → Bottom navigation on mobile

### MUI-Specific
- Use `Container` component for consistent max-width
- Use `Grid` with `xs`, `sm`, `md`, `lg` breakpoints
- Use `Hidden` component or `sx` with breakpoint values for conditional rendering
- Use `Drawer` with `variant="temporary"` on mobile, `"permanent"` on desktop

---

## 4. Typography & Color (HIGH)

### Typography
- Base font size: 16px for body text
- Line-height: 1.5-1.75 for body text
- Limit line length: 60-75 characters per line
- Consistent type scale (MUI default is good: 12, 14, 16, 18, 20, 24, 32)
- Use font-weight for hierarchy: Bold (600-700) headings, Regular (400) body, Medium (500) labels
- Avoid text smaller than 12px

### Color System
- Define semantic color tokens, not raw hex in components
- Use MUI theme palette: `primary`, `secondary`, `error`, `warning`, `info`, `success`
- Add custom tokens to theme: `theme.palette.neutral`, `theme.palette.surface`
- Functional color (error red, success green) must include icon/text — never color-only meaning
- Avoid gray-on-gray text combinations

### MUI-Specific
- Extend MUI theme with project-specific tokens in `createTheme`
- Use `theme.palette.*` consistently — never hardcode hex in `sx`
- Use `Typography` component variants consistently
- Custom fonts via `theme.typography.fontFamily`

---

## 5. Forms & Feedback (MEDIUM)

### Form Design
- Visible label per input — never placeholder-only
- Error message below the related field (MUI: `helperText` + `error` prop)
- Mark required fields with asterisk (`required` prop on TextField)
- Show loading → success/error state on submit
- Auto-focus first invalid field after failed submission

### Validation
- Validate on blur, not on keystroke
- Show error only after user finishes input
- Error messages must state cause + how to fix
- Use `aria-live` region for form errors

### Empty & Loading States
- Helpful message + action when no content exists
- Skeleton/shimmer for loading states (MUI `Skeleton` component)
- Auto-dismiss toasts in 3-5 seconds (MUI `Snackbar` + `autoHideDuration`)

### Confirmation
- Confirm before destructive actions (MUI `Dialog`)
- "Undo" option for destructive operations
- Show step indicator for multi-step forms

### MUI-Specific
- Use `TextField` with `variant="outlined"` (standard for this project)
- Use `FormControl` + `FormHelperText` for complex validation
- Use `Alert` component for inline feedback
- Use `Skeleton` for loading placeholders
- Use `LinearProgress` or `CircularProgress` for determinate/indeterminate loading

---

## 6. Navigation (HIGH)

### Structure
- Primary navigation: Sidebar on desktop, BottomNav or Drawer on mobile
- Bottom navigation maximum 5 items
- Current location visually highlighted (MUI `ListItemButton` with `selected`)
- Predictable back behavior — preserve scroll and state

### Patterns
- Use breadcrumbs for 3+ level deep hierarchies
- Deep link all key screens
- Navigation placement consistent across all pages
- Destructive actions (logout, delete) visually separated from normal nav

### MUI-Specific
- Use `Drawer` for sidebar navigation
- Use `Breadcrumbs` component for hierarchy
- Use `Tabs` for same-level content switching
- Use `ListItemButton` with `selected` + `component={RouterLink}`
- Active state: `sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}`

---

## 7. Animation (MEDIUM)

### Timing & Easing
- Micro-interactions: 150-300ms
- Complex transitions: ≤400ms
- Avoid animations >500ms
- Use `ease-out` for entering, `ease-in` for exiting
- Exit animations shorter than enter (~60-70% of duration)

### Performance
- Animate only `transform` and `opacity` — never `width`, `height`, `top`, `left`
- Maximum 1-2 animated elements per view
- Stagger list entrance by 30-50ms per item

### Meaning
- Every animation must convey cause-effect relationship
- Spatial continuity: forward = slide left/up, back = slide right/down
- Modals animate from trigger source (scale + fade)

### MUI-Specific
- Use MUI `Fade`, `Grow`, `Slide`, `Collapse` components
- Use `sx` transitions: `sx={{ transition: 'all 0.2s ease-out' }}`
- Use `theme.transitions` for consistent timing
- Use `Collapse` for expandable sections
- Respect `prefers-reduced-motion` via CSS media query

---

## 8. Dark Mode (MEDIUM)

### Design Rules
- Dark mode uses desaturated/lighter tonal variants — not inverted colors
- Test contrast separately for dark mode (don't assume light mode values work)
- Surface elevation via opacity layers, not shadows
- Borders/dividers visible in both themes

### Implementation
- Use MUI `ThemeProvider` with `prefers-color-scheme` detection
- Define both `palette.mode: 'light'` and `palette.mode: 'dark'`
- Semantic tokens map per theme — not hardcoded per-screen hex
- Modal scrim: 40-60% black for foreground isolation

### MUI-Specific
- Use `useMediaQuery('(prefers-color-scheme: dark)')` for auto-detection
- Store user preference in localStorage
- Use `CssBaseline` for consistent dark mode base styles
- Use `alpha()` from `@mui/system` for transparent overlays

---

## Anti-Patterns to Avoid

| Don't | Why |
|-------|-----|
| Placeholder-only labels | Accessibility violation, confusing on focus |
| Hover-only interactions | Doesn't work on touch devices |
| Disabling zoom | Accessibility violation |
| Horizontal scroll on mobile | Poor UX |
| Hardcoded hex colors in sx | Breaks theming, hard to maintain |
| Icon-only buttons without aria-label | Screen reader can't identify |
| Nested scroll regions | Conflicting gestures |
| Animating width/height | Causes layout reflow |
| Gray-on-gray text | Insufficient contrast |
| Skipping heading levels | Breaks document outline |
| Instant state transitions | Feels jarring |
| Loading spinners >1s without progress | Users think it's broken |

---

## MUI Theme Structure Reference

```jsx
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    error: { main: '#d32f2f' },
    warning: { main: '#ed6c02' },
    success: { main: '#2e7d32' },
    neutral: { main: '#64748b', contrastText: '#fff' },
    surface: { default: '#f8fafc', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
  },
  shape: { borderRadius: 8 },
  spacing: 8,
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },
  },
});
```

## Pre-Delivery Checklist

Before delivering UI code:

- [ ] All text has 4.5:1 contrast ratio
- [ ] All interactive elements have visible focus states
- [ ] Icon-only buttons have `aria-label`
- [ ] Forms have visible labels (not placeholder-only)
- [ ] Errors appear below the related field
- [ ] Touch targets ≥44px
- [ ] No horizontal scroll on mobile (375px)
- [ ] Loading states shown for async operations
- [ ] Destructive actions have confirmation dialogs
- [ ] Colors come from theme, not hardcoded hex
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Dark mode tested independently
- [ ] Heading hierarchy is sequential (h1→h2→h3)
- [ ] Toasts auto-dismiss in 3-5s
