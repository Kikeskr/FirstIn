export function toGatewayUrl(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    const path = uri.slice("ipfs://".length).replace(/^ipfs\//, "");
    return `https://gateway.pinata.cloud/ipfs/${path}`;
  }
  return uri;
}
