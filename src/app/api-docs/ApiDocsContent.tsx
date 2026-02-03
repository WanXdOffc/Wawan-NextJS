"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
    ChevronDown, 
    Play, 
    Copy, 
    Check, 
    Clock, 
    Trash2,
    Sparkles,
    Link2,
    Video,
    Code2,
    Send,
    Loader2,
    Tv,
    Music,
    ImageIcon,
    Bot,
    Search,
    Globe,
    Youtube,
    Instagram,
    FileText,
    BookOpen,
    Github,
    QrCode,
    CloudSun,
    Package,
    Smartphone,
    Heart
  } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  options?: string[];
  showWhen?: { field: string; values: string[] };
  isFileUpload?: boolean;
}

interface ApiEndpoint {
  id: string;
  name: string;
  method: "GET" | "POST";
  path: string;
  category: "AI" | "Downloader" | "Tools" | "Novel" | "Stalk" | "Search";
  description: string;
  icon: React.ElementType;
  parameters: ApiParameter[];
  exampleRequest: string;
  exampleResponse: string;
  returnsImage?: boolean;
  returnsVideo?: boolean;
}

interface RequestHistory {
  id: string;
  endpoint: string;
  method: string;
  params: Record<string, string>;
  response: unknown;
  timestamp: Date;
  status: "success" | "error";
}

