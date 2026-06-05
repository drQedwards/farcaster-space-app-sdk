import { NextRequest, NextResponse } from "next/server";
import { EgressClient, EncodedFileOutput, EncodedFileType, SegmentedFileProtocol, StreamOutput, StreamProtocol } from "livekit-server-sdk";

/**
 * POST /api/spaces/stream
 * Starts or stops a stream/recording egress for a space.
 *
 * body: {
 *   action: "start-twitch" | "start-recording" | "stop",
 *   roomName: string,
 *   egressId?: string,       // required for "stop"
 *   twitchStreamKey?: string  // required for "start-twitch"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { action, roomName, egressId, twitchStreamKey } = await request.json();

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({ error: "LiveKit not configured" }, { status: 503 });
    }

    // Convert WSS URL to HTTPS for EgressClient
    const httpUrl = wsUrl.replace(/^wss?:\/\//, "https://");
    const egress = new EgressClient(httpUrl, apiKey, apiSecret);

    if (action === "stop") {
      if (!egressId) {
        return NextResponse.json({ error: "egressId required to stop" }, { status: 400 });
      }
      await egress.stopEgress(egressId);
      return NextResponse.json({ ok: true });
    }

    if (action === "start-twitch") {
      if (!twitchStreamKey) {
        return NextResponse.json({ error: "twitchStreamKey required" }, { status: 400 });
      }
      const info = await egress.startRoomCompositeEgress(roomName, {
        stream: new StreamOutput({
          protocol: StreamProtocol.RTMP,
          urls: [`rtmp://live.twitch.tv/live/${twitchStreamKey}`],
        }),
      });
      return NextResponse.json({ ok: true, egressId: info.egressId });
    }

    if (action === "start-recording") {
      // Records to a timestamped mp4 — stored in LiveKit's configured storage
      const info = await egress.startRoomCompositeEgress(roomName, {
        file: new EncodedFileOutput({
          fileType: EncodedFileType.MP4,
          filepath: `recordings/${roomName}-${Date.now()}.mp4`,
        }),
      });
      return NextResponse.json({ ok: true, egressId: info.egressId });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    // Surface a friendly message for missing egress config
    if (msg.includes("egress") || msg.includes("404")) {
      return NextResponse.json(
        {
          error: "Egress not enabled on your LiveKit project. Enable it at cloud.livekit.io.",
          code: "EGRESS_NOT_ENABLED",
        },
        { status: 422 }
      );
    }
    console.error("Stream/egress error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
