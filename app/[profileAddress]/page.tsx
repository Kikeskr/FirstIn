import { ProfileClient } from "@/components/ProfileClient";

export default async function CreatorPage({ params }: { params: Promise<{ profileAddress: string }> }) {
  const { profileAddress } = await params;
  return <ProfileClient profileAddress={profileAddress} />;
}
