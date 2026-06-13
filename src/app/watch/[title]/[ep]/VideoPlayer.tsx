"use client";

import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

export default function VideoPlayer({ url }: { url: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-96 bg-zinc-900 animate-pulse rounded-lg flex items-center justify-center">Loading Player...</div>;

  // This one line completely fixes the TypeScript library clash
  const Player = ReactPlayer as any;

  return (
    <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden shadow-2xl border border-zinc-800">
      <Player
        url={url}
        controls
        width="100%"
        height="100%"
        className="absolute top-0 left-0"
        playing={false}
      />
    </div>
  );
}