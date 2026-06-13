"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function WatchPage({ params }: { params: { title: string, ep: string } }) {
  const title = decodeURIComponent(params.title);
  const epNumber = params.ep;

  const [imdbId, setImdbId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeServer, setActiveServer] = useState<{name: string, url: string} | null>(null);
  const [servers, setServers] = useState<{name: string, url: string}[]>([]);

  useEffect(() => {
    async function fetchDynamicId() {
      try {
        // 1. Clean basic weird characters
        let cleanTitle = title.replace(/ *\([^)]*\) */g, "").trim();

        // 2. THE NORMALIZER: Look for "Season X" or "Xnd Season" and save the number!
        let targetSeason = "1";
        const seasonMatch = cleanTitle.match(/Season\s*(\d+)/i) || cleanTitle.match(/(\d+)(?:st|nd|rd|th)\s*Season/i);
        
        if (seasonMatch) {
          targetSeason = seasonMatch[1];
        }

        // 3. Strip the season text out completely so TVMaze can find the root show
        const baseShowTitle = cleanTitle.replace(/(Season \d+|Part \d+|\d+(st|nd|rd|th) Season|Cour \d+|The Movie)/gi, '').trim();

        // Search TVMaze with the cleaned base title
        const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(baseShowTitle)}`);
        const data = await res.json();
        
        const fetchedImdb = data[0]?.show?.externals?.imdb;

        if (fetchedImdb) {
          setImdbId(fetchedImdb);
          
          // 4. Inject BOTH the dynamic IMDB ID and the dynamic Season Number!
          const dynamicServers = [
            { name: "Server 1 (VidSrc ME)", url: `https://vidsrc.me/embed/tv?imdb=${fetchedImdb}&season=${targetSeason}&episode=${epNumber}` },
            { name: "Server 2 (VidLink)", url: `https://vidlink.pro/tv/${fetchedImdb}/${targetSeason}/${epNumber}` },
            { name: "Server 3 (SuperEmbed)", url: `https://multiembed.mov/?video_id=${fetchedImdb}&tmdb=0&s=${targetSeason}&e=${epNumber}` },
            { name: "Server 4 (VidSrc Net)", url: `https://vidsrc.net/embed/tv?imdb=${fetchedImdb}&season=${targetSeason}&episode=${epNumber}` }
          ];
          
          setServers(dynamicServers);
          setActiveServer(dynamicServers[0]);
        } else {
          setImdbId("NOT_FOUND");
        }
      } catch (error) {
        setImdbId("ERROR");
      }
      setIsLoading(false);
    }

    fetchDynamicId();
  }, [title, epNumber]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-6 flex justify-between items-center border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              {title}
            </h1>
            <h2 className="text-lg text-zinc-400 mt-2 font-medium">Episode {epNumber}</h2>
          </div>
          <Link href="/" className="text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 px-6 py-2.5 rounded-full transition-all hover:scale-105 shadow-lg">
            Back to Home
          </Link>
        </header>

        {isLoading && (
          <div className="w-full aspect-video bg-zinc-900 rounded-xl flex flex-col items-center justify-center border border-zinc-800 shadow-2xl">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-400 font-mono text-sm tracking-widest uppercase">Syncing databases...</p>
          </div>
        )}

        {!isLoading && (imdbId === "NOT_FOUND" || imdbId === "ERROR") && (
          <div className="w-full py-24 bg-zinc-900 rounded-xl text-center border border-zinc-800 shadow-2xl px-6">
            <h3 className="text-2xl font-bold text-red-500 mb-2">Anime Not Found</h3>
            <p className="text-zinc-400 max-w-md mx-auto">
              Our database could not locate the specific IMDB ID for "{title}". 
            </p>
          </div>
        )}

        {!isLoading && activeServer && (
          <>
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="text-zinc-500 text-sm flex items-center mr-2">Select Server:</span>
              {servers.map((server, index) => (
                <button
                  key={index}
                  onClick={() => setActiveServer(server)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                    activeServer.name === server.name 
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/30" 
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  }`}
                >
                  {server.name}
                </button>
              ))}
            </div>

            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800 relative">
              <iframe 
                src={activeServer.url}
                className="w-full h-full absolute top-0 left-0"
                allowFullScreen
                scrolling="no"
                frameBorder="0"
                title={`Watch ${title} Episode ${epNumber}`}
              ></iframe>
            </div>
            
            <div className="mt-4 flex justify-between text-xs text-zinc-600 font-mono">
              <span>Extracted Search: "{title.replace(/(Season \d+|Part \d+|\d+(st|nd|rd|th) Season|Cour \d+|The Movie)/gi, '').trim()}"</span>
              <span>Mapped IMDB ID: {imdbId}</span>
            </div>
          </>
        )}

      </div>
    </main>
  );
}