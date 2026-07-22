import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  RefreshCw, 
  Sparkles,
  Database,
  Mail,
  User,
  ShieldAlert
} from 'lucide-react';
import { 
  WhitelistedGuest, 
  fetchAllWhitelistedGuests, 
  preRegisterGuest, 
  removeGuestFromWhitelist, 
  checkEmailWhitelist 
} from '../lib/whitelist';

interface WhitelistManagerProps {
  onClose?: () => void;
  onSelectGuest?: (guest: WhitelistedGuest) => void;
}

export default function WhitelistManager({ onClose, onSelectGuest }: WhitelistManagerProps) {
  const [guests, setGuests] = useState<WhitelistedGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Guest Form
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'guest' | 'vip' | 'client' | 'admin'>('guest');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick Verification Tester
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{ checked: boolean; isWhitelisted: boolean; details?: any } | null>(null);

  const loadWhitelist = async () => {
    setLoading(true);
    try {
      const data = await fetchAllWhitelistedGuests();
      setGuests(data);
    } catch (err) {
      console.error('Error loading whitelist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWhitelist();
  }, []);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      setMessage({ type: 'error', text: 'Please provide a valid email address.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const added = await preRegisterGuest(
        newEmail,
        newName || 'Authorized Guest',
        newNotes || 'Pre-registered via Whitelist Portal',
        newRole,
        'active'
      );

      setMessage({ 
        type: 'success', 
        text: `Successfully pre-registered ${added.email} in Firestore whitelist!` 
      });

      setNewEmail('');
      setNewName('');
      setNewNotes('');
      loadWhitelist();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to pre-register email. Saved locally.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = async (email: string, name: string, role: 'admin' | 'vip' | 'guest') => {
    setIsSubmitting(true);
    try {
      await preRegisterGuest(email, name, 'Quick pre-registered via panel', role, 'active');
      setMessage({ type: 'success', text: `Pre-registered ${email} in Firestore whitelist!` });
      loadWhitelist();
    } catch (e) {
      setMessage({ type: 'error', text: 'Quick add failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (guest: WhitelistedGuest) => {
    if (window.confirm(`Revoke whitelist access for ${guest.email}?`)) {
      await removeGuestFromWhitelist(guest.id, guest.email);
      setMessage({ type: 'success', text: `Removed ${guest.email} from whitelist.` });
      loadWhitelist();
    }
  };

  const handleVerifyTest = async () => {
    if (!testEmail || !testEmail.includes('@')) return;
    const res = await checkEmailWhitelist(testEmail);
    setTestResult({
      checked: true,
      isWhitelisted: res.isWhitelisted,
      details: res
    });
  };

  const filteredGuests = guests.filter(g => 
    g.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.notes && g.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-2xl border border-border shadow-lg p-6 space-y-6 max-w-4xl mx-auto text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-primary font-serif">Firestore Guest Whitelist Manager</h3>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold flex items-center gap-1">
              <Database className="w-3 h-3" />
              Live Sync
            </span>
          </div>
          <p className="text-xs text-ash mt-1">
            Pre-register authorized guest emails in Firestore so users can bypass Google Auth restrictions during portal entry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadWhitelist}
            className="p-2 border border-border hover:bg-mist text-ash hover:text-primary rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Refresh Whitelist from Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-border text-xs text-ash hover:text-primary hover:bg-mist rounded-lg cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Alert Banner */}
      {message && (
        <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border border-rose-200 text-rose-900'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Quick Add Presets */}
      <div className="bg-surface/50 border border-border/80 p-3.5 rounded-xl space-y-2">
        <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-ash block">
          ⚡ 1-Click Pre-register Accounts
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleQuickAdd('cgumpo@yitzak.co.za', 'Christina Gumpo (Yitzak)', 'admin')}
            className="text-xs bg-white hover:bg-emerald-50 border border-border hover:border-emerald-300 text-charcoal hover:text-emerald-900 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            + cgumpo@yitzak.co.za
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd('christinavonnidigital@gmail.com', 'Christina Vonn Digital', 'admin')}
            className="text-xs bg-white hover:bg-emerald-50 border border-border hover:border-emerald-300 text-charcoal hover:text-emerald-900 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            + christinavonnidigital@gmail.com
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd('christinagumpo@gmail.com', 'Christina Gumpo', 'admin')}
            className="text-xs bg-white hover:bg-emerald-50 border border-border hover:border-emerald-300 text-charcoal hover:text-emerald-900 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            + christinagumpo@gmail.com
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd('guest@yitzak.co.za', 'Yitzak Guest Client', 'guest')}
            className="text-xs bg-white hover:bg-emerald-50 border border-border hover:border-emerald-300 text-charcoal hover:text-emerald-900 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            + guest@yitzak.co.za
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & Quick Test */}
        <div className="space-y-6">
          {/* Pre-Register Form */}
          <form onSubmit={handleAddGuest} className="bg-surface border border-border p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-primary" />
              Pre-Register Guest Email
            </h4>

            <div>
              <label className="text-[10px] font-mono uppercase text-ash font-bold block mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-ash absolute left-2.5 top-3" />
                <input 
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="client@domain.com"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-border rounded-lg text-xs text-charcoal outline-none focus:border-primary font-sans"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-ash font-bold block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-ash absolute left-2.5 top-3" />
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-border rounded-lg text-xs text-charcoal outline-none focus:border-primary font-sans"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-ash font-bold block mb-1">Access Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full p-2 bg-white border border-border rounded-lg text-xs text-charcoal outline-none focus:border-primary font-sans"
              >
                <option value="guest">Authorized Guest</option>
                <option value="vip">VIP Client</option>
                <option value="client">Corporate Client</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-ash font-bold block mb-1">Notes / Department</label>
              <input 
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="e.g. Legal Compliance Team"
                className="w-full p-2 bg-white border border-border rounded-lg text-xs text-charcoal outline-none focus:border-primary font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#023625] hover:bg-primary text-white py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Save to Whitelist'}
            </button>
          </form>

          {/* Verification Tester */}
          <div className="border border-border/80 p-4 rounded-xl bg-white space-y-3">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Test Email Whitelist Status
            </h4>
            <div className="flex gap-2">
              <input 
                type="email"
                value={testEmail}
                onChange={(e) => {
                  setTestEmail(e.target.value);
                  setTestResult(null);
                }}
                placeholder="Check email address..."
                className="flex-1 p-2 border border-border rounded-lg text-xs outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleVerifyTest}
                className="bg-surface hover:bg-mist border border-border px-3 text-xs font-bold text-primary rounded-lg cursor-pointer"
              >
                Verify
              </button>
            </div>

            {testResult?.checked && (
              <div className={`p-2.5 rounded-lg text-xs border ${
                testResult.isWhitelisted 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                {testResult.isWhitelisted ? (
                  <div className="space-y-1">
                    <p className="font-bold flex items-center gap-1 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified on Whitelist ({testResult.details?.source})
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Role: <span className="font-semibold uppercase">{testResult.details?.guest?.role}</span> | Name: {testResult.details?.guest?.name}
                    </p>
                  </div>
                ) : (
                  <p className="font-bold flex items-center gap-1 text-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Not pre-registered in Firestore Whitelist
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Whitelisted Guest List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-ash absolute left-3 top-3" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search whitelisted emails or names..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-border rounded-lg text-xs text-charcoal outline-none focus:border-primary"
              />
            </div>
            <span className="text-xs font-mono font-bold text-ash shrink-0 bg-surface px-2.5 py-1 rounded-md border border-border">
              {filteredGuests.length} Pre-registered
            </span>
          </div>

          <div className="border border-border rounded-xl overflow-hidden bg-white max-h-[420px] overflow-y-auto divide-y divide-border/60">
            {loading ? (
              <div className="p-8 text-center text-xs text-ash">
                Loading Firestore Whitelist...
              </div>
            ) : filteredGuests.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-ash mx-auto" />
                <p className="text-xs text-ash font-medium">No pre-registered guest emails found.</p>
                <p className="text-[11px] text-ash/80">Use the form or quick buttons on the left to add emails.</p>
              </div>
            ) : (
              filteredGuests.map((guest) => (
                <div 
                  key={guest.id || guest.email} 
                  className="p-3.5 hover:bg-surface/60 transition-colors flex items-center justify-between gap-3 text-left"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-primary truncate max-w-[220px]">
                        {guest.email}
                      </span>
                      <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                        guest.role === 'admin' 
                          ? 'bg-amber-100 text-amber-800' 
                          : guest.role === 'vip' 
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {guest.role}
                      </span>
                      <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        Whitelisted
                      </span>
                    </div>

                    <div className="text-[11px] text-ash flex items-center gap-3">
                      <span>Name: <strong className="text-charcoal">{guest.name}</strong></span>
                      {guest.notes && <span className="truncate max-w-[180px]">({guest.notes})</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onSelectGuest && (
                      <button
                        type="button"
                        onClick={() => onSelectGuest(guest)}
                        className="px-2.5 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded cursor-pointer font-medium"
                      >
                        Select
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(guest)}
                      className="p-1.5 text-ash hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      title="Revoke Whitelist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
