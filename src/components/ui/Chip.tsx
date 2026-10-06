"use client";

export function Chip({
  active,
  tone,
  small,
  children,
  ...rest
}: {
  active?: boolean;
  tone?: "include" | "exclude";
  small?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const look = !active
    ? "border-line bg-surface text-ink hover:border-muted/40"
    : tone === "exclude"
      ? "border-ink/70 bg-surface text-ink line-through decoration-1"
      : "border-accent bg-accent text-accent-ink";
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-medium transition-[transform,background-color,border-color,color] duration-150 active:scale-[0.97] ${
        small ? "min-h-9 px-3 text-[0.8rem]" : "min-h-10 px-3.5 text-sm"
      } ${look}`}
    >
      {children}
    </button>
  );
}
