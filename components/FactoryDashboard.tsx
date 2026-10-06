"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { isAddress } from "viem";
import { FACTORY_ADDRESS, factoryAbi } from "@/lib/contracts";
import { SiteHeader } from "@/components/SiteHeader";

type Metadata = { name: string; description: string; image: string };

function shortAddress(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export function FactoryDashboard() {
  const { address, isConnected } = useAccount();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [metadataUri, setMetadataUri] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [lookup, setLookup] = useState("");
  const [lookupError, setLookupError] = useState("");
  const configured = Boolean(FACTORY_ADDRESS && isAddress(FACTORY_ADDRESS));

  const profileRead = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "creatorToProfile",
    args: address ? [address] : undefined,
    query: { enabled: configured && Boolean(address), refetchInterval: 10_000 },
  });
  const profileAddress = profileRead.data as `0x${string}` | undefined;
  const alreadyHasProfile = Boolean(profileAddress && profileAddress !== "0x0000000000000000000000000000000000000000");

  const { data: txHash, error: writeError, isPending, writeContract } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (receipt.isSuccess) {
      setStatusMessage("Your creator profile is live on Monad Testnet.");
      void profileRead.refetch();
    }
  }, [receipt.isSuccess]);

  const metadata = useMemo<Metadata>(() => ({ name: name.trim(), description: bio.trim(), image: image.trim() }), [name, bio, image]);
  const metadataReady = metadata.name.length > 0 && metadata.image.length > 0;

  async function uploadMetadata() {
    setStatusMessage("Uploading metadata to IPFS…");
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      setMetadataUri(result.uri);
      setStatusMessage(`Metadata pinned: ${result.uri}`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not upload metadata.");
    }
  }

  function downloadMetadata() {
    if (!metadataReady) return;
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "firstin-profile.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setStatusMessage("Metadata JSON downloaded. Pin it to IPFS, then paste its ipfs:// URI below.");
  }

  function launchProfile() {
    setStatusMessage("");
    if (!configured) {
      setStatusMessage("Factory address is not configured. Deploy the factory and set NEXT_PUBLIC_FACTORY_ADDRESS.");
      return;
    }
    if (!metadataUri.startsWith("ipfs://") && !metadataUri.startsWith("https://")) {
      setStatusMessage("Enter an ipfs:// metadata URI (or an HTTPS URI) before creating the profile.");
      return;
    }
    writeContract({ address: FACTORY_ADDRESS!, abi: factoryAbi, functionName: "createProfile", args: [metadataUri] });
  }

  function openLookup() {
    setLookupError("");
    const value = lookup.trim();
    if (!isAddress(value)) {
      setLookupError("Enter a valid EVM profile address.");
      return;
    }
    window.location.href = `/${value}`;
  }

  return (
    <main className="min-h-screen grid-paper">
      <SiteHeader />
      <section className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-20 pt-8 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-16 lg:pt-16">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs font-bold uppercase tracking-[.16em]">
            <span className="h-2 w-2 rounded-full bg-[#9dbd20]" /> Proof of discovery · Monad
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-[.98] tracking-[-.055em] sm:text-7xl">
            Be here<br /><span className="text-[#6c8119]">before it</span><br />matters.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#53554e]">
            The first 100 supporters get a permanent place in a creator’s story—and share 20% of the tips that follow.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="rounded-full bg-acid px-4 py-2">80% to creator</span>
            <span className="rounded-full border border-black/15 bg-paper px-4 py-2">20% to early supporters</span>
            <span className="rounded-full border border-black/15 bg-paper px-4 py-2">100 badges max</span>
          </div>
          <div className="mt-12 border-t border-black/15 pt-5">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-muted">Already have a creator profile?</p>
            <div className="mt-3 flex max-w-xl gap-2">
              <input className="focus-ring min-w-0 flex-1 rounded-xl border border-black/15 bg-white px-4 py-3 text-sm" value={lookup} onChange={(event) => setLookup(event.target.value)} placeholder="Paste a profile address" aria-label="Profile address" />
              <button onClick={openLookup} className="focus-ring rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-[#34362f]">Open</button>
            </div>
            {lookupError && <p className="mt-2 text-sm text-red-700">{lookupError}</p>}
          </div>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-card sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-muted">Creator studio</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">Launch your profile</h2>
            </div>
            <span className="rounded-full bg-[#f0f3e7] px-3 py-1.5 font-mono text-xs text-[#566912]">01 / 100</span>
          </div>

          {!isConnected ? (
            <div className="mt-8 rounded-2xl bg-paper p-5 text-sm leading-6 text-[#55574f]">Connect your wallet to see your creator profile or launch one.</div>
          ) : alreadyHasProfile ? (
            <div className="mt-8 rounded-2xl bg-paper p-5">
              <p className="text-sm text-muted">Your profile is ready</p>
              <Link className="mt-3 inline-flex items-center gap-2 font-mono text-sm font-bold underline decoration-[#9dbd20] decoration-2 underline-offset-4" href={`/${profileAddress}`}>
                {shortAddress(profileAddress!)} <span aria-hidden="true">↗</span>
              </Link>
              <p className="mt-3 text-xs text-muted">Open it to claim badges, tip, or manage revenue.</p>
            </div>
          ) : (
            <div className="mt-7 space-y-4">
              <label className="block text-sm font-bold">Display name
                <input className="focus-ring mt-2 w-full rounded-xl border border-black/15 bg-[#fbfaf7] px-4 py-3 font-normal" value={name} onChange={(event) => setName(event.target.value)} placeholder="The name people know you by" maxLength={60} />
              </label>
              <label className="block text-sm font-bold">Short bio
                <textarea className="focus-ring mt-2 min-h-24 w-full resize-y rounded-xl border border-black/15 bg-[#fbfaf7] px-4 py-3 font-normal" value={bio} onChange={(event) => setBio(event.target.value)} placeholder="What are you making?" maxLength={280} />
              </label>
              <label className="block text-sm font-bold">Profile image URL
                <input className="focus-ring mt-2 w-full rounded-xl border border-black/15 bg-[#fbfaf7] px-4 py-3 font-mono text-xs font-normal" value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://… or ipfs://…" />
              </label>
              <div className="flex flex-wrap gap-2">
                <button disabled={!metadataReady} onClick={uploadMetadata} className="focus-ring rounded-xl border border-black/15 px-4 py-2.5 text-sm font-bold hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40">Pin metadata to IPFS</button>
                <button disabled={!metadataReady} onClick={downloadMetadata} className="focus-ring rounded-xl px-4 py-2.5 text-sm font-semibold text-muted underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-40">Download JSON</button>
              </div>
              <label className="block text-sm font-bold">Metadata URI
                <input className="focus-ring mt-2 w-full rounded-xl border border-black/15 bg-[#fbfaf7] px-4 py-3 font-mono text-xs font-normal" value={metadataUri} onChange={(event) => setMetadataUri(event.target.value)} placeholder="ipfs://…" />
              </label>
              <button disabled={!configured || !metadataUri || isPending || receipt.isLoading} onClick={launchProfile} className="focus-ring w-full rounded-xl bg-ink px-5 py-4 text-sm font-bold text-white transition hover:bg-[#34362f] disabled:cursor-not-allowed disabled:opacity-40">
                {isPending || receipt.isLoading ? "Creating profile…" : "Create creator profile ↗"}
              </button>
              {address && <p className="text-xs leading-5 text-muted">Wallet <span className="font-mono">{shortAddress(address)}</span> · one profile per wallet</p>}
            </div>
          )}

          {!configured && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">Factory contract is not configured yet. Compile and deploy the factory, then set <code>NEXT_PUBLIC_FACTORY_ADDRESS</code>.</p>}
          {writeError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{writeError.message}</p>}
          {statusMessage && <p aria-live="polite" className="mt-4 rounded-xl bg-[#f0f3e7] p-3 text-sm leading-5 text-[#465516]">{statusMessage}</p>}
          {profileRead.error && <p className="mt-3 text-xs text-red-700">Could not read the factory. Check the RPC and factory address.</p>}
        </div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-black/10 px-5 py-6 text-xs text-muted sm:px-8">
        <span>FirstIn · Monad Testnet · MON</span>
        <span>Early belief, shared upside.</span>
      </footer>
    </main>
  );
}