const apiEndpoints: ApiEndpoint[] = [
  {
    id: "gemini",
    name: "Gemini AI",
    method: "POST",
    path: "/api/ai/gemini",
    category: "AI",
    description: "Intelligent responses using Google Gemini model via advanced scraping. Supports context/sessions and system instructions.",
    icon: Bot,
    parameters: [
      {
        name: "message",
        type: "string",
        required: true,
        description: "The user message or prompt to send",
      },
      {
        name: "instruction",
        type: "string",
        required: false,
        description: "System instruction to guide AI behavior",
      },
      {
        name: "sessionId",
        type: "string",
        required: false,
        description: "Optional session ID to continue conversation",
      },
    ],
    exampleRequest: `{
  "message": "Explain quantum physics",
  "instruction": "Explain like I'm five"
}`,
    exampleResponse: `{
  "success": true,
  "text": "Quantum physics is like having a magic ball...",
  "sessionId": "eyJydXNlbWVBcnJheSI6WyIiLCIiL..."
}`,
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    method: "POST",
    path: "/api/ai/perplexity",
    category: "AI",
    description: "AI-powered search with real-time web results. Returns answers with cited sources from multiple domains (web, academic, social, finance).",
    icon: Search,
    parameters: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "The search query or question",
      },
    ],
    exampleRequest: `{
  "query": "What are the latest news in Indonesia?",
  "source": { "web": true, "social": true }
}`,
    exampleResponse: `{
  "success": true,
  "answer": "Here are the latest news from Indonesia...",
  "sources": [{ "title": "...", "url": "..." }]
}`,
  },
  {
    id: "venice",
    name: "Venice AI",
    method: "POST",
    path: "/api/ai/venice",
    category: "AI",
    description: "Chat with Dolphin 3.0 Mistral 24B model via Venice AI. Uncensored and web-enabled responses.",
    icon: Globe,
    parameters: [
      {
        name: "message",
        type: "string",
        required: true,
        description: "The message or question to send",
      },
    ],
    exampleRequest: `{
  "message": "Hi, how are you?"
}`,
    exampleResponse: `{
  "success": true,
  "text": "Hello! I'm doing great, thanks for asking..."
}`,
  },
  {
    id: "gemmy-chat",
    name: "Gemmy AI Chat (Vision)",
    method: "POST",
    path: "/api/ai/gemmy/chat",
    category: "AI",
    description: "Advanced AI with Vision capabilities. Analyze images, describe photos, extract text from images (OCR), and more using Gemini 2.5 Flash Lite.",
    icon: Bot,
    parameters: [
      {
        name: "prompt",
        type: "string",
        required: true,
        description: "The prompt or question to send",
      },
      {
        name: "media",
        type: "string",
        required: false,
        description: "Image URL (jpg/png/webp) to analyze",
      },
      {
        name: "history",
        type: "array",
        required: false,
        description: "Chat history for multi-turn conversations",
      },
    ],
    exampleRequest: `{
  "prompt": "Describe this image in detail",
  "media": "https://example.com/photo.jpg"
}`,
    exampleResponse: `{
  "success": true,
  "reply": "This image shows a beautiful sunset over the ocean...",
  "history": [...]
}`,
  },
  {
    id: "gemmy-file",
    name: "Gemmy AI File Reader",
    method: "POST",
    path: "/api/ai/gemmy/file",
    category: "AI",
    description: "Read and analyze documents/files. Upload text files, code, JSON, or any text-based content for AI analysis, summarization, or Q&A.",
    icon: Code2,
    parameters: [
      {
        name: "prompt",
        type: "string",
        required: true,
        description: "Question or instruction about the file",
      },
      {
        name: "fileContent",
        type: "string",
        required: true,
        description: "File content as text or Base64 encoded",
        isFileUpload: true,
      },
      {
        name: "fileName",
        type: "string",
        required: false,
        description: "Original filename for context",
      },
    ],
    exampleRequest: `{
  "prompt": "Summarize this code and explain what it does",
  "fileContent": "function hello() { return 'world'; }",
  "fileName": "example.js"
}`,
    exampleResponse: `{
  "success": true,
  "reply": "This is a simple JavaScript function named 'hello' that returns the string 'world'...",
  "history": [...]
}`,
  },
  {
    id: "gemmy-image",
    name: "Gemmy AI Image",
    method: "POST",
    path: "/api/ai/gemmy/image",
    category: "AI",
    description: "High-speed image generation using Imagen 4.0 Fast. Generate creative visuals from text prompts.",
    icon: ImageIcon,
    returnsImage: true,
    parameters: [
      {
        name: "prompt",
        type: "string",
        required: true,
        description: "Text description of the image to generate",
      },
      {
        name: "aspectRatio",
        type: "select",
        required: false,
        description: "Image aspect ratio",
        options: ["1:1", "4:3", "3:4", "16:9", "9:16"],
      },
    ],
    exampleRequest: `{
  "prompt": "A futuristic city with flying cars",
  "aspectRatio": "16:9"
}`,
    exampleResponse: `{
  "success": true,
  "url": "https://api.cloudsky.biz.id/file?key=...",
  "safetyAttributes": {...}
}`,
  },
  {
    id: "claude",
    name: "Claude AI",
    method: "GET",
    path: "/api/ai/claude",
    category: "AI",
    description: "Generate AI responses using Claude 3 Haiku model. Quick and intelligent responses for any text prompt.",
    icon: Sparkles,
    parameters: [
      {
        name: "text",
        type: "string",
        required: true,
        description: "The prompt or question to send to Claude AI",
      },
    ],
    exampleRequest: `/api/ai/claude?text=Hello, how are you?`,
    exampleResponse: `{
  "success": true,
  "result": "Hello! I'm doing well, thank you for asking...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}`,
  },
  {
    id: "tiktok",
    name: "TikTok Downloader",
    method: "GET",
    path: "/api/dl/tiktok",
    category: "Downloader",
    description: "Download TikTok videos without watermark. Returns video, audio, and author metadata.",
    icon: Video,
    returnsVideo: true,
    parameters: [
      {
        name: "url",
        type: "string",
        required: true,
        description: "The TikTok video URL to download",
      },
    ],
    exampleRequest: `/api/dl/tiktok?url=https://www.tiktok.com/@user/video/123456789`,
    exampleResponse: `{
  "success": true,
  "result": {
    "author": "@username",
    "thumbnail": "https://...",
    "video": "https://...",
    "audio": "https://..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}`,
  },
  {
    id: "tiktok-v2",
    name: "TikTok Downloader V2",
    method: "GET",
    path: "/api/dl/tiktok-v2",
    category: "Downloader",
    description: "Advanced TikTok downloader with multiple quality options: HD, No Watermark, With Watermark, and Audio-only downloads.",
    icon: Video,
    returnsVideo: true,
    parameters: [
      {
        name: "url",
        type: "string",
        required: true,
        description: "The TikTok video URL to download",
      },
    ],
    exampleRequest: `/api/dl/tiktok-v2?url=https://www.tiktok.com/@user/video/123456789`,
    exampleResponse: `{
  "success": true,
  "result": {
    "title": "Video description...",
    "author": { "username": "@user", "avatar": "https://..." },
    "cover": "https://...",
    "downloads": [
      { "type": "hd", "label": "Download HD", "url": "..." },
      { "type": "nowm", "label": "No Watermark", "url": "..." },
      { "type": "wm", "label": "With Watermark", "url": "..." },
      { "type": "audio", "label": "MP3 Audio", "url": "..." }
    ]
  }
}`,
  },
  {
    id: "spotify",
    name: "Spotify Downloader",
    method: "GET",
    path: "/api/spotify/download",
    category: "Downloader",
    description: "Download audio from Spotify tracks. Provide a track URL and get a downloadable MP3 link.",
    icon: Music,
    parameters: [
      {
        name: "url",
        type: "string",
        required: true,
        description: "Spotify track URL",
      },
    ],
    exampleRequest: `/api/spotify/download?url=https://open.spotify.com/track/...`,
    exampleResponse: `{
  "author": "Wanyzx",
  "success": true,
  "download": "https://yoursite.com/uploads/abc123.mp3",
  "filename": "abc123.mp3"
}`,
  },
  {
    id: "youtube",
    name: "YouTube Downloader",
    method: "GET",
    path: "/api/dl/youtube",
    category: "Downloader",
    description: "Download YouTube videos in multiple formats and qualities. Supports MP3 audio and video from 144p to 1080p.",
    icon: Youtube,
    returnsVideo: true,
    parameters: [
      {
        name: "url",
        type: "string",
        required: true,
        description: "YouTube video URL (supports youtube.com, youtu.be, shorts)",
      },
      {
        name: "format",
        type: "select",
        required: false,
        description: "Download format/quality (default: mp3)",
        options: ["mp3", "144", "240", "360", "480", "720", "1080"],
      },
    ],
    exampleRequest: `/api/dl/youtube?url=https://youtube.com/watch?v=dQw4w9WgXcQ&format=720`,
    exampleResponse: `{
  "success": true,
  "data": {
    "title": "Video Title",
    "format": "720",
    "thumbnail": "https://i.ytimg.com/vi/.../hqdefault.jpg",
    "duration": 212,
    "downloadUrl": "https://..."
  }
}`,
  },
  {
    id: "instagram",
    name: "Instagram Downloader",
    method: "GET",
    path: "/api/dl/instagram",
    category: "Downloader",
    description: "Download Instagram Reels with complete metadata. Returns video tracks in multiple qualities, audio tracks, thumbnails, and author info.",
    icon: Instagram,
    returnsVideo: true,
    parameters: [
      {
        name: "url",
        type: "string",
        required: true,
        description: "Instagram Reel URL (e.g., instagram.com/reel/...)",
      },
    ],
    exampleRequest: `/api/dl/instagram?url=https://www.instagram.com/reel/DTqfnA0gc1U/`,
    exampleResponse: `{
  "success": true,
  "result": {
    "metadata": {
      "id": "...",
      "code": "DTqfnA0gc1U",
      "caption": "Video caption...",
      "createTime": "2024-01-15T10:30:00.000Z"
    },
    "author": {
      "username": "@user",
      "fullName": "Full Name",
      "profilePic": "https://...",
      "verified": true
    },
    "media": {
      "thumbnails": [{ "url": "...", "resolution": "1080x1920" }],
      "videos": [{ "url": "...", "resolution": "720x1280", "qualityLabel": "720p" }],
      "audios": [{ "url": "...", "bandwidth": 128000 }]
    }
  }
}`,
  },
  {
    id: "shorturl",
    name: "Short URL",
    method: "GET",
    path: "/api/tools/shorturl",
    category: "Tools",
    description: "Shorten long URLs using is.gd or tinu.be providers. Reliable and fast URL redirection.",
    icon: Link2,
    parameters: [
      {
        name: "url",
        type: "string",
        required: true,
        description: "The long URL to shorten",
      },
      {
        name: "provider",
        type: "string",
        required: false,
        description: "Provider: 'isgd' (default) or 'tinube'",
        options: ["isgd", "tinube"],
      },
    ],
    exampleRequest: `/api/tools/shorturl?url=https://google.com&provider=isgd`,
    exampleResponse: `{
  "success": true,
  "result": "https://is.gd/abc123",
  "originalUrl": "https://google.com",
  "provider": "isgd"
}`,
  },
  {
    id: "gpt-image",
    name: "GPT Image",
    method: "POST",
    path: "/api/tools/gpt-image",
    category: "Tools",
    description: "Process images with GPT-Image AI. Send an image URL and a prompt to get AI-generated image results.",
    icon: ImageIcon,
    returnsImage: true,
    parameters: [
      {
        name: "imageUrl",
        type: "string",
        required: true,
        description: "URL of the image to process",
      },
      {
        name: "prompt",
        type: "string",
        required: true,
        description: "What to do with the image (e.g., 'Make it Ghibli style')",
      },
    ],
    exampleRequest: `{
  "imageUrl": "https://example.com/photo.jpg",
  "prompt": "Make it Ghibli style"
}`,
    exampleResponse: `{
  "success": true,
  "image": "base64_result_data..."
}`,
  },
  {
    id: "anime",
    name: "Anime API",
    method: "GET",
    path: "/api/anime",
    category: "Tools",
    description: "Comprehensive Anime database. Search, stream, and explore genres/episodes.",
    icon: Tv,
    returnsVideo: true,
    parameters: [
      {
        name: "action",
        type: "select",
        required: true,
        description: "Action to perform",
        options: ["homepage", "search", "detail", "stream", "genres", "list"],
      },
      {
        name: "q",
        type: "string",
        required: true,
        description: "Search query",
        showWhen: { field: "action", values: ["search"] },
      },
      {
        name: "id",
        type: "string",
        required: true,
        description: "Anime ID",
        showWhen: { field: "action", values: ["detail", "stream"] },
      },
      {
        name: "epsid",
        type: "string",
        required: true,
        description: "Episode ID",
        showWhen: { field: "action", values: ["stream"] },
      },
      {
        name: "type",
        type: "select",
        required: false,
        description: "Anime type",
        options: ["series", "movie", "ova", "live-action"],
        showWhen: { field: "action", values: ["list"] },
      },
      {
        name: "genre",
        type: "string",
        required: false,
        description: "Genre filter (e.g., action, romance)",
        showWhen: { field: "action", values: ["list"] },
      },
      {
        name: "page",
        type: "string",
        required: false,
        description: "Page number (default: 0)",
        showWhen: { field: "action", values: ["search", "list"] },
      },
      {
        name: "count",
        type: "string",
        required: false,
        description: "Items per page (default: 15)",
        showWhen: { field: "action", values: ["search", "list"] },
      },
      {
        name: "quality",
        type: "select",
        required: false,
        description: "Stream quality",
        options: ["HD", "SD"],
        showWhen: { field: "action", values: ["stream"] },
      },
    ],
    exampleRequest: `/api/anime?action=search&q=naruto`,
    exampleResponse: `{
  "success": true,
  "data": [...]
}`,
  },
  {
    id: "sakuranovel",
    name: "SakuraNovel API",
    method: "GET",
    path: "/api/novel/sakuranovel",
    category: "Novel",
    description: "Light novel scraper from SakuraNovel. Search novels, get details, and read chapters.",
    icon: BookOpen,
    parameters: [
      {
        name: "action",
        type: "select",
        required: true,
        description: "Action to perform",
        options: ["search", "detail", "chapter"],
      },
      {
        name: "q",
        type: "string",
        required: true,
        description: "Search query",
        showWhen: { field: "action", values: ["search"] },
      },
      {
        name: "url",
        type: "string",
        required: true,
        description: "Novel or chapter URL from SakuraNovel",
        showWhen: { field: "action", values: ["detail", "chapter"] },
      },
    ],
    exampleRequest: `/api/novel/sakuranovel?action=search&q=osananajimi`,
    exampleResponse: `{
  "success": true,
  "data": [
    {
      "title": "Osananajimi ga...",
      "cover": "https://...",
      "type": "Light Novel",
      "status": "Ongoing",
      "url": "https://sakuranovel.id/series/..."
    }
  ]
}`,
  },
  {
    id: "gpt3",
    name: "GPT-3 AI",
    method: "GET",
    path: "/api/ai/gpt3",
    category: "AI",
    description: "Free GPT-3 AI chat. Send prompts and get intelligent responses.",
    icon: Bot,
    parameters: [
      {
        name: "prompt",
        type: "string",
        required: true,
        description: "The prompt or question to send",
      },
      {
        name: "system",
        type: "string",
        required: false,
        description: "System instruction (default: helpful assistant)",
      },
    ],
    exampleRequest: `/api/ai/gpt3?prompt=Hello&system=You are helpful`,
    exampleResponse: `{
  "author": "Wanyzx",
  "success": true,
  "data": "Hello! How can I help you today?"
}`,
  },
  {
    id: "github",
    name: "GitHub API",
    method: "GET",
    path: "/api/tools/github",
    category: "Stalk",
    description: "GitHub stalker and downloader. Get user profiles, download repo/file/gist data.",
    icon: Github,
    parameters: [
      {
        name: "action",
        type: "select",
        required: true,
        description: "Action to perform",
        options: ["stalk", "download"],
      },
      {
        name: "username",
        type: "string",
        required: true,
        description: "GitHub username",
        showWhen: { field: "action", values: ["stalk"] },
      },
      {
        name: "url",
        type: "string",
        required: true,
        description: "GitHub URL (repo, file, or gist)",
        showWhen: { field: "action", values: ["download"] },
      },
    ],
    exampleRequest: `/api/tools/github?action=stalk&username=octocat`,
    exampleResponse: `{
  "author": "Wanyzx",
  "success": true,
  "data": {
    "username": "octocat",
    "followers": 12345,
    "public_repo": 8
  }
}`,
  },
  {
    id: "qrcode",
    name: "QR Code Generator",
    method: "GET",
    path: "/api/tools/qrcode",
    category: "Tools",
    description: "Generate QR codes from text or URLs. Returns PNG image directly.",
    icon: QrCode,
    returnsImage: true,
    parameters: [
      {
        name: "text",
        type: "string",
        required: true,
        description: "Text or URL to encode as QR code",
      },
    ],
    exampleRequest: `/api/tools/qrcode?text=https://github.com`,
    exampleResponse: `[PNG Image]`,
  },
  {
    id: "igstalk",
    name: "Instagram Stalker",
    method: "GET",
    path: "/api/tools/igstalk",
    category: "Stalk",
    description: "Get Instagram profile info including bio, followers, posts, and more.",
    icon: Instagram,
    parameters: [
      {
        name: "username",
        type: "string",
        required: true,
        description: "Instagram username",
      },
    ],
    exampleRequest: `/api/tools/igstalk?username=instagram`,
    exampleResponse: `{
  "author": "Wanyzx",
  "success": true,
  "data": {
    "username": "instagram",
    "followers": 1000000,
    "is_verified": true
  }
}`,
  },
  {
    id: "waifu",
    name: "Random Waifu",
    method: "GET",
    path: "/api/tools/waifu",
    category: "Tools",
    description: "Get random anime waifu images.",
    icon: Heart,
    returnsImage: true,
    parameters: [],
    exampleRequest: `/api/tools/waifu`,
    exampleResponse: `{
  "author": "Wanyzx",
  "success": true,
  "data": {
    "url": "https://...",
    "base64": "..."
  }
}`,
  },
  {
    id: "brat",
    name: "Brat Generator",
    method: "GET",
    path: "/api/tools/brat",
    category: "Tools",
    description: "Generate Brat-style images. Supports static PNG and animated GIF.",
    icon: ImageIcon,
    returnsImage: true,
    parameters: [
      {
        name: "text",
        type: "string",
        required: true,
        description: "Text to render (max 10 words)",
      },
      {
        name: "animated",
        type: "select",
        required: false,
        description: "Create animated GIF",
        options: ["true", "false"],
      },
      {
        name: "delay",
        type: "string",
        required: false,
        description: "Animation delay in ms (default: 500)",
      },
    ],
    exampleRequest: `/api/tools/brat?text=hello world&animated=true`,
    exampleResponse: `[PNG/GIF Image]`,
  },
  {
    id: "cuaca",
    name: "Cuaca Indonesia",
    method: "GET",
    path: "/api/tools/cuaca",
    category: "Tools",
    description: "Weather forecast for Indonesia from BMKG. Search by location name.",
    icon: CloudSun,
    parameters: [
      {
        name: "action",
        type: "select",
        required: false,
        description: "Action (default: weather)",
        options: ["search", "weather"],
      },
      {
        name: "q",
        type: "string",
        required: true,
        description: "Location name (e.g., Jakarta, Bali)",
      },
    ],
    exampleRequest: `/api/tools/cuaca?q=Jakarta`,
    exampleResponse: `{
  "author": "Wanyzx",
  "success": true,
  "data": {
    "wilayah": { "nama": "Jakarta" },
    "weather": [...]
  }
}`,
  },
  {
    id: "resi",
    name: "Cek Resi",
    method: "GET",
    path: "/api/tools/resi",
    category: "Tools",
    description: "Track package shipments. Supports JNE, J&T, SiCepat, and more.",
    icon: Package,
    parameters: [
      {
        name: "action",
        type: "select",
        required: false,
        description: "Action to perform",
        options: ["track", "couriers", "search"],
      },
      {
        name: "resi",
        type: "string",
        required: true,
        description: "Tracking number",
        showWhen: { field: "action", values: ["track"] },
      },
      {
        name: "courier",
        type: "string",
        required: true,
        description: "Courier name (e.g., jne, jnt)",
        showWhen: { field: "action", values: ["track"] },
      },
      {
        name: "q",
        type: "string",
        required: true,
        description: "Search keyword",
        showWhen: { field: "action", values: ["search"] },
      },
    ],
    exampleRequest: `/api/tools/resi?action=track&resi=123456&courier=jne`,
    exampleResponse: `{
  "author": "Wanyzx",
  "success": true,
  "data": {
    "courier": "JNE",
    "status": "Delivered",
    "history": [...]
  }
}`,
  },
  {
    id: "an1",
    name: "AN1 APK Search",
    method: "GET",
    path: "/api/tools/an1",
    category: "Search",
    description: "Search Android APK/MOD from AN1.com. Find apps and games.",
    icon: Smartphone,
    parameters: [
      {
        name: "q",
        type: "string",
        required: true,
        description: "App name to search",
      },
    ],
    exampleRequest: `/api/tools/an1?q=pou`,
    exampleResponse: `{
  "author": "Wanyzx",
  "success": true,
  "data": [
      {
        "title": "Pou",
        "developer": "...",
        "type": "MOD"
      }
    ]
  }`,
  },
  {
    id: "pinterest",
    name: "Pinterest Search",
    method: "GET",
    path: "/api/search/pinterest",
    category: "Search",
    description: "Search images from Pinterest. Returns original quality image URLs. Note: Results may vary in relevance.",
    icon: ImageIcon,
    returnsImage: true,
    parameters: [
      {
        name: "q",
        type: "string",
        required: true,
        description: "Search query (e.g., anime wallpaper, nature)",
      },
      {
        name: "limit",
        type: "select",
        required: false,
        description: "Number of images to return (default: 10)",
        options: ["5", "10", "15", "20", "25", "30", "40", "50"],
      },
    ],
    exampleRequest: `/api/search/pinterest?q=anime wallpaper&limit=10`,
    exampleResponse: `{
  "author": "Wanyzx",
  "success": true,
  "query": "anime wallpaper",
  "limit": 10,
  "total": 10,
  "data": [
    "https://i.pinimg.com/originals/...",
    "https://i.pinimg.com/originals/..."
  ]
}`,
  },
];

