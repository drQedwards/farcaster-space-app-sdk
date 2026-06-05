import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";

// POST /api/spaces/invite
// Host calls this to grant canPublish to a listener
export async function POST(request: NextRequest) {
  try {
    const { roomName, targetIdentity } = await request.json();

    if (!roomName || !targetIdentity) {
      return NextResponse.json(
        { error: "Missing roomName or targetIdentity" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json(
        { error: "LiveKit not configured" },
        { status: 503 }
      );
    }

    const svc = new RoomServiceClient(wsUrl, apiKey, apiSecret);

    // Update participant permissions server-side — no token refresh needed
    await svc.updateParticipant(roomName, targetIdentity, undefined, {
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Invite to speak error:", error);
    return NextResponse.json(
      { error: "Failed to invite participant" },
      { status: 500 }
    );
  }
}
