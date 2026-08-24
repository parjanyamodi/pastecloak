"use client";
import Editor from "./Editor";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateActions from "./CreateActions";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { createPaste } from "@/lib/actions";
import { encrypt, serializeEncryptedData, type EncryptionAlgorithm } from "@/lib/crypto";

export interface PasteOptions {
  format: string;
  expiresIn: string;
  password: string;
  burnAfterRead: boolean;
  openDiscussion: boolean;
  algorithm: EncryptionAlgorithm;
}

export default function ContentBox() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [options, setOptions] = useState<PasteOptions>({
    format: "plaintext",
    expiresIn: "86400",
    password: "",
    burnAfterRead: false,
    openDiscussion: false,
    algorithm: "x25519-chacha20",
  });

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    
    setError(null);
    setIsSubmitting(true);
    setStatus("Encrypting...");

    try {
      const { encrypted, decryptionKey } = await encrypt(content, options.algorithm);
      const encryptedContent = serializeEncryptedData(encrypted);
      
      setStatus("Saving...");

      const result = await createPaste({
        encryptedContent,
        algorithm: options.algorithm,
        format: options.format,
        password: options.password || undefined,
        burnAfterRead: options.burnAfterRead,
        openDiscussion: options.openDiscussion,
        expiresIn: options.expiresIn !== "0" ? options.expiresIn : undefined,
      });

      if ("error" in result) {
        setError(result.error);
        setStatus("");
        setIsSubmitting(false);
        return;
      }

      router.push(`/${result.urlId}#${decryptionKey}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Encryption failed");
      setStatus("");
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          Share secrets securely
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          End-to-end encrypted. Zero-knowledge. Your content is encrypted before it ever leaves your device.
        </p>
      </div>

      {/* Main Card */}
      <div className="glass-card overflow-hidden">
        {/* Editor */}
        <Editor content={content} setContent={setContent} />
        
        {/* Divider */}
        <div className="border-t border-border/50" />
        
        {/* Options */}
        <CreateActions options={options} setOptions={setOptions} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          <span>Encrypted locally before upload</span>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed focus-ring transition-all hover:glow"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{status}</span>
            </>
          ) : (
            <>
              <span>Create paste</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
