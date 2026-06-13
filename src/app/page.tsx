import Link from "next/link";

async function getTrendingAnime() {
  // UPDATED QUERY: We added strict filters to ban unreleased shows and movies!
  const query = `
    query {
      Page(page: 1, perPage: 13) {
        media(type: ANIME, sort: TRENDING_DESC, status_not: NOT_YET_RELEASED, format_in: [TV, TV_SHORT, ONA]) {
          id
          title { english romaji }
          description
          bannerImage
          coverImage { extraLarge }
          episodes
        }
      }
    }
  `;

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return null;
    const json = await res.json();
    return json.data.Page.media;
  } catch (error) {
    return null;
  }
}

export default async function Home() {
  const animeData = await getTrendingAnime();

  if (!animeData || animeData.length === 0) {
    return <div className="min-h-screen bg-zinc-950 text-white p-10">Loading Database...</div>;
  }

  const heroAnime = animeData[0];
  const heroTitle = heroAnime.title.english || heroAnime.title.romaji;
  const cleanDescription = heroAnime.description?.replace(/<[^>]*>?/gm, '') || "No description available.";
  
  const trendingGrid = animeData.slice(1);

  return (
    <main className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      
      {/* 1. HERO BANNER SECTION */}
      <section className="relative w-full h-[70vh] md:h-[85vh] flex items-end pb-20 md:pb-32 px-6 md:px-16">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroAnime.bannerImage || heroAnime.coverImage.extraLarge} 
            alt={heroTitle} 
            className="w-full h-full object-cover object-center opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent w-full md:w-3/4"></div>
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex gap-3 mb-4 items-center">
            <span className="text-red-500 font-bold tracking-widest text-sm uppercase drop-shadow-md">
              #1 Trending Worldwide
            </span>
            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
              {heroAnime.episodes ? `${heroAnime.episodes} EP` : "Ongoing"}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-extrabold mb-4 drop-shadow-2xl">
            {heroTitle}
          </h1>
          <p className="text-zinc-300 text-sm md:text-lg mb-8 max-w-2xl line-clamp-3 leading-relaxed drop-shadow-md">
            {cleanDescription}
          </p>
          
          <div className="flex gap-4">
            <Link 
              href={`/info/${encodeURIComponent(heroTitle)}`}
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-red-600/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
              View Episodes
            </Link>
          </div>
        </div>
      </section>

      {/* 2. TRENDING GRID SECTION */}
      <section className="px-6 md:px-16 pb-20 relative z-20 -mt-10 md:-mt-20">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
          <span className="w-1.5 h-8 bg-red-500 rounded-full inline-block"></span>
          Trending Now
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {trendingGrid.map((anime: any) => {
            const title = anime.title.english || anime.title.romaji;
            return (
              <Link href={`/info/${encodeURIComponent(title)}`} key={anime.id} className="group relative">
                
                <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden shadow-lg transition-transform duration-300 ease-out group-hover:scale-105 group-hover:shadow-red-500/20 group-hover:shadow-2xl border border-zinc-800 group-hover:border-zinc-600">
                  <img 
                    src={anime.coverImage.extraLarge} 
                    alt={title}
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                  />
                  
                  <div className="absolute top-2 right-2 bg-black/80 text-zinc-300 text-xs font-bold px-2 py-1 rounded backdrop-blur-sm border border-zinc-700/50 z-10 shadow-lg">
                    {anime.episodes ? `${anime.episodes} EP` : "Ongoing"}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                    <div className="bg-red-600 p-4 rounded-full text-white shadow-lg shadow-red-500/50 transform group-hover:scale-110 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <h3 className="mt-3 text-zinc-300 font-semibold text-sm md:text-base truncate group-hover:text-red-400 transition-colors">
                  {title}
                </h3>
              </Link>
            );
          })}
        </div>
      </section>

    </main>
  );
}