"use client";
import { Clock, Lock, Flame, ChevronDown, Sparkles } from "lucide-react";
import { PasteOptions } from "./ContentBox";
import { ALGORITHM_INFO, type EncryptionAlgorithm } from "@/lib/crypto";

export default function CreateActions({
  options,
  setOptions,
}: {
  options: PasteOptions;
  setOptions: React.Dispatch<React.SetStateAction<PasteOptions>>;
}) {
  const expirationTimes = [
    { label: "5 min", time: "300" },
    { label: "10 min", time: "600" },
    { label: "1 hour", time: "3600" },
    { label: "1 day", time: "86400" },
    { label: "1 week", time: "604800" },
    { label: "1 month", time: "2628000" },
    { label: "Never", time: "0" },
  ];

  const algorithms: { value: EncryptionAlgorithm; label: string; desc: string }[] = [
    { value: "x25519-chacha20", label: "X25519", desc: "Fast & secure" },
    { value: "rsa-aes", label: "RSA-AES", desc: "Classic" },
    { value: "kyber-chacha20", label: "Kyber", desc: "Post-quantum" },
    { value: "hybrid-pq", label: "Hybrid", desc: "Maximum security" },
  ];
  
  const updateOption = <K extends keyof PasteOptions>(key: K, value: PasteOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const selectedAlgorithm = ALGORITHM_INFO[options.algorithm];
  
  return (
    <div className="p-4 space-y-4">
      {/* Encryption Selection */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          Encryption
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {algorithms.map((algo) => (
            <button
              key={algo.value}
              type="button"
              onClick={() => updateOption("algorithm", algo.value)}
              className={`p-3 rounded-lg text-left transition-all ${
                options.algorithm === algo.value
                  ? "bg-primary/10 border border-primary/30 ring-1 ring-primary/20"
                  : "bg-secondary/50 border border-transparent hover:bg-secondary hover:border-border"
              }`}
            >
              <div className={`text-sm font-medium ${options.algorithm === algo.value ? "text-primary" : "text-foreground"}`}>
                {algo.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {algo.desc}
              </div>
            </button>
          ))}
        </div>
        
        {/* Security indicator */}
        {selectedAlgorithm.security === "quantum-safe" && (
          <p className="text-xs text-violet-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            Quantum-resistant encryption
          </p>
        )}
      </div>

      {/* Options Row */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {/* Expiration */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div className="relative">
            <select
              value={options.expiresIn}
              onChange={(e) => updateOption("expiresIn", e.target.value)}
              className="appearance-none bg-secondary/50 hover:bg-secondary border border-border rounded-lg px-3 py-2 pr-8 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
            >
              {expirationTimes.map((exp) => (
                <option key={exp.time} value={exp.time}>
                  {exp.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
          </div>
        </div>

        {/* Password */}
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <input
            type="password"
            placeholder="Password (optional)"
            value={options.password}
            onChange={(e) => updateOption("password", e.target.value)}
            className="bg-secondary/50 hover:bg-secondary border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 w-40"
          />
        </div>

        {/* Burn */}
        <button
          type="button"
          onClick={() => updateOption("burnAfterRead", !options.burnAfterRead)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
            options.burnAfterRead
              ? "bg-orange-500/10 border border-orange-500/30 text-orange-400"
              : "bg-secondary/50 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Flame className={`h-4 w-4 ${options.burnAfterRead ? "text-orange-400" : ""}`} />
          <span>Burn after read</span>
        </button>
      </div>
    </div>
  );
}
