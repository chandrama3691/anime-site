import Link from "next/link";

interface AnimeDetails {
  mal_id: number;
  title: string;
  title_english: string | null;
  synopsis: string;
  year: number | null;
  episodes: number | null;
  score: number | null;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
}

interface Episode {
  mal_id: number;
  title: string;
  title_japanese: string | null;
}

async function getAnimeDetails(id: string) {
  const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`, {
    next: { revalidate: 3600 }
  });
  if (!response.ok) throw new Error('Failed to fetch details');
  const data = await response.json();
  return data.data;
}

async function getAnimeEpisodes(id: string) {
  const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/episodes`, {
    next: { revalidate: 3600 }
  });
  if (!response.ok) return []; 
  const data = await response.json();
  return data.data;
}

export default async function AnimeDetailsPage({ params }: { params: { id: string } }) {
  const id = params.id;
  
  const anime: AnimeDetails = await getAnimeDetails(id);
  const episodes: Episode[] = await getAnimeEpisodes(id);

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      
      <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
        </svg>
        Back to Home
      </Link>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <img 
          src={anime.images.jpg.large_image_url} 
          alt={anime.title} 
          className="w-full md:w-72 rounded-lg shadow-2xl object-cover"
        />
        <div>
          <h1 className="text-4xl font-bold mb-2">{anime.title_english || anime.title}</h1>
          <div className="flex gap-4 text-sm text-zinc-400 mb-6">
            <span>{anime.year || "N/A"}</span>
            <span>•</span>
            <span>{anime.episodes ? `${anime.episodes} Episodes` : "Ongoing"}</span>
            <span>•</span>
            <span className="bg-red-600 text-white px-2 py-0.5 rounded font-bold">{anime.score} ★</span>
          </div>
          <p className="text-zinc-300 leading-relaxed max-w-3xl">
            {anime.synopsis}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 border-l-4 border-red-500 pl-3">Episodes</h2>
        
        {episodes && episodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* The Clickable Episode Link */}
            {episodes.map((ep: Episode) => (
              <Link 
                href={`/watch/${encodeURIComponent(anime.title)}/${ep.mal_id}`} 
                key={ep.mal_id} 
                className="bg-zinc-900 p-4 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800 hover:border-red-500 block"
              >
                <div className="text-red-500 font-bold mb-1">Episode {ep.mal_id}</div>
                <div className="text-sm font-medium line-clamp-1">{ep.title}</div>
                {ep.title_japanese && (
                  <div className="text-xs text-zinc-500 mt-1 line-clamp-1">{ep.title_japanese}</div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-zinc-500 bg-zinc-900 p-6 rounded-lg text-center">
            No episode list available for this title yet.
          </div>
        )}
      </div>

    </main>
  );
}