import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Calendar, MapPin, Briefcase, Trophy, Loader2, Package, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { PUBLIC_SUBMISSION_STAKING_CONTRACT, PUBLIC_SUBMISSION_STAKING_ABI } from "@/contracts/PublicSubmissionStaking";

export function PendingApprovals() {
  const { user: authUser } = useAuth();
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const address = authUser?.wallet_address;

  const [hackathons, setHackathons] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [isApprovingAll, setIsApprovingAll] = useState(false);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    setLoading(true);
    try {
      const [
        { data: hackathonsData },
        { data: eventsData },
        { data: jobsData },
        { data: productsData },
        { data: communitiesData },
        { data: newsData }
      ] = await Promise.all([
        supabase.from('hackathons').select('*').eq('is_approved', false),
        supabase.from('events').select('*').eq('is_approved', false),
        supabase.from('jobs').select('*').eq('is_approved', false),
        supabase.from('products').select('*').eq('status', 'pending'),
        supabase.from('communities').select('*').eq('is_published', false),
        supabase.from('news').select('*').eq('is_approved', false)
      ]);

      setHackathons(hackathonsData || []);
      setEvents(eventsData || []);
      setJobs(jobsData || []);
      setProducts(productsData || []);
      setCommunities(communitiesData || []);
      setNews(newsData || []);
    } catch (error) {
      console.error("Error fetching pending items:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalCount = hackathons.length + events.length + jobs.length + products.length + communities.length + news.length;

  const handleApprove = async (type: "hackathon" | "event" | "job" | "product" | "community" | "news", item: any) => {
    if (!wallet) {
      toast.error("Please connect your admin wallet");
      return;
    }

    setProcessing(`${type}-${item.id}`);
    try {
      // If item has an on-chain ID, we need to approve it on the contract first
      if (item.on_chain_id) {
        toast.info("Approving on-chain and initiating refund...");
        const provider = await wallet.getEthereumProvider();
        const walletClient = createWalletClient({
          account: wallet.address as `0x${string}`,
          chain: sepolia,
          transport: custom(provider)
        });
        const publicClient = createPublicClient({ chain: sepolia, transport: http() });

        const hash = await walletClient.writeContract({
          address: PUBLIC_SUBMISSION_STAKING_CONTRACT.address,
          abi: PUBLIC_SUBMISSION_STAKING_ABI,
          functionName: 'approve',
          args: [BigInt(item.on_chain_id)],
        });

        await publicClient.waitForTransactionReceipt({ hash });
        toast.success("On-chain approval and refund successful!");
      }

      const table = 
        type === "hackathon" ? "hackathons" : 
        type === "event" ? "events" : 
        type === "job" ? "jobs" : 
        type === "community" ? "communities" :
        type === "news" ? "news" :
        "products";
        
      const updateData = 
        type === "product" ? { status: 'approved' } : 
        type === "community" ? { is_published: true } :
        { is_approved: true };

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', item.id);

      if (error) throw error;
      
      toast.success(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} approved and published!`);
      fetchPendingItems();
    } catch (error: any) {
      console.error("Approval error:", error);
      toast.error(error.message || "Failed to approve");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (type: "hackathon" | "event" | "job" | "product" | "community" | "news", item: any) => {
    if (!wallet) {
      toast.error("Please connect your admin wallet");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to reject this ${type}?`);
    if (!confirmed) return;

    setProcessing(`${type}-${item.id}`);
    try {
      // If item has an on-chain ID, we need to reject it on the contract
      if (item.on_chain_id) {
        toast.info("Rejecting on-chain...");
        const provider = await wallet.getEthereumProvider();
        const walletClient = createWalletClient({
          account: wallet.address as `0x${string}`,
          chain: sepolia,
          transport: custom(provider)
        });
        const publicClient = createPublicClient({ chain: sepolia, transport: http() });

        const hash = await walletClient.writeContract({
          address: PUBLIC_SUBMISSION_STAKING_CONTRACT.address,
          abi: PUBLIC_SUBMISSION_STAKING_ABI,
          functionName: 'reject',
          args: [BigInt(item.on_chain_id)],
        });

        await publicClient.waitForTransactionReceipt({ hash });
        toast.success("On-chain rejection successful!");
      }

      const table = 
        type === "hackathon" ? "hackathons" : 
        type === "event" ? "events" : 
        type === "job" ? "jobs" : 
        type === "community" ? "communities" :
        type === "news" ? "news" :
        "products";
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', item.id);

      if (error) throw error;
      
      toast.success(`❌ ${type.charAt(0).toUpperCase() + type.slice(1)} rejected`);
      fetchPendingItems();
    } catch (error: any) {
      console.error("Rejection error:", error);
      toast.error(error.message || "Failed to reject");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">🎉 No pending items to review!</p>
            <p className="text-sm text-muted-foreground mt-2">All content has been reviewed.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              📋 Pending Approvals
              <Badge variant="destructive" className="ml-2">{totalCount} items</Badge>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-purple-500/10 rounded-lg">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{hackathons.length}</p>
              <p className="text-sm text-muted-foreground">Hackathons</p>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-lg">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-sm text-muted-foreground">Events</p>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg">
              <Briefcase className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{jobs.length}</p>
              <p className="text-sm text-muted-foreground">Jobs</p>
            </div>
            <div className="text-center p-4 bg-orange-500/10 rounded-lg">
              <Package className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">{products.length}</p>
              <p className="text-sm text-muted-foreground">Products</p>
            </div>
            <div className="text-center p-4 bg-pink-500/10 rounded-lg">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 text-pink-500" />
              <p className="text-2xl font-bold">{communities.length}</p>
              <p className="text-sm text-muted-foreground">Communities</p>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
              <Newspaper className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{news.length}</p>
              <p className="text-sm text-muted-foreground">News</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Items List */}
      <div className="space-y-4">
        {([
          { title: "Hackathons", data: hackathons, type: "hackathon" as const, icon: Trophy, color: "text-purple-500" },
          { title: "Events", data: events, type: "event" as const, icon: Calendar, color: "text-blue-500" },
          { title: "Jobs", data: jobs, type: "job" as const, icon: Briefcase, color: "text-green-500" },
          { title: "Products", data: products, type: "product" as const, icon: Package, color: "text-orange-500" },
          { title: "Communities", data: communities, type: "community" as const, icon: MessageSquare, color: "text-pink-500" },
          { title: "News", data: news, type: "news" as const, icon: Newspaper, color: "text-yellow-500" }
        ]).map((section) => section.data.length > 0 && (
          <Card key={section.type}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <section.icon className={`h-5 w-5 ${section.color}`} />
                Pending {section.title} ({section.data.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {section.data.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border border-border rounded-lg bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{item.name || item.title}</h3>
                          {item.on_chain_id && (
                            <Badge variant="outline" className="text-[10px] border-primary/50 text-primary">
                              <Wallet className="h-3 w-3 mr-1" />
                              Staked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          {item.start_date || item.date ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.start_date || item.date).toLocaleDateString()}
                            </span>
                          ) : null}
                          {item.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.location}
                            </span>
                          )}
                          {item.wallet_address && (
                            <span className="font-mono opacity-60">
                              {item.wallet_address.slice(0, 6)}...{item.wallet_address.slice(-4)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(section.type, item)}
                          disabled={processing === `${section.type}-${item.id}`}
                        >
                          {processing === `${section.type}-${item.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(section.type, item)}
                          disabled={processing === `${section.type}-${item.id}`}
                        >
                          {processing === `${section.type}-${item.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
