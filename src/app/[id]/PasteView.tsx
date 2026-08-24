"use client";

import { useState, useEffect } from "react";
import { Lock, Clock, Copy, Check, Flame, Shield, AlertTriangle, Loader2, KeyRound } from "lucide-react";
import { decrypt, parseEncryptedData, ALGORITHM_INFO } from "@/lib/crypto";

interface PasteData {
  encryptedContent: string;
  algorithm: string;
  format: string;
  burnAfterRead: boolean;
  openDiscussion: boolean;
  createdAt: Date;
  expiresAt: Date | null;
  id: string;
}

interface Props {
  urlId: string;
  initialData: PasteData | { error: string; passwordProtected?: boolean };
  verifyPassword: (urlId: string, password: string) => Promise<PasteData | { error: string; passwordProtected?: boolean }>;
}

export default function PasteView({ urlId, initialData, verifyPassword }: Props) {
  const [encryptedData, setEncryptedData] = useState<PasteData | null>(
    "error" in initialData ? null : initialData
  );
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(
    "passwordProtected" in initialData && initialData.passwordProtected
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    "error" in initialData && !initialData.passwordProtected ? initialData.error : null
  );
  const [loading, setLoading] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [noKey, setNoKey] = useState(false);

  useEffect(() => {
    const decryptContent = async () => {
      if (!encryptedData) return;
      
      const hash = window.location.hash.slice(1);
      
      if (!hash) {
        setNoKey(true);
        return;
      }

      setDecrypting(true);
      try {
        const encrypted = parseEncryptedData(encryptedData.encryptedContent);
        const plaintext = await decrypt(encrypted, hash);
        setDecryptedContent(plaintext);
      } catch {
        setError("Decryption failed - invalid key or corrupted data");
      } finally {
        setDecrypting(false);
      }
    };

    decryptContent();
  }, [encryptedData]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await verifyPassword(urlId, password);

    if ("error" in result) {
      setError(result.error);
    } else {
      setEncryptedData(result);
      setPasswordRequired(false);
    }

    setLoading(false);
  };

  const copyToClipboard = async () => {
    if (decryptedContent) {
      await navigator.clipboard.writeText(decryptedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  // Password entry
  if (passwordRequired) {
    return (
      <div className="glass-card p-8 max-w-sm mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Password Protected</h1>
        <p className="text-sm text-muted-foreground mb-6">
          This paste requires a password to view.
        </p>
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full px-4 py-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Unlocking..." : "Unlock"}
          </button>
        </form>
        {error && error !== "Password required" && (
          <p className="text-destructive text-sm mt-4">{error}</p>
        )}
      </div>
    );
  }

  // No key
  if (noKey) {
    return (
      <div className="glass-card p-8 max-w-sm mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
          <KeyRound className="h-5 w-5 text-orange-400" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Missing Decryption Key</h1>
        <p className="text-sm text-muted-foreground">
          The decryption key should be included in the URL after the # symbol. Make sure you have the complete link.
        </p>
      </div>
    );
  }

  // Decrypting
  if (decrypting) {
    return (
      <div className="glass-card p-8 max-w-sm mx-auto text-center">
        <Loader2 className="h-10 w-10 mx-auto mb-4 animate-spin text-primary" />
        <h1 className="text-xl font-semibold mb-2">Decrypting...</h1>
        <p className="text-sm text-muted-foreground">
          Your content is being decrypted locally.
        </p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="glass-card p-8 max-w-sm mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Decryption Failed</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!encryptedData || !decryptedContent) return null;

  const algorithmInfo = ALGORITHM_INFO[encryptedData.algorithm as keyof typeof ALGORITHM_INFO];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatDate(encryptedData.createdAt)}</span>
        </div>

        {encryptedData.expiresAt && (
          <div className="flex items-center gap-2 text-sm text-orange-400">
            <Clock className="h-4 w-4" />
            <span>Expires {formatDate(encryptedData.expiresAt)}</span>
          </div>
        )}

        {encryptedData.burnAfterRead && (
          <div className="flex items-center gap-1.5 text-sm text-orange-400">
            <Flame className="h-4 w-4" />
            <span>Burned</span>
          </div>
        )}

        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
          algorithmInfo?.security === "quantum-safe"
            ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
            : algorithmInfo?.security === "very-high"
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
        }`}>
          <Shield className="h-3 w-3" />
          {algorithmInfo?.name || encryptedData.algorithm}
        </span>

        <div className="flex-1" />

        <button
          onClick={copyToClipboard}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-secondary hover:bg-secondary/80 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="glass-card overflow-hidden">
        <pre className="p-5 overflow-x-auto text-sm font-mono leading-relaxed whitespace-pre-wrap break-words min-h-[300px]">
          {decryptedContent}
        </pre>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        <span>Decrypted locally in your browser</span>
      </div>
    </div>
  );
}
