import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Plus, Users, Calendar, MapPin, CheckCircle, Info } from 'lucide-react';
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
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [suggestedVolunteers, setSuggestedVolunteers] = useState<VolunteerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, eventsRes, suggestedRes] = await Promise.all([
        api.get('/organization/stats'),
        api.get('/events/me'),
        api.get('/organization/suggested-volunteers')
      ]);
      setStats(statsRes.data);
      setEvents(eventsRes.data);
      setSuggestedVolunteers(suggestedRes.data);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
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
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Create Event
        </button>
      </header>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

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
            <button className="text-indigo-600 text-sm font-medium hover:underline">View All</button>
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
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
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
                <div key={volunteer.user_id} className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-200 rounded-full mr-3 flex items-center justify-center font-bold text-indigo-700">
                      {volunteer.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{volunteer.full_name}</p>
                      <p className="text-xs text-gray-500">Expertise: {volunteer.expertise}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-700 font-bold text-sm">{Math.round(volunteer.score)}% Match</p>
                    <button className="text-xs text-indigo-600 hover:underline">Invite</button>
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
