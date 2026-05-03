import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { ShieldCheck, Clock, CheckCircle, XCircle, FileText, Upload } from 'lucide-react';

interface Document {
  id: number;
  type: string;
  status: string;
  url: string;
  admin_comment: string | null;
}

const Verification = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('identity');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/admin/my-documents');
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    
    setUploading(true);
    try {
      await api.post('/admin/upload', formData);
      fetchDocuments();
    } catch (err) {
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-amber-500" size={20} />;
      case 'approved': return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected': return <XCircle className="text-red-500" size={20} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <ShieldCheck className="mr-3 text-indigo-600" size={32} />
          Trust & Verification
        </h1>
        <p className="text-gray-600">Verify your identity and certificates to unlock more opportunities.</p>
      </header>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Submit New Document</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select 
                className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                <option value="identity">Identity Card / Passport</option>
                <option value="certificate">Training Certificate</option>
                <option value="other">Other Supporting Document</option>
              </select>
            </div>
            
            <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50' : ''}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="text-gray-400 mb-2" size={32} />
                <p className="text-sm text-gray-500">
                  {uploading ? 'Uploading...' : 'Click to upload document'}
                </p>
              </div>
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>
        </section>

        {/* Status Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Verification Status</h2>
          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
              </div>
            ) : documents.length > 0 ? (
              documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="p-2 bg-white rounded-lg mr-3 shadow-sm">
                      <FileText className="text-gray-400" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{doc.type}</p>
                      <p className="text-xs text-gray-500">Submitted on {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm font-medium capitalize">{doc.status}</span>
                    {getStatusIcon(doc.status)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No documents submitted yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Verification;
