Export interface Track {
  id: string;
  videoId: string | null;
  title: string;
  artist: string;
  album: string;
  duration: number;
  thumbnail: string | null;
  gradientFrom: string;
  gradientTo: string;
}

const GRADIENTS = [
  ["#1a1a2e","#007aff"], ["#2d1b69","#c850c0"], ["#0f3460","#e94560"],
  ["#1a0533","#8b5cf6"], ["#0d0d0d","#007aff"], ["#1c1c1c","#ff6b6b"],
  ["#0a1628","#20bf55"], ["#2d1b00","#ff8c00"], ["#1a0a00","#ff6b35"],
  ["#001a33","#00d4ff"], ["#0a0a1a","#007aff"], ["#1a0033","#a855f7"],
  ["#00180a","#22c55e"], ["#180012","#ec4899"], ["#001a0a","#10b981"],
  ["#1a1000","#f59e0b"],
];

export function getGradient(index: number): [string, string] {
  const g = GRADIENTS[index % GRADIENTS.length];
  return [g[0], g[1]];
}

export function apiTrackToTrack(item: any, index: number): Track {
  const [from, to] = getGradient(index);
  return {
    id: item.videoId ?? `track-${index}`,
    videoId: item.videoId ?? null,
    title: item.title ?? "Unknown",
    artist: item.artist ?? "Unknown",
    album: item.album ?? "",
    duration: item.duration ?? 0,
    thumbnail: item.thumbnail ?? null,
    gradientFrom: from,
    gradientTo: to,
  };
}

export function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export const FALLBACK_TRACKS: Track[] = [
  { id:"1", videoId:"H5v3kku4y6Q", title:"Midnight Drive",    artist:"ODESZA",        album:"A Moment Apart",       duration:243, thumbnail:null, gradientFrom:"#1a1a2e", gradientTo:"#007aff" },
  { id:"2", videoId:"4NRXx6U8ABQ", title:"Blinding Lights",   artist:"The Weeknd",    album:"After Hours",          duration:200, thumbnail:null, gradientFrom:"#2d1b69", gradientTo:"#c850c0" },
  { id:"3", videoId:"MV_3Dpw-BRY", title:"Electric Feel",     artist:"MGMT",          album:"Oracular Spectacular", duration:229, thumbnail:null, gradientFrom:"#0f3460", gradientTo:"#e94560" },
  { id:"4", videoId:"TUVcZfQe-Kw", title:"Levitating",        artist:"Dua Lipa",      album:"Future Nostalgia",     duration:203, thumbnail:null, gradientFrom:"#1a0533", gradientTo:"#8b5cf6" },
  { id:"5", videoId:"XXYlFuWEuKI", title:"Save Your Tears",   artist:"The Weeknd",    album:"After Hours",          duration:215, thumbnail:null, gradientFrom:"#0d0d0d", gradientTo:"#007aff" },
  { id:"6", videoId:"CxrPtCMFMoA", title:"Starboy",           artist:"The Weeknd",    album:"Starboy",              duration:230, thumbnail:null, gradientFrom:"#1c1c1c", gradientTo:"#ff6b6b" },
  { id:"7", videoId:"0VuPvdCLlcM", title:"Circles",           artist:"Post Malone",   album:"Hollywood's Bleeding", duration:215, thumbnail:null, gradientFrom:"#0a1628", gradientTo:"#20bf55" },
  { id:"8", videoId:"bkljB7Y6qQ",  title:"Heat Waves",        artist:"Glass Animals", album:"Dreamland",            duration:238, thumbnail:null, gradientFrom:"#2d1b00", gradientTo:"#ff8c00" },
];

// ── Shuffle utility ─────────────────────────────────────────────────────────
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type RepeatMode = "none" | "all" | "one";
