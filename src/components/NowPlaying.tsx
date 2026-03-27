Import { useState } from "react";
import { Track, formatDuration, RepeatMode } from "@/data/music";

interface NowPlayingProps {
  track: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (s: number) => void;
  onClose: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
  repeatMode: RepeatMode;
  onCycleRepeat: () => void;
  isShuffled: boolean;
  onToggleShuffle: () => void;
  queue: Track[];
  onQueueTrackSelect: (track: Track) => void;
  sleepTimer: number | null; // minutes remaining
  onSetSleepTimer: (minutes: number | null) => void;
}

function AlbumArt({ track, size = 280 }: { track: Track; size?: number }) {
  const [imgError, setImgError] = useState(false);
  if (track.thumbnail && !imgError)
    return (
      <img
        src={track.thumbnail}
        alt={track.title}
        onError={() => setImgError(true)}
        style={{ width: size, height: size, borderRadius: 24, objectFit: "cover" }}
      />
    );
  return (
    <div
      style={{
        width: size, height: size, borderRadius: 24,
        background: `linear-gradient(135deg,${track.gradientFrom},${track.gradientTo})`,
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.03)" }} />
      <div style={{ position: "absolute", bottom: "15%", right: "15%", width: "40%", height: "40%", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
      <div style={{ position: "absolute", top: "10%", left: "10%", width: "20%", height: "20%", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
    </div>
  );
}

const SLEEP_OPTIONS = [5, 10, 15, 30, 45, 60];

export default function NowPlaying({
  track, isPlaying, currentTime, duration,
  onPlayPause, onNext, onPrev, onSeek, onClose,
  isLiked, onToggleLike,
  repeatMode, onCycleRepeat,
  isShuffled, onToggleShuffle,
  queue, onQueueTrackSelect,
  sleepTimer, onSetSleepTimer,
}: NowPlayingProps) {
  const [activeTab, setActiveTab] = useState<"up-next" | "sleep">("up-next");
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onSeek(Math.floor(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration));
  };

  const repeatIcon = () => {
    if (repeatMode === "one") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"/><text x="10" y="14" fontSize="7" fill="#007aff" fontWeight="700" stroke="none">1</text>
      </svg>
    );
    const col = repeatMode === "all" ? "#007aff" : "rgba(255,255,255,0.45)";
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
        <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
    );
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "#000",
      display: "flex", flexDirection: "column",
      fontFamily: "'Space Grotesk', sans-serif",
      animation: "slideUpFull 0.35s cubic-bezier(0.32,0.72,0,1) forwards",
    }}>
      <style>{`
        @keyframes slideUpFull {
          from { transform: translateY(100%); opacity:0.6; }
          to   { transform: translateY(0);    opacity:1; }
        }
        @keyframes pulse-blue { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .np-btn { background:transparent; border:none; cursor:pointer; padding:8px; border-radius:99px; display:flex; align-items:center; justify-content:center; transition:transform 0.15s ease,opacity 0.15s ease; }
        .np-btn:active { transform:scale(0.9); }
        .np-progress { height:4px; background:rgba(255,255,255,0.12); border-radius:99px; cursor:pointer; position:relative; }
        .np-progress-fill { height:100%; background:#007aff; border-radius:99px; transition:width 0.3s linear; position:relative; }
        .np-progress-fill::after { content:''; position:absolute; right:-5px; top:50%; transform:translateY(-50%); width:12px; height:12px; border-radius:50%; background:#fff; box-shadow:0 0 8px rgba(0,122,255,0.6); }
        .tab-btn { flex:1; padding:10px 0; background:transparent; border:none; cursor:pointer; font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:500; transition:color 0.2s ease; }
      `}</style>

      {/* Background blur art */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, overflow: "hidden",
        background: `radial-gradient(ellipse at 50% 30%, ${track.gradientTo}22 0%, #000 65%)`,
      }} />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "56px 24px 16px" }}>
        <button className="np-btn" onClick={onClose}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "0.8px", textTransform: "uppercase" }}>Now Playing</div>
        </div>
        <button className="np-btn" onClick={onToggleLike}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? "#007aff" : "none"} stroke={isLiked ? "#007aff" : "rgba(255,255,255,0.5)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      {/* Album art */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", padding: "8px 24px 24px" }}>
        <div style={{
          boxShadow: `0 24px 60px ${track.gradientTo}55, 0 8px 32px rgba(0,0,0,0.6)`,
          borderRadius: 24,
          transform: isPlaying ? "scale(1)" : "scale(0.92)",
          transition: "transform 0.4s cubic-bezier(0.32,0.72,0,1)",
        }}>
          <AlbumArt track={track} size={272} />
        </div>
      </div>

      {/* Track info */}
      <div style={{ position: "relative", zIndex: 1, padding: "0 28px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.3px" }}>{track.title}</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>{track.artist}</div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ position: "relative", zIndex: 1, padding: "0 28px 16px" }}>
        <div className="np-progress" onClick={handleSeekClick}>
          <div className="np-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 20px" }}>
        <button className="np-btn" onClick={onToggleShuffle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isShuffled ? "#007aff" : "rgba(255,255,255,0.45)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
            <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
          </svg>
        </button>
        <button className="np-btn" onClick={onPrev}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.85)"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
        </button>
        <button onClick={onPlayPause} style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "#007aff", border: "none", color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 32px rgba(0,122,255,0.5)",
          transition: "transform 0.15s ease",
        }}
          onMouseDown={e => (e.currentTarget.style.transform = "scale(0.93)")}
          onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          {isPlaying
            ? <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
        </button>
        <button className="np-btn" onClick={onNext}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.85)"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>
        <button className="np-btn" onClick={onCycleRepeat}>{repeatIcon()}</button>
      </div>

      {/* Bottom tabs: Up Next / Sleep */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {(["up-next", "sleep"] as const).map(tab => (
            <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)}
              style={{ color: activeTab === tab ? "#007aff" : "rgba(255,255,255,0.4)", borderBottom: activeTab === tab ? "2px solid #007aff" : "2px solid transparent" }}>
              {tab === "up-next" ? "Up Next" : sleepTimer ? `Sleep · ${sleepTimer}m` : "Sleep Timer"}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          {activeTab === "up-next" && (
            <div style={{ padding: "8px 0" }}>
              {queue.length === 0
                ? <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Queue is empty</div>
                : queue.map((t, i) => (
                  <div key={`${t.id}-${i}`} onClick={() => onQueueTrackSelect(t)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 24px", cursor: "pointer",
                      background: t.id === track.id ? "rgba(0,122,255,0.08)" : "transparent",
                      transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = t.id === track.id ? "rgba(0,122,255,0.1)" : "rgba(255,255,255,0.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = t.id === track.id ? "rgba(0,122,255,0.08)" : "transparent")}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, overflow: "hidden",
                      background: `linear-gradient(135deg,${t.gradientFrom},${t.gradientTo})` }}>
                      {t.thumbnail && <img src={t.thumbnail} alt={t.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: t.id === track.id ? "#007aff" : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{t.artist}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{formatDuration(t.duration)}</div>
                  </div>
                ))}
            </div>
          )}

          {activeTab === "sleep" && (
            <div style={{ padding: "20px 24px" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>
                {sleepTimer ? `Pausing playback in ${sleepTimer} minutes` : "Automatically pause playback after a set time."}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                {SLEEP_OPTIONS.map(m => (
                  <button key={m} onClick={() => onSetSleepTimer(sleepTimer === m ? null : m)}
                    style={{
                      padding: "14px 8px", borderRadius: 14, border: "1px solid",
                      borderColor: sleepTimer === m ? "#007aff" : "rgba(255,255,255,0.1)",
                      background: sleepTimer === m ? "rgba(0,122,255,0.15)" : "rgba(255,255,255,0.04)",
                      color: sleepTimer === m ? "#007aff" : "rgba(255,255,255,0.7)",
                      fontSize: 14, fontWeight: 600, cursor: "pointer",
                      fontFamily: "'Space Grotesk',sans-serif",
                      transition: "all 0.2s ease",
                    }}>
                    {m}m
                  </button>
                ))}
              </div>
              {sleepTimer && (
                <button onClick={() => onSetSleepTimer(null)}
                  style={{ width: "100%", padding: "13px", borderRadius: 14, border: "1px solid rgba(255,59,48,0.3)",
                    background: "rgba(255,59,48,0.08)", color: "#ff3b30", fontSize: 14, fontWeight: 600,
                    cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>
                  Cancel Timer
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
