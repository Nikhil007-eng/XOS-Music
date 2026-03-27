Import { useState, useEffect, useRef, useCallback } from "react";
import { Track, apiTrackToTrack, FALLBACK_TRACKS, shuffleArray, RepeatMode } from "@/data/music";
import Home from "@/pages/Home";
import BottomPlayer from "@/components/BottomPlayer";
import BottomNav from "@/components/BottomNav";
import YouTubePlayer from "@/components/YouTubePlayer";
import NowPlaying from "@/components/NowPlaying";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ── Library page (liked tracks) ─────────────────────────────────────────────
function LibraryPage({ likedTracks, onTrackSelect, currentTrack, isPlaying }: {
  likedTracks: Track[]; onTrackSelect: (t: Track) => void; currentTrack: Track; isPlaying: boolean;
}) {
  return (
    <div style={{ padding: "56px 20px 20px" }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 4, letterSpacing: "-0.5px" }}>Library</h2>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>{likedTracks.length} liked songs</p>
      {likedTracks.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>♡</div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Songs you like will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {likedTracks.map(track => {
            const active = currentTrack.id === track.id;
            return (
              <div key={track.id} onClick={() => onTrackSelect(track)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 14, cursor: "pointer",
                  background: active ? "rgba(0,122,255,0.08)" : "transparent",
                  border: active ? "1px solid rgba(0,122,255,0.15)" : "1px solid transparent",
                  transition: "background 0.2s" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, overflow: "hidden",
                  background: `linear-gradient(135deg,${track.gradientFrom},${track.gradientTo})` }}>
                  {track.thumbnail && <img src={track.thumbnail} alt={track.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: active ? 600 : 500, color: active ? "#007aff" : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{track.artist}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#007aff">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Profile page ─────────────────────────────────────────────────────────────
function ProfilePage({ likedCount }: { likedCount: number }) {
  return (
    <div style={{ padding: "56px 20px 20px", textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#007aff,#a855f7)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🎵</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Music Lover</h2>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>XOS Music · YouTube Music</p>
      <div style={{ marginTop: 32, display: "flex", gap: 16, justifyContent: "center" }}>
        {[[String(likedCount), "Liked"], ["43", "Playlists"], ["8", "Albums"]].map(([num, label]) => (
          <div key={label} className="glass" style={{ padding: "16px 20px", borderRadius: 16, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#007aff" }}>{num}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tracks, setTracks]               = useState<Track[]>(FALLBACK_TRACKS);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack]   = useState<Track>(FALLBACK_TRACKS[0]);
  const [isPlaying, setIsPlaying]         = useState(false);
  const [activeTab, setActiveTab]         = useState("home");
  const [ytReady, setYtReady]             = useState(false);
  const [currentTime, setCurrentTime]     = useState(0);
  const [duration, setDuration]           = useState(0);

  // ── New state ───────────────────────────────────────────────────────────────
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [likedIds, setLikedIds]           = useState<Set<string>>(new Set());
  const [repeatMode, setRepeatMode]       = useState<RepeatMode>("none");
  const [isShuffled, setIsShuffled]       = useState(false);
  const [queue, setQueue]                 = useState<Track[]>(FALLBACK_TRACKS);
  const [sleepTimer, setSleepTimer]       = useState<number | null>(null); // minutes remaining

  const playerRef       = useRef<any>(null);
  const timeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sleepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tracksRef       = useRef<Track[]>(tracks);
  const queueRef        = useRef<Track[]>(queue);

  useEffect(() => { tracksRef.current = tracks; }, [tracks]);
  useEffect(() => { queueRef.current = queue; }, [queue]);

  // ── Fetch tracks ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${BASE}/api/music/home`).then(r => r.json()).then(data => {
      if (data.tracks?.length) {
        const loaded = data.tracks.map((t: any, i: number) => apiTrackToTrack(t, i));
        setTracks(loaded);
        setQueue(loaded);
        setCurrentTrack(loaded[0]);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${BASE}/api/music/trending`).then(r => r.json()).then(data => {
      if (data.tracks?.length)
        setTrendingTracks(data.tracks.map((t: any, i: number) => apiTrackToTrack(t, i + 20)));
    }).catch(() => {});
  }, []);

  // ── Time tracking ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    if (isPlaying && ytReady && playerRef.current) {
      timeIntervalRef.current = setInterval(() => {
        try {
          const ct  = playerRef.current?.getCurrentTime?.() ?? 0;
          const dur = playerRef.current?.getDuration?.() ?? 0;
          setCurrentTime(Math.floor(ct));
          if (dur > 0) setDuration(Math.floor(dur));
        } catch {}
      }, 1000);
    }
    return () => { if (timeIntervalRef.current) clearInterval(timeIntervalRef.current); };
  }, [isPlaying, ytReady]);

  // ── Sleep timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
    if (sleepTimer === null) return;
    sleepIntervalRef.current = setInterval(() => {
      setSleepTimer(prev => {
        if (prev === null) return null;
        if (prev <= 1) { setIsPlaying(false); clearInterval(sleepIntervalRef.current!); return null; }
        return prev - 1;
      });
    }, 60_000);
    return () => { if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current); };
  }, [sleepTimer]);

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const getNextTrack = useCallback((forward: boolean) => {
    const list = queueRef.current;
    const idx  = list.findIndex(t => t.id === currentTrack.id);
    if (forward) return list[(idx + 1) % list.length];
    return list[(idx - 1 + list.length) % list.length];
  }, [currentTrack.id]);

  const handleNext = useCallback(() => {
    if (repeatMode === "one") {
      try { playerRef.current?.seekTo?.(0, true); } catch {}
      setIsPlaying(true); return;
    }
    setCurrentTrack(getNextTrack(true));
    setCurrentTime(0); setIsPlaying(true);
  }, [repeatMode, getNextTrack]);

  const handlePrev = useCallback(() => {
    if (currentTime > 3) { try { playerRef.current?.seekTo?.(0, true); } catch {} setCurrentTime(0); return; }
    setCurrentTrack(getNextTrack(false));
    setCurrentTime(0); setIsPlaying(true);
  }, [currentTime, getNextTrack]);

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track); setCurrentTime(0); setIsPlaying(true);
    // build queue starting from selected track
    const list = tracksRef.current;
    const idx  = list.findIndex(t => t.id === track.id);
    const reordered = [...list.slice(idx), ...list.slice(0, idx)];
    setQueue(isShuffled ? shuffleArray(reordered) : reordered);
  };

  // ── Shuffle ─────────────────────────────────────────────────────────────────
  const handleToggleShuffle = () => {
    setIsShuffled(prev => {
      const next = !prev;
      setQueue(q => next ? shuffleArray(q) : [...tracksRef.current]);
      return next;
    });
  };

  // ── Repeat ──────────────────────────────────────────────────────────────────
  const handleCycleRepeat = () => {
    setRepeatMode(m => m === "none" ? "all" : m === "all" ? "one" : "none");
  };

  // ── Like ────────────────────────────────────────────────────────────────────
  const handleToggleLike = (track?: Track) => {
    const t = track ?? currentTrack;
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(t.id) ? next.delete(t.id) : next.add(t.id);
      return next;
    });
  };

  const likedTracks = tracks.filter(t => likedIds.has(t.id));

  return (
    <div style={{ minHeight: "100vh", background: "#000000", fontFamily: "'Space Grotesk',sans-serif" }}>
      <YouTubePlayer
        videoId={currentTrack.videoId}
        isPlaying={isPlaying}
        onReady={p => { playerRef.current = p; setYtReady(true); }}
        onStateChange={s => {
          if (s === 0) handleNext();
          else if (s === 1) setIsPlaying(true);
          else if (s === 2) setIsPlaying(false);
        }}
        onError={handleNext}
      />

      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {(activeTab === "home" || activeTab === "search") && (
          <Home
            tracks={tracks} trendingTracks={trendingTracks}
            currentTrack={currentTrack} isPlaying={isPlaying}
            onTrackSelect={handleTrackSelect}
            onPlayPause={() => setIsPlaying(p => !p)}
            likedIds={likedIds}
            onToggleLike={handleToggleLike}
          />
        )}
        {activeTab === "library" && (
          <LibraryPage
            likedTracks={likedTracks} onTrackSelect={handleTrackSelect}
            currentTrack={currentTrack} isPlaying={isPlaying}
          />
        )}
        {activeTab === "profile" && <ProfilePage likedCount={likedIds.size} />}
      </div>

      <BottomPlayer
        track={currentTrack} isPlaying={isPlaying}
        currentTime={currentTime} duration={duration || currentTrack.duration}
        onPlayPause={() => setIsPlaying(p => !p)}
        onNext={handleNext} onPrev={handlePrev}
        onSeek={s => { try { playerRef.current?.seekTo?.(s, true); setCurrentTime(s); } catch {} }}
        onOpenNowPlaying={() => setShowNowPlaying(true)}
        isLiked={likedIds.has(currentTrack.id)}
        onToggleLike={() => handleToggleLike()}
      />

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {showNowPlaying && (
        <NowPlaying
          track={currentTrack} isPlaying={isPlaying}
          currentTime={currentTime} duration={duration || currentTrack.duration}
          onPlayPause={() => setIsPlaying(p => !p)}
          onNext={handleNext} onPrev={handlePrev}
          onSeek={s => { try { playerRef.current?.seekTo?.(s, true); setCurrentTime(s); } catch {} }}
          onClose={() => setShowNowPlaying(false)}
          isLiked={likedIds.has(currentTrack.id)}
          onToggleLike={() => handleToggleLike()}
          repeatMode={repeatMode} onCycleRepeat={handleCycleRepeat}
          isShuffled={isShuffled} onToggleShuffle={handleToggleShuffle}
          queue={queue} onQueueTrackSelect={t => { handleTrackSelect(t); }}
          sleepTimer={sleepTimer} onSetSleepTimer={setSleepTimer}
        />
      )}
    </div>
  );
}
