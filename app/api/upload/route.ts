import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 16_384) {
    return NextResponse.json({ error: "Profile metadata is too large." }, { status: 413 });
  }

  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return NextResponse.json(
      { error: "Metadata upload is not configured. Add PINATA_JWT or paste an existing IPFS URI." },
      { status: 503 },
    );
  }

  try {
    const metadata = await request.json();
    if (
      typeof metadata.name !== "string" ||
      typeof metadata.description !== "string" ||
      typeof metadata.image !== "string" ||
      !metadata.name.trim() ||
      !metadata.image.trim() ||
      metadata.name.length > 60 ||
      metadata.description.length > 280 ||
      metadata.image.length > 2048
    ) {
      return NextResponse.json({ error: "Name and image are required." }, { status: 400 });
    }

    const pinResponse = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pinataContent: {
          name: metadata.name.trim(),
          description: metadata.description.trim(),
          image: metadata.image.trim(),
        },
        pinataMetadata: { name: `FirstIn - ${metadata.name.trim()}` },
      }),
      cache: "no-store",
    });

    const result = await pinResponse.json();
    if (!pinResponse.ok || typeof result.IpfsHash !== "string") {
      return NextResponse.json({ error: "The IPFS provider rejected the upload." }, { status: 502 });
    }
    return NextResponse.json({ uri: `ipfs://${result.IpfsHash}` });
  } catch {
    return NextResponse.json({ error: "Could not upload the profile metadata." }, { status: 400 });
  }
}
