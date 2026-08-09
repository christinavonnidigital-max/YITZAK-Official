import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  Trash2, 
  Send, 
  Download, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Database,
  ExternalLink,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db, getAccessToken } from '../lib/firebase';
import { sendWelcomeNewsletterEmail } from '../lib/googleApi';

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
  status: string;
  lastEmailSentAt?: string;
}

export default function NewsletterSubscribersManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'newsletter_subscriptions'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list: Subscriber[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          email: data.email || docSnap.id,
          createdAt: data.createdAt || new Date().toISOString(),
          status: data.status || 'active',
          lastEmailSentAt: data.lastEmailSentAt
        });
      });

      // Local storage fallback merging
      const localSubsStr = localStorage.getItem('yitzak_newsletter_subscriptions');
      if (localSubsStr) {
        try {
          const localSubs = JSON.parse(localSubsStr);
          localSubs.forEach((item: any) => {
            if (!list.some(s => s.email.toLowerCase() === item.email.toLowerCase())) {
              list.push({
                id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                email: item.email,
                createdAt: item.createdAt || new Date().toISOString(),
                status: 'active'
              });
            }
          });
        } catch (e) {
          console.error('Local subs parse error:', e);
        }
      }

      setSubscribers(list);
    } catch (err) {
      console.error('Error fetching subscribers from Firestore:', err);
      // Fallback to local storage
      const localSubsStr = localStorage.getItem('yitzak_newsletter_subscriptions');
      if (localSubsStr) {
        try {
          const localSubs = JSON.parse(localSubsStr);
          const list: Subscriber[] = localSubs.map((item: any, idx: number) => ({
            id: `local_${idx}`,
            email: item.email,
            createdAt: item.createdAt || new Date().toISOString(),
            status: 'active'
          }));
          setSubscribers(list);
        } catch (e) {
          setSubscribers([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const triggerNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      triggerNotify('Please enter a valid email address.');
      return;
    }
    const cleanEmail = newEmail.trim().toLowerCase();
    setAdding(true);

    try {
      const docId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const subObj = {
        email: cleanEmail,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      await setDoc(doc(db, 'newsletter_subscriptions', docId), subObj);
      triggerNotify(`Added ${cleanEmail} to newsletter database.`);
      setNewEmail('');
      fetchSubscribers();
    } catch (err) {
      console.warn('Firestore write failed, saving to localStorage:', err);
      const localSubs = JSON.parse(localStorage.getItem('yitzak_newsletter_subscriptions') || '[]');
      localSubs.push({ email: cleanEmail, createdAt: new Date().toISOString() });
      localStorage.setItem('yitzak_newsletter_subscriptions', JSON.stringify(localSubs));
      triggerNotify(`Saved ${cleanEmail} locally.`);
      setNewEmail('');
      fetchSubscribers();
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (sub: Subscriber) => {
    if (!window.confirm(`Remove ${sub.email} from subscribers?`)) return;
    try {
      if (!sub.id.startsWith('local_')) {
        await deleteDoc(doc(db, 'newsletter_subscriptions', sub.id));
      }
      // Also clean localStorage
      const localSubsStr = localStorage.getItem('yitzak_newsletter_subscriptions');
      if (localSubsStr) {
        try {
          let localSubs = JSON.parse(localSubsStr);
          localSubs = localSubs.filter((item: any) => item.email.toLowerCase() !== sub.email.toLowerCase());
          localStorage.setItem('yitzak_newsletter_subscriptions', JSON.stringify(localSubs));
        } catch (e) {}
      }
      triggerNotify(`Removed ${sub.email}`);
      fetchSubscribers();
    } catch (err) {
      triggerNotify('Failed to delete subscriber.');
    }
  };

  const handleSendDigestEmail = async (sub: Subscriber) => {
    setSendingId(sub.id);
    try {
      const token = await getAccessToken();
      if (!token) {
        triggerNotify('Google OAuth authorization required to dispatch emails.');
        return;
      }
      await sendWelcomeNewsletterEmail(token, sub.email);
      
      // Update last sent in Firestore
      if (!sub.id.startsWith('local_')) {
        await setDoc(doc(db, 'newsletter_subscriptions', sub.id), {
          lastEmailSentAt: new Date().toISOString()
        }, { merge: true });
      }

      triggerNotify(`✓ Successfully dispatched Welcome Digest email to ${sub.email}!`);
      fetchSubscribers();
    } catch (err: any) {
      console.error('Failed to send email:', err);
      triggerNotify(`Email dispatch note: ${err.message || 'Please check Gmail authorization.'}`);
    } finally {
      setSendingId(null);
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const headers = ['Email', 'Subscribed Date', 'Status', 'Last Sent Date'];
    const rows = subscribers.map(s => [
      `"${s.email}"`,
      `"${s.createdAt}"`,
      `"${s.status}"`,
      `"${s.lastEmailSentAt || 'Not sent yet'}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `YITZAK_Newsletter_Subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotify('Exported subscriber list to CSV.');
  };

  const filtered = subscribers.filter(s => 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white border border-border p-6 rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#B68A35]/10 text-primary border border-[#B68A35]/20 px-3 py-0.5 rounded-full mb-1">
              <Mail className="w-3 h-3 text-[#B68A35]" />
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold">Digest Audience Hub</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-primary">The YITZAK Digest Subscribers</h3>
            <p className="text-xs text-ash mt-0.5">
              Active subscriber registry and audience dispatch management.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSubscribers}
              className="px-3 py-2 text-xs border border-border hover:bg-mist text-charcoal rounded-lg flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync List
            </button>
            <button
              onClick={handleExportCSV}
              disabled={subscribers.length === 0}
              className="px-4 py-2 text-xs bg-surface-container hover:bg-border text-primary border border-border rounded-lg flex items-center gap-1.5 cursor-pointer font-bold disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Add subscriber form */}
        <form onSubmit={handleAddSubscriber} className="flex flex-col sm:flex-row gap-2 pt-2">
          <input 
            type="email"
            placeholder="Pre-register email (e.g. subscriber@company.com)"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1 p-2.5 border border-border bg-mist text-xs text-charcoal outline-none focus:border-primary rounded-lg font-sans"
          />
          <button
            type="submit"
            disabled={adding}
            className="bg-[#023625] hover:bg-primary text-white text-xs uppercase font-bold tracking-wider px-5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add Subscriber
          </button>
        </form>
      </div>

      {/* Search & List Table */}
      <div className="bg-white border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-mist/50">
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 text-ash absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Search subscribers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-border bg-white text-xs text-charcoal outline-none focus:border-primary rounded-md"
            />
          </div>
          <span className="text-xs text-ash font-mono font-medium">
            Total: <strong className="text-primary">{subscribers.length}</strong>
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
            <p className="text-xs text-ash">Loading subscriber directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Mail className="w-8 h-8 mx-auto text-ash/40" />
            <p className="text-sm font-bold text-primary">No Subscribers Found</p>
            <p className="text-xs text-ash">Subscribers will appear here as soon as users sign up in the footer form.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container text-ash uppercase font-mono tracking-wider border-b border-border">
                  <th className="p-3.5 font-semibold">Subscriber Email</th>
                  <th className="p-3.5 font-semibold">Joined Date</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold">Last Email Dispatch</th>
                  <th className="p-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-mist/30 transition-colors">
                    <td className="p-3.5 font-medium text-charcoal flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span>{sub.email}</span>
                      {sub.email.endsWith('@yitzak.co.za') && (
                        <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">
                          VIP Executive
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-ash font-mono">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        <CheckCircle className="w-2.5 h-2.5" />
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-ash font-mono text-[11px]">
                      {sub.lastEmailSentAt ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          {new Date(sub.lastEmailSentAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-amber-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          Pending Dispatch
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSendDigestEmail(sub)}
                          disabled={sendingId === sub.id}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                          title="Dispatch Digest Welcome Email via Gmail API"
                        >
                          {sendingId === sub.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          Dispatch Email
                        </button>
                        <button
                          onClick={() => handleDelete(sub)}
                          className="p-1 text-ash hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Delete subscriber"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
