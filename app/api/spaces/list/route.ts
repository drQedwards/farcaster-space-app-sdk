import { NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";
import { Space } from "@/features/spaces/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  // If LiveKit is not configured, return empty list gracefully
  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ spaces: [], configured: false });
  }

  try {
    const svc = new RoomServiceClient(wsUrl, apiKey, apiSecret);
    const rooms = await svc.listRooms();

    const spaces: Space[] = rooms
      .filter((r) => r.name.startsWith("space-"))
      .map((r) => {
        // Room metadata is stored as JSON string in metadata field
        let meta: Partial<Space> = {};
        try {
          if (r.metadata) meta = JSON.parse(r.metadata);
        } catch {}

        return {
          id: r.name.replace("space-", ""),
          title: (meta.title as string) ?? r.name,
          hostFid: (meta.hostFid as number) ?? 0,
          hostName: (meta.hostName as string) ?? "Unknown",
          hostPfp: (meta.hostPfp as string) ?? "",
          status: "live" as const,
          participantCount: r.numParticipants,
          speakerCount: r.numPublishers ?? 0,
          topic: meta.topic as string | undefined,
          createdAt: Number(r.creationTime) * 1000,
          startedAt: Number(r.creationTime) * 1000,
        };
      })
      .sort((a, b) => b.participantCount - a.participantCount);

    return NextResponse.json({ spaces, configured: true });
  } catch (err) {
    console.error("Failed to list spaces:", err);
    return NextResponse.json({ spaces: [], configured: true, error: "Failed to fetch rooms" });
  }
}
