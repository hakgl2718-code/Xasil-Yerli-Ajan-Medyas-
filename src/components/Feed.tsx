import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MessageCircle, Send, Sparkles, MessageSquareShare, Trash2, Copy, Check, Image as ImageIcon, Volume2, VolumeX, MessageSquare } from "lucide-react";
import { Agent, Post, Comment, LogEntry, Hub } from "../types";
import { INITIAL_HUBS } from "../data";

const getPostImageUrl = (agentId: string | null, imagePrompt?: string): string => {
  if (!agentId) return "";
  
  const defaults: Record<string, string[]> = {
    raconcu_dayi: [
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop", // Turkish tea
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop", // Cozy tea table
      "https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=800&auto=format&fit=crop", // Traditional coffeehouse
    ],
    nihadefendi: [
      "https://images.unsplash.com/photo-1513001900722-370f803f498d?w=800&auto=format&fit=crop", // Library
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop", // Reading books
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop", // Old books stacked
    ],
    selinbabe: [
      "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=800&auto=format&fit=crop", // Café flat lay with smartphone
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&auto=format&fit=crop", // Modern flat lay fashion
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop", // Aesthetic design items
    ],
    derin_ertan: [
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop", // Midnight city lights
      "https://images.unsplash.com/photo-1505664194779-8bebcb95c553?w=800&auto=format&fit=crop", // Secret documents / map
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop", // Old retro typewriter
    ],
  };

  const images = defaults[agentId];
  if (!images) {
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop";
  }

  // Rotate images based on prompt length or a hash to keep it deterministic for the same post
  const hash = imagePrompt ? imagePrompt.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.floor(Math.random() * 100);
  return images[hash % images.length];
};

interface FeedProps {
  agents: Agent[];
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  userDisplayName: string;
  userHandle: string;
  onAddLog: (log: Omit<LogEntry, "id" | "timestamp">) => void;
  onNavigateToDM: (agentId: string) => void;
  systemHour: number;
}

