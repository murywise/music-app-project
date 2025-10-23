# Deezer API Integration

## Overview
This music app is integrated with the **Deezer API**, a free music streaming API that provides access to millions of tracks, albums, artists, and playlists without requiring authentication for basic features.

## API Details

### Base URL
```
https://api.deezer.com
```

### Authentication
✅ **No authentication required** for basic catalog searches and track lookups!

### Rate Limits
- The Deezer API has rate limits that vary by endpoint
- Generally sufficient for typical application usage
- For production apps, consider implementing caching

## Implemented Features

### 1. **Search Functionality** (`/search`)
- Search for tracks, artists, albums, and playlists
- **Endpoint**: `GET /search?q={query}`
- **Example**: `https://api.deezer.com/search?q=eminem`

### 2. **Track Details** (`/track/{id}`)
- Get detailed information about a specific track
- Includes: title, artist, album, duration, preview URL, cover art
- **Endpoint**: `GET /track/{id}`
- **Example**: `https://api.deezer.com/track/3135556`

### 3. **Artist Information** (`/artist/{id}`)
- Get artist profile, fan count, albums count
- **Endpoint**: `GET /artist/{id}`
- **Related Endpoints**:
  - `/artist/{id}/top` - Get top tracks
  - `/artist/{id}/albums` - Get artist albums

### 4. **Album Details** (`/album/{id}`)
- Get album information including tracklist
- **Endpoint**: `GET /album/{id}`
- **Example**: `https://api.deezer.com/album/302127`

### 5. **Charts** (`/chart`)
- Get trending/popular tracks, albums, artists
- **Endpoint**: `GET /chart/0/tracks?limit={limit}`
- Used on the home page to display trending songs

### 6. **Radio & Genres** (`/radio`, `/genre`)
- Browse by genre
- Get radio stations and their tracks
- **Endpoints**:
  - `GET /radio` - List all radio stations
  - `GET /radio/{id}/tracks` - Get radio tracks
  - `GET /genre` - List all genres
  - `GET /genre/{id}/artists` - Get artists by genre

## Data Structure

### Track Object
```json
{
  "id": 3135556,
  "title": "Lose Yourself",
  "duration": 326,
  "rank": 943638,
  "preview": "https://cdns-preview-d.dzcdn.net/...",
  "artist": {
    "id": 13,
    "name": "Eminem"
  },
  "album": {
    "id": 302127,
    "title": "8 Mile",
    "cover": "https://api.deezer.com/album/302127/image",
    "cover_small": "https://...",
    "cover_medium": "https://...",
    "cover_big": "https://...",
    "cover_xl": "https://..."
  }
}
```

## Implementation in App

### Service Layer (`/src/services/deezerApi.js`)
Centralized API service with functions for all endpoints:
- `getChartTracks()` - Get trending tracks
- `searchAll(query)` - Search across all types
- `getTrack(id)` - Get track details
- `getArtist(id)` - Get artist info
- `getAlbum(id)` - Get album info
- And more...

### Pages Using Deezer API
1. **Home** - Displays chart-topping tracks
2. **Search** - Real-time search across music catalog
3. **Song** - Detailed track view with related songs
4. **Artist** - Artist profile with top tracks and albums
5. **Album** - Album view with complete tracklist

### Audio Playback
- Uses 30-second preview URLs provided by Deezer
- Preview URL: `track.preview`
- Format: MP3, 128 kbps

## Features Enabled by Deezer API

✅ Browse millions of tracks  
✅ Search for songs, artists, albums  
✅ View detailed track information  
✅ Play 30-second previews  
✅ Discover trending music  
✅ Explore artist discographies  
✅ View album tracklists  
✅ No API key required for basic features  

## Limitations

⚠️ **Preview Only**: Only 30-second previews are available (no full tracks)  
⚠️ **Rate Limits**: API has rate limiting (exact limits vary)  
⚠️ **No User Features**: Cannot access user playlists without OAuth  
⚠️ **Geographic Restrictions**: Some content may be region-restricted  

## CORS Support
✅ Deezer API supports CORS for browser-based applications

## Example API Calls

### Search for tracks
```javascript
const response = await fetch('https://api.deezer.com/search?q=daft punk');
const data = await response.json();
console.log(data.data); // Array of tracks
```

### Get track details
```javascript
const response = await fetch('https://api.deezer.com/track/3135556');
const track = await response.json();
console.log(track.title, track.preview);
```

### Get trending tracks
```javascript
const response = await fetch('https://api.deezer.com/chart/0/tracks?limit=50');
const data = await response.json();
console.log(data.data); // Top 50 tracks
```

## Resources

- **Official Documentation**: https://developers.deezer.com/api
- **API Explorer**: https://developers.deezer.com/api/explorer
- **Status Page**: Check API availability

## Future Enhancements

🚀 **Potential additions**:
- Genre browsing page
- Radio stations
- Playlist creation (requires OAuth)
- Advanced search filters
- Artist recommendations
- Similar tracks feature

---

**Note**: This integration uses the free tier of Deezer API. For production applications with high traffic, consider implementing caching strategies and monitoring API usage.
