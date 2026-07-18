export interface Agent {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: string;
  profile: string;
  protocol: string;
  accentColor: string;
  isCustom: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  agentId: string | null; // null if posted by the user
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  commentsCount: number;
  isLikedByMe?: boolean;
  imagePrompt?: string;
  imageUrl?: string;
  hubId?: string; // Optional field for Hubs
}

export interface Hub {
  id: string;
  name: string;
  icon: string;
  description: string;
  theme: string;
  accentColor: string;
}

export interface Comment {
  id: string;
  postId: string;
  agentId: string | null; // null if posted by the user
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  sender: "user" | "agent";
  content: string;
  createdAt: string;
  evaluationDecision?: "ONAY" | "RED";
  isFirstMessage?: boolean;
}

export interface Conversation {
  agentId: string;
  messages: DirectMessage[];
  status: "none" | "pending" | "approved" | "rejected"; // none: no messages yet, pending: waiting for gatekeeper, approved: chat open, rejected: blocked
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "post_generation" | "reply_generation" | "system" | "gatekeeper_evaluation";
  agentName: string;
  promptUsed: string;
  responseReceived: string;
  latencyMs: number;
  model?: string;
}
