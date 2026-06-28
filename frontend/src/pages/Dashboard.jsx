import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApod, getFavorites } from '../services/api';
import { Link } from 'react-router-dom';
import { Rocket, Image as ImageIcon, Camera, Globe, Heart } from 'lucide-react';

export default function Dashboard() {
  const { data: apodRes, isLoading: apodLoading } = useQuery({
    queryKey: ['apod'],
    queryFn: () => getApod()
  });

  const { data: favRes } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => getFavorites()
  });

  const apod = apodRes?.data?.data;
  const favorites = favRes?.data?.data || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-bold mb-2">Mission Control</h1>
        <p className="text-slate-400">Welcome back to the Space Explorer Dashboard.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 flex flex-col justify-between hover:border-indigo-500 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-sm">Today's APOD</p>
              <h3 className="text-xl font-bold group-hover:text-indigo-400 transition-colors">Astronomy Picture</h3>
            </div>
            <ImageIcon className="text-indigo-500" />
          </div>
          <Link to="/apod" className="text-sm text-indigo-400 hover:underline">Explore →</Link>
        </div>
        
        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 flex flex-col justify-between hover:border-red-500 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-sm">Mars Rovers</p>
              <h3 className="text-xl font-bold group-hover:text-red-400 transition-colors">Photo Gallery</h3>
            </div>
            <Camera className="text-red-500" />
          </div>
          <Link to="/mars" className="text-sm text-red-400 hover:underline">Explore →</Link>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 flex flex-col justify-between hover:border-emerald-500 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-sm">Near Earth Objects</p>
              <h3 className="text-xl font-bold group-hover:text-emerald-400 transition-colors">Asteroid Tracker</h3>
            </div>
            <Globe className="text-emerald-500" />
          </div>
          <Link to="/neo" className="text-sm text-emerald-400 hover:underline">Explore →</Link>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-xl border border-gray-800 flex flex-col justify-between hover:border-pink-500 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-sm">Saved Items</p>
              <h3 className="text-xl font-bold group-hover:text-pink-400 transition-colors">{favorites.length} Favorites</h3>
            </div>
            <Heart className="text-pink-500" />
          </div>
          <Link to="/favorites" className="text-sm text-pink-400 hover:underline">Manage →</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden shadow-lg">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold flex items-center gap-2"><ImageIcon className="text-indigo-400" size={20} /> Today's APOD Preview</h2>
          </div>
          <div className="p-4">
            {apodLoading ? (
              <div className="animate-pulse bg-gray-700 h-64 rounded-lg w-full"></div>
            ) : apod ? (
              <div className="space-y-4">
                {apod.media_type === 'image' ? (
                  <img src={apod.url} alt={apod.title} className="w-full h-64 object-cover rounded-lg" />
                ) : (
                  <iframe src={apod.url} title={apod.title} className="w-full h-64 rounded-lg" />
                )}
                <h3 className="font-bold text-lg">{apod.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-3">{apod.explanation}</p>
                <Link to="/apod" className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-sm">View Full Screen</Link>
              </div>
            ) : (
              <p className="text-slate-400">Failed to load APOD.</p>
            )}
          </div>
        </div>
        
        <div className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden shadow-lg">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2"><Heart className="text-pink-400" size={20} /> Recent Favorites</h2>
            <Link to="/favorites" className="text-sm text-pink-400 hover:underline">View all</Link>
          </div>
          <div className="p-4 space-y-4">
            {favorites.length === 0 ? (
              <div className="text-center py-8 text-slate-400 flex flex-col items-center">
                <Heart size={48} className="mb-4 opacity-20" />
                <p>No favorites yet. Start exploring and save some!</p>
              </div>
            ) : (
              favorites.slice(0, 4).map(fav => (
                <div key={fav.id} className="flex gap-4 items-center p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                  {fav.imageUrl ? (
                    <img src={fav.imageUrl} alt={fav.title} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-700 flex items-center justify-center rounded-md flex-shrink-0">
                      <Rocket size={24} className="text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate text-sm">{fav.title}</h4>
                    <span className="text-xs px-2 py-0.5 bg-gray-600 rounded-full inline-block mt-1">{fav.type}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
