"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Download, Play, Pause, Volume2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface CodeBlockProps {
  language: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <span className="text-xs font-mono text-muted-foreground uppercase">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-accent hover:bg-accent/80 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "hsl(var(--card))",
          fontSize: "0.875rem",
        }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

interface AudioPlayerProps {
  src: string;
  title?: string;
}

function AudioPlayer({ src, title }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * audioRef.current.duration;
    }
  };

  return (
    <div className="my-6 p-4 rounded-xl bg-card border border-border">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-[hsl(var(--theme-primary))] text-white hover:opacity-90 transition-opacity"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <div className="flex-1">
          {title && <p className="text-sm font-medium mb-2">{title}</p>}
          <div
            className="h-2 bg-accent rounded-full cursor-pointer overflow-hidden"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-[hsl(var(--theme-primary))] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <Volume2 className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  );
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

function VideoPlayer({ src, poster }: VideoPlayerProps) {
  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border">
      <video
        src={src}
        poster={poster}
        controls
        className="w-full aspect-video bg-black"
      />
    </div>
  );
}

interface FileDownloadProps {
  src: string;
  filename: string;
  size?: string;
}

function FileDownload({ src, filename, size }: FileDownloadProps) {
  return (
    <a
      href={src}
      download={filename}
      className="my-6 flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-[hsl(var(--theme-primary)/0.5)] transition-colors group"
    >
      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[hsl(var(--theme-primary)/0.1)] text-[hsl(var(--theme-primary))]">
        <Download className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <p className="font-medium group-hover:text-[hsl(var(--theme-primary))] transition-colors">
          {filename}
        </p>
        {size && <p className="text-sm text-muted-foreground">{size}</p>}
      </div>
      <span className="px-4 py-2 text-sm font-medium rounded-lg bg-[hsl(var(--theme-primary))] text-white">
        Download
      </span>
    </a>
  );
}

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const processedContent = content
    .replace(/\[audio:([^\]]+)\](?:\(([^)]*)\))?/g, (_, src, title) => {
      return `<audio-player src="${src}" title="${title || ''}"></audio-player>`;
    })
    .replace(/\[video:([^\]]+)\](?:\(([^)]*)\))?/g, (_, src, poster) => {
      return `<video-player src="${src}" poster="${poster || ''}"></video-player>`;
    })
    .replace(/\[file:([^\]]+)\]\(([^)]+)\)(?:\{([^}]*)\})?/g, (_, filename, src, size) => {
      return `<file-download src="${src}" filename="${filename}" size="${size || ''}"></file-download>`;
    });

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-black mt-10 mb-4 gradient-text">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold mt-8 mb-4 gradient-text">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-bold mt-4 mb-2">{children}</h4>
          ),
          p: ({ children }) => {
            const text = String(children);
            
            if (text.includes("<audio-player")) {
              const match = text.match(/<audio-player src="([^"]+)" title="([^"]*)">/);
              if (match) {
                return <AudioPlayer src={match[1]} title={match[2] || undefined} />;
              }
            }
            
            if (text.includes("<video-player")) {
              const match = text.match(/<video-player src="([^"]+)" poster="([^"]*)">/);
              if (match) {
                return <VideoPlayer src={match[1]} poster={match[2] || undefined} />;
              }
            }
            
            if (text.includes("<file-download")) {
              const match = text.match(/<file-download src="([^"]+)" filename="([^"]+)" size="([^"]*)">/);
              if (match) {
                return <FileDownload src={match[1]} filename={match[2]} size={match[3] || undefined} />;
              }
            }
            
            return <p className="mb-4 text-muted-foreground leading-relaxed">{children}</p>;
          },
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="my-4 ml-6 list-disc space-y-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 ml-6 list-decimal space-y-2">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-muted-foreground">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-4 border-[hsl(var(--theme-primary))] pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--theme-primary))] hover:underline"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <figure className="my-6">
              <img
                src={src}
                alt={alt || ""}
                className="rounded-xl w-full"
              />
              {alt && (
                <figcaption className="text-center text-sm text-muted-foreground mt-2">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
          hr: () => <hr className="my-8 border-border" />,
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-xl">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-card px-4 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2">{children}</td>
          ),
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className || "");
            const code = String(children).replace(/\n$/, "");

            if (match || code.includes("\n")) {
              return <CodeBlock language={match?.[1] || ""} code={code} />;
            }

            return (
              <code className="bg-card px-2 py-1 rounded text-sm text-[hsl(var(--theme-primary))] font-mono">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
