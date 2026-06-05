export interface Space {
  id: string;
  title: string;
  hostFid: number;
  hostName: string;
  hostPfp: string;
  status: "live" | "scheduled" | "ended";
  participantCount: number;
  speakerCount: number;
  topic?: string;
  createdAt: number;
  startedAt: number;
}