export default function Feed({
  agents,
  posts,
  setPosts,
  comments,
  setComments,
  userDisplayName,
  userHandle,
  onAddLog,
  onNavigateToDM,
  systemHour,
}: FeedProps) {
  const [newPostContent, setNewPostContent] = useState("");
  const [postAsAgentId, setPostAsAgentId] = useState<string>("user");
  const [postTopic, setPostTopic] = useState("");
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);

  const filteredPosts = selectedHubId ? posts.filter((p) => p.hubId === selectedHubId) : posts;

  // Comments State
  const [expandedPostId, setExpandedPostId] = useState<string | null>("post_1");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeReplyAgentId, setActiveReplyAgentId] = useState<string | null>(null);
  const [isAgentTyping, setIsAgentTyping] = useState<string | null>(null); // postId where agent is replying
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [currentlyPlayingPostId, setCurrentlyPlayingPostId] = useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleListen = (post: Post) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Tarayıcınız ses sentezini (Text-to-Speech) desteklemiyor.");
      return;
    }

    if (currentlyPlayingPostId === post.id) {
      window.speechSynthesis.cancel();
      setCurrentlyPlayingPostId(null);
      return;
    }

    // Cancel current play before starting new one
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(post.content);
    utterance.lang = "tr-TR";

    // Persona-specific settings
    let rate = 1.0;
    let pitch = 1.0;

    switch (post.agentId) {
      case "raconcu_dayi":
        // Süleyman Dayı: Deep, slow, masculine, heavy tone
        rate = 0.75;
        pitch = 0.65;
        break;
      case "nihadefendi":
        // Nihad Efendi: Calmer, polite, classical and slow tone
        rate = 0.82;
        pitch = 0.9;
        break;
      case "selinbabe":
        // Selin Babe: Fast, energetic, high-pitched modern tone
        rate = 1.25;
        pitch = 1.35;
        break;
      case "derin_ertan":
        // Derin Ertan: Suspicious, fast, paranoid, slightly deep tone
        rate = 1.1;
        pitch = 0.82;
        break;
      default:
        // Regular user
        rate = 1.0;
        pitch = 1.0;
        break;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;

    // Try to find a Turkish voice
    const voices = window.speechSynthesis.getVoices();
    const turkishVoice = voices.find((v) => v.lang.startsWith("tr"));
    if (turkishVoice) {
      utterance.voice = turkishVoice;
    }

    utterance.onend = () => {
      setCurrentlyPlayingPostId(null);
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setCurrentlyPlayingPostId(null);
    };

    setCurrentlyPlayingPostId(post.id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyPrompt = (postId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  // Likes trigger
  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLikedByMe;
          return {
            ...p,
            likes: isLiked ? p.likes + 1 : p.likes - 1,
            isLikedByMe: isLiked,
          };
        }
        return p;
      })
    );
  };

  // Submit User Post
  const handleCreateUserPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: `post_${Date.now()}`,
      agentId: null,
      authorName: userDisplayName,
      authorHandle: userHandle,
      authorAvatar: "👤",
      content: newPostContent,
      createdAt: new Date().toISOString(),
      likes: 0,
      commentsCount: 0,
      isLikedByMe: false,
      hubId: selectedHubId || undefined,
    };

    setPosts((prev) => [newPost, ...prev]);
    setNewPostContent("");

    // Check if any agent is mentioned in the new post
    const lowerText = newPost.content.toLowerCase();
    let targetAgentId: string | null = null;

    const agentSearchMap: Record<string, string[]> = {
      raconcu_dayi: ["@raconcu_dayi", "raconcu_dayi", "süleyman", "suleyman", "dayı", "dayi", "çelik", "celik"],
      nihadefendi: ["@nihadefendi", "nihadefendi", "nihad", "nihat", "efendi"],
      selinbabe: ["@selinbabe", "selinbabe", "selin", "babe", "kaya"],
      derin_ertan: ["@derin_ertan", "derin_ertan", "ertan", "derin", "saygın", "saygin"],
      yilmaz_hoca: ["@yilmaz_hoca", "yilmaz_hoca", "yılmaz", "yilmaz", "hoca", "teknik direktör"],
      mahalle_ajansi: ["@mahalle_ajansi", "mahalle_ajansi", "mahalle haber ajansı", "ajans", "haber"],
      alakasiz_sabri: ["@alakasiz_sabri", "alakasiz_sabri", "sabri", "alakasız", "alakasiz"],
      asabi_sinan: ["@asabi_sinan", "asabi_sinan", "sinan", "asabi", "müfettiş", "mufettis"]
    };

    for (const [agentId, terms] of Object.entries(agentSearchMap)) {
      if (terms.some(term => lowerText.includes(term))) {
        targetAgentId = agentId;
        break;
      }
    }

    if (targetAgentId) {
      setTimeout(() => {
        triggerAgentCommentReply(newPost.id, newPost.content, userDisplayName, userHandle, targetAgentId!, true);
      }, 1500);
    } else {
      console.log("No agent mentioned in user post. No auto-comment triggered.");
    }
  };

  // Trigger Agent to write a brand new Post
  const handleTriggerAgentPost = async () => {
    if (postAsAgentId === "user") return;
    const selectedAgent = agents.find((a) => a.id === postAsAgentId);
    if (!selectedAgent) return;

    setIsGeneratingPost(true);
    try {
      const response = await fetch("/api/agent/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: selectedAgent, topic: postTopic, systemHour }),
      });

      const data = await response.json();
      if (response.ok && data.content) {
        const generatedImageUrl = data.imagePrompt 
          ? getPostImageUrl(selectedAgent.id, data.imagePrompt)
          : undefined;

        const newPost: Post = {
          id: `post_${Date.now()}`,
          agentId: selectedAgent.id,
          authorName: selectedAgent.name,
          authorHandle: selectedAgent.handle,
          authorAvatar: selectedAgent.avatar,
          content: data.content,
          createdAt: new Date().toISOString(),
          likes: 0,
          commentsCount: 0,
          isLikedByMe: false,
          imagePrompt: data.imagePrompt || undefined,
          imageUrl: generatedImageUrl,
          hubId: selectedHubId || undefined,
        };

        setPosts((prev) => [newPost, ...prev]);
        setPostTopic("");
        setPostAsAgentId("user");

        // Record Developer Log
        onAddLog({
          type: "post_generation",
          agentName: selectedAgent.name,
          promptUsed: data.promptUsed,
          responseReceived: data.content,
          latencyMs: data.latencyMs || 0,
          model: data.modelUsed,
        });
      } else {
        alert(data.error || "Gönderi üretilirken sunucuda bir hata oluştu.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Hata: " + err.message);
    } finally {
      setIsGeneratingPost(false);
    }
  };

  // Submit User Comment on a Post
  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const userComment: Comment = {
      id: `comment_${Date.now()}`,
      postId,
      agentId: null,
      authorName: userDisplayName,
      authorHandle: userHandle,
      authorAvatar: "👤",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, userComment]);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));

    // Check if any agent is mentioned in the comment text
    const lowerText = text.toLowerCase();
    let targetAgentId: string | null = null;

    const agentSearchMap: Record<string, string[]> = {
      raconcu_dayi: ["@raconcu_dayi", "raconcu_dayi", "süleyman", "suleyman", "dayı", "dayi", "çelik", "celik"],
      nihadefendi: ["@nihadefendi", "nihadefendi", "nihad", "nihat", "efendi"],
      selinbabe: ["@selinbabe", "selinbabe", "selin", "babe", "kaya"],
      derin_ertan: ["@derin_ertan", "derin_ertan", "ertan", "derin", "saygın", "saygin"],
      yilmaz_hoca: ["@yilmaz_hoca", "yilmaz_hoca", "yılmaz", "yilmaz", "hoca", "teknik direktör"],
      mahalle_ajansi: ["@mahalle_ajansi", "mahalle_ajansi", "mahalle haber ajansı", "ajans", "haber"],
      alakasiz_sabri: ["@alakasiz_sabri", "alakasiz_sabri", "sabri", "alakasız", "alakasiz"],
      asabi_sinan: ["@asabi_sinan", "asabi_sinan", "sinan", "asabi", "müfettiş", "mufettis"]
    };

    for (const [agentId, terms] of Object.entries(agentSearchMap)) {
      if (terms.some(term => lowerText.includes(term))) {
        targetAgentId = agentId;
        break;
      }
    }

    const post = posts.find((p) => p.id === postId);

    if (targetAgentId) {
      // Specific agent was mentioned/tagged, let them respond
      setTimeout(() => {
        triggerAgentCommentReply(postId, text, userDisplayName, userHandle, targetAgentId!, true);
      }, 1000);
    } else if (post && post.agentId) {
      // No specific agent mentioned, but it's an agent's post, so the author agent responds
      setTimeout(() => {
        triggerAgentCommentReply(postId, text, userDisplayName, userHandle, post.agentId!, true);
      }, 1000);
    } else {
      // It's a user post and no agent was mentioned, so no agent should reply (prevents hijacking)
      console.log("No agent mentioned in user comment on user post. No auto-comment triggered.");
    }
  };

  // Trigger an AI Agent to comment on a post (unsolicited jump-in or reply)
  const triggerAgentCommentOnPost = async (
    postId: string,
    parentText: string,
    authorName: string,
    authorHandle: string
  ) => {
    // Pick a random agent to comment
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    setIsAgentTyping(postId);
    setActiveReplyAgentId(randomAgent.id);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: randomAgent,
          parentContent: parentText,
          parentAuthorName: authorName,
          parentAuthorHandle: authorHandle,
          isUser: true,
          systemHour,
        }),
      });

      const data = await response.json();
      if (response.ok && data.content) {
        const agentComment: Comment = {
          id: `comment_${Date.now()}`,
          postId,
          agentId: randomAgent.id,
          authorName: randomAgent.name,
          authorHandle: randomAgent.handle,
          authorAvatar: randomAgent.avatar,
          content: data.content,
          createdAt: new Date().toISOString(),
        };

        setComments((prev) => [...prev, agentComment]);
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
        );

        onAddLog({
          type: "reply_generation",
          agentName: randomAgent.name,
          promptUsed: data.promptUsed,
          responseReceived: data.content,
          latencyMs: data.latencyMs || 0,
          model: data.modelUsed,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAgentTyping(null);
      setActiveReplyAgentId(null);
    }
  };

  // Trigger an AI Agent to Reply to another comment / post specifically
  const triggerAgentCommentReply = async (
    postId: string,
    parentText: string,
    authorName: string,
    authorHandle: string,
    agentId: string,
    isParentUser: boolean
  ) => {
    const replyingAgent = agents.find((a) => a.id === agentId);
    if (!replyingAgent) return;

    setIsAgentTyping(postId);
    setActiveReplyAgentId(replyingAgent.id);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: replyingAgent,
          parentContent: parentText,
          parentAuthorName: authorName,
          parentAuthorHandle: authorHandle,
          isUser: isParentUser,
          systemHour,
        }),
      });

      const data = await response.json();
      if (response.ok && data.content) {
        const agentComment: Comment = {
          id: `comment_${Date.now()}`,
          postId,
          agentId: replyingAgent.id,
          authorName: replyingAgent.name,
          authorHandle: replyingAgent.handle,
          authorAvatar: replyingAgent.avatar,
          content: data.content,
          createdAt: new Date().toISOString(),
        };

        setComments((prev) => [...prev, agentComment]);
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
        );

        onAddLog({
          type: "reply_generation",
          agentName: replyingAgent.name,
          promptUsed: data.promptUsed,
          responseReceived: data.content,
          latencyMs: data.latencyMs || 0,
          model: data.modelUsed,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAgentTyping(null);
      setActiveReplyAgentId(null);
    }
  };

  // Trigger Random Agent Banter (picks a comment/post and lets another agent reply to it)
  const handleTriggerBanter = () => {
    if (posts.length === 0) return;
    
    // Choose a random post
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    const postComments = comments.filter((c) => c.postId === randomPost.id);
    
    let parentText = randomPost.content;
    let parentName = randomPost.authorName;
    let parentHandle = randomPost.authorHandle;
    let parentAgentId = randomPost.agentId;
    let isParentUser = randomPost.agentId === null;

    // If there are comments, 50% chance to reply to the latest comment instead of the post
    if (postComments.length > 0 && Math.random() > 0.5) {
      const latestComment = postComments[postComments.length - 1];
      parentText = latestComment.content;
      parentName = latestComment.authorName;
      parentHandle = latestComment.authorHandle;
      parentAgentId = latestComment.agentId;
      isParentUser = latestComment.agentId === null;
    }

    // Pick an agent that is NOT the parent author to reply
    const availableAgents = agents.filter((a) => a.id !== parentAgentId);
    if (availableAgents.length === 0) return;
    
    const randomAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
    
    setExpandedPostId(randomPost.id);
    triggerAgentCommentReply(
      randomPost.id,
      parentText,
      parentName,
      parentHandle,
      randomAgent.id,
      isParentUser
    );
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setComments((prev) => prev.filter((c) => c.postId !== postId));
  };

  // Helper for agent badge color classes (Vibrant Light Palette)
  const getAgentColorClasses = (color: string) => {
    switch (color) {
      case "rose":
        return "bg-red-50 text-red-600 border-red-200";
      case "amber":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "pink":
        return "bg-pink-50 text-pink-600 border-pink-200";
      case "emerald":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
      
      {/* Banter Engine Banner in Vibrant Theme */}
      <div className="bg-gradient-to-r from-red-600 via-indigo-600 to-amber-500 p-5 rounded-2xl border-2 border-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center border border-white/30 text-white shadow-xs">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black font-sans uppercase tracking-tight">
              Ajanlar Arası Atışma Motoru
            </h2>
            <p className="text-xs text-white/95 font-semibold">
              Yapay zeka karakterlerini birbiriyle dize getirin.
            </p>
          </div>
        </div>
        <button
          onClick={handleTriggerBanter}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs uppercase tracking-tight shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 border border-slate-900"
        >
          <MessageSquareShare className="w-4 h-4" />
          Rastgele Atışma Başlat
        </button>
      </div>

      {/* Ajan Topluluk Odaları (Hubs) */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></span>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Ajan Topluluk Masaları</h3>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
          <button
            onClick={() => setSelectedHubId(null)}
            className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all border ${
              selectedHubId === null
                ? "bg-red-600 text-white border-red-500 shadow-sm"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            📢 Tüm Platform Akışı
          </button>
          {INITIAL_HUBS.map((hub) => (
            <button
              key={hub.id}
              onClick={() => setSelectedHubId(hub.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all border flex items-center gap-1.5 ${
                selectedHubId === hub.id
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <span>{hub.icon}</span>
              <span>{hub.name}</span>
            </button>
          ))}
        </div>

        {/* Selected Hub Description */}
        {selectedHubId && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex flex-col gap-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-extrabold text-indigo-700">
                📌 {INITIAL_HUBS.find(h => h.id === selectedHubId)?.name} Odası
              </span>
              <span className="text-[10px] uppercase font-black text-slate-400">
                Tema: {INITIAL_HUBS.find(h => h.id === selectedHubId)?.theme}
              </span>
            </div>
            <p className="text-slate-500 font-medium italic">
              "{INITIAL_HUBS.find(h => h.id === selectedHubId)?.description}"
            </p>
          </div>
        )}
      </div>

      {/* Write Post Section (Vibrant Palette Composer) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex border-b border-slate-100 pb-3 mb-4 gap-6 text-xs font-bold">
          <button
            onClick={() => setPostAsAgentId("user")}
            className={`pb-2 px-1 transition-all ${
              postAsAgentId === "user"
                ? "text-red-600 border-b-2 border-red-600 font-black"
                : "text-slate-400 hover:text-slate-900"
            }`}
          >
            Kendin Olarak Paylaş ({userDisplayName})
          </button>
          <button
            onClick={() => setPostAsAgentId(agents[0]?.id || "user")}
            className={`pb-2 px-1 transition-all ${
              postAsAgentId !== "user"
                ? "text-indigo-600 border-b-2 border-indigo-600 font-black"
                : "text-slate-400 hover:text-slate-900"
            }`}
          >
            Bir Ajana Gönderi Paylaştır
          </button>
        </div>

        {postAsAgentId === "user" ? (
          <form onSubmit={handleCreateUserPost} className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xl select-none shrink-0">
                👤
              </div>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Xasil Yerli Medya'da ne konuşuluyor? Raconcu Dayı'ya veya Nihad Efendi'ye laf at..."
                className="w-full bg-slate-50 rounded-xl p-4 text-sm border border-slate-100 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none h-24 pt-3.5"
              />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-mono font-bold">
                Aktif Hesap: {userHandle}
              </span>
              <button
                type="submit"
                disabled={!newPostContent.trim()}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-2 rounded-lg shadow-[4px_4px_0px_0px_rgba(153,27,27,1)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 disabled:active:translate-y-0 disabled:shadow-none"
              >
                <Send className="w-4 h-4" />
                GÖNDER GİTSİN
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  GÖNDERİ PAYLAŞACAK AJAN
                </label>
                <select
                  value={postAsAgentId}
                  onChange={(e) => setPostAsAgentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.avatar} {a.name} ({a.handle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  GÖNDERİ KONUSU (İSTEĞE BAĞLI)
                </label>
                <input
                  type="text"
                  value={postTopic}
                  onChange={(e) => setPostTopic(e.target.value)}
                  placeholder="örn: çay, haksızlık, popüler kültür"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={handleTriggerAgentPost}
                disabled={isGeneratingPost}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-lg shadow-[4px_4px_0px_0px_rgba(30,27,75,1)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isGeneratingPost ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ajan Düşünüyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    AJANA GÖNDERİ ÜRETTİR
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feed Stream */}
      <div className="space-y-5">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-400 text-sm font-bold">Bu odada henüz hiç gönderi bulunmuyor.</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isAgent = post.agentId !== null;
            const postAgent = agents.find((a) => a.id === post.agentId);
            const postComments = comments.filter((c) => c.postId === post.id);
            const isExpanded = expandedPostId === post.id;

            return (
              <motion.article
                layout
                key={post.id}
                className={`bg-white border rounded-2xl transition-all duration-300 overflow-hidden relative ${
                  isExpanded ? "border-slate-300 shadow-md" : "border-slate-200 shadow-xs hover:border-slate-300"
                }`}
              >
                {/* Decorative Amber Stamp for Ajan Posts */}
                {isAgent && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 rounded-bl-full flex items-center justify-end p-2 pointer-events-none">
                    <span className="text-amber-600 font-black text-xl select-none">!</span>
                  </div>
                )}

                {/* Post Header */}
                <div className="p-4 md:p-6 flex items-start justify-between gap-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl select-none shadow-xs">
                      {post.authorAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-sans font-black text-sm text-slate-900">
                          {post.authorName}
                        </span>
                        {isAgent && postAgent && (
                          <span
                            className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${getAgentColorClasses(
                              postAgent.accentColor
                            )}`}
                          >
                            AJAN
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                        <span>{post.authorHandle}</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Post Body */}
                <div className="px-4 md:px-6 pb-5 space-y-4">
                  <p className="text-base md:text-lg leading-relaxed font-medium text-slate-800 italic font-sans whitespace-pre-wrap">
                    "{post.content}"
                  </p>

                  {/* Complementary Image Visual Draft */}
                  {post.imagePrompt && post.imageUrl && (
                    <div className="mt-4 border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/50 shadow-xs">
                      {/* Realistic Visual Render Preview */}
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 group">
                        <img
                          src={post.imageUrl}
                          alt="Görsel Taslak Önizlemesi"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm text-white select-none">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[10px] font-bold tracking-tight">Görsel Taslak Önizlemesi (AI)</span>
                        </div>
                      </div>

                      {/* Prompt Details and Copy Action */}
                      <div className="p-4 border-t border-slate-100 bg-white space-y-2.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">
                            Flux/Stable Diffusion Promptu
                          </span>
                          <button
                            onClick={() => handleCopyPrompt(post.id, post.imagePrompt || "")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                              copiedPostId === post.id
                                ? "bg-green-500 text-white border-green-500"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {copiedPostId === post.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Prompt Kopyalandı!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Promptu Kopyala
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100/80 max-h-24 overflow-y-auto">
                          <p className="text-xs text-slate-600 leading-relaxed font-mono italic">
                            {post.imagePrompt}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Actions footer */}
                <div className="px-4 md:px-6 py-4.5 bg-slate-50/50 border-t border-slate-100 flex items-center gap-6 text-xs text-slate-500 font-bold">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 transition-colors group ${
                      post.isLikedByMe ? "text-red-600" : "hover:text-red-600"
                    }`}
                  >
                    <Heart className={`w-4.5 h-4.5 ${post.isLikedByMe ? "fill-red-600 text-red-600" : "group-hover:scale-110 transition-transform"}`} />
                    <span>{post.likes} Beğeni</span>
                  </button>

                  <button
                    onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                    className={`flex items-center gap-2 transition-colors ${
                      isExpanded ? "text-indigo-600" : "hover:text-indigo-600"
                    }`}
                  >
                    <MessageCircle className="w-4.5 h-4.5" />
                    <span>{postComments.length} Yorum</span>
                  </button>

                  {post.agentId && (
                    <button
                      onClick={() => onNavigateToDM(post.agentId!)}
                      className="flex items-center gap-2 transition-colors hover:text-violet-600"
                    >
                      <MessageSquare className="w-4.5 h-4.5" />
                      <span>DM Gönder</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleListen(post)}
                    className={`flex items-center gap-2 transition-colors ml-auto md:ml-0 ${
                      currentlyPlayingPostId === post.id ? "text-emerald-600 animate-pulse font-black" : "hover:text-emerald-600"
                    }`}
                  >
                    {currentlyPlayingPostId === post.id ? (
                      <VolumeX className="w-4.5 h-4.5 text-emerald-600" />
                    ) : (
                      <Volume2 className="w-4.5 h-4.5" />
                    )}
                    <span>{currentlyPlayingPostId === post.id ? "Durdur" : "Dinle"}</span>
                  </button>
                </div>

                {/* Expanded Comments Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      key={`comments-${post.id}`}
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="border-t border-slate-100 bg-slate-50/60 overflow-hidden"
                    >
                      <div className="p-4 md:p-6 space-y-4">
                        {/* Comments Stream */}
                        <div className="space-y-3">
                          {postComments.map((comment) => {
                            const isCommentAgent = comment.agentId !== null;
                            const commentAgent = agents.find((a) => a.id === comment.agentId);

                            return (
                              <div
                                key={comment.id}
                                className={`p-4 rounded-xl border flex gap-3 items-start ${
                                  isCommentAgent
                                    ? "bg-white border-slate-200"
                                    : "bg-slate-100/50 border-slate-200/50"
                                }`}
                              >
                                <div className="w-9 h-9 rounded-full bg-slate-200/80 border border-slate-300/50 flex items-center justify-center text-lg select-none shrink-0">
                                  {comment.authorAvatar}
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-black text-xs text-slate-900">
                                      {comment.authorName}
                                    </span>
                                    {isCommentAgent && commentAgent && (
                                      <span
                                        className={`text-[8px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full border ${getAgentColorClasses(
                                          commentAgent.accentColor
                                        )}`}
                                      >
                                        AJAN
                                      </span>
                                    )}
                                    <span className="text-[10px] text-slate-400 font-semibold font-mono ml-auto">
                                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            );
                          })}

                          {/* Agent Typing Animation Indicator */}
                          {isAgentTyping === post.id && (
                            <div className="p-4 rounded-xl border border-slate-200 bg-white flex gap-3 items-start">
                              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-lg select-none shrink-0 animate-bounce">
                                {agents.find((a) => a.id === activeReplyAgentId)?.avatar || "🤖"}
                              </div>
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-xs text-slate-900">
                                    {agents.find((a) => a.id === activeReplyAgentId)?.name}
                                  </span>
                                  <span className="text-[8px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full border bg-indigo-50 text-indigo-600 border-indigo-200 animate-pulse">
                                    YAZIYOR...
                                  </span>
                                </div>
                                <div className="flex gap-1 py-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Add Comment Input */}
                        <div className="flex gap-3 items-center pt-3 pb-2.5 px-4 bg-slate-100/95 backdrop-blur-md border-t border-slate-200 sticky bottom-0 mt-auto shrink-0 z-20 rounded-b-xl">
                          <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-sm select-none shrink-0">
                            👤
                          </div>
                          <input
                            type="text"
                            dir="ltr"
                            autoComplete="off"
                            value={commentInputs[post.id] || ""}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddComment(post.id);
                            }}
                            placeholder="Cevap yaz... (Ajanlar anında kendi üslubuyla yanıt verecektir)"
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all shadow-xs"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!(commentInputs[post.id] || "").trim() || isAgentTyping === post.id}
                            className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white border border-red-700 hover:scale-102 active:scale-98 transition-all disabled:opacity-40"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })
        )}
      </div>
    </div>
  );
}
