"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      // When the user hits enter, send them to the search page!
      router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Clear the bar
    }
  };

  return (
    // Fixed at the top, glassmorphism blur effect, z-50 keeps it above videos
    <nav className="fixed top-0 left-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 transition-all duration-300 py-3 px-6 md:px-16 flex items-center justify-between">
      
      {/* Logo Area */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="bg-red-600 p-1.5 rounded-md transform group-hover:rotate-12 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-xl font-black tracking-tight text-white group-hover:text-red-500 transition-colors">
          Anime<span className="text-red-600">Stream</span>
        </span>
      </Link>

      {/* The Sleek Search Bar */}
      <form onSubmit={handleSearch} className="relative w-full max-w-xs md:max-w-md hidden sm:block group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-zinc-400 group-focus-within:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for anime..."
          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm rounded-full focus:ring-2 focus:ring-red-600 focus:border-transparent block pl-10 p-2.5 transition-all hover:bg-zinc-800 focus:bg-zinc-900 placeholder-zinc-500"
        />
      </form>

    </nav>
  );
}