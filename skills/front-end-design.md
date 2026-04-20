# 🎨 Front-end Design Guidelines - Smart AI Commerce

## ⌨️ Inputs & Form Fields
- **Height**: Standardize on `h-16` (64px) for primary form fields and the main chat input.
- **Rounding**: Use `rounded-[2rem]` (32px) for a consistent "ethereal" and modern aesthetic. 
- **Padding**: Maintain a consistent `px-6` (24px) for horizontal padding.
- **Label Alignment**: Labels must be aligned with the text *inside* the input. If the input has `px-6`, the label should have a matching margin (e.g., `ml-6`).
- **Visual Depth**: Use `bg-surface-lowest` with a subtle `shadow-sm`.
- **Interactivity**: 
  - Smooth transitions (`duration-300`).
  - Focus states: `focus:border-primary/50` and a soft glow ring `focus:ring-4 focus:ring-primary/10`.
  - Error states: `border-error` with a matching `focus:ring-error/10`.

## 🖱️ Buttons
- **Height**: Match input height (`h-16`).
- **Rounding**: Match input rounding (`rounded-[2rem]`).
- **Shadows**: Primary buttons should have a high-depth shadow with brand color glow (e.g., `shadow-xl shadow-primary/20`).
- **Feedback**: Active state scale down (`active:scale-95`).

## 📐 Layout & Alignment
- **Max Width**: Interactive elements and message streams in the main view must be constrained to `max-w-[840px]` and centered (`mx-auto`) to maintain visual balance.
- **Message Bubbles**: Use `rounded-[2.5rem]` with one sharp corner (e.g., `rounded-br-none` for user) to indicate direction.
- **Glassmorphism**: Use `backdrop-blur-xl` and `bg-surface-low/80` for floating elements and sidebars.

## 📏 Spacing System
- **Base Unit**: 8px.
- **Gaps**:
  - `gap-2` (8px) for label-input relationships.
  - `gap-6` (24px) for field-to-field spacing.
  - `gap-10` (40px) for major section spacing.
