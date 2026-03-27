import { useState, useEffect, useRef } from "react";
import { Track, apiTrackToTrack, formatDuration } from "@/data/music";

// Public API Proxy for live YouTube Music Search in 2026
const SEARCH_API = "https://pipedapi.kavin.rocks/search?filter=music_songs&q=";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 50); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!searchQuery.trim()) { setSearchResults([]); setShowSearch(false); setSearchLoading(false); return; }
    
    setSearchLoading(true); setShowSearch(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${SEARCH_API}${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        // Mapping Piped API response to XOS Track format
        const formatted = data.items.map((item: any, i: number) => ({
          id: item.url.split("v=")[1],
          videoId: item.url.split("v=")[1],
          title: item.title,
          artist: item.uploaderName,
          duration: item.duration,
          thumbnail: item.thumbnail,
          ...apiTrackToTrack({}, i + 50) // Inherit xos1 gradients
        }));
        setSearchResults(formatted);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 600);
  }, [searchQuery]);

  const quickPicks = trendingTracks.length > 0 ? trendingTracks : tracks.slice(0, 8);

  return (
    <div style={{ paddingBottom: 160 }}>
      {/* Header */}
      <div className="slide-up" style={{ padding: "56px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>XOS Music</h1>
        <span className="dev-badge" style={{ fontSize: 8, fontWeight: 600, color: "#007aff", background: "rgba(0,122,255,0.12)",
          border: "1px solid rgba(0,122,255,0.25)", borderRadius: 99, padding: "3px 8px",
          letterSpacing: "0.5px", textTransform: "uppercase" }}>STABLE v1.1</span>
      </div>

      {/* Search using Font Awesome */}
      <div className="slide-up slide-up-delay-1" style={{ padding: "0 20px 20px", position: "relative", zIndex: 50 }}>
        <div style={{ position: "relative" }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4, fontSize: 14 }}></i>
          <input className="search-input glass" type="search" placeholder="Search YouTube Music..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "12px 16px 12px 40px", fontSize: 15, borderRadius: 14, border: "1px solid #1a1a1a", color: "#fff", outline: "none" }} />
        </div>
        
        {showSearch && (
          <div className="glass slide-up" style={{ position: "absolute", top: "calc(100% + 8px)", left: 20, right: 20,
            borderRadius: 16, overflow: "hidden", zIndex: 100, maxHeight: 400, overflowY: "auto", border: "1px solid #1a1a1a" }}>
            {searchLoading ? (
              <div style={{ padding: 20, textAlign: "center", color: "#007aff" }}><i className="fa-solid fa-circle-notch fa-spin"></i></div>
            ) : searchResults.map(track => (
              <div key={track.id} className="interactive" onClick={() => { onTrackSelect(track); setSearchQuery(""); }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #1a1a1a" }}>
                <AlbumArt track={track} size={40} radius={10} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{track.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{track.artist}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sections ... (Keeping Quick Picks and History consistent) */}
      <section style={{ padding: "0 20px" }}>
         <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Quick Picks</h2>
         <div className="scroll-hide" style={{ display: "flex", gap: 14, overflowX: "auto" }}>
            {quickPicks.map(track => (
              <div key={track.id} className="interactive glass" onClick={() => onTrackSelect(track)}
                style={{ flexShrink: 0, width: 150, borderRadius: 16, padding: 12, position: "relative" }}>
                <AlbumArt track={track} size={126} radius={12} />
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 10 }}>{track.title}</div>
                <button onClick={e => { e.stopPropagation(); onToggleLike(track); }}
                  style={{ position: "absolute", top: 18, right: 18, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 28, height: 28 }}>
                  <i className={likedIds.has(track.id) ? "fa-solid fa-heart" : "fa-regular fa-heart"} style={{ color: likedIds.has(track.id) ? "#007aff" : "#fff", fontSize: 12 }}></i>
                </button>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}
