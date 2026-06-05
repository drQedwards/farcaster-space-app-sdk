import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";

export async function POST(request: NextRequest) {
  try {
    const { spaceId, title, hostFid, hostName, hostPfp, topic } =
      await request.json();

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      // No LiveKit — still OK, token endpoint handles this
      return NextResponse.json({ ok: true });
    }

    const svc = new RoomServiceClient(wsUrl, apiKey, apiSecret);

    const metadata = JSON.stringify({
      title,
      hostFid,
      hostName,
      hostPfp: hostPfp ?? "",
      topic: topic ?? "",
    });

    await svc.createRoom({
      name: `space-${spaceId}`,
      emptyTimeout: 300, // auto-close after 5 min empty
      maxParticipants: 500,
      metadata,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to create room:", err);
    // Non-fatal: room will be created on first join anyway
    return NextResponse.json({ ok: true });
  }
}
