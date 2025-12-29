"use client";
import Editor from "./Editor";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateActions from "./CreateActions";
import { Send, Loader2, Shield } from "lucide-react";
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
      // Step 1: Encrypt content client-side
      const { encrypted, decryptionKey } = await encrypt(content, options.algorithm);
      const encryptedContent = serializeEncryptedData(encrypted);
      
      setStatus("Saving...");

      // Step 2: Save to server (server never sees plaintext)
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

      // Step 3: Redirect with decryption key in URL fragment
      // The key is in the fragment (#) so it's NEVER sent to the server
      router.push(`/${result.urlId}#${decryptionKey}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Encryption failed");
      setStatus("");
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      {/* Options */}
      <CreateActions options={options} setOptions={setOptions} />

      {/* Editor - Main Focus */}
      <div className="glass-strong rounded-xl overflow-hidden">
        <Editor content={content} setContent={setContent} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Send Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>End-to-end encrypted • Server never sees your content</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-[hsl(160,100%,40%)] text-[hsl(220,20%,4%)] hover:bg-[hsl(160,100%,45%)] disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_hsl(160,100%,50%,0.3)] transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {status || "Processing..."}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send
            </>
          )}
        </button>
      </div>
    </div>
  );
}
