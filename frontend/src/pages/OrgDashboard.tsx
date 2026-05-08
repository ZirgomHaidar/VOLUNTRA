import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Plus, Users, Calendar, MapPin, CheckCircle, Info, X } from 'lucide-react';
import api from '../api/client';

interface Stats {
  active_events: number;
  total_volunteers: number;
  completion_rate: number;
}

interface Event {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
}

interface VolunteerMatch {
  user_id: number;
  full_name: string;
  score: number;
  expertise: string;
}

const OrgDashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerMatch | null>(null);
  const [activeEvents, setActiveEvents] = useState<Event[]>([]);
  const [inviteEventId, setInviteEventId] = useState<number | string>('');

  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [suggestedVolunteers, setSuggestedVolunteers] = useState<VolunteerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    latitude: 40.7128,
    longitude: -74.0060,
    start_time: '',
    end_time: '',
    skills: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, eventsRes, suggestedRes, activeRes] = await Promise.all([
        api.get('/organization/stats'),
        api.get('/events/me'),
        api.get('/organization/suggested-volunteers'),
        api.get('/organization/active-events')
      ]);
      setStats(statsRes.data);
      setEvents(eventsRes.data);
      setSuggestedVolunteers(suggestedRes.data);
      setActiveEvents(activeRes.data);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = (volunteer: VolunteerMatch) => {
    setSelectedVolunteer(volunteer);
    setShowInviteModal(true);
  };

  const submitInvite = async () => {
    if (!selectedVolunteer || !inviteEventId) return;
    try {
      await api.post('/organization/invite', null, {
        params: {
          volunteer_id: selectedVolunteer.user_id,
          event_id: inviteEventId
        }
      });
      setShowInviteModal(false);
      alert(`Invitation sent to ${selectedVolunteer.full_name}!`);
    } catch (err) {
      setError('Failed to send invitation.');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/events/', {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== '')
      });
      setShowCreateModal(false);
      fetchDashboardData();
      setFormData({
        title: '',
        description: '',
        latitude: 40.7128,
        longitude: -74.0060,
        start_time: '',
        end_time: '',
        skills: ''
      });
    } catch (err) {
      setError('Failed to create event. Please check your inputs.');
    }
  };

  const statCards = [
    { label: 'Active Events', value: stats?.active_events ?? 0, icon: Calendar, color: 'text-indigo-600' },
    { label: 'Total Volunteers', value: stats?.total_volunteers ?? 0, icon: Users, color: 'text-green-600' },
    { label: 'Completion Rate', value: `${stats?.completion_rate ?? 0}%`, icon: CheckCircle, color: 'text-amber-600' },
  ];

  if (loading) return <div className="p-8 text-center">Loading Organization Dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Invite Volunteer Modal */}
      {showInviteModal && selectedVolunteer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Invite {selectedVolunteer.full_name}</h2>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">Select which active event you want to invite them for:</p>
              <select 
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                value={inviteEventId}
                onChange={(e) => setInviteEventId(e.target.value)}
              >
                <option value="">Choose an event...</option>
                {activeEvents.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
              {activeEvents.length === 0 && (
                <p className="text-amber-600 text-xs bg-amber-50 p-2 rounded">You have no active events to invite volunteers to.</p>
              )}
              <button
                onClick={submitInvite}
                disabled={!inviteEventId}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Title</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Latitude</label>
                  <input
                    type="number" step="any" required
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={formData.latitude}
                    onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Longitude</label>
                  <input
                    type="number" step="any" required
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={formData.longitude}
                    onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="datetime-local" required
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={formData.start_time}
                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="datetime-local" required
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={formData.end_time}
                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Required Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Teaching, Cooking"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.skills}
                  onChange={e => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors mt-6 shadow-lg shadow-indigo-200 cursor-pointer"
              >
                Launch Event
              </button>
            </form>
          </div>
        </div>
      )}

      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <LayoutDashboard className="mr-3 text-indigo-600" size={32} />
            Organization Hub
          </h1>
          <p className="text-gray-600">Manage your social service impact and events.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center cursor-pointer"
        >
          <Plus size={20} className="mr-2" />
          Create Event
        </button>
      </header>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-center border border-red-100">{error}</div>}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
            <div className={`p-4 rounded-xl bg-gray-50 ${stat.color} mr-4`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Events */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Your Events</h2>
            <button className="text-indigo-600 text-sm font-medium hover:underline cursor-pointer">View All</button>
          </div>
          <div className="p-6 space-y-4">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-indigo-100 transition-colors">
                  <div>
                    <h3 className="font-bold text-gray-900">{event.title}</h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <MapPin size={12} className="mr-1" /> {new Date(event.start_time).toLocaleDateString()} • {event.description.substring(0, 40)}...
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${new Date(event.end_time) > new Date() ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                    {new Date(event.end_time) > new Date() ? 'Active' : 'Ended'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                <Calendar className="mx-auto mb-2 opacity-20" size={32} />
                <p>No events created yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* AI Recommendations */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">AI-Suggested Volunteers</h2>
          </div>
          <div className="p-6 space-y-4">
            {suggestedVolunteers.length > 0 ? (
              suggestedVolunteers.map((volunteer) => (
                <div key={volunteer.user_id} className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl hover:bg-indigo-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-200 rounded-full mr-3 flex items-center justify-center font-bold text-indigo-700 uppercase">
                      {volunteer.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{volunteer.full_name}</p>
                      <p className="text-xs text-gray-500">Expertise: {volunteer.expertise}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-700 font-bold text-sm">{Math.round(volunteer.score)}% Match</p>
                    <button 
                      onClick={() => handleInvite(volunteer)}
                      className="text-xs text-indigo-600 hover:underline font-medium cursor-pointer"
                    >
                      Invite
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                <Users className="mx-auto mb-2 opacity-20" size={32} />
                <p>No suggested volunteers found.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrgDashboard;
