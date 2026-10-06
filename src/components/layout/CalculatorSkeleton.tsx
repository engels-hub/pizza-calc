import { lv } from "@/content/lv";

const block = "animate-pulse rounded-2xl bg-sunken";

/**
 * Prerendered stand-in for the calculator while the personal part streams in.
 * Mirrors the real layout's blocks so nothing jumps when it arrives.
 */
export function CalculatorSkeleton() {
  return (
    <main
      className="mx-auto flex max-w-[1400px] flex-col gap-12 px-4 pb-24 md:px-8 lg:gap-16 lg:pb-16"
      aria-busy="true"
    >
      <section className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold leading-none tracking-tighter md:text-5xl">{lv.planner.title}</h1>
          <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-muted">{lv.planner.lead}</p>
        </div>
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-6 lg:grid-cols-[auto_minmax(0,0.85fr)_minmax(0,2.4fr)]">
          <div className={`${block} h-28 w-44`} />
          <div className={`${block} h-28`} />
          <div className={`${block} col-span-2 h-28 lg:col-span-1`} />
        </div>
        <div className="flex flex-col gap-3">
          <div className={`${block} h-14`} />
          <div className={`${block} h-14`} />
        </div>
      </section>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className={`${block} h-[50dvh] rounded-3xl`} />
        <div className={`${block} h-[50dvh] rounded-3xl`} />
      </div>
    </main>
  );
}
