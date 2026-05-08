import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Camera, Trash2, Edit3, Save, X, Plus, Image as ImageIcon } from 'lucide-react';

interface Media {
  id: number;
  url: string;
  media_type: string;
  caption: string;
  created_at: string;
}

interface PortfolioData {
  id: number;
  bio: string;
  media: Media[];
}

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await api.get('/portfolio/me');
      setPortfolio(response.data);
      setBio(response.data.bio);
    } catch (err) {
      setError('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBio = async () => {
    try {
      const response = await api.put('/portfolio/me', { bio });
      setPortfolio(response.data);
      setIsEditingBio(false);
    } catch (err) {
      setError('Failed to update bio');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    try {
      const response = await api.post('/portfolio/me/media', formData);
      setPortfolio(response.data);
    } catch (err) {
      setError('Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    if (!window.confirm('Are you sure you want to delete this media?')) return;
    
    try {
      const response = await api.delete(`/portfolio/me/media/${mediaId}`);
      setPortfolio(response.data);
    } catch (err) {
      setError('Failed to delete media');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading portfolio...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

      {/* Profile Header */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Portfolio</h2>
          {!isEditingBio ? (
            <button 
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
            >

              <Edit3 size={20} />
            </button>
          ) : (
            <div className="flex space-x-2">
              <button 
                onClick={handleSaveBio}
                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors cursor-pointer"
              >
                <Save size={20} />
              </button>
              <button 
                onClick={() => { setIsEditingBio(false); setBio(portfolio?.bio || ''); }}
                className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        {isEditingBio ? (
          <textarea
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about your volunteering journey..."
          />
        ) : (
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {portfolio?.bio || "No bio yet. Click the edit icon to share your story!"}
          </p>
        )}
      </section>

      {/* Media Gallery */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <ImageIcon className="mr-2 text-indigo-600" size={24} />
            Media Gallery
          </h3>
          
          <label className={`cursor-pointer flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Plus size={20} className="mr-2" />
            {uploading ? 'Uploading...' : 'Add Media'}
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={uploading}
              accept="image/*,video/*"
            />
          </label>
        </div>

        {portfolio?.media && portfolio.media.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {portfolio.media.map((item) => (
              <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                {item.media_type === 'video' ? (
                  <video src={item.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={item.url} alt={item.caption} className="w-full h-full object-cover" />
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => handleDeleteMedia(item.id)}
                    className="p-3 bg-white/20 hover:bg-red-500/80 text-white rounded-full transition-all cursor-pointer"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Camera className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No media uploaded yet. Show the world your impact!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Portfolio;
