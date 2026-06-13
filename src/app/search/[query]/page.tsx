import Link from "next/link";

async function getSearchResults(searchString: string) {
  const query = `
    query ($search: String) {
      Page(page: 1, perPage: 24) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC, status_not: NOT_YET_RELEASED, format_in: [TV, TV_SHORT, ONA]) {
          id
          title { english romaji }
          coverImage { extraLarge }
          episodes
          averageScore
        }
      }
    }
  `;

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query, 
        variables: { search: searchString } 
      }),
      cache: 'no-store'
    });
    
    if (!res.ok) return null;
    const json = await res.json();
    return json.data.Page.media;
  } catch (error) {
    return null;
  }
}

export default async function SearchPage({ params }: { params: { query: string } }) {
  const decodedQuery = decodeURIComponent(params.query);
  const searchResults = await getSearchResults(decodedQuery);

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6 md:p-16">
      
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">
          Search Results for <span className="text-red-500">"{decodedQuery}"</span>
        </h1>
        <p className="text-zinc-500">
          Found {searchResults?.length || 0} matches
        </p>
      </div>

      {(!searchResults || searchResults.length === 0) ? (
        <div className="w-full py-20 text-center border border-zinc-800 rounded-xl bg-zinc-900/50">
          <h2 className="text-xl text-zinc-400">No anime found matching your search.</h2>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {searchResults.map((anime: any) => {
            const title = anime.title.english || anime.title.romaji;
            return (
              <Link href={`/info/${encodeURIComponent(title)}`} key={anime.id} className="group relative">
                <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105 border border-zinc-800 group-hover:border-zinc-600">
                  <img 
                    src={anime.coverImage.extraLarge} 
                    alt={title}
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                  />
                  
                  {/* Rating Badge */}
                  {anime.averageScore && (
                    <div className="absolute top-2 left-2 bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm z-10">
                      {anime.averageScore}%
                    </div>
                  )}

                  <div className="absolute top-2 right-2 bg-black/80 text-zinc-300 text-xs font-bold px-2 py-1 rounded backdrop-blur-sm border border-zinc-700/50 z-10">
                    {anime.episodes ? `${anime.episodes} EP` : "Ongoing"}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                    <div className="bg-red-600 p-4 rounded-full text-white shadow-lg shadow-red-500/50 transform group-hover:scale-110 transition-transform">
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
      )}
    </main>
  );
}