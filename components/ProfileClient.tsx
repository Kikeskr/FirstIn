"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatEther, getAddress, isAddress, parseEther, type Address } from "viem";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { monadTestnet } from "@/lib/monad";
import { profileAbi } from "@/lib/contracts";
import { toGatewayUrl } from "@/lib/ipfs";
import { SiteHeader } from "@/components/SiteHeader";

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
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-6 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">← All creators</Link>
        <section className="mt-6 overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-card">
          <div className="h-36 bg-[linear-gradient(110deg,#d9ff57_0%,#f0f3e7_52%,#e8e5db_100%)] sm:h-48">
            <div className="flex h-full items-end justify-end p-5 sm:p-7"><span className="rounded-full bg-white/80 px-3 py-2 font-mono text-xs">MONAD · TESTNET</span></div>
          </div>
          <div className="grid gap-8 px-5 pb-7 sm:px-8 sm:pb-9 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end">
              <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[1.6rem] border-4 border-white bg-ink text-3xl font-black text-acid sm:h-28 sm:w-28">
                {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : "FI"}
              </div>
              <div className="pb-1">
                <p className="text-xs font-bold uppercase tracking-[.15em] text-muted">Creator profile</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{metadata?.name || (metadataLoading ? "Loading profile…" : "FirstIn creator")}</h1>
                <p className="mt-2 font-mono text-xs text-muted">{shortAddress(address!)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-paper px-4 py-2">{minted.toString()} / {cap.toString()} badges claimed</span>
              <span className="rounded-full bg-[#f0f3e7] px-4 py-2">Early supporters share 20%</span>
            </div>
            {metadata?.description && <p className="max-w-2xl text-sm leading-6 text-[#55574f] sm:col-span-2">{metadata.description}</p>}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <section className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-card sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[.16em] text-muted">Proof of discovery</p><h2 className="mt-2 text-2xl font-black">Get in early.</h2></div>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-acid text-xl">✳</span>
            </div>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#55574f]">Claim one of the first 100 supporter badges. When the creator distributes tips, early supporters share one fifth equally.</p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-paper"><div className="h-full rounded-full bg-[#a9ca2d] transition-all" style={{ width: `${cap > 0n ? Math.min(100, Number((minted * 100n) / cap)) : 0}%` }} /></div>
            <div className="mt-2 flex justify-between font-mono text-xs text-muted"><span>0</span><span>{minted.toString()} claimed</span><span>{cap.toString()}</span></div>
            <button disabled={!isConnected || soldOut || Boolean(claimed.data) || isWriting} onClick={claimBadge} className="focus-ring mt-7 w-full rounded-xl bg-ink px-5 py-4 text-sm font-bold text-white hover:bg-[#34362f] disabled:cursor-not-allowed disabled:opacity-40">
              {!isConnected ? "Connect wallet to claim" : soldOut ? "All badges claimed" : claimed.data ? "You’ve claimed your badge" : isWriting ? "Confirm in your wallet…" : "Claim supporter badge · Free"}
            </button>
            {isConnected && claimed.data && <p className="mt-3 text-center text-xs text-muted">Your address has already claimed its one badge.</p>}
          </section>

          <section className="rounded-[1.75rem] border border-black/10 bg-ink p-6 text-white shadow-card sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-acid">Send a tip</p>
            <h2 className="mt-2 text-2xl font-black">Back the work.</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">Tips go to this profile contract. The creator can distribute them: 80% to the creator, 20% shared with badge claimants.</p>
            <label className="mt-6 block text-xs font-bold uppercase tracking-[.12em] text-white/55">Amount in MON
              <div className="mt-2 flex rounded-xl border border-white/15 bg-white/5 p-1.5 focus-within:border-acid">
                <input className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-lg font-semibold text-white outline-none placeholder:text-white/25" inputMode="decimal" value={tipAmount} onChange={(event) => setTipAmount(event.target.value)} placeholder="0.05" aria-label="Tip amount in MON" />
                <span className="self-center px-3 font-mono text-sm text-acid">MON</span>
              </div>
            </label>
            <button disabled={!isConnected || isWriting || !tipAmount} onClick={tipCreator} className="focus-ring mt-4 w-full rounded-xl bg-acid px-5 py-4 text-sm font-black text-ink hover:bg-[#e7ff9a] disabled:cursor-not-allowed disabled:opacity-40">{isWriting ? "Processing…" : "Send tip ↗"}</button>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[1.75rem] border border-black/10 bg-white p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-muted">Your earnings</p>
            <h2 className="mt-2 text-xl font-black">Withdrawable balance</h2>
            <div className="mt-5 flex items-end gap-2"><span className="text-4xl font-black tracking-tight">{isConnected ? formatMon(credit.data) : "—"}</span><span className="pb-1 font-mono text-sm text-muted">MON</span></div>
            <p className="mt-2 text-xs leading-5 text-muted">Creator earnings and supporter rewards are available here after the creator distributes tips.</p>
            <button disabled={!isConnected || !credit.data || credit.data === 0n || isWriting} onClick={withdrawRevenue} className="focus-ring mt-5 rounded-xl border border-black/15 px-5 py-3 text-sm font-bold hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40">Withdraw to connected wallet</button>
          </section>

          {isOwner && <section className="rounded-[1.75rem] border border-[#c2dc55] bg-[#f4f8e5] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#64771b]">Creator tools</p>
            <h2 className="mt-2 text-xl font-black">Distribute tip revenue</h2>
            <p className="mt-3 text-sm leading-6 text-[#55574f]">Pending tips: <strong>{formatMon(pending.data)} MON</strong>. Allocating creates withdrawal credits; no recipient can block this transaction.</p>
            <button disabled={!pending.data || pending.data === 0n || minted === 0n || isWriting} onClick={distributeRevenue} className="focus-ring mt-5 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-[#34362f] disabled:cursor-not-allowed disabled:opacity-40">{isWriting ? "Processing…" : minted === 0n ? "Waiting for first badge claimant" : "Distribute revenue"}</button>
          </section>}
        </div>

        {(message || transactionError || contractReceipt.isError || tipReceipt.isError) && <p aria-live="polite" role={transactionError || contractReceipt.isError || tipReceipt.isError ? "alert" : "status"} className={`mt-6 rounded-xl p-4 text-sm ${transactionError || contractReceipt.isError || tipReceipt.isError ? "bg-red-50 text-red-800" : "bg-[#f0f3e7] text-[#465516]"}`}>
          {transactionError?.message || (contractReceipt.isError || tipReceipt.isError ? "Transaction failed. Check the wallet and retry." : message)}
        </p>}
        {chainId !== monadTestnet.id && isConnected && <button disabled={switching} onClick={() => switchChain({ chainId: monadTestnet.id })} className="mt-4 rounded-xl bg-amber-100 px-4 py-3 text-sm font-bold text-amber-900">{switching ? "Switching network…" : "Switch wallet to Monad Testnet"}</button>}
        {supply.error && <p className="mt-5 text-sm text-red-700">Could not read this profile contract from the configured Monad RPC.</p>}
        <p className="mt-8 break-all font-mono text-xs text-muted">Contract: {address}</p>
      </div>
    </main>
  );
}
