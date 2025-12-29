"use client";

export default function Editor({
  content,
  setContent,
}: {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className="relative">
      <textarea
        className="w-full min-h-[400px] sm:min-h-[500px] p-4 bg-transparent border-0 resize-none font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0"
        placeholder="Paste your content here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        spellCheck={false}
      />
      {/* Character count - subtle */}
      <div className="absolute bottom-3 right-4 text-xs text-muted-foreground/50 font-mono">
        {content.length > 0 && `${content.length} chars`}
      </div>
    </div>
  );
}
