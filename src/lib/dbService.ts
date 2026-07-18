import { db, isFirebaseEnabled } from "./firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { Agent, Post, Comment, Conversation, LogEntry } from "../types";

// Deeply clean objects of undefined values, as Firestore does not accept undefined fields.
function cleanUndefined(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  }
  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      cleaned[key] = cleanUndefined(val);
    }
  }
  return cleaned;
}

// Local state cache for the fallback mode
let fallbackState: {
  posts: Post[];
  comments: Comment[];
  agents: Agent[];
  conversations: Record<string, Conversation>;
  logs: LogEntry[];
} = {
  posts: [],
  comments: [],
  agents: [],
  conversations: {},
  logs: [],
};

// Listeners active in fallback polling mode
const fallbackListeners: Set<() => void> = new Set();

// Start polling if Firebase is not enabled
let isPollingStarted = false;
function startFallbackPolling() {
  if (isPollingStarted || isFirebaseEnabled) return;
  isPollingStarted = true;

  const poll = async () => {
    try {
      const response = await fetch("/api/db/state");
      if (response.ok) {
        const newState = await response.json();
        // Update local state cache
        fallbackState = newState;
        // Trigger all listeners
        fallbackListeners.forEach((listener) => listener());
      }
    } catch (error) {
      console.error("Failed to poll server state:", error);
    }
    setTimeout(poll, 2000); // Poll every 2 seconds
  };

  poll();
}

// 1. LISTEN TO POSTS
export function listenPosts(callback: (posts: Post[]) => void): () => void {
  if (isFirebaseEnabled && db) {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const posts: Post[] = [];
      snapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() } as Post);
      });
      callback(posts);
    }, (error) => {
      console.error("Firebase listenPosts error:", error);
    });
  } else {
    // Fallback mode
    startFallbackPolling();
    const listener = () => {
      // Sort posts desc by default
      const sorted = [...fallbackState.posts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      callback(sorted);
    };
    fallbackListeners.add(listener);
    // Initial call
    listener();
    return () => {
      fallbackListeners.delete(listener);
    };
  }
}

// 2. LISTEN TO COMMENTS
export function listenComments(callback: (comments: Comment[]) => void): () => void {
  if (isFirebaseEnabled && db) {
    const q = query(collection(db, "comments"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      const comments: Comment[] = [];
      snapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() } as Comment);
      });
      callback(comments);
    }, (error) => {
      console.error("Firebase listenComments error:", error);
    });
  } else {
    // Fallback mode
    startFallbackPolling();
    const listener = () => {
      const sorted = [...fallbackState.comments].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      callback(sorted);
    };
    fallbackListeners.add(listener);
    listener();
    return () => {
      fallbackListeners.delete(listener);
    };
  }
}

// 3. LISTEN TO AGENTS
export function listenAgents(callback: (agents: Agent[]) => void): () => void {
  if (isFirebaseEnabled && db) {
    const q = query(collection(db, "agents"), orderBy("id", "asc"));
    return onSnapshot(q, (snapshot) => {
      const agents: Agent[] = [];
      snapshot.forEach((doc) => {
        agents.push({ id: doc.id, ...doc.data() } as Agent);
      });
      callback(agents);
    }, (error) => {
      console.error("Firebase listenAgents error:", error);
    });
  } else {
    // Fallback mode
    startFallbackPolling();
    const listener = () => {
      callback(fallbackState.agents);
    };
    fallbackListeners.add(listener);
    listener();
    return () => {
      fallbackListeners.delete(listener);
    };
  }
}

// 4. LISTEN TO CONVERSATIONS
export function listenConversations(
  callback: (conversations: Record<string, Conversation>) => void
): () => void {
  if (isFirebaseEnabled && db) {
    const q = collection(db, "conversations");
    return onSnapshot(q, (snapshot) => {
      const conversations: Record<string, Conversation> = {};
      snapshot.forEach((docSnap) => {
        conversations[docSnap.id] = docSnap.data() as Conversation;
      });
      callback(conversations);
    }, (error) => {
      console.error("Firebase listenConversations error:", error);
    });
  } else {
    // Fallback mode
    startFallbackPolling();
    const listener = () => {
      callback(fallbackState.conversations);
    };
    fallbackListeners.add(listener);
    listener();
    return () => {
      fallbackListeners.delete(listener);
    };
  }
}

