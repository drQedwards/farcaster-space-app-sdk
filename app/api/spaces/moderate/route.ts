import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";

// POST /api/spaces/moderate
// Host can remotely mute or remove a speaker
export async function POST(request: NextRequest) {
  try {
    const { roomName, targetIdentity, action } = await request.json();

    if (!roomName || !targetIdentity || !action) {
      return NextResponse.json(
        { error: "Missing roomName, targetIdentity, or action" },
        { status: 400 }
      );
    }

    if (!["mute", "remove"].includes(action)) {
      return NextResponse.json(
        { error: "action must be 'mute' or 'remove'" },
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

    if (action === "mute") {
      // Revoke canPublish — participant's audio is stopped server-side
      await svc.updateParticipant(roomName, targetIdentity, undefined, {
        canPublish: false,
        canSubscribe: true,
        canPublishData: true,
      });
    } else if (action === "remove") {
      // Remove the participant from the room entirely
      await svc.removeParticipant(roomName, targetIdentity);
    }

    return NextResponse.json({ ok: true, action, targetIdentity });
  } catch (error) {
    console.error("Moderate speaker error:", error);
    return NextResponse.json(
      { error: "Moderation action failed" },
      { status: 500 }
    );
  }
}
