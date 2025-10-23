import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchTracks, searchArtists, searchAlbums } from '../services/deezerApi';
import MusicCard from '../components/MusicCard';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [isLoading, setIsLoading] = useState(true);
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [activeTab, setActiveTab] = useState('tracks');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');
      
      try {
        // Fetch data in parallel
        const [tracksData, artistsData, albumsData] = await Promise.all([
          searchTracks(query),
          searchArtists(query),
          searchAlbums(query)
        ]);
        
        setTracks(tracksData || []);
        setArtists(artistsData || []);
        setAlbums(albumsData || []);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to fetch search results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Custom handwritten styles
  const tabStyle = (tab) => `
    px-4 py-2 font-medium text-sm rounded-lg transition-colors
    ${activeTab === tab 
      ? 'bg-purple-600 text-white' 
      : 'text-gray-300 hover:text-white hover:bg-gray-800'
    }
  `;

  const renderArtistCard = (artist) => (
    <div key={artist.id} className="bg-gray-800/60 p-4 rounded-lg backdrop-blur-sm hover:shadow-glow transition-all duration-300 border border-gray-700/50">
      <div className="relative mb-3">
        <img 
          src={artist.picture_medium || artist.picture} 
          alt={artist.name} 
          className="w-32 h-32 mx-auto rounded-full object-cover border-2 border-gray-700"
        />
      </div>
      <a href={`/artist/${artist.id}`} className="block text-center">
        <h3 className="font-bold text-white truncate hover:text-purple-400 transition">
          {artist.name}
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          {artist.nb_fan ? `${(artist.nb_fan / 1000).toFixed(1)}k fans` : 'Artist'}
        </p>
      </a>
    </div>
  );

  const renderAlbumCard = (album) => (
    <div key={album.id} className="bg-gray-800/60 p-4 rounded-lg backdrop-blur-sm hover:shadow-glow transition-all duration-300 border border-gray-700/50">
      <div className="relative mb-3">
        <img 
          src={album.cover_medium || album.cover} 
          alt={album.title} 
          className="w-full h-40 object-cover rounded-md"
        />
      </div>
      <a href={`/album/${album.id}`} className="block">
        <h3 className="font-bold text-white truncate hover:text-purple-400 transition">
          {album.title}
        </h3>
      </a>
      <a href={`/artist/${album.artist?.id}`} className="block">
        <p className="text-sm text-gray-400 truncate hover:text-purple-400 transition">
          {album.artist?.name}
        </p>
      </a>
    </div>
  );
  
  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-white">
          Search results for <span className="text-purple-400">"{query}"</span>
        </h1>
        <p className="text-gray-400">
          {isLoading 
            ? 'Searching...' 
            : `Found ${tracks.length} tracks, ${artists.length} artists, and ${albums.length} albums`
          }
        </p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Custom-styled tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-700 pb-2">
        <button 
          onClick={() => setActiveTab('tracks')} 
          className={tabStyle('tracks')}
        >
          Songs
        </button>
        <button 
          onClick={() => setActiveTab('artists')} 
          className={tabStyle('artists')}
        >
          Artists
        </button>
        <button 
          onClick={() => setActiveTab('albums')} 
          className={tabStyle('albums')}
        >
          Albums
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-pulse flex space-x-2">
            <div className="h-3 w-3 bg-purple-400 rounded-full"></div>
            <div className="h-3 w-3 bg-purple-400 rounded-full animation-delay-200"></div>
            <div className="h-3 w-3 bg-purple-400 rounded-full animation-delay-400"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Tracks */}
          {activeTab === 'tracks' && (
            tracks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tracks.map((track) => (
                  <MusicCard key={track.id} song={track} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 py-8 text-center italic">No songs found matching your search.</p>
            )
          )}
          
          {/* Artists */}
          {activeTab === 'artists' && (
            artists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {artists.map(renderArtistCard)}
              </div>
            ) : (
              <p className="text-gray-400 py-8 text-center italic">No artists found matching your search.</p>
            )
          )}
          
          {/* Albums */}
          {activeTab === 'albums' && (
            albums.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {albums.map(renderAlbumCard)}
              </div>
            ) : (
              <p className="text-gray-400 py-8 text-center italic">No albums found matching your search.</p>
            )
          )}
        </>
      )}
    </div>
  );
};

export default Search;
