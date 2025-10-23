import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AudioProvider } from './context/AudioContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AudioPlayer from './components/AudioPlayer';

// Regular imports for frequently used pages
import HomeSimple from './pages/HomeSimple';
import Library from './pages/Library';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';

// Lazy-loaded pages for better performance
const Search = lazy(() => import('./pages/Search'));
const Playlist = lazy(() => import('./pages/Playlist'));
const Song = lazy(() => import('./pages/Song'));
const Artist = lazy(() => import('./pages/Artist'));
const Album = lazy(() => import('./pages/Album'));

// Loading fallback for lazy-loaded components
const PageLoader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-pulse flex space-x-2">
      <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
      <div className="h-3 w-3 bg-purple-500 rounded-full animation-delay-200"></div>
      <div className="h-3 w-3 bg-purple-500 rounded-full animation-delay-400"></div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-100">
            <div className="flex h-screen overflow-hidden">
              <Navbar />
              <main className="flex-1 overflow-y-auto pl-64 pb-24">
                <div className="p-8">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<HomeSimple />} />
                      <Route path="/library" element={<Library />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/playlist/:id" element={<Playlist />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/song/:id" element={<Song />} />
                      <Route path="/artist/:id" element={<Artist />} />
                      <Route path="/album/:id" element={<Album />} />
                    </Routes>
                  </Suspense>
                </div>
              </main>
            </div>
            <AudioPlayer />
          </div>
        </Router>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;