import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, useReadContract } from "wagmi";
import { daoRegistryAddress, daoRegistryAbi } from "@/lib/contracts";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, FileCode, Coins, Vote, ShieldCheck, Timer, ExternalLink } from "lucide-react";

interface NodeData {
  label: string;
  name?: string;
  symbol?: string;
  period?: number;
  percentage?: number;
  delay?: number;
}

interface NodeInfo {
  id: string;
  type: string;
  data: NodeData;
}

interface ContractInfo {
    filename: string;
    code: string;
}

interface DaoInfo {
  daoAddress: string;
  cid: string;
  name?: string;
  description?: string;
  nodes?: NodeInfo[];
  contracts?: ContractInfo[];
}

const ParameterDisplay = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
    </div>
    <span className="font-medium">{value}</span>
  </div>
);

const DashboardPage = () => {
  const { isConnected, address, chain } = useAccount();
  const [daos, setDaos] = useState<DaoInfo[]>([]);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

  const { data: userDaosData, isLoading: isContractLoading, error: contractError } = useReadContract({
    address: daoRegistryAddress,
    abi: daoRegistryAbi,
    functionName: 'getDAOsByUser',
    args: [address!],
    query: {
      enabled: isConnected && !!address,
    },
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!userDaosData) return;

      const [daoAddresses, cids] = userDaosData;
      if (cids.length === 0) {
        setDaos([]);
        return;
      }

      setIsFetchingMetadata(true);
      
      const metadataPromises = cids.map(async (cid, index) => {
        const daoAddress = daoAddresses[index];
        const ipfsUrl = `https://ipfs.io/ipfs/${cid}`;
        try {
          const response = await fetch(ipfsUrl);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const metadata = await response.json();
          return { daoAddress, cid, ...metadata };
        } catch (e) {
          console.error(`Dashboard: Failed to fetch or parse metadata for CID ${cid}. URL: ${ipfsUrl}`, e);
          return { daoAddress, cid, name: "Metadata not found", description: "Could not load details from IPFS." };
        }
      });

      const resolvedDaos = await Promise.all(metadataPromises);
      setDaos(resolvedDaos.reverse());
      setIsFetchingMetadata(false);
    };

    fetchMetadata();
  }, [userDaosData, address]);

  const renderDaoCard = (dao: DaoInfo) => {
    const tokenNode = dao.nodes?.find(n => n.type === 'token');
    const votingNode = dao.nodes?.find(n => n.type === 'voting');
    const quorumNode = dao.nodes?.find(n => n.type === 'quorum');
    const timelockNode = dao.nodes?.find(n => n.type === 'timelock');

    return (
      <Card key={dao.daoAddress} className="flex flex-col">
        <CardHeader>
          <CardTitle className="truncate">{dao.name || "Unnamed DAO"}</CardTitle>
          <CardDescription className="truncate">{dao.description || "No description."}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Key Parameters</h4>
            <div className="space-y-2 rounded-md border p-3">
              {tokenNode && <ParameterDisplay icon={Coins} label="Token" value={`${tokenNode.data.name} (${tokenNode.data.symbol})`} />}
              {votingNode && <ParameterDisplay icon={Vote} label="Voting Period" value={`${votingNode.data.period || 'N/A'} days`} />}
              {quorumNode && <ParameterDisplay icon={ShieldCheck} label="Quorum" value={`${quorumNode.data.percentage || 'N/A'}%`} />}
              {timelockNode && <ParameterDisplay icon={Timer} label="Timelock Delay" value={`${timelockNode.data.delay || 'N/A'} days`} />}
            </div>
          </div>
          
          {dao.contracts && dao.contracts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Generated Contracts</h4>
              <div className="flex flex-wrap gap-2">
                {dao.contracts.map(contract => (
                  <Badge key={contract.filename} variant="outline">
                    <FileCode className="h-3 w-3 mr-1.5" />
                    {contract.filename}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <div className="p-4 pt-0 mt-auto">
          <Separator className="mb-4" />
          <div className="text-xs text-muted-foreground flex items-start gap-1.5">
            <span className="font-medium mt-0.5">Address:</span>
            {chain?.blockExplorers?.default?.url ? (
              <a
                href={`${chain.blockExplorers.default.url}/address/${dao.daoAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary break-all flex items-center gap-1"
              >
                <span>{dao.daoAddress}</span>
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            ) : (
              <span className="break-all">{dao.daoAddress}</span>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderContent = () => {
    if (!isConnected) {
      return (
        <Card className="max-w-md mx-auto mt-10">
          <CardHeader className="text-center">
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Please connect your wallet to view your DAOs.</CardDescription>
          </CardHeader>
        </Card>
      );
    }

    if (isContractLoading || isFetchingMetadata) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-80" />)}
        </div>
      );
    }

    if (contractError) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to fetch DAOs from the blockchain. Please ensure you have deployed the new contract and updated the address in the code.
            <p className="text-xs mt-2">({contractError.shortMessage})</p>
          </AlertDescription>
        </Alert>
      );
    }

    if (daos.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>No DAOs Found</CardTitle>
            <CardDescription>You haven't registered any DAOs with this wallet yet. Once you register a DAO from the builder, it will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">Create a DAO</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {daos.map(renderDaoCard)}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className="flex items-center justify-between p-4 border-b bg-card sticky top-0 z-10">
        <h1 className="text-xl font-bold">My DAOs</h1>
        <Button asChild variant="outline">
          <Link to="/">Back to Builder</Link>
        </Button>
      </header>

      <main className="flex-1 p-4 sm:p-6">
        <div className="container mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;