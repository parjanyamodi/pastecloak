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
        className="w-full min-h-[320px] p-5 bg-transparent resize-none font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        placeholder="Enter your secret content here...

Your text will be encrypted with industry-standard algorithms before being uploaded. Only someone with the unique link can decrypt it."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        spellCheck={false}
        autoFocus
      />
      
      {/* Character count */}
      {content.length > 0 && (
        <div className="absolute bottom-3 right-4 px-2 py-1 rounded-md bg-secondary text-xs font-mono text-muted-foreground">
          {content.length.toLocaleString()}
        </div>
      )}
    </div>
  );
}
