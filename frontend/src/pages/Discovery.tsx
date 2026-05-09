import { useState, useEffect } from 'react';
import api from '../api/client';
import { MapPin, Star, Zap, Info, X, Calendar, Clock, Target, CheckCircle2 } from 'lucide-react';

interface MatchResult {
  event_id: number;
  title: string;
  score: number;
  distance_km: number;
  match_reasons: string[];
}

interface FullEvent {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  organization_id: number;
  has_joined: boolean;
}

const Discovery = () => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  
  // Detail Modal State
  const [selectedEvent, setSelectedEvent] = useState<FullEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalModalLoading] = useState(false);
  const [joinStatus, setJoinStatus] = useState<'idle' | 'joining' | 'success'>('idle');

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

  const handleViewDetails = async (eventId: number) => {
    setModalModalLoading(true);
    setShowModal(true);
    setJoinStatus('idle');
    try {
      const response = await api.get(`/events/${eventId}`);
      setSelectedEvent(response.data);
    } catch (err) {
      setError("Failed to load event details.");
      setShowModal(false);
    } finally {
      setModalModalLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!selectedEvent) return;
    setJoinStatus('joining');
    try {
      await api.post(`/reliability/join/${selectedEvent.id}`);
      setJoinStatus('success');
      setTimeout(() => {
        setShowModal(false);
        fetchMatches(); // Refresh list
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to join event");
      setJoinStatus('idle');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Event Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {modalLoading ? (
              <div className="p-20 text-center text-gray-500">Loading details...</div>
            ) : selectedEvent && (
              <>
                <div className="relative h-48 bg-indigo-600 p-8 flex items-end">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedEvent.title}</h2>
                    <div className="flex items-center text-indigo-100 text-sm">
                      <Target size={16} className="mr-2" />
                      Social Impact Event
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4 text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="mr-3 text-indigo-600" size={20} />
                        <span>{new Date(selectedEvent.start_time).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-3 text-indigo-600" size={20} />
                        <span>{new Date(selectedEvent.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedEvent.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                      <p className="text-gray-600 leading-relaxed">{selectedEvent.description}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-8 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Joining this event will impact your <span className="font-bold text-indigo-600">Reliability Score</span>.
                    </div>
                    <button
                      onClick={handleJoinEvent}
                      disabled={joinStatus !== 'idle' || selectedEvent.has_joined}
                      className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center cursor-pointer ${
                        joinStatus === 'success' || selectedEvent.has_joined
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
                      }`}
                    >
                      {joinStatus === 'joining' && 'Joining...'}
                      {(joinStatus === 'success' || selectedEvent.has_joined) && <><CheckCircle2 className="mr-2" size={20} /> Joined!</>}
                      {joinStatus === 'idle' && !selectedEvent.has_joined && 'Join Event Now'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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

                <button 
                  onClick={() => handleViewDetails(match.event_id)}
                  className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
                >
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
