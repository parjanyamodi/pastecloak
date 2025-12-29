"use client";
import { 
  Clock, 
  Lock, 
  Flame, 
  MessageSquare,
  ChevronDown,
  FileCode,
  Shield,
  Zap,
  Atom
} from "lucide-react";
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

  const formats = [
    { label: "Plain Text", value: "plaintext" },
    { label: "Source Code", value: "code" },
    { label: "Markdown", value: "markdown" },
  ];

  const algorithms: { value: EncryptionAlgorithm; label: string; icon: React.ReactNode }[] = [
    { value: "x25519-chacha20", label: "X25519", icon: <Zap className="h-3 w-3" /> },
    { value: "rsa-aes", label: "RSA-AES", icon: <Lock className="h-3 w-3" /> },
    { value: "kyber-chacha20", label: "Kyber", icon: <Atom className="h-3 w-3" /> },
    { value: "hybrid-pq", label: "Hybrid PQ", icon: <Shield className="h-3 w-3" /> },
  ];
  
  const updateOption = <K extends keyof PasteOptions>(key: K, value: PasteOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const selectedAlgorithm = ALGORITHM_INFO[options.algorithm];
  
  return (
    <div className="space-y-3">
      {/* Encryption Algorithm Selector */}
      <div className="flex flex-wrap items-center gap-2 p-3 glass rounded-xl">
        <Shield className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Encryption:</span>
        <div className="flex gap-1.5">
          {algorithms.map((algo) => (
            <button
              key={algo.value}
              type="button"
              onClick={() => updateOption("algorithm", algo.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                options.algorithm === algo.value
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-[hsl(220,20%,12%)] text-muted-foreground hover:text-foreground hover:bg-[hsl(220,20%,16%)]'
              }`}
            >
              {algo.icon}
              {algo.label}
            </button>
          ))}
        </div>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
          selectedAlgorithm.security === 'quantum-safe' 
            ? 'bg-purple-500/20 text-purple-400' 
            : selectedAlgorithm.security === 'very-high'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-blue-500/20 text-blue-400'
        }`}>
          {selectedAlgorithm.security === 'quantum-safe' ? '🔮 Quantum-Safe' : 
           selectedAlgorithm.security === 'very-high' ? '✓ Very High' : '✓ High'}
        </span>
      </div>

      {/* Other Options Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 p-3 glass rounded-xl">
        {/* Format */}
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-muted-foreground" />
          <div className="relative">
            <select
              value={options.format}
              onChange={(e) => updateOption("format", e.target.value)}
              className="appearance-none bg-transparent border border-[hsl(220,20%,18%)] rounded-lg px-3 py-1.5 pr-8 text-sm text-foreground focus:outline-none focus:border-[hsl(160,100%,40%,0.5)] transition-colors cursor-pointer"
            >
              {formats.map((f) => (
                <option key={f.value} value={f.value} className="bg-[hsl(220,20%,8%)]">
                  {f.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Expiration */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div className="relative">
            <select
              value={options.expiresIn}
              onChange={(e) => updateOption("expiresIn", e.target.value)}
              className="appearance-none bg-transparent border border-[hsl(220,20%,18%)] rounded-lg px-3 py-1.5 pr-8 text-sm text-foreground focus:outline-none focus:border-[hsl(160,100%,40%,0.5)] transition-colors cursor-pointer"
            >
              {expirationTimes.map((exp) => (
                <option key={exp.time} value={exp.time} className="bg-[hsl(220,20%,8%)]">
                  {exp.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Password */}
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <input
            type="password"
            placeholder="Password"
            value={options.password}
            onChange={(e) => updateOption("password", e.target.value)}
            className="bg-transparent border border-[hsl(220,20%,18%)] rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-[hsl(160,100%,40%,0.5)] transition-colors w-28"
          />
        </div>

        {/* Burn after reading */}
        <label className="flex items-center gap-2 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={options.burnAfterRead}
            onChange={(e) => updateOption("burnAfterRead", e.target.checked)}
            className="sr-only"
          />
          <div 
            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
              options.burnAfterRead 
                ? 'bg-orange-500 border-orange-500' 
                : 'border-[hsl(220,20%,25%)] group-hover:border-orange-500/50'
            }`}
          >
            {options.burnAfterRead && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <Flame className={`h-4 w-4 transition-colors ${options.burnAfterRead ? 'text-orange-500' : 'text-muted-foreground group-hover:text-orange-500/70'}`} />
          <span className={`text-sm hidden sm:inline transition-colors ${options.burnAfterRead ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
            Burn
          </span>
        </label>

        {/* Open discussion */}
        <label className="flex items-center gap-2 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={options.openDiscussion}
            onChange={(e) => updateOption("openDiscussion", e.target.checked)}
            className="sr-only"
          />
          <div 
            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
              options.openDiscussion 
                ? 'bg-[hsl(160,100%,40%)] border-[hsl(160,100%,40%)]' 
                : 'border-[hsl(220,20%,25%)] group-hover:border-[hsl(160,100%,40%,0.5)]'
            }`}
          >
            {options.openDiscussion && (
              <svg className="w-3 h-3 text-[hsl(220,20%,4%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <MessageSquare className={`h-4 w-4 transition-colors ${options.openDiscussion ? 'text-[hsl(160,100%,45%)]' : 'text-muted-foreground group-hover:text-[hsl(160,100%,45%,0.7)]'}`} />
          <span className={`text-sm hidden sm:inline transition-colors ${options.openDiscussion ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
            Discussion
          </span>
        </label>
      </div>
    </div>
  );
}
