import { lv } from "@/content/lv";
import { PIZZERIA_URLS } from "@/lib/types";

const link = "underline decoration-line underline-offset-2 hover:text-ink";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-[1400px] px-4 pb-36 text-xs leading-relaxed text-muted md:px-8 lg:pb-10">
      {lv.footer.before}{" "}
      <a className={link} href={PIZZERIA_URLS["darbnīca"]} target="_blank" rel="noreferrer">
        picudarbnica.lv
      </a>{" "}
      {lv.footer.and}{" "}
      <a className={link} href={PIZZERIA_URLS.lulu} target="_blank" rel="noreferrer">
        lulu.lv
      </a>
      {lv.footer.after}
    </footer>
  );
}
