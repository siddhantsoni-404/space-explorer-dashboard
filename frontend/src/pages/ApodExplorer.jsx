import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getApod, createFavorite } from '../services/api';
import { Heart, Calendar } from 'lucide-react';

export default function ApodExplorer() {
  const [date, setDate] = useState('');
  
  const { data: apodRes, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['apod', date],
    queryFn: () => getApod(date || undefined),
    retry: false
  });

  const saveMutation = useMutation({
    mutationFn: (data) => createFavorite(data),
    onSuccess: () => alert('Saved to favorites!'),
    onError: () => alert('Failed to save to favorites.')
  });

  const apod = apodRes?.data?.data;

  const handleSave = () => {
    if (!apod) return;
    saveMutation.mutate({
      title: apod.title,
      type: 'APOD',
      nasaId: apod.date,
      imageUrl: apod.url,
      notes: apod.explanation,
      tags: ['apod']
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <header className="flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold">Astronomy Picture of the Day</h1>
          <p className="text-slate-400">Discover the cosmos! Each day a different image or photograph of our fascinating universe is featured.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <label className="text-sm text-slate-400 font-semibold flex items-center gap-1"><Calendar size={14}/> Select Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            max={new Date().toISOString().split('T')[0]}
            className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          <div className="animate-pulse bg-slate-800 h-[500px] w-full rounded-xl"></div>
          <div className="animate-pulse bg-slate-800 h-8 w-1/3 rounded"></div>
          <div className="animate-pulse bg-slate-800 h-24 w-full rounded"></div>
        </div>
      ) : isError ? (
        <div className="bg-red-900/20 text-red-400 border border-red-800/30 p-4 rounded-md">
          {error.response?.data?.message || 'An error occurred while fetching APOD.'}
        </div>
      ) : apod ? (
        <div className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden shadow-xl">
          {apod.media_type === 'image' ? (
            <img src={apod.hdurl || apod.url} alt={apod.title} className="w-full h-auto max-h-[70vh] object-contain bg-black" />
          ) : (
            <div className="aspect-video w-full">
              <iframe src={apod.url} title={apod.title} className="w-full h-full" allowFullScreen />
            </div>
          )}
          
          <div className="p-6 md:p-8 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{apod.title}</h2>
                <p className="text-sm text-indigo-400">{apod.date} {apod.copyright && `• © ${apod.copyright}`}</p>
              </div>
              <button 
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
              >
                <Heart size={18} /> {saveMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
            
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{apod.explanation}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
