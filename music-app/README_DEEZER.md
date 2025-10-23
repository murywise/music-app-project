# Music App with Deezer API Integration

A modern, fully-functional music streaming web application built with **React** and powered by the **Deezer API**. Browse millions of songs, discover new artists, and enjoy 30-second previews of tracks - all without requiring authentication!

## 🎵 Features

### Core Functionality
- ✅ **Browse Trending Music** - Discover top chart tracks on the home page
- ✅ **Advanced Search** - Search for songs, artists, and albums in real-time
- ✅ **Song Details** - View comprehensive track information with related songs
- ✅ **Artist Profiles** - Explore artist pages with top tracks and full discography
- ✅ **Album Views** - Browse complete album tracklists with metadata
- ✅ **Audio Playback** - Play 30-second preview clips of any track
- ✅ **Persistent Player** - Fixed bottom player with play/pause controls
- ✅ **User Authentication** - Firebase-based login and signup system
- ✅ **Personal Library** - Save and manage your playlists (Firebase integration)

### User Experience
- 🎨 Modern, responsive UI with TailwindCSS
- 🔍 Instant search with loading states
- 🎯 Click-through navigation between songs, artists, and albums
- 📱 Mobile-friendly responsive design
- ⚡ Fast loading with optimized API calls
- 🎭 Hover effects and smooth transitions

## 🚀 Tech Stack

- **Frontend**: React 18
- **Routing**: React Router v6
- **Styling**: TailwindCSS
- **API**: Deezer API (free, no auth required)
- **Backend**: Firebase (Authentication & Firestore)
- **Icons**: React Icons
- **HTTP Client**: Axios

## 📁 Project Structure

```
src/
├── components/
│   ├── AudioPlayer.jsx       # Fixed bottom audio player
│   ├── MusicCard.jsx          # Reusable song card component
│   ├── Navbar.jsx             # Navigation bar
│   └── SearchBar.jsx          # Search interface
├── context/
│   ├── AudioContext.jsx       # Audio playback state management
│   └── AuthContext.jsx        # Firebase authentication context
├── pages/
│   ├── Home.jsx               # Trending tracks page
│   ├── Song.jsx               # Song details page
│   ├── Artist.jsx             # Artist profile page (NEW)
│   ├── Album.jsx              # Album details page (NEW)
│   ├── Library.jsx            # User playlists
│   ├── Playlist.jsx           # Playlist details
│   ├── Login.jsx              # Login page
│   └── Signup.jsx             # Signup page
├── services/
│   └── deezerApi.js           # Centralized Deezer API service (NEW)
├── firebase/
│   └── firebase.jsx           # Firebase configuration
└── App.jsx                    # Main app component
```

## 🔧 Installation & Setup

1. **Clone the repository**
```bash
cd music-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Open your browser**
```
http://localhost:3000
```

## 🎼 Deezer API Integration

### What is Deezer?
Deezer is a music streaming service with a comprehensive API that provides:
- 90+ million tracks
- Artist information and discographies
- Album details and tracklists
- Real-time search
- 30-second preview URLs
- **No authentication required for basic features!**

### API Service (`/src/services/deezerApi.js`)

The app includes a centralized API service with these functions:

#### Charts & Trending
- `getChartTracks(limit)` - Get trending tracks
- `getChartAlbums(limit)` - Get trending albums
- `getChartArtists(limit)` - Get trending artists

#### Search
- `searchAll(query)` - Search everything
- `searchTracks(query)` - Search tracks only
- `searchArtists(query)` - Search artists only
- `searchAlbums(query)` - Search albums only

#### Details
- `getTrack(trackId)` - Get track details
- `getArtist(artistId)` - Get artist info
- `getArtistTopTracks(artistId)` - Get artist's top songs
- `getArtistAlbums(artistId)` - Get artist's albums
- `getAlbum(albumId)` - Get album with tracklist

#### Additional
- `getGenres()` - List all music genres
- `getRadio()` - Get radio stations
- `getPlaylist(playlistId)` - Get playlist details

### Example API Usage

```javascript
import { getChartTracks, searchAll, getArtist } from '../services/deezerApi';

