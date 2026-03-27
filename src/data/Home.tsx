Import { useState, useEffect, useRef } from "react";
import { Track, apiTrackToTrack, formatDuration } from "@/data/music";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function AlbumArt({ track, size = 64, radius = 12 }: { track: Track; size?: number; radius?: number }) {
  const [imgError, setImgError] = useState(false);
  if (track.thumbnail && !imgError)
    return (
      <img src={track.thumbnail} alt={track.title} onError={() => setImgError(true)}
        style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", flexShrink: 0 }} />
    );
  return (
    <div style={{ width: size, height: size, borderRadius: radius, flexShrink: 0, position: "relative", overflow: "hidden",
      background: `linear-gradient(135deg,${track.gradientFrom},${track.gradientTo})` }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.04)" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "20%", width: "30%", height: "30%", borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
    </div>
  );
}

interface HomeProps {
  tracks: Track[];
  trendingTracks: Track[];
  currentTrack: Track;
  isPlaying: boolean;
  onTrackSelect: (t: Track) => void;
  onPlayPause: () => void;
  likedIds: Set<string>;
  onToggleLike: (t: Track) => void;
}

export default function Home({ tracks, trendingTracks, currentTrack, isPlaying, onTrackSelect, likedIds, onToggleLike }: HomeProps) {
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [showSearch,    setShowSearch]    = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loaded,        setLoaded]        = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 50); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!searchQuery.trim()) { setSearchResults([]); setShowSearch(false); setSearchLoading(false); return; }
    setSearchLoading(true); setShowSearch(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`${BASE}/api/music/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults((data.tracks ?? []).map((t: any, i: number) => apiTrackToTrack(t, i + 50)));
      } catch { setSearchResults([]); }
      finally  { setSearchLoading(false); }
    }, 400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [searchQuery]);

  const quickPicks = trendingTracks.length > 0 ? trendingTracks : tracks.slice(0, 8);

  return (
    <div style={{ paddingBottom: 160 }}>
      {/* Header */}
      <div className="slide-up" style={{ padding: "56px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>XOS Music</h1>
        <span style={{ fontSize: 8, fontWeight: 600, color: "#007aff", background: "rgba(0,122,255,0.12)",
          border: "1px solid rgba(0,122,255,0.25)", borderRadius: 99, padding: "3px 8px",
          letterSpacing: "0.5px", textTransform: "uppercase" }}>STABLE v1.1</span>
      </div>

      {/* Search */}
      <div className="slide-up slide-up-delay-1" style={{ padding: "0 20px 20px", position: "relative", zIndex: 50 }}>
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="search-input" type="search" placeholder="Search YouTube Music..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "12px 16px 12px 40px", fontSize: 15 }} />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="interactive"
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%",
                width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        {showSearch && (
          <div className="glass slide-up" style={{ position: "absolute", top: "calc(100% - 8px)", left: 20, right: 20,
            borderRadius: 16, overflow: "hidden", zIndex: 50, maxHeight: 340, overflowY: "auto" }}>
            {searchLoading
              ? <div style={{ padding: 20, textAlign: "center" }}>
                  <div style={{ display: "inline-flex", gap: 6 }}>
                    {[0, 1, 2].map(i => <div key={i} className="playing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#007aff", animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              : searchResults.length === 0
                ? <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 14 }}>No results found</div>
                : searchResults.map(track => (
                    <div key={track.id} className="interactive"
                      onClick={() => { onTrackSelect(track); setSearchQuery(""); }}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
                      <AlbumArt track={track} size={40} radius={10} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.title}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{track.artist}</div>
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{formatDuration(track.duration)}</div>
                    </div>
                  ))
            }
          </div>
        )}
      </div>

      {/* Quick Picks */}
      <section className={loaded ? "slide-up slide-up-delay-2" : ""} style={{ marginBottom: 32 }}>
        <div style={{ padding: "0 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Quick Picks</h2>
          <span style={{ fontSize: 13, color: "#007aff", fontWeight: 500 }} className="interactive">See all</span>
        </div>
        <div className="scroll-hide" style={{ display: "flex", gap: 14, overflowX: "auto", paddingLeft: 20, paddingRight: 20 }}>
          {quickPicks.map(track => (
            <div key={track.id} className="interactive glass" onClick={() => onTrackSelect(track)}
              style={{ flexShrink: 0, width: 150, borderRadius: 16, padding: 12, cursor: "pointer", position: "relative" }}>
              <div style={{ width: "100%", aspectRatio: "1", borderRadius: 16, overflow: "hidden", marginBottom: 10, position: "relative" }}>
                {track.thumbnail
                  ? <img src={track.thumbnail} alt={track.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg,${track.gradientFrom},${track.gradientTo})` }} />}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.artist}</div>
              {/* Like button on card */}
              <button onClick={e => { e.stopPropagation(); onToggleLike(track); }}
                style={{ position: "absolute", top: 18, right: 18, background: "rgba(0,0,0,0.5)", border: "none",
                  borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "transform 0.15s" }}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.85)")}
                onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={likedIds.has(track.id) ? "#007aff" : "none"}
                  stroke={likedIds.has(track.id) ? "#007aff" : "rgba(255,255,255,0.7)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Keep Listening */}
      <section className={loaded ? "slide-up slide-up-delay-3" : ""}>
        <div style={{ padding: "0 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Keep Listening</h2>
          <span style={{ fontSize: 13, color: "#007aff", fontWeight: 500 }} className="interactive">History</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 16px" }}>
          {tracks.map(track => {
            const active = currentTrack.id === track.id;
            return (
              <div key={track.id} className="interactive" onClick={() => onTrackSelect(track)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 14, cursor: "pointer",
                  background: active ? "rgba(0,122,255,0.08)" : "transparent",
                  border: active ? "1px solid rgba(0,122,255,0.15)" : "1px solid transparent",
                  transition: "background 0.2s ease" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <AlbumArt track={track} size={48} radius={12} />
                  {active && isPlaying && (
                    <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: "rgba(0,0,0,0.45)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                      {[0, 1, 2].map(b => <div key={b} className="playing-dot" style={{ width: 3, height: 10 + b * 4, borderRadius: 99, background: "#007aff", animationDelay: `${b * 0.2}s` }} />)}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: active ? 600 : 500, color: active ? "#007aff" : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{track.artist}{track.album ? ` · ${track.album}` : ""}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={e => { e.stopPropagation(); onToggleLike(track); }}
                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.15s" }}
                    onMouseDown={e => (e.currentTarget.style.transform = "scale(0.85)")}
                    onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill={likedIds.has(track.id) ? "#007aff" : "none"}
                      stroke={likedIds.has(track.id) ? "#007aff" : "rgba(255,255,255,0.3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{formatDuration(track.duration)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
