import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2 } from 'lucide-react';
import { listProposals, castVote, listNotifications, markNotificationRead } from '../api/governanceService';

const TeacherGovernanceWidget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      const [ps, ns] = await Promise.all([listProposals('active'), listNotifications()]);
      setProposals(ps);
      setNotifications(ns);
    } catch (e: any) {
      setError(e?.message || 'Failed to load governance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleVote = async (proposalId: string, choiceIndex: number) => {
    try {
      await castVote(proposalId, choiceIndex);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to cast vote');
    }
  };

  const handleMarkRead = async (id: string) => {
    try { await markNotificationRead(id); setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); } catch {}
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader><CardTitle>Governance</CardTitle></CardHeader>
        <CardContent className="flex items-center py-6"><Loader2 className="h-5 w-5 mr-2 animate-spin"/> Loading…</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Teacher Governance</CardTitle>
        <CardDescription>Vote on proposals and view notifications</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50"><AlertDescription className="text-red-800">{error}</AlertDescription></Alert>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-black mb-2">Active Proposals</h3>
            <div className="space-y-2">
              {proposals.length === 0 && <div className="text-sm text-gray-600">No active proposals.</div>}
              {proposals.map(p => (
                <div key={p.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-gray-600 mb-2">{p.type}</div>
                  <div className="flex flex-wrap gap-2">
                    {(p.options || ['Yes','No']).map((opt: string, idx: number) => (
                      <Button key={idx} size="sm" variant="outline" onClick={() => handleVote(p.id, idx)}>{opt}</Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-black mb-2">Notifications</h3>
            <div className="space-y-2">
              {notifications.length === 0 && <div className="text-sm text-gray-600">No notifications.</div>}
              {notifications.map(n => (
                <div key={n.id} className={`p-3 rounded border ${n.read ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{n.title}</div>
                      <div className="text-xs text-gray-600">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    {!n.read && <Button size="sm" variant="outline" onClick={() => handleMarkRead(n.id)}>Mark read</Button>}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">{n.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherGovernanceWidget;
