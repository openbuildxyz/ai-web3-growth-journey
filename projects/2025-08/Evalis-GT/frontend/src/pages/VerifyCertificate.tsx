import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { verifyCertificate } from '../api/certificatesService';

const VerifyCertificate: React.FC = () => {
  const [params] = useSearchParams();
  const id = params.get('id') || '';
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState<boolean | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!id) { setError('Missing certificate id'); setLoading(false); return; }
      try {
        const res = await verifyCertificate(id);
        setOk(res.ok); setDetails(res.details);
      } catch (e: any) { setError(e?.message || 'Verification failed'); }
      finally { setLoading(false); }
    };
    run();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <Card className="border-0 shadow-md max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Verify Certificate</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <div>Verifying on-chain and IPFS…</div>}
            {error && <Alert className="mb-4 border-red-200 bg-red-50"><AlertDescription className="text-red-800">{error}</AlertDescription></Alert>}
            {ok !== null && (
              <div>
                <div className={`p-3 rounded mb-3 ${ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {ok ? 'Certificate Authentic' : 'Certificate Failed Checks'}
                </div>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">{JSON.stringify(details, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyCertificate;