export function ApiDocsContent() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, "overview" | "try">>({});
  const [inputValues, setInputValues] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const [imageGallery, setImageGallery] = useState<Record<string, string[]>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleEndpoint = (id: string) => {
    setExpandedEndpoint(expandedEndpoint === id ? null : id);
    if (!activeTab[id]) {
      setActiveTab((prev) => ({ ...prev, [id]: "overview" }));
    }
  };

  const handleInputChange = (endpointId: string, paramName: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [endpointId]: {
        ...prev[endpointId],
        [paramName]: value,
      },
    }));
  };

  const shouldShowParam = (endpointId: string, param: ApiParameter): boolean => {
    if (!param.showWhen) return true;
    const currentValue = inputValues[endpointId]?.[param.showWhen.field] || "";
    return param.showWhen.values.includes(currentValue);
  };

  const getVisibleParams = (endpoint: ApiEndpoint): ApiParameter[] => {
    return endpoint.parameters.filter((param) => shouldShowParam(endpoint.id, param));
  };

  const handleTryApi = async (endpoint: ApiEndpoint) => {
    const params = inputValues[endpoint.id] || {};
    const visibleParams = getVisibleParams(endpoint);
    
    const missingParams = visibleParams
      .filter((p) => p.required && !params[p.name])
      .map((p) => p.name);

    if (missingParams.length > 0) {
      setResponses((prev) => ({
        ...prev,
        [endpoint.id]: { error: `Missing required parameters: ${missingParams.join(", ")}` },
      }));
      return;
    }

    setLoading((prev) => ({ ...prev, [endpoint.id]: true }));

      try {
        let response;
        const filteredParams: Record<string, string> = {};
        visibleParams.forEach((p) => {
          if (params[p.name]) {
            filteredParams[p.name] = params[p.name];
          }
        });

        if (endpoint.method === "GET") {
          const queryParams = new URLSearchParams(filteredParams).toString();
          const url = `${endpoint.path}?${queryParams}`;
          response = await fetch(url);
        } else {
          response = await fetch(endpoint.path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filteredParams),
          });
        }
        
        const contentType = response.headers.get("content-type") || "";
        
        if (contentType.includes("image/")) {
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          setImageUrls((prev) => ({ ...prev, [endpoint.id]: imageUrl }));
          const data = { success: true, message: "Image generated successfully", contentType };
          setResponses((prev) => ({ ...prev, [endpoint.id]: data }));

          setHistory((prev) => [
            {
              id: Date.now().toString(),
              endpoint: endpoint.name,
              method: endpoint.method,
              params: filteredParams,
              response: data,
              timestamp: new Date(),
              status: "success",
            },
            ...prev.slice(0, 9),
          ]);
        } else {
          const data = await response.json();
          setResponses((prev) => ({ ...prev, [endpoint.id]: data }));

          if (endpoint.returnsImage && data.url) {
              setImageUrls((prev) => ({ ...prev, [endpoint.id]: data.url }));
            } else if (endpoint.returnsImage && data.data?.url) {
              setImageUrls((prev) => ({ ...prev, [endpoint.id]: data.data.url }));
            } else if (endpoint.returnsImage && data.image) {
              const base64Url = data.image.startsWith("data:") 
                ? data.image 
                : `data:image/png;base64,${data.image}`;
              setImageUrls((prev) => ({ ...prev, [endpoint.id]: base64Url }));
            } else if (endpoint.returnsImage && data.data?.base64) {
              const base64Url = `data:image/png;base64,${data.data.base64}`;
              setImageUrls((prev) => ({ ...prev, [endpoint.id]: base64Url }));
            }

            const thumbnailUrl = data.result?.thumbnail || data.result?.cover || 
                data.data?.thumbnail || data.data?.cover ||
                data.data?.avatar_url || data.data?.avatar ||
                data.data?.poster || data.data?.image ||
                (Array.isArray(data.data) && data.data[0]?.cover) ||
                (Array.isArray(data.data) && data.data[0]?.thumbnail) ||
                (Array.isArray(data.data) && data.data[0]?.poster);
              if (thumbnailUrl) {
                setImageUrls((prev) => ({ ...prev, [endpoint.id]: thumbnailUrl }));
              }

              if (endpoint.id === "pinterest" && Array.isArray(data.data)) {
                setImageGallery((prev) => ({ ...prev, [endpoint.id]: data.data }));
              }

            if (endpoint.returnsVideo) {
              const videoUrl = data.result?.video || 
                data.result?.downloads?.find((d: { type: string; url: string }) => d.type === 'nowm' || d.type === 'hd')?.url ||
                data.data?.downloadUrl ||
                data.data?.url ||
                data.data?.streamUrl ||
                data.result?.tracks?.find((t: { type: string; url: string }) => t.type === 'video')?.url;
              if (videoUrl) {
                setVideoUrls((prev) => ({ ...prev, [endpoint.id]: videoUrl }));
              }
            }

          setHistory((prev) => [
            {
              id: Date.now().toString(),
              endpoint: endpoint.name,
              method: endpoint.method,
              params: filteredParams,
              response: data,
              timestamp: new Date(),
              status: data.success !== false ? "success" : "error",
            },
            ...prev.slice(0, 9),
          ]);
        }
      } catch (error) {
      const errorResponse = { error: "Request failed", details: String(error) };
      setResponses((prev) => ({ ...prev, [endpoint.id]: errorResponse }));
      
      setHistory((prev) => [
        {
          id: Date.now().toString(),
          endpoint: endpoint.name,
          method: endpoint.method,
          params,
          response: errorResponse,
          timestamp: new Date(),
          status: "error",
        },
        ...prev.slice(0, 9),
      ]);
    } finally {
      setLoading((prev) => ({ ...prev, [endpoint.id]: false }));
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearHistory = () => setHistory([]);

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "POST":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const categories = ["AI", "Search", "Stalk", "Downloader", "Tools", "Novel"] as const;

  const handleFileUpload = (endpointId: string, paramName: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      handleInputChange(endpointId, paramName, content);
      handleInputChange(endpointId, "fileName", file.name);
    };
    reader.readAsText(file);
  };

  const renderParamInput = (endpoint: ApiEndpoint, param: ApiParameter) => {
    const value = inputValues[endpoint.id]?.[param.name] || "";

    if (param.isFileUpload) {
      return (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="file"
              id={`file-${endpoint.id}-${param.name}`}
              accept=".txt,.js,.ts,.jsx,.tsx,.json,.md,.py,.html,.css,.xml,.yaml,.yml,.csv,.sql,.sh,.bash,.php,.rb,.java,.c,.cpp,.h,.go,.rs,.swift,.kt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(endpoint.id, param.name, file);
              }}
              className="hidden"
            />
            <label
              htmlFor={`file-${endpoint.id}-${param.name}`}
              className="flex items-center justify-center gap-3 w-full h-24 bg-background/50 rounded-2xl border-2 border-dashed border-border hover:border-primary transition-all cursor-pointer group"
            >
              <div className="text-center">
                <Code2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {value ? "File loaded - Click to change" : "Click to upload file"}
                </span>
              </div>
            </label>
          </div>
          {value && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
              File loaded: {inputValues[endpoint.id]?.["fileName"] || "unknown"} ({value.length} chars)
            </div>
          )}
          <Textarea
            placeholder="Or paste file content directly here..."
            value={value}
            onChange={(e) => handleInputChange(endpoint.id, param.name, e.target.value)}
            rows={4}
            className="bg-background/50 rounded-2xl border-2 focus:border-primary transition-all resize-none font-mono text-xs"
          />
        </div>
      );
    }

    if (param.type === "select" && param.options) {
      return (
        <select
          value={value}
          onChange={(e) => handleInputChange(endpoint.id, param.name, e.target.value)}
          className="w-full h-12 px-4 bg-background/50 rounded-2xl border-2 border-border focus:border-primary transition-all outline-none"
        >
          <option value="">Select {param.name}...</option>
          {param.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (param.options && param.type !== "select") {
      return (
        <select
          value={value}
          onChange={(e) => handleInputChange(endpoint.id, param.name, e.target.value)}
          className="w-full h-12 px-4 bg-background/50 rounded-2xl border-2 border-border focus:border-primary transition-all outline-none"
        >
          <option value="">Select {param.name}...</option>
          {param.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (["message", "text", "instruction", "prompt", "query"].includes(param.name)) {
      return (
        <Textarea
          placeholder={param.description}
          value={value}
          onChange={(e) => handleInputChange(endpoint.id, param.name, e.target.value)}
          rows={3}
          className="bg-background/50 rounded-2xl border-2 focus:border-primary transition-all resize-none"
        />
      );
    }

    return (
      <Input
        placeholder={param.description}
        value={value}
        onChange={(e) => handleInputChange(endpoint.id, param.name, e.target.value)}
        className="h-12 bg-background/50 rounded-2xl border-2 focus:border-primary transition-all"
      />
    );
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              API <span className="gradient-text">Documentation</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Explore and test our collection of free APIs
            </p>
            <Link href="/donate">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-block"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 rounded-full blur-lg opacity-50"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <Button
                  className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-600 hover:via-rose-600 hover:to-pink-600 text-white font-bold rounded-full px-8 py-3 shadow-lg shadow-pink-500/30 border border-pink-400/20"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <Heart className="w-5 h-5 mr-2 fill-current" />
                  </motion.div>
                  <span className="relative">
                    Support Us
                    <motion.span
                      className="absolute -top-1 -right-2"
                      animate={{ 
                        rotate: [0, 15, -15, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                    </motion.span>
                  </span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>

        {categories.map((category) => {
          const categoryEndpoints = apiEndpoints.filter(e => e.category === category);
          if (categoryEndpoints.length === 0) return null;

          return (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm">
                  {category[0]}
                </span>
                {category}
              </h2>
              <div className="space-y-4">
                {categoryEndpoints.map((endpoint, index) => (
                  <motion.div
                    key={endpoint.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div
                      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                        expandedEndpoint === endpoint.id
                          ? "border-primary/50 bg-card ring-1 ring-primary/20 shadow-lg shadow-primary/10"
                          : "border-border bg-card/50 hover:border-primary/30"
                      }`}
                    >
                      <button
                        onClick={() => toggleEndpoint(endpoint.id)}
                        className="w-full p-4 flex items-center gap-4 text-left"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                          <endpoint.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-black border uppercase tracking-wider ${getMethodColor(
                                endpoint.method
                              )}`}
                            >
                              {endpoint.method}
                            </span>
                            <span className="font-bold text-lg">{endpoint.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {endpoint.path}
                          </p>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                            expandedEndpoint === endpoint.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {expandedEndpoint === endpoint.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="px-4 pb-4">
                              <div className="flex gap-2 mb-4 border-b border-border">
                                <button
                                  onClick={() =>
                                    setActiveTab((prev) => ({ ...prev, [endpoint.id]: "overview" }))
                                  }
                                  className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
                                    activeTab[endpoint.id] === "overview" || !activeTab[endpoint.id]
                                      ? "border-primary text-primary"
                                      : "border-transparent text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  <Code2 className="w-4 h-4 inline mr-2" />
                                  Overview
                                </button>
                                <button
                                  onClick={() =>
                                    setActiveTab((prev) => ({ ...prev, [endpoint.id]: "try" }))
                                  }
                                  className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
                                    activeTab[endpoint.id] === "try"
                                      ? "border-primary text-primary"
                                      : "border-transparent text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  <Play className="w-4 h-4 inline mr-2" />
                                  Try It
                                </button>
                              </div>

                              {(activeTab[endpoint.id] === "overview" || !activeTab[endpoint.id]) && (
                                <div className="space-y-6">
                                  <p className="text-muted-foreground leading-relaxed">{endpoint.description}</p>

                                  <div>
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Parameters</h4>
                                    <div className="space-y-2">
                                      {endpoint.parameters.map((param) => (
                                        <div
                                          key={param.name}
                                          className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50"
                                        >
                                          <code className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-sm font-mono font-bold">
                                            {param.name}
                                          </code>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-3 flex-wrap">
                                              <span className="text-xs font-medium text-muted-foreground uppercase">
                                                {param.type}
                                              </span>
                                              {param.required && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-bold border border-red-500/20 uppercase">
                                                  required
                                                </span>
                                              )}
                                              {param.showWhen && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 font-bold border border-yellow-500/20 uppercase">
                                                  when {param.showWhen.field}={param.showWhen.values.join("|")}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                              {param.description}
                                            </p>
                                            {param.options && (
                                              <p className="text-xs text-muted-foreground/70 mt-1">
                                                Options: {param.options.join(", ")}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Example Request</h4>
                                        <button
                                          onClick={() =>
                                            copyToClipboard(endpoint.exampleRequest, `req-${endpoint.id}`)
                                          }
                                          className="p-2 rounded-xl hover:bg-accent transition-all hover:scale-110"
                                        >
                                          {copiedId === `req-${endpoint.id}` ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                          ) : (
                                            <Copy className="w-4 h-4" />
                                          )}
                                        </button>
                                      </div>
                                      <pre className="p-4 rounded-2xl bg-black/40 text-sm overflow-x-auto border border-border/50 font-mono">
                                        {endpoint.exampleRequest}
                                      </pre>
                                    </div>
                                    <div>
                                      <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Example Response</h4>
                                        <button
                                          onClick={() =>
                                            copyToClipboard(endpoint.exampleResponse, `res-${endpoint.id}`)
                                          }
                                          className="p-2 rounded-xl hover:bg-accent transition-all hover:scale-110"
                                        >
                                          {copiedId === `res-${endpoint.id}` ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                          ) : (
                                            <Copy className="w-4 h-4" />
                                          )}
                                        </button>
                                      </div>
                                      <pre className="p-4 rounded-2xl bg-black/40 text-sm overflow-x-auto border border-border/50 font-mono">
                                        {endpoint.exampleResponse}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {activeTab[endpoint.id] === "try" && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Input Parameters</h4>
                                      <div className="space-y-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
                                        {getVisibleParams(endpoint).map((param) => (
                                          <div key={param.name} className="space-y-1.5">
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                                              {param.name}
                                              {param.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            {renderParamInput(endpoint, param)}
                                          </div>
                                        ))}
                                        {getVisibleParams(endpoint).length === 0 && (
                                          <p className="text-sm text-muted-foreground italic text-center py-4">
                                            No parameters required for this endpoint.
                                          </p>
                                        )}
                                        <Button
                                          onClick={() => handleTryApi(endpoint)}
                                          disabled={loading[endpoint.id]}
                                          className="w-full h-12 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20"
                                        >
                                          {loading[endpoint.id] ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                          ) : (
                                            <Send className="w-5 h-5" />
                                          )}
                                          {loading[endpoint.id] ? "SENDING..." : "EXECUTE REQUEST"}
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Response</h4>
                                        {responses[endpoint.id] && (
                                          <button
                                            onClick={() => copyToClipboard(JSON.stringify(responses[endpoint.id], null, 2), `res-val-${endpoint.id}`)}
                                            className="p-2 rounded-xl hover:bg-accent transition-all"
                                          >
                                            {copiedId === `res-val-${endpoint.id}` ? (
                                              <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                              <Copy className="w-4 h-4" />
                                            )}
                                          </button>
                                        )}
                                      </div>
                                      
                                      <div className="space-y-4">
                                        <div className="relative group">
                                          <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                          <pre className="relative p-6 rounded-2xl bg-black/60 border border-border/50 text-sm overflow-x-auto max-h-[400px] custom-scrollbar font-mono">
                                            {responses[endpoint.id] 
                                              ? JSON.stringify(responses[endpoint.id], null, 2)
                                              : "// Response will appear here after execution..."
                                            }
                                          </pre>
                                        </div>

                                        {/* Visual Preview Section */}
                                        <AnimatePresence>
                                          {imageUrls[endpoint.id] && (
                                            <motion.div
                                              initial={{ opacity: 0, scale: 0.95 }}
                                              animate={{ opacity: 1, scale: 1 }}
                                              className="space-y-3"
                                            >
                                              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <ImageIcon className="w-3 h-3" /> Visual Preview
                                              </h4>
                                              <div className="relative group rounded-2xl overflow-hidden border border-border/50 bg-black/40">
                                                <img 
                                                  src={imageUrls[endpoint.id]} 
                                                  alt="Result Preview" 
                                                  className="w-full h-auto max-h-[300px] object-contain mx-auto"
                                                />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-full font-bold"
                                                    onClick={() => window.open(imageUrls[endpoint.id], '_blank')}
                                                  >
                                                    View Full Image
                                                  </Button>
                                                </div>
                                              </div>
                                            </motion.div>
                                          )}

                                          {videoUrls[endpoint.id] && (
                                            <motion.div
                                              initial={{ opacity: 0, scale: 0.95 }}
                                              animate={{ opacity: 1, scale: 1 }}
                                              className="space-y-3"
                                            >
                                              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <Video className="w-3 h-3" /> Video Preview
                                              </h4>
                                              <div className="rounded-2xl overflow-hidden border border-border/50 bg-black/40 aspect-video">
                                                <video 
                                                  src={videoUrls[endpoint.id]} 
                                                  controls 
                                                  className="w-full h-full"
                                                />
                                              </div>
                                            </motion.div>
                                          )}

                                          {imageGallery[endpoint.id] && (
                                            <motion.div
                                              initial={{ opacity: 0 }}
                                              animate={{ opacity: 1 }}
                                              className="space-y-3"
                                            >
                                              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <ImageIcon className="w-3 h-3" /> Image Results ({imageGallery[endpoint.id].length})
                                              </h4>
                                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {imageGallery[endpoint.id].map((url, i) => (
                                                  <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border/50 bg-black/40 group relative">
                                                    <img src={url} alt={`Result ${i}`} className="w-full h-full object-cover" />
                                                    <button 
                                                      onClick={() => window.open(url, '_blank')}
                                                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                    >
                                                      <Link2 className="w-5 h-5 text-white" />
                                                    </button>
                                                  </div>
                                                ))}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Request History Section */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-20 border-t border-border pt-12"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary" />
                Request <span className="gradient-text">History</span>
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearHistory}
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Clear History
              </Button>
            </div>
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-card/50 border border-border/50 flex items-center gap-4 hover:border-primary/30 transition-all group"
                >
                  <div className={`w-2 h-12 rounded-full ${item.status === "success" ? "bg-emerald-500/50" : "bg-red-500/50"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-black uppercase text-muted-foreground">{item.method}</span>
                      <span className="font-bold truncate">{item.endpoint}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-medium">
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                      <span className="truncate">Params: {Object.keys(item.params).join(", ") || "none"}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setExpandedEndpoint(apiEndpoints.find(e => e.name === item.endpoint)?.id || null);
                      setActiveTab(prev => ({ ...prev, [apiEndpoints.find(e => e.name === item.endpoint)?.id || ""]: "try" }));
                      setInputValues(prev => ({
                        ...prev,
                        [apiEndpoints.find(e => e.name === item.endpoint)?.id || ""]: item.params
                      }));
                      setResponses(prev => ({
                        ...prev,
                        [apiEndpoints.find(e => e.name === item.endpoint)?.id || ""]: item.response
                      }));
                    }}
                  >
                    Load
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <style jsx global>{`
        .gradient-text {
          background: linear-gradient(135deg, #fff 0%, hsl(var(--primary)) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
