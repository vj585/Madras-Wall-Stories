"use client";
import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Mail, Lock, User, Check, X, AlertTriangle } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function ManageAdminsPage() {
  const { data: session } = useSession();
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  
  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpAction, setOtpAction] = useState(''); // 'ADD_ADMIN' or 'REMOVE_ADMIN'
  const [targetAdminId, setTargetAdminId] = useState(null); // Used for removal
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin-users');
      const data = await res.json();
      if (data.success) {
        setAdmins(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch administrators');
    } finally {
      setIsLoading(false);
    }
  };

  const requestOTP = async (action, targetId = null) => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch('/api/admin-users/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      
      if (data.success) {
        setOtpAction(action);
        setTargetAdminId(targetId);
        setShowOtpModal(true);
        setOtp('');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('An error occurred while requesting OTP');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      setError('All fields are required');
      return;
    }
    await requestOTP('ADD_ADMIN');
  };

  const handleRemoveClick = async (adminId) => {
    await requestOTP('REMOVE_ADMIN', adminId);
  };

  const verifyOtpAndExecute = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let res;
      if (otpAction === 'ADD_ADMIN') {
        res = await fetch('/api/admin-users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newAdmin, otp })
        });
      } else if (otpAction === 'REMOVE_ADMIN') {
        res = await fetch(`/api/admin-users?id=${targetAdminId}&otp=${otp}`, {
          method: 'DELETE'
        });
      }

      const data = await res.json();
      if (data.success) {
        setShowOtpModal(false);
        setShowAddForm(false);
        setNewAdmin({ name: '', email: '', password: '' });
        fetchAdmins();
      } else {
        setError(data.error || 'Operation failed');
      }
    } catch (err) {
      setError('An error occurred during verification');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Administrators</h1>
          <p className="text-gray-500">Manage who has full access to your store backend.</p>
        </div>
        {!showAddForm && (
          <button 
            onClick={() => { setError(null); setShowAddForm(true); }}
            className="bg-black text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Admin
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-heading">Add New Administrator</h2>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="password" 
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-black text-white px-5 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isProcessing ? 'Sending OTP...' : 'Create Admin'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading administrators...</div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No administrators found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Administrator</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Added On</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((admin) => {
                  const isSelf = session?.user?.email?.toLowerCase() === admin.email.toLowerCase();
                  
                  return (
                    <tr key={admin._id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 shrink-0">
                            {admin.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 flex items-center gap-2">
                              {admin.name}
                              {isSelf && <span className="bg-green-100 text-green-700 text-[10px] uppercase px-2 py-0.5 rounded-full font-bold">You</span>}
                            </p>
                            <p className="text-gray-500 text-xs">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-accent-blue font-bold text-xs bg-blue-50 px-2.5 py-1 rounded-full w-max">
                          <Shield className="w-3 h-3" />
                          SUPER ADMIN
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(admin.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleRemoveClick(admin._id)}
                          disabled={isSelf || isProcessing}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isSelf ? "You cannot remove yourself" : "Remove Admin"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowOtpModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-black" />
            </div>
            
            <h2 className="text-2xl font-bold font-heading mb-2">Security Verification</h2>
            <p className="text-gray-500 text-sm mb-6">
              To proceed with {otpAction === 'ADD_ADMIN' ? 'adding a new admin' : 'removing an admin'}, please enter the 6-digit OTP sent to <strong>{session?.user?.email}</strong>.
            </p>
            
            <div className="space-y-4">
              <div>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-3xl tracking-[0.5em] py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-mono font-bold"
                  placeholder="------"
                  maxLength={6}
                />
              </div>
              
              <button 
                onClick={verifyOtpAndExecute}
                disabled={otp.length !== 6 || isProcessing}
                className="w-full bg-black text-white px-5 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isProcessing ? 'Verifying...' : 'Verify & Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
