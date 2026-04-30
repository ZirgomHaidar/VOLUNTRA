import { useState, useEffect } from 'react';
import api from '../api/client';
import { MapPin, Star, Zap, Info } from 'lucide-react';

interface MatchResult {
  event_id: number;
  title: string;
  score: float;
  distance_km: number;
  match_reasons: string[];
}

const Discovery = () => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (err) => {
          setError("Location access denied. Using default location.");
          // Default to a central location if denied (e.g., London or NY)
          setLocation({ lat: 40.7128, lon: -74.0060 });
        }
      );
    }
  }, []);

  useEffect(() => {
    if (location) {
      fetchMatches();
    }
  }, [location]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await api.get('/matching/suggested', {
        params: { lat: location?.lat, lon: location?.lon }
      });
      setMatches(response.data);
    } catch (err) {
      setError("Failed to fetch matches.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discover Opportunities</h1>
        <p className="text-gray-600">AI-powered matches based on your skills and location.</p>
      </header>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div key={match.event_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{match.title}</h3>
                  <div className="flex items-center bg-indigo-50 px-2 py-1 rounded text-indigo-700 text-sm font-bold">
                    <Zap size={14} className="mr-1" />
                    {Math.round(match.score)}%
                  </div>
                </div>

                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <MapPin size={16} className="mr-1" />
                  {match.distance_km} km away
                </div>

                <div className="space-y-2">
                  {match.match_reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-center text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
                      <Star size={12} className="mr-2" />
                      {reason}
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && matches.length === 0 && (
        <div className="text-center py-20">
          <Info className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900">No matches found yet</h3>
          <p className="text-gray-500">Try updating your skills or checking back later.</p>
        </div>
      )}
    </div>
  );
};

export default Discovery;
