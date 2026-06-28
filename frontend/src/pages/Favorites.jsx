import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFavorites, updateFavorite, deleteFavorite } from '../services/api';
import { Trash2, Edit3, X, Save, Image as ImageIcon, Camera, Globe } from 'lucide-react';

export default function Favorites() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');

  const { data: favRes, isLoading, isError } = useQuery({
    queryKey: ['favorites', filterType],
    queryFn: () => getFavorites(filterType || undefined)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateFavorite(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      setEditingId(null);
    }
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this favorite?')) {
      deleteMutation.mutate(id);
    }
  };

  const startEdit = (fav) => {
    setEditingId(fav.id);
    setEditNotes(fav.notes || '');
  };

  const handleSaveEdit = (id) => {
    updateMutation.mutate({ id, data: { notes: editNotes } });
  };

  const favorites = favRes?.data?.data || [];

  const getIcon = (type) => {
    switch (type.toUpperCase()) {
      case 'APOD': return <ImageIcon className="text-indigo-400" size={16} />;
      case 'MARS': return <Camera className="text-red-400" size={16} />;
      case 'NEO': return <Globe className="text-emerald-400" size={16} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="border-b border-gray-800 pb-4 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Your Favorites</h1>
          <p className="text-slate-400">Manage your saved space discoveries.</p>
        </div>
        
        <div className="flex gap-2">
          {['', 'APOD', 'Mars', 'NEO'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filterType === type ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {type || 'All'}
            </button>
          ))}
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="animate-pulse bg-slate-800 h-32 rounded-xl"></div>)}
        </div>
      ) : isError ? (
        <div className="bg-red-900/20 text-red-400 border border-red-800/30 p-4 rounded-md">
          Error loading favorites.
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12 bg-[#1e293b] rounded-xl border border-gray-800">
          <p className="text-slate-400 text-lg">No favorites found. Go explore and save some!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(fav => (
            <div key={fav.id} className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden shadow-lg flex flex-col">
              {fav.imageUrl && (
                <div className="h-48 overflow-hidden bg-black">
                  <img src={fav.imageUrl} alt={fav.title} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-bold text-lg leading-tight line-clamp-2">{fav.title}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(fav)} className="p-1.5 text-slate-400 hover:text-indigo-400 bg-slate-800 rounded-md transition-colors"><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(fav.id)} className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 rounded-md transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-slate-800 rounded-md text-slate-300 font-medium">
                    {getIcon(fav.type)} {fav.type}
                  </span>
                  {fav.tags?.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-slate-800 rounded-md text-slate-400">#{tag}</span>
                  ))}
                </div>

                {editingId === fav.id ? (
                  <div className="mt-auto pt-4 border-t border-gray-800">
                    <textarea 
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 min-h-[80px]"
                      placeholder="Add personal notes..."
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:text-slate-200"><X size={16}/></button>
                      <button onClick={() => handleSaveEdit(fav.id)} className="p-1.5 text-indigo-400 hover:text-indigo-300"><Save size={16}/></button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto pt-4 border-t border-gray-800">
                    <p className="text-sm text-slate-400 whitespace-pre-wrap line-clamp-4">
                      {fav.notes || <span className="italic opacity-50">No notes added. Click edit to add some.</span>}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
