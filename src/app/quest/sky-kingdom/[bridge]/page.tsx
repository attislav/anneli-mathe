import { notFound } from "next/navigation";
import { getBridge, BRIDGES } from "@/data/bridges";
import { BridgeChallenge } from "@/components/BridgeChallenge";

type Params = { bridge: string };

export function generateStaticParams(): Params[] {
  return BRIDGES.map((b) => ({ bridge: b.id }));
}

export default async function BridgePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { bridge: bridgeId } = await params;
  const bridge = getBridge(bridgeId);
  if (!bridge) notFound();

  return <BridgeChallenge bridge={bridge} />;
}
