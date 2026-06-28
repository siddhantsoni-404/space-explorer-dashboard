import React, { useState, useEffect } from 'react';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { getMarsPhotos, createFavorite } from '../services/api';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Heart, Loader } from 'lucide-react';

export default function MarsExplorer() {
  const [rover, setRover] = useState('curiosity');
  const [sol, setSol] = useState('1000');
  const [camera, setCamera] = useState('');

  const fetchPhotos = async ({ pageParam = 1 }) => {
    const params = { rover, page: pageParam };
    if (sol) params.sol = sol;
    if (camera) params.camera = camera;
    const res = await getMarsPhotos(params);
    return res.data;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['mars', rover, sol, camera],
    queryFn: fetchPhotos,
    getNextPageParam: (lastPage, allPages) => {
      // NASA API returns 25 photos per page. If we got 25, there MIGHT be a next page.
      return lastPage.data.length === 25 ? allPages.length + 1 : undefined;
    }
  });

  // Re-fetch when filters change
  useEffect(() => {
    refetch();
  }, [rover, sol, camera, refetch]);

  const saveMutation = useMutation({
    mutationFn: (data) => createFavorite(data),
    onSuccess: () => alert('Saved to favorites!'),
    onError: () => alert('Failed to save to favorites.')
  });

  const handleSave = (photo) => {
    saveMutation.mutate({
      title: `Mars Photo ${photo.id} by ${photo.rover.name}`,
      type: 'Mars',
      nasaId: photo.id.toString(),
      imageUrl: photo.img_src,
      notes: `Camera: ${photo.camera.full_name}\nEarth Date: ${photo.earth_date}`,
      tags: ['mars', rover, camera].filter(Boolean)
    });
  };

  const photos = data ? data.pages.flatMap(page => page.data) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold mb-4">Mars Rover Photos</h1>
        
        <div className="flex flex-wrap gap-4 items-end bg-[#1e293b] p-4 rounded-lg border border-gray-800">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-semibold uppercase">Rover</label>
            <select value={rover} onChange={e => setRover(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-red-500">
              <option value="curiosity">Curiosity</option>
              <option value="opportunity">Opportunity</option>
              <option value="spirit">Spirit</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-semibold uppercase">Sol (Martian Day)</label>
            <input type="number" value={sol} onChange={e => setSol(e.target.value)} min="0" className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-red-500 w-24" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-semibold uppercase">Camera</label>
            <select value={camera} onChange={e => setCamera(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-red-500">
              <option value="">All Cameras</option>
              <option value="FHAZ">Front Hazard Avoidance</option>
              <option value="RHAZ">Rear Hazard Avoidance</option>
              <option value="MAST">Mast</option>
              <option value="CHEMCAM">Chemistry and Camera</option>
              <option value="NAVCAM">Navigation</option>
            </select>
          </div>
        </div>
      </header>

      {isError && (
        <div className="bg-red-900/20 text-red-400 border border-red-800/30 p-4 rounded-md">
          {error.response?.data?.message || 'Error fetching photos.'}
        </div>
      )}

      {isLoading && photos.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="animate-pulse bg-slate-800 h-64 rounded-xl"></div>)}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12 bg-[#1e293b] rounded-xl border border-gray-800">
          <p className="text-slate-400 text-lg">No photos found for the selected criteria.</p>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={photos.length}
          next={fetchNextPage}
          hasMore={hasNextPage}
          loader={<div className="flex justify-center p-4"><Loader className="animate-spin text-red-500" /></div>}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-hidden"
        >
          {photos.map((photo) => (
            <div key={photo.id} className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden group">
              <div className="relative h-48 overflow-hidden bg-black">
                <img src={photo.img_src} alt={`Mars sol ${photo.sol}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <button 
                  onClick={() => handleSave(photo)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-pink-600 text-white p-2 rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                  title="Save to Favorites"
                >
                  <Heart size={16} />
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs text-red-400 font-semibold mb-1">{photo.camera.name}</p>
                <p className="text-sm text-slate-300">Sol: {photo.sol} • {photo.earth_date}</p>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
}
