"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BrandMark } from "@/components/BrandMark";

export function SiteHeader() {
  return (
    <header className="w-full bg-ink text-paper">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="FirstIn home">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#292620]"><BrandMark className="h-8 w-8" /></span>
          <span className="font-display text-xl font-semibold tracking-tight">FirstIn</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-paper sm:flex">
            <span className="h-2 w-2 rounded-full bg-gold" /> Monad Testnet
          </span>
          <ConnectButton showBalance={false} chainStatus="none" accountStatus={{ smallScreen: "avatar", largeScreen: "address" }} />
        </div>
      </div>
    </header>
  );
}
