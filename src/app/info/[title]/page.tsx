import Link from "next/link";

// 1. Ask AniList for the specific anime details based on the URL title
async function getAnimeDetails(title: string) {
  const query = `
    query ($search: String) {
      Media (search: $search, type: ANIME) {
        title { english romaji }
        description
        bannerImage
        coverImage { extraLarge }
        episodes
        status
        genres
        averageScore
        nextAiringEpisode { episode }
      }
    }
  `;

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query, 
        variables: { search: title } 
      }),
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return null;
    const json = await res.json();
    return json.data.Media;
  } catch (error) {
    return null;
  }
}

export default async function InfoPage({ params }: { params: { title: string } }) {
  const decodedTitle = decodeURIComponent(params.title);
  const anime = await getAnimeDetails(decodedTitle);

  if (!anime) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center flex-col">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Anime Not Found</h1>
        <Link href="/" className="bg-zinc-800 px-6 py-2 rounded-full hover:bg-zinc-700">Go Home</Link>
      </div>
    );
  }

  const displayTitle = anime.title.english || anime.title.romaji;
  
  // Clean up the HTML tags that AniList sometimes leaves in their descriptions
  const cleanDescription = anime.description?.replace(/<br><br>/g, '\n\n').replace(/<[^>]*>?/gm, '') || "No synopsis available.";
  
  // Calculate total episodes. If it's still airing, we calculate based on the next scheduled episode!
  const epCount = anime.episodes || (anime.nextAiringEpisode?.episode ? anime.nextAiringEpisode.episode - 1 : 12);
  
  // Generate an array of numbers [1, 2, 3...] up to the total episode count
  const episodeList = Array.from({ length: epCount }, (_, i) => i + 1);

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-20">
      
      {/* 1. CINEMATIC HERO HEADER */}
      <div className="relative w-full h-[50vh] md:h-[60vh]">
        <div className="absolute inset-0">
          <img 
            src={anime.bannerImage || anime.coverImage.extraLarge} 
            alt={displayTitle} 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"></div>
        </div>
      </div>

      {/* 2. DETAILS SECTION (Pushed up to overlap the banner) */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10 -mt-32 md:-mt-48 flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Cover Art */}
        <div className="w-48 md:w-72 flex-shrink-0 mx-auto md:mx-0 shadow-2xl shadow-black/50 rounded-xl overflow-hidden border border-zinc-800">
          <img 
            src={anime.coverImage.extraLarge} 
            alt={displayTitle} 
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Right Column: Title & Data */}
        <div className="flex-col justify-end pt-4 md:pt-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">{displayTitle}</h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm font-medium">
            <span className="bg-red-600 text-white px-3 py-1 rounded-md shadow-md">
              Score: {anime.averageScore ? `${anime.averageScore}%` : 'N/A'}
            </span>
            <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-md border border-zinc-700">
              {anime.status.replace('_', ' ')}
            </span>
            <span className="text-zinc-400">
              {anime.genres.slice(0, 3).join(' • ')}
            </span>
          </div>

          <p className="text-zinc-300 leading-relaxed max-w-3xl whitespace-pre-wrap text-sm md:text-base">
            {cleanDescription}
          </p>
        </div>
      </div>

      {/* 3. EPISODE GRID SECTION */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-16">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <span className="w-1.5 h-8 bg-red-500 rounded-full inline-block"></span>
          Available Episodes
        </h2>

        {/* Responsive grid for episode buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {episodeList.map((epNum) => (
            <Link 
              key={epNum}
              // This is where the magic happens! We route the user to the watch page with the specific episode number.
              href={`/watch/${encodeURIComponent(displayTitle)}/${epNum}`}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-red-500/50 text-zinc-300 hover:text-white transition-all duration-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 group shadow-lg"
            >
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-red-400 transition-colors">
                Episode
              </span>
              <span className="text-2xl font-black">
                {epNum}
              </span>
            </Link>
          ))}
        </div>
      </div>

    </main>
  );
}