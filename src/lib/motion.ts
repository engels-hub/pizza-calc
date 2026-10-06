/** Shared motion tokens, so every animation on the page moves the same way. */
export const spring = { type: "spring", stiffness: 100, damping: 20 } as const;
export const snappy = { type: "spring", stiffness: 380, damping: 32 } as const;
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
