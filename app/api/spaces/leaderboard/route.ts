import { NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";

export const dynamic = "force-dynamic";

export interface LeaderboardEntry {
  hostFid: number;
  hostName: string;
  hostPfp: string;
  spacesHosted: number;
  totalListeners: number;
  totalSpeakers: number;
  topics: string[];
}

const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  {
    hostFid: 3,
    hostName: "dwr.eth",
    hostPfp: "",
    spacesHosted: 47,
    totalListeners: 8420,
    totalSpeakers: 18,
    topics: ["Farcaster", "Base"],
  },
  {
    hostFid: 2,
    hostName: "vitalik.eth",
    hostPfp: "",
    spacesHosted: 31,
    totalListeners: 6103,
    totalSpeakers: 24,
    topics: ["Ethereum", "AI"],
  },
  {
    hostFid: 5,
    hostName: "jessepollak",
    hostPfp: "",
    spacesHosted: 28,
    totalListeners: 4850,
    totalSpeakers: 15,
    topics: ["Base", "DeFi"],
  },
  {
    hostFid: 6,
    hostName: "balajis",
    hostPfp: "",
    spacesHosted: 22,
    totalListeners: 3910,
    totalSpeakers: 12,
    topics: ["AI", "Ethereum"],
  },
  {
    hostFid: 4,
    hostName: "crypt0music",
    hostPfp: "",
    spacesHosted: 19,
    totalListeners: 2340,
    totalSpeakers: 8,
    topics: ["Music", "NFTs"],
  },
  {
    hostFid: 7,
    hostName: "linda.eth",
    hostPfp: "",
    spacesHosted: 15,
    totalListeners: 1870,
    totalSpeakers: 10,
    topics: ["Farcaster", "NFTs"],
  },
  {
    hostFid: 8,
    hostName: "rish",
    hostPfp: "",
    spacesHosted: 12,
    totalListeners: 1530,
    totalSpeakers: 7,
    topics: ["DeFi", "Base"],
  },
  {
    hostFid: 9,
    hostName: "nonlinear.eth",
    hostPfp: "",
    spacesHosted: 10,
    totalListeners: 980,
    totalSpeakers: 6,
    topics: ["Farcaster", "Ethereum"],
  },
];

export async function GET() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ leaderboard: DEMO_LEADERBOARD, configured: false });
  }

  try {
    const svc = new RoomServiceClient(wsUrl, apiKey, apiSecret);
    const rooms = await svc.listRooms();

    // Aggregate stats per host from active rooms
    const hostMap = new Map<number, LeaderboardEntry>();

    for (const room of rooms) {
      if (!room.name.startsWith("space-")) continue;

      let meta: { hostFid?: number; hostName?: string; hostPfp?: string; topic?: string } = {};
      try {
        if (room.metadata) meta = JSON.parse(room.metadata);
      } catch {}

      const fid = meta.hostFid ?? 0;
      if (!fid) continue;

      const existing = hostMap.get(fid);
      if (existing) {
        existing.spacesHosted += 1;
        existing.totalListeners += room.numParticipants;
        existing.totalSpeakers += room.numPublishers ?? 0;
        if (meta.topic && !existing.topics.includes(meta.topic)) {
          existing.topics.push(meta.topic);
        }
      } else {
        hostMap.set(fid, {
          hostFid: fid,
          hostName: meta.hostName ?? `fid:${fid}`,
          hostPfp: meta.hostPfp ?? "",
          spacesHosted: 1,
          totalListeners: room.numParticipants,
          totalSpeakers: room.numPublishers ?? 0,
          topics: meta.topic ? [meta.topic] : [],
        });
      }
    }

    const leaderboard = Array.from(hostMap.values()).sort(
      (a, b) => b.totalListeners - a.totalListeners || b.spacesHosted - a.spacesHosted
    );

    // Fall back to demo data if no real rooms found yet
    return NextResponse.json({
      leaderboard: leaderboard.length > 0 ? leaderboard : DEMO_LEADERBOARD,
      configured: true,
    });
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err);
    return NextResponse.json({ leaderboard: DEMO_LEADERBOARD, configured: true, error: "Failed" });
  }
}
