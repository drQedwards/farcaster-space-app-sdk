import { NextRequest, NextResponse } from "next/server";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

export async function POST(request: NextRequest) {
  try {
    const { roomName, participantName, participantFid, role } =
      await request.json();

    if (!roomName || !participantName || !participantFid) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "LiveKit not configured. Please set LIVEKIT_API_KEY and LIVEKIT_API_SECRET." },
        { status: 503 }
      );
    }

    const canPublish = role === "host" || role === "speaker";

    const at = new AccessToken(apiKey, apiSecret, {
      identity: `fid_${participantFid}`,
      name: participantName,
      ttl: "4h",
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomName = searchParams.get("roomName");

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ participants: [] });
  }

  try {
    const svc = new RoomServiceClient(wsUrl, apiKey, apiSecret);
    const participants = roomName
      ? await svc.listParticipants(roomName)
      : [];

    return NextResponse.json({
      participants: participants.map((p) => ({
        identity: p.identity,
        name: p.name,
        isPublishing: p.tracks.length > 0,
      })),
    });
  } catch {
    return NextResponse.json({ participants: [] });
  }
}
