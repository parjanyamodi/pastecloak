"use client";

import { useState, useEffect } from "react";
import { Lock, Clock, Copy, Check, Flame, Shield, AlertTriangle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

  // Decrypt content when we have data and the key from URL fragment
  useEffect(() => {
    const decryptContent = async () => {
      if (!encryptedData) return;
      
      // Get decryption key from URL fragment (never sent to server)
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
      } catch (err) {
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

  // Password entry screen
  if (passwordRequired) {
    return (
      <div className="glass-strong rounded-xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Password Protected</h1>
        </div>
        <p className="text-muted-foreground mb-4">
          This paste is password protected. Enter the password to view it.
        </p>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass border-white/20"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Unlocking..." : "Unlock"}
          </Button>
        </form>
        {error && error !== "Password required" && (
          <p className="text-red-500 text-sm mt-4">{error}</p>
        )}
      </div>
    );
  }

  // No decryption key
  if (noKey) {
    return (
      <div className="glass-strong rounded-xl p-8 text-center w-full max-w-md">
        <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-2">Missing Decryption Key</h1>
        <p className="text-muted-foreground">
          The decryption key should be in the URL after the # symbol.
          Make sure you have the complete link.
        </p>
      </div>
    );
  }

  // Decrypting
  if (decrypting) {
    return (
      <div className="glass-strong rounded-xl p-8 text-center w-full max-w-md">
        <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
        <h1 className="text-xl font-semibold mb-2">Decrypting...</h1>
        <p className="text-muted-foreground">
          Your content is being decrypted locally.
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="glass-strong rounded-xl p-8 text-center w-full max-w-md">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-2">Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!encryptedData || !decryptedContent) return null;

  const algorithmInfo = ALGORITHM_INFO[encryptedData.algorithm as keyof typeof ALGORITHM_INFO];

  return (
    <div className="w-full max-w-4xl space-y-4">
      {/* Paste Info Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 glass rounded-xl border-white/20">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Created: {formatDate(encryptedData.createdAt)}</span>
        </div>

        {encryptedData.expiresAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-orange-500" />
            <span>Expires: {formatDate(encryptedData.expiresAt)}</span>
          </div>
        )}

        {encryptedData.burnAfterRead && (
          <div className="flex items-center gap-2 text-sm text-orange-500">
            <Flame className="h-4 w-4" />
            <span>Burned after reading</span>
          </div>
        )}

        {/* Encryption badge */}
        <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
          algorithmInfo?.security === 'quantum-safe' 
            ? 'bg-purple-500/20 text-purple-400' 
            : algorithmInfo?.security === 'very-high'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-blue-500/20 text-blue-400'
        }`}>
          <Shield className="h-3 w-3" />
          {algorithmInfo?.name || encryptedData.algorithm}
        </div>

        <div className="flex-1" />

        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-[hsl(220,20%,12%)] hover:bg-[hsl(220,20%,16%)] transition-all"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Paste Content */}
      <div className="glass-strong rounded-xl overflow-hidden">
        <pre className="p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap break-words min-h-[300px]">
          {decryptedContent}
        </pre>
      </div>

      {/* Security Note */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
        <Shield className="h-3 w-3" />
        <span>Decrypted locally in your browser • Server never saw your content</span>
      </div>
    </div>
  );
}
