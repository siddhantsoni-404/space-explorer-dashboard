import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { getNeo, createFavorite } from '../services/api';
import { Heart, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function NeoExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const startDate = searchParams.get('startDate') || today.toISOString().split('T')[0];
  const endDate = searchParams.get('endDate') || nextWeek.toISOString().split('T')[0];
  const minDiameter = searchParams.get('minDiameter') || '';

  const updateParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const { data: neoRes, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['neo', startDate, endDate, minDiameter],
    queryFn: () => getNeo({ start_date: startDate, end_date: endDate, minDiameter: minDiameter || undefined }),
    retry: false
  });

  const saveMutation = useMutation({
    mutationFn: (data) => createFavorite(data),
    onSuccess: () => alert('Saved to favorites!'),
    onError: () => alert('Failed to save to favorites.')
  });

  const handleSave = (asteroid) => {
    saveMutation.mutate({
      title: asteroid.name,
      type: 'NEO',
      nasaId: asteroid.id,
      notes: `Potentially Hazardous: ${asteroid.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}\nMax Diameter: ${asteroid.estimated_diameter?.meters?.estimated_diameter_max?.toFixed(2)}m`,
      tags: ['neo', asteroid.is_potentially_hazardous_asteroid ? 'hazardous' : 'safe']
    });
  };

  const asteroids = neoRes?.data?.data || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold mb-4">Near Earth Objects (NEO)</h1>
        
        <div className="flex flex-wrap gap-4 items-end bg-[#1e293b] p-4 rounded-lg border border-gray-800">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-semibold uppercase">Start Date</label>
            <input type="date" value={startDate} onChange={e => updateParams('startDate', e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500" />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-semibold uppercase">End Date (Max 7 days)</label>
            <input type="date" value={endDate} onChange={e => updateParams('endDate', e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-semibold uppercase">Min Diameter (meters)</label>
            <input type="number" value={minDiameter} onChange={e => updateParams('minDiameter', e.target.value)} placeholder="e.g. 100" className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 w-32" />
          </div>
        </div>
      </header>

      {isError && (
        <div className="bg-red-900/20 text-red-400 border border-red-800/30 p-4 rounded-md">
          {error.response?.data?.message || 'Error fetching Near Earth Objects.'}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-slate-800 h-24 rounded-xl"></div>)}
        </div>
      ) : asteroids.length === 0 && !isError ? (
        <div className="text-center py-12 bg-[#1e293b] rounded-xl border border-gray-800">
          <p className="text-slate-400 text-lg">No asteroids found for this period.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {asteroids.map(a => {
            const isHazardous = a.is_potentially_hazardous_asteroid;
            const maxDiameter = a.estimated_diameter?.meters?.estimated_diameter_max?.toFixed(2);
            
            return (
              <div key={a.id} className={`bg-[#1e293b] p-5 rounded-xl border ${isHazardous ? 'border-red-500/50' : 'border-emerald-500/30'} flex flex-col justify-between relative`}>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg pr-8">{a.name}</h3>
                    {isHazardous ? <ShieldAlert className="text-red-500 shrink-0" /> : <ShieldCheck className="text-emerald-500 shrink-0" />}
                  </div>
                  
                  <div className="space-y-1 text-sm text-slate-300 mb-4">
                    <p><span className="text-slate-500">Max Diameter:</span> {maxDiameter}m</p>
                    <p><span className="text-slate-500">Velocity:</span> {parseFloat(a.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour || 0).toFixed(2)} km/h</p>
                    <p><span className="text-slate-500">Miss Distance:</span> {parseFloat(a.close_approach_data?.[0]?.miss_distance?.kilometers || 0).toFixed(2)} km</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleSave(a)}
                  className="flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-3 py-1.5 rounded-md transition-colors w-full text-sm mt-2"
                >
                  <Heart size={14} /> Save
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
