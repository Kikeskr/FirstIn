"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { getAddress, isAddress } from "viem";
import { FACTORY_ADDRESS, factoryAbi } from "@/lib/contracts";
import { monadTestnet } from "@/lib/monad";
import { SiteHeader } from "@/components/SiteHeader";
import { BrandMark } from "@/components/BrandMark";

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
  const [lookupLoading, setLookupLoading] = useState(false);
  const configured = Boolean(FACTORY_ADDRESS && isAddress(FACTORY_ADDRESS));
  const publicClient = usePublicClient({ chainId: monadTestnet.id });

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

  async function openLookup() {
    setLookupError("");
    const value = lookup.trim();
    if (!isAddress(value)) {
      setLookupError("Enter a creator wallet or profile address.");
      return;
    }

    const inputAddress = getAddress(value);
    if (!configured || !FACTORY_ADDRESS || !publicClient) {
      window.location.href = `/${inputAddress}`;
      return;
    }

    setLookupLoading(true);
    try {
      const profileForCreator = await publicClient.readContract({
        address: FACTORY_ADDRESS,
        abi: factoryAbi,
        functionName: "creatorToProfile",
        args: [inputAddress],
      });
      const isZeroAddress = profileForCreator === "0x0000000000000000000000000000000000000000";
      window.location.href = `/${isZeroAddress ? inputAddress : profileForCreator}`;
    } catch {
      setLookupError("Could not look up that address on Monad Testnet. Please try again.");
      setLookupLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid-paper">
      <SiteHeader />
      <section className="mx-auto grid min-h-[590px] w-full max-w-7xl gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-16 lg:pt-10">
        <div>
          <p className="mb-10 font-mono text-xs uppercase tracking-[.19em] text-teal">Proof of discovery · on Monad</p>
          <h1 className="max-w-3xl font-serif text-6xl font-normal leading-[.98] tracking-[-.045em] sm:text-7xl lg:text-[5.25rem]">
            Discovery,<br />made visible.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#4C473F]">
            Launch a creator profile. Recognize the first 100 who believed.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#creator-studio" className="focus-ring inline-flex min-h-14 items-center justify-center rounded-full bg-ink px-8 text-sm font-bold text-paper hover:bg-[#34312C]">Create your profile</a>
            <a href="#find-creator" className="focus-ring inline-flex min-h-14 items-center justify-center rounded-full border border-ink px-8 text-sm font-semibold text-ink hover:bg-white/50">Explore creators</a>
          </div>
        </div>

        <div className="mx-auto grid aspect-square w-full max-w-[360px] place-items-center rounded-full border-2 border-ink bg-raised p-5 sm:max-w-[390px]">
          <div className="grid h-full w-full place-items-center rounded-full border border-[#E7E0D2] p-5">
            <div className="relative grid h-full w-full place-items-center rounded-full border border-teal">
              <BrandMark className="h-36 w-36" ink="#141210" />
              <span className="absolute bottom-8 bg-raised px-3 font-mono text-[10px] uppercase tracking-widest text-muted">A place in the story</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 border-y border-black/10 px-5 py-5 text-sm text-[#4C473F] sm:grid-cols-3 sm:px-8">
        <span>80% to the creator</span>
        <span><span className="mr-3 text-gold">●</span>20% shared with badge holders</span>
        <span><span className="mr-3 text-gold">●</span>100 badges maximum</span>
      </div>

      <section id="creator-studio" className="scroll-mt-8 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[.18em] text-teal">Creator studio</p>
        <h2 className="mt-3 font-serif text-4xl font-normal sm:text-5xl">Launch your profile.</h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">Create your onchain home and give your earliest supporters a permanent place in the story.</p>
        <div className="relative mt-8 border border-black/10 bg-raised p-6 shadow-card sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-muted">One profile per wallet</p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">Your creator profile</h3>
            </div>
            <div className="flex items-center gap-3">
              <img src="/brand/symbol-seal-color.svg" alt="" className="h-12 w-12" />
              <span className="rounded-full bg-teal-soft px-3 py-1.5 font-mono text-xs text-teal">100 MAX</span>
            </div>
          </div>

          {!isConnected ? (
            <div className="mt-8 rounded-2xl bg-paper p-5 text-sm leading-6 text-[#55574f]">Connect your wallet to see your creator profile or launch one.</div>
          ) : alreadyHasProfile ? (
            <div className="mt-8 rounded-2xl bg-paper p-5">
              <p className="text-sm text-muted">Your profile is ready</p>
              <Link className="mt-3 inline-flex items-center gap-2 font-mono text-sm font-bold underline decoration-gold decoration-2 underline-offset-4" href={`/${profileAddress}`}>
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
          {statusMessage && <p aria-live="polite" className="mt-4 rounded-xl bg-teal-soft p-3 text-sm leading-5 text-teal">{statusMessage}</p>}
          {profileRead.error && <p className="mt-3 text-xs text-red-700">Could not read the factory. Check the RPC and factory address.</p>}
        </div>
        </div>
      </section>

      <section id="find-creator" className="mx-auto grid max-w-7xl gap-4 border-t border-black/10 px-5 py-12 sm:px-8 md:grid-cols-[1fr_1.2fr] md:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.18em] text-muted">Already have a creator profile?</p>
          <p className="mt-2 font-serif text-2xl">Go straight to their page.</p>
        </div>
        <div>
          <div className="flex gap-2">
            <input className="focus-ring min-w-0 flex-1 border border-black/15 bg-raised px-4 py-3 text-sm" value={lookup} onChange={(event) => setLookup(event.target.value)} placeholder="Creator wallet or profile address" aria-label="Creator wallet or profile address" />
            <button disabled={lookupLoading} onClick={openLookup} className="focus-ring bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-[#34362f] disabled:cursor-wait disabled:opacity-60">{lookupLoading ? "Opening…" : "Open"}</button>
          </div>
          {lookupError && <p className="mt-2 text-sm text-red-700">{lookupError}</p>}
        </div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-black/10 px-5 py-6 text-xs text-muted sm:px-8">
        <span>FirstIn · Monad Testnet · MON</span>
        <span>Proof of discovery, on Monad.</span>
      </footer>
    </main>
  );
}
