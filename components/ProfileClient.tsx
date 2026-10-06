"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatEther, getAddress, isAddress, parseEther, type Address } from "viem";
import {
  useAccount,
  useChainId,
  useReadContract,
  useReadContracts,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { monadTestnet } from "@/lib/monad";
import { profileAbi } from "@/lib/contracts";
import { toGatewayUrl } from "@/lib/ipfs";
import { SiteHeader } from "@/components/SiteHeader";
import { BrandMark } from "@/components/BrandMark";

type ProfileMetadata = { name?: string; description?: string; image?: string };

function shortAddress(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function formatMon(value: bigint | undefined) {
  if (value === undefined) return "—";
  return Number(formatEther(value)).toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function ProfileClient({ profileAddress }: { profileAddress: string }) {
  const valid = isAddress(profileAddress);
  const address = valid ? getAddress(profileAddress) as Address : undefined;
  const { address: account, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const [metadata, setMetadata] = useState<ProfileMetadata | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [message, setMessage] = useState("");

  const queryOptions = { enabled: Boolean(address), refetchInterval: 12_000 };
  const supply = useReadContract({ address, abi: profileAbi, functionName: "badgesMinted", query: queryOptions });
  const maxSupply = useReadContract({ address, abi: profileAbi, functionName: "MAX_BADGES", query: queryOptions });
  const owner = useReadContract({ address, abi: profileAbi, functionName: "owner", query: queryOptions });
  const uriRead = useReadContract({ address, abi: profileAbi, functionName: "uri", args: [1n], query: queryOptions });
  const claimed = useReadContract({ address, abi: profileAbi, functionName: "hasClaimed", args: account ? [account] : undefined, query: { ...queryOptions, enabled: Boolean(address && account) } });
  const pending = useReadContract({ address, abi: profileAbi, functionName: "pendingRevenue", query: queryOptions });
  const credit = useReadContract({ address, abi: profileAbi, functionName: "withdrawableRevenue", args: account ? [account] : undefined, query: { ...queryOptions, enabled: Boolean(address && account) } });

  const contractWrite = useWriteContract();
  const contractReceipt = useWaitForTransactionReceipt({ hash: contractWrite.data });
  const tipWrite = useSendTransaction();
  const tipReceipt = useWaitForTransactionReceipt({ hash: tipWrite.data });

  useEffect(() => {
    const uri = uriRead.data;
    if (!uri || typeof uri !== "string") return;
    const controller = new AbortController();
    setMetadataLoading(true);
    fetch(toGatewayUrl(uri), { signal: controller.signal, cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Metadata unavailable");
        return response.json();
      })
      .then((result: ProfileMetadata) => setMetadata(result))
      .catch(() => setMetadata(null))
      .finally(() => setMetadataLoading(false));
    return () => controller.abort();
  }, [uriRead.data]);

  useEffect(() => {
    if (contractReceipt.isSuccess || tipReceipt.isSuccess) {
      setMessage("Transaction confirmed on Monad Testnet.");
      void Promise.all([supply.refetch(), maxSupply.refetch(), claimed.refetch(), pending.refetch(), credit.refetch()]);
    }
  }, [contractReceipt.isSuccess, tipReceipt.isSuccess]);

  const minted = supply.data ?? 0n;
  const cap = maxSupply.data ?? 100n;
  const soldOut = minted >= cap;
  const isOwner = Boolean(account && owner.data && account.toLowerCase() === owner.data.toLowerCase());
  const supporterReads = useReadContracts({
    contracts: Array.from({ length: Number(minted) }, (_, index) => ({ address: address!, abi: profileAbi, functionName: "earlySupporters" as const, args: [BigInt(index)] })),
    query: { enabled: Boolean(address && isOwner && minted > 0n), refetchInterval: 12_000 },
  });
  const supporters = (supporterReads.data ?? []).flatMap((item) => item.status === "success" && item.result ? [item.result as Address] : []).reverse();
  const imageUrl = metadata?.image ? toGatewayUrl(metadata.image) : undefined;
  const isWriting = contractWrite.isPending || contractReceipt.isLoading || tipWrite.isPending || tipReceipt.isLoading;
  const transactionError = contractWrite.error || tipWrite.error;

  if (!valid) {
    return <main className="min-h-screen grid-paper"><SiteHeader /><div className="mx-auto max-w-3xl px-5 py-24"><p className="text-xs font-bold uppercase tracking-[.16em] text-muted">Profile not found</p><h1 className="mt-3 text-4xl font-black">That address doesn’t look right.</h1><Link href="/" className="mt-8 inline-block font-bold underline underline-offset-4">Back to FirstIn</Link></div></main>;
  }

  function requireMonad(): boolean {
    if (chainId !== monadTestnet.id) {
      switchChain({ chainId: monadTestnet.id });
      return false;
    }
    return true;
  }

  function claimBadge() {
    setMessage("");
    if (!requireMonad() || !address) return;
    contractWrite.writeContract({ address, abi: profileAbi, functionName: "claimBadge" });
  }

  function distributeRevenue() {
    setMessage("");
    if (!requireMonad() || !address) return;
    contractWrite.writeContract({ address, abi: profileAbi, functionName: "distributeRevenue" });
  }

  function withdrawRevenue() {
    setMessage("");
    if (!requireMonad() || !address) return;
    contractWrite.writeContract({ address, abi: profileAbi, functionName: "withdrawRevenue" });
  }

  function tipCreator() {
    setMessage("");
    if (!requireMonad() || !address) return;
    try {
      const value = parseEther(tipAmount);
      if (value <= 0n) throw new Error("Enter a tip greater than zero.");
      tipWrite.sendTransaction({ to: address, value });
      setTipAmount("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Enter a valid MON amount.");
    }
  }

  return (
    <main className="min-h-screen grid-paper">
      <SiteHeader />
      <div className="h-48 bg-teal-soft sm:h-52">
        <div className="mx-auto flex h-full max-w-7xl items-start justify-between px-5 pt-10 sm:px-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[.18em] text-teal">Creator profile · Monad Testnet</p>
            <Link href="/" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink/70 hover:text-ink">← All creators</Link>
          </div>
          <span className="rounded-full bg-raised/80 px-3 py-2 font-mono text-xs text-teal">MONAD · TESTNET</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <section id="profile" className="-mt-8 grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
          <div className="pt-0">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="-mt-14 grid h-32 w-32 shrink-0 place-items-center overflow-hidden rounded-full border-[7px] border-paper bg-ink sm:h-36 sm:w-36">
                {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : <BrandMark className="h-20 w-20" />}
              </div>
              <div className="pb-2">
                <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">{metadata?.name || (metadataLoading ? "Loading profile…" : "FirstIn creator")}</h1>
                <p className="mt-2 font-mono text-xs text-muted">{shortAddress(address!)}</p>
              </div>
            </div>
            {metadata?.description && <p className="mt-6 max-w-xl text-sm leading-6 text-[#4C473F]">{metadata.description}</p>}

            <div className="mt-10">
              <div className="flex items-end justify-between gap-4">
                <p className="text-sm font-bold uppercase tracking-[.12em]">Early supporter badges</p>
                <p className="font-mono text-sm text-muted">{minted.toString()} / {cap.toString()}</p>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#E7E0D2]"><div className="h-full rounded-full bg-gold transition-all" style={{ width: `${cap > 0n ? Math.min(100, Number((minted * 100n) / cap)) : 0}%` }} /></div>
              <p className="mt-3 font-mono text-xs text-muted">{minted.toString()} claimed · {cap > minted ? (cap - minted).toString() : "0"} remaining</p>
              <button disabled={!isConnected || soldOut || Boolean(claimed.data) || isWriting} onClick={claimBadge} className="focus-ring mt-7 min-h-14 rounded-full bg-ink px-8 text-sm font-bold text-paper hover:bg-[#34312C] disabled:cursor-not-allowed disabled:opacity-40">
                {!isConnected ? "Connect wallet to claim" : soldOut ? "All badges claimed" : claimed.data ? "You’ve claimed your badge" : isWriting ? "Confirm in your wallet…" : "Claim supporter badge"}
              </button>
              {isConnected && claimed.data && <p className="mt-3 text-sm text-muted">Your address has already claimed its one badge.</p>}
              <p className="mt-7 text-sm text-[#4C473F]">80% to creator <span className="mx-2 text-gold">·</span> 20% shared among badge holders</p>
            </div>
          </div>

          <section className="mt-8 border border-[#E7E0D2] bg-raised p-7 sm:p-10 lg:mt-12">
            <p className="font-mono text-xs uppercase tracking-[.16em] text-teal">Back the work</p>
            <h2 className="mt-4 font-serif text-4xl font-normal">Send a tip</h2>
            <p className="mt-4 text-sm leading-6 text-[#4C473F]">Your support helps this creator keep making.</p>
            <label className="sr-only" htmlFor="tip-amount">Tip amount in MON</label>
            <div className="mt-8 flex min-h-14 items-center border border-[#E7E0D2] bg-white px-4">
              <input id="tip-amount" className="min-w-0 flex-1 bg-transparent py-3 text-base text-ink outline-none placeholder:text-muted" inputMode="decimal" value={tipAmount} onChange={(event) => setTipAmount(event.target.value)} placeholder="0.05 MON" aria-label="Tip amount in MON" />
            </div>
            <button disabled={!isConnected || isWriting || !tipAmount} onClick={tipCreator} className="focus-ring mt-5 min-h-14 w-full rounded-full bg-teal px-6 text-sm font-bold text-white hover:bg-[#17483F] disabled:cursor-not-allowed disabled:opacity-40">{isWriting ? "Processing…" : "Send tip"}</button>
          </section>
        </section>

        {isOwner ? (
          <section id="creator-overview" className="mt-16 overflow-hidden border border-black/10 bg-raised shadow-card">
            <div className="grid min-h-[520px] lg:grid-cols-[230px_1fr]">
              <aside className="bg-ink p-6 text-paper sm:p-8">
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center"><BrandMark className="h-10 w-10" /></span><span className="font-display text-lg font-semibold">FirstIn</span></div>
                <p className="mt-12 font-mono text-[10px] uppercase tracking-[.16em] text-white/45">Creator space</p>
                <nav className="mt-4 flex gap-2 overflow-x-auto lg:flex-col">
                  <a href="#creator-overview" className="whitespace-nowrap bg-white/10 px-4 py-3 text-sm text-paper"><span className="mr-2 text-gold">•</span>Overview</a>
                  <a href="#profile" className="whitespace-nowrap px-4 py-3 text-sm text-white/60 hover:bg-white/5">Your profile</a>
                  <a href="#supporters" className="whitespace-nowrap px-4 py-3 text-sm text-white/60 hover:bg-white/5">Supporters</a>
                  <a href="#revenue" className="whitespace-nowrap px-4 py-3 text-sm text-white/60 hover:bg-white/5">Revenue</a>
                </nav>
              </aside>
              <div className="p-5 sm:p-8 lg:p-10">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                  <div><h2 className="font-serif text-4xl font-normal">Your early circle.</h2><p className="mt-2 text-sm text-muted">A clear view of the people who found you first.</p></div>
                  <span className="font-mono text-xs text-muted">{shortAddress(address!)}</span>
                </div>
                <div className="grid gap-4 xl:grid-cols-[.9fr_1.6fr_.9fr]">
                  <div className="border border-[#E7E0D2] bg-white p-6">
                    <p className="font-mono text-[10px] uppercase tracking-[.15em] text-muted">Badges claimed</p>
                    <p className="mt-5 font-display text-4xl font-semibold">{minted.toString()}<span className="ml-1 text-xl font-normal text-muted">/ {cap.toString()}</span></p>
                  </div>
                  <div className="border border-[#E7E0D2] bg-white p-6">
                    <p className="font-mono text-[10px] uppercase tracking-[.15em] text-muted">Tip split</p>
                    <div className="mt-6 flex h-4 overflow-hidden rounded-full bg-teal-soft"><div className="w-4/5 bg-gold" /></div>
                    <div className="mt-4 flex justify-between text-xs"><span>80% creator</span><span className="text-teal">20% supporters</span></div>
                  </div>
                  <div className="bg-ink p-6 text-paper">
                    <p className="font-mono text-[10px] uppercase tracking-[.15em] text-white/50">Pending tips</p>
                    <p className="mt-5 font-display text-2xl font-semibold">{formatMon(pending.data)} MON</p>
                    <p className="mt-2 text-xs text-gold">Ready to distribute</p>
                  </div>
                </div>

                <div id="supporters" className="mt-8 border border-[#E7E0D2] bg-white p-6 sm:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div><p className="font-mono text-xs uppercase tracking-[.13em]">Recent supporters</p><p className="mt-2 text-xs text-muted">Claim order is recorded onchain.</p></div>
                    <button disabled={!pending.data || pending.data === 0n || minted === 0n || isWriting} onClick={distributeRevenue} className="focus-ring rounded-full bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-[#34312C] disabled:cursor-not-allowed disabled:opacity-40">{isWriting ? "Processing…" : minted === 0n ? "Waiting for first claimant" : "Distribute revenue"}</button>
                  </div>
                  <div className="mt-5">
                    {supporters.length ? supporters.slice(0, 6).map((supporter) => <div key={supporter} className="grid grid-cols-[1fr_auto] items-center gap-4 border-t border-[#E7E0D2] py-4 text-sm sm:grid-cols-[1fr_1fr_auto]"><span className="font-mono text-xs">{shortAddress(supporter)}</span><span className="hidden text-xs text-muted sm:block">Early supporter</span><span className="font-mono text-[10px] uppercase text-teal">Claimed</span></div>) : <p className="border-t border-[#E7E0D2] py-5 text-sm text-muted">{minted === 0n ? "No badges claimed yet." : "Loading supporter addresses…"}</p>}
                  </div>
                </div>

                <div id="revenue" className="mt-8 border border-[#E7E0D2] bg-white p-6 sm:p-7">
                  <p className="font-mono text-xs uppercase tracking-[.13em]">Withdrawable balance</p>
                  <div className="mt-4 flex flex-wrap items-end justify-between gap-4"><p className="font-display text-3xl font-semibold">{formatMon(credit.data)} <span className="font-mono text-sm font-normal text-muted">MON</span></p><button disabled={!credit.data || credit.data === 0n || isWriting} onClick={withdrawRevenue} className="focus-ring rounded-full border border-black/15 px-5 py-3 text-sm font-semibold hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40">Withdraw to wallet</button></div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-16 border border-black/10 bg-raised p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[.16em] text-muted">Your earnings</p>
            <h2 className="mt-3 font-serif text-3xl font-normal">Withdrawable balance</h2>
            <div className="mt-5 flex items-end gap-2"><span className="font-display text-4xl font-semibold">{isConnected ? formatMon(credit.data) : "—"}</span><span className="pb-1 font-mono text-sm text-muted">MON</span></div>
            <p className="mt-2 text-xs leading-5 text-muted">Supporter rewards become available after the creator distributes tips.</p>
            <button disabled={!isConnected || !credit.data || credit.data === 0n || isWriting} onClick={withdrawRevenue} className="focus-ring mt-5 rounded-full border border-black/15 px-6 py-3 text-sm font-bold hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40">Withdraw to connected wallet</button>
          </section>
        )}

        {(message || transactionError || contractReceipt.isError || tipReceipt.isError) && <p aria-live="polite" role={transactionError || contractReceipt.isError || tipReceipt.isError ? "alert" : "status"} className={`mt-6 rounded-xl p-4 text-sm ${transactionError || contractReceipt.isError || tipReceipt.isError ? "bg-red-50 text-red-800" : "bg-teal-soft text-teal"}`}>
          {transactionError?.message || (contractReceipt.isError || tipReceipt.isError ? "Transaction failed. Check the wallet and retry." : message)}
        </p>}
          {chainId !== monadTestnet.id && isConnected && <button disabled={switching} onClick={() => switchChain({ chainId: monadTestnet.id })} className="mt-4 rounded-xl bg-[#E8D8B7] px-4 py-3 text-sm font-bold text-ink">{switching ? "Switching network…" : "Switch wallet to Monad Testnet"}</button>}
        {supply.error && <p className="mt-5 text-sm text-red-700">Could not read this profile contract from the configured Monad RPC.</p>}
        <p className="mt-8 break-all font-mono text-xs text-muted">Contract: {address}</p>
      </div>
    </main>
  );
}