// 5. LISTEN TO LOGS
export function listenLogs(callback: (logs: LogEntry[]) => void): () => void {
  if (isFirebaseEnabled && db) {
    const q = query(collection(db, "logs"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
      const logs: LogEntry[] = [];
      snapshot.forEach((docSnap) => {
        logs.push({ id: docSnap.id, ...docSnap.data() } as LogEntry);
      });
      callback(logs);
    }, (error) => {
      console.error("Firebase listenLogs error:", error);
    });
  } else {
    // Fallback mode
    startFallbackPolling();
    const listener = () => {
      const sorted = [...fallbackState.logs].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      callback(sorted);
    };
    fallbackListeners.add(listener);
    listener();
    return () => {
      fallbackListeners.delete(listener);
    };
  }
}

// Write helper functions to handle backend / Firestore syncing

// POST
export async function addPost(post: Post): Promise<void> {
  if (isFirebaseEnabled && db) {
    await setDoc(doc(db, "posts", post.id), cleanUndefined(post));
  } else {
    await fetch("/api/db/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });
  }
}

export async function deletePost(postId: string): Promise<void> {
  if (isFirebaseEnabled && db) {
    await deleteDoc(doc(db, "posts", postId));
  } else {
    await fetch(`/api/db/posts/${postId}`, {
      method: "DELETE",
    });
  }
}

// COMMENT
export async function addComment(comment: Comment): Promise<void> {
  if (isFirebaseEnabled && db) {
    await setDoc(doc(db, "comments", comment.id), cleanUndefined(comment));
  } else {
    await fetch("/api/db/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comment),
    });
  }
}

// AGENT
export async function saveAgent(agent: Agent): Promise<void> {
  if (isFirebaseEnabled && db) {
    await setDoc(doc(db, "agents", agent.id), cleanUndefined(agent));
  } else {
    await fetch("/api/db/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(agent),
    });
  }
}

export async function deleteAgent(agentId: string): Promise<void> {
  if (isFirebaseEnabled && db) {
    await deleteDoc(doc(db, "agents", agentId));
  } else {
    await fetch(`/api/db/agents/${agentId}`, {
      method: "DELETE",
    });
  }
}

// LOG
export async function addLog(log: LogEntry): Promise<void> {
  if (isFirebaseEnabled && db) {
    await setDoc(doc(db, "logs", log.id), cleanUndefined(log));
  } else {
    await fetch("/api/db/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
  }
}

export async function clearLogs(): Promise<void> {
  if (isFirebaseEnabled && db) {
    const q = collection(db, "logs");
    const snapshot = await getDocs(q);
    for (const d of snapshot.docs) {
      await deleteDoc(doc(db, "logs", d.id));
    }
  } else {
    await fetch("/api/db/logs/clear", {
      method: "POST",
    });
  }
}

// CONVERSATION
export async function saveConversation(
  agentId: string,
  conversation: Conversation
): Promise<void> {
  if (isFirebaseEnabled && db) {
    await setDoc(doc(db, "conversations", agentId), cleanUndefined(conversation));
  } else {
    await fetch("/api/db/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId, conversation }),
    });
  }
}

// BOOTSTRAP DATA (Saves initial seed data to Firebase if database is empty)
export async function bootstrapDatabaseIfEmpty(
  initialAgents: Agent[],
  initialPosts: Post[],
  initialComments: Comment[]
): Promise<void> {
  if (!isFirebaseEnabled || !db) return;

  try {
    // 1. Check Agents
    const agentsRef = collection(db, "agents");
    const agentsSnap = await getDocs(agentsRef);
    if (agentsSnap.empty) {
      console.log("Seeding initial agents to Firestore...");
      for (const a of initialAgents) {
        await setDoc(doc(db, "agents", a.id), cleanUndefined(a));
      }
    }

    // 2. Check Posts
    const postsRef = collection(db, "posts");
    const postsSnap = await getDocs(postsRef);
    if (postsSnap.empty) {
      console.log("Seeding initial posts to Firestore...");
      for (const p of initialPosts) {
        await setDoc(doc(db, "posts", p.id), cleanUndefined(p));
      }
    }

    // 3. Check Comments
    const commentsRef = collection(db, "comments");
    const commentsSnap = await getDocs(commentsRef);
    if (commentsSnap.empty) {
      console.log("Seeding initial comments to Firestore...");
      for (const c of initialComments) {
        await setDoc(doc(db, "comments", c.id), cleanUndefined(c));
      }
    }
  } catch (err) {
    console.error("Error bootstrapping Firestore database:", err);
  }
}
