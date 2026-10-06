"use client";

import { CheckIcon, LinkSimpleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { lv } from "@/content/lv";

/** Copies this tab's address, which carries the whole order. */
export function ShareLink() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked; the address bar has the same link.
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex min-h-10 items-center gap-2 rounded-full px-1 text-sm font-medium text-accent transition-transform active:scale-[0.98]"
    >
      {copied ? <CheckIcon size={16} weight="bold" /> : <LinkSimpleIcon size={16} weight="bold" />}
      <span aria-live="polite">{copied ? lv.summary.linkCopied : lv.summary.copyLink}</span>
    </button>
  );
}
