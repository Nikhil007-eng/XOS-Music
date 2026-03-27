Import { Track, formatDuration } from "@/data/music";

interface BottomPlayerProps {
  track: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (s: number) => void;
  onOpenNowPlaying: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
}

export default function BottomPlayer({
  track, isPlaying, currentTime, duration,
  onPlayPause, onNext, onPrev, onSeek,
  onOpenNowPlaying, isLiked, onToggleLike,
}: BottomPlayerProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    onSeek(Math.floor(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration));
  };

  const Art = () =>
    track.thumbnail
      ? <img src={track.thumbnail} alt={track.title} style={{ width: 44, height: 44, borderRadius: 11, objectFit: "cover", flexShrink: 0 }} />
      : <div style={{ width: 44, height: 44, borderRadius: 11, flexShrink: 0, background: `linear-gradient(135deg,${track.gradientFrom},${track.gradientTo})` }} />;

  return (
    <div style={{ position: "fixed", bottom: 80, left: 0, right: 0, zIndex: 100, padding: "0 12px" }}>
      <div
        className="glass"
        onClick={onOpenNowPlaying}
        style={{ borderRadius: 20, padding: "10px 12px 8px", cursor: "pointer" }}
      >
        {/* Progress bar at top */}
        <div className="progress-bar" onClick={handleProgressClick} style={{ marginBottom: 10 }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Art />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.title}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{track.artist}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={e => e.stopPropagation()}>
            {/* Like */}
            <button
              onClick={e => { e.stopPropagation(); onToggleLike(); }}
              style={{ background: "transparent", border: "none", color: isLiked ? "#007aff" : "rgba(255,255,255,0.4)", cursor: "pointer", padding: 6, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.15s ease" }}
              onMouseDown={e => (e.currentTarget.style.transform = "scale(0.85)")}
              onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "#007aff" : "none"} stroke={isLiked ? "#007aff" : "rgba(255,255,255,0.45)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {/* Prev */}
            <button className="interactive" onClick={e => { e.stopPropagation(); onPrev(); }}
              style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: 6, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
            </button>

            {/* Play/Pause */}
            <button className="interactive" onClick={e => { e.stopPropagation(); onPlayPause(); }}
              style={{ width: 40, height: 40, borderRadius: "50%", background: "#007aff", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,122,255,0.4)" }}>
              {isPlaying
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
            </button>

            {/* Next */}
            <button className="interactive" onClick={e => { e.stopPropagation(); onNext(); }}
              style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: 6, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
          </div>
        </div>

        {/* Time */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 6, padding: "0 2px" }}>
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>
    </div>
  );
}
