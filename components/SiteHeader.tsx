"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
      <Link href="/" className="flex items-center gap-3" aria-label="FirstIn home">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-sm font-black text-acid">FI</span>
        <span className="text-lg font-black tracking-tight">firstin<span className="text-muted">.</span></span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs font-semibold sm:flex">
          <span className="h-2 w-2 rounded-full bg-[#9dbd20]" /> Monad Testnet
        </span>
        <ConnectButton showBalance={false} chainStatus="none" accountStatus={{ smallScreen: "avatar", largeScreen: "address" }} />
      </div>
    </header>
  );
}
