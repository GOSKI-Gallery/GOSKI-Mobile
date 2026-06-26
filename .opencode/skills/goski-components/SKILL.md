---
name: goski-components
description: How to create and style UI components for GOSKI Mobile. NativeWind classes, theme support, and component patterns.
---

## Styling
- Framework: NativeWind (Tailwind CSS for React Native)
- Config: `tailwind.config.js`
- Custom radii via `theme.extend.borderRadius` — xl=16px, 2xl=24px
- Custom font: `font-krona` (KronaOne-Regular) for logo/title

## Theme support
All components must support light and dark modes:
```tsx
const isDark = useThemeStore((s) => s.isDark);
// Use Tailwind dark: prefix for classes
className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
// Use inline isDark for hardcoded colors
style={{ backgroundColor: isDark ? "#27272a" : "#FAFAFA" }}
```

## Color palette (matching Laravel)
| Token | Light | Dark |
|-------|-------|------|
| Body bg | `#FAFAFA` | `#27272a` (zinc-800) |
| Card/surface bg | `white` | `zinc-950` (#09090b) |
| Input bg | `white` | `zinc-900` |
| Primary text | `zinc-900` | `white` |
| Secondary text | `zinc-500` | `zinc-400` |
| Border | `zinc-200` | `zinc-700` |
| Primary button bg | `zinc-900` | `zinc-950` |

## Border radius
| Class | Value | Where to use |
|-------|-------|-------------|
| `rounded` | 4px | skeleton lines |
| `rounded-lg` | 8px | small badges |
| `rounded-xl` | 16px | buttons, inputs, upload area, card inner elements |
| `rounded-2xl` | 24px | main cards, modal containers |
| `rounded-full` | 50% | avatars, user photos |

## Button styles (matches Laravel)
```tsx
// Primary button
className="bg-zinc-900 dark:bg-zinc-950 text-white font-bold py-3 px-8 rounded-xl"
// Outline button
className="bg-transparent border border-zinc-900 dark:border-zinc-700 rounded-xl"
```

## Component patterns
- Import `useThemeStore` from `../../states/useThemeStore`
- Pass `className` prop for extensibility (use `className` parameter in component interface)
- Use `activeOpacity={0.8}` on TouchableOpacity for press feedback
- Import icons from `../ui/Icons` (SVG-based, pass `color` and `size` props)
- For modals, use `react-native-modal` with `useNativeDriver` prop
- For alerts, use `useAlertStore` from `../../states/useAlertStore` (not React Native Alert)