// Get trending tracks
const tracks = await getChartTracks(50);

// Search for music
const results = await searchAll('daft punk');

// Get artist details
const artist = await getArtist(27);
```

## 🎯 Features Breakdown

### 1. Home Page (`/`)
- Displays top 50 trending tracks from Deezer charts
- Grid layout with song cards
- Click any card to view song details
- Hover to reveal play button

### 2. Search (`Navbar SearchBar`)
- Real-time search across Deezer's catalog
- Search songs, artists, albums simultaneously
- Loading states and error handling
- Results displayed in grid layout

### 3. Song Details Page (`/song/:id`)
- Large album artwork
- Track metadata (duration, release date, BPM, popularity)
- Links to artist and album pages
- Related tracks from the same artist
- Play preview button

### 4. Artist Page (`/artist/:id`) - NEW
- Artist profile with high-quality image
- Fan count and album count statistics
- Tabbed interface:
  - **Top Tracks** - Artist's most popular songs
  - **Albums** - Complete discography
- Click any album to view details

### 5. Album Page (`/album/:id`) - NEW
- Album artwork and metadata
- Complete tracklist with durations
- Total album duration calculation
- Genre information
- Click any track to play or view details
- Link back to artist page

### 6. Audio Player (Bottom Fixed)
- Persistent across all pages
- Album artwork thumbnail
- Song title and artist name (clickable links)
- Play/Pause toggle
- "Preview (30s)" indicator
- Elegant gradient background

## 🎨 UI/UX Improvements

### Enhanced Components
- **MusicCard**: Hover effects, play button overlay, truncated text
- **AudioPlayer**: Gradient background, clickable elements, responsive design
- **Loading States**: User-friendly loading messages
- **Error Handling**: Clear error messages for failed API calls
- **Responsive Grid**: Adapts from 1 to 4 columns based on screen size

### Design Elements
- Modern card-based layout
- Smooth hover transitions
- Shadow effects for depth
- Gradient backgrounds
- Truncated text for better layout
- Consistent color scheme (blue/green accents)

## 🔐 Firebase Integration

The app uses Firebase for:
- **Authentication**: Email/password login and signup
- **Firestore**: Store user playlists
- **Auth Context**: Global authentication state

## 📝 API Endpoints Reference

```
Base URL: https://api.deezer.com

GET /chart/0/tracks              → Trending tracks
GET /search?q={query}            → Search all
GET /track/{id}                  → Track details
GET /artist/{id}                 → Artist info
GET /artist/{id}/top             → Artist top tracks
GET /artist/{id}/albums          → Artist albums
GET /album/{id}                  → Album details
GET /genre                       → All genres
GET /radio                       → Radio stations
```

## ⚠️ Limitations

- **30-second previews only** (full tracks not available via free API)
- **Rate limiting** applies (implement caching for production)
- **No user-specific features** without OAuth (playlists are local/Firebase)
- Some content may be **region-restricted**

## 🚀 Future Enhancements

Potential features to add:
- [ ] Genre browsing page
- [ ] Radio stations player
- [ ] Advanced search filters (by genre, year, etc.)
- [ ] User favorites/likes
- [ ] Recent plays history
- [ ] Share functionality
- [ ] Dark mode toggle
- [ ] Progress bar for audio playback
- [ ] Volume control
- [ ] Queue management

## 📚 Documentation

See `DEEZER_API_INTEGRATION.md` for detailed API documentation.

## 🎓 Learning Resources

- [Deezer API Documentation](https://developers.deezer.com/api)
- [React Documentation](https://react.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Firebase Documentation](https://firebase.google.com/docs)

## 📄 License

This is a demonstration project for educational purposes.

## 🙏 Credits

- **Music Data**: Powered by [Deezer API](https://www.deezer.com)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Framework**: [React](https://react.dev)

---

**Enjoy exploring millions of songs! 🎵**
