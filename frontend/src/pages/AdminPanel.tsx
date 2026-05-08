import { useState, useEffect } from 'react';
import api from '../api/client';
import { Shield, Check, X, ExternalLink, User } from 'lucide-react';

interface PendingDoc {
  id: number;
  type: string;
  status: string;
  url: string;
  user_id: number;
}

const AdminPanel = () => {
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const response = await api.get('/admin/pending');
      setPendingDocs(response.data);
    } catch (err) {
      setError('Only administrators can access this page.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (docId: number, status: string) => {
    try {
      await api.post(`/admin/review/${docId}`, null, {
        params: { status, comment: status === 'approved' ? 'Verified by Admin' : 'Incomplete documentation' }
      });
      setPendingDocs(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      setError('Failed to process review.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Admin Panel...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="mr-3 text-red-600" size={32} />
            Platform Admin
          </h1>
          <p className="text-gray-600">Review and verify volunteer documentation.</p>
        </div>
        <div className="bg-red-50 text-red-700 px-4 py-1 rounded-full text-sm font-bold border border-red-100">
          Admin Mode Active
        </div>
      </header>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-bold text-gray-900">Pending Verifications ({pendingDocs.length})</h2>
        </div>

        {pendingDocs.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {pendingDocs.map((doc) => (
              <div key={doc.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start space-x-4 mb-4 md:mb-0">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 capitalize">{doc.type} Verification</h3>
                    <p className="text-sm text-gray-500">User ID: #{doc.user_id}</p>
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 text-sm flex items-center mt-1 hover:underline"
                    >
                      View Document <ExternalLink size={14} className="ml-1" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => handleReview(doc.id, 'approved')}
                    className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    <Check size={18} className="mr-2" />
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReview(doc.id, 'rejected')}
                    className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <X size={18} className="mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">No pending documents to review.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminPanel;
