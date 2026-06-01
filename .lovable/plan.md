### Change
On the Resume page, add right-side padding (`pr-4`) to the `RoleBlock` component so the text has equal breathing room on both left and right sides within the coral hover overlay.

### Affected file
- `src/pages/Resume.tsx`

### Current code
```tsx
<div className="py-4 pl-4 transition-all duration-200 hover:bg-coral-light/30 cursor-default rounded-r-lg">
```

### Updated code
```tsx
<div className="py-4 px-4 transition-all duration-200 hover:bg-coral-light/30 cursor-default rounded-r-lg">
```

Using `px-4` (horizontal padding) replaces `pl-4` with symmetrical left/right padding, matching the left-side gap on the right side.