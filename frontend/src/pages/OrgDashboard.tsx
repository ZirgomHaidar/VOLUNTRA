import React, { useState } from 'react';
import { LayoutDashboard, Plus, Users, Calendar, MapPin, CheckCircle } from 'lucide-react';

const OrgDashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const mockStats = [
    { label: 'Active Events', value: '4', icon: Calendar, color: 'text-indigo-600' },
    { label: 'Total Volunteers', value: '128', icon: Users, color: 'text-green-600' },
    { label: 'Completion Rate', value: '94%', icon: CheckCircle, color: 'text-amber-600' },
  ];

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {mockStats.map((stat, idx) => (
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
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-indigo-100 transition-colors">
                <div>
                  <h3 className="font-bold text-gray-900">Community Clean-up #{i}</h3>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <MapPin size={12} className="mr-1" /> Central Park • 12 Volunteers
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">Active</span>
              </div>
            ))}
          </div>
        </section>

        {/* AI Recommendations */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">AI-Suggested Volunteers</h2>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-200 rounded-full mr-3 flex items-center justify-center font-bold text-indigo-700">
                    V{i}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">Volunteer Name {i}</p>
                    <p className="text-xs text-gray-500">Expertise: Disaster relief</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-indigo-700 font-bold text-sm">9{5-i}% Match</p>
                  <button className="text-xs text-indigo-600 hover:underline">Invite</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrgDashboard;
