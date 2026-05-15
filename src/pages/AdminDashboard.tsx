import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Shield, Users, Trophy, Calendar, Briefcase, MessageSquare, Trash2, Plus, Edit, Mail, Wallet, Newspaper, Eye, Package, Award, Bot, Star, Sparkles, Loader2, Search, Activity, Clock, Download, BarChart3, Database, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CommunityPagesManager } from "@/components/admin/CommunityPagesManager";
import { EventGroupsManager } from "@/components/admin/EventGroupsManager";
import { AIAgentManager } from "@/components/admin/AIAgentManager";
import { AIEmailAgent } from "@/components/admin/AIEmailAgent";
import { PendingApprovals } from "@/components/admin/PendingApprovals";
import { PermissionsManager } from "@/components/admin/PermissionsManager";
import { ContentPublisher } from "@/components/admin/ContentPublisher";
import { QuickStats } from "@/components/admin/QuickStats";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { QuickActions } from "@/components/admin/QuickActions";
import { BulkActions } from "@/components/admin/BulkActions";
import { SearchFilter } from "@/components/admin/SearchFilter";
import { SystemHealth } from "@/components/admin/SystemHealth";
import { ActivityLog } from "@/components/admin/ActivityLog";
import { DataExport } from "@/components/admin/DataExport";
import { ReportsAnalytics } from "@/components/admin/ReportsAnalytics";
import { BackupRestore } from "@/components/admin/BackupRestore";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { BulkImport } from "@/components/admin/BulkImport";
import { BulkEmailSender } from "@/components/admin/BulkEmailSender";
import { GlobalContentExplorer } from "@/components/admin/GlobalContentExplorer";
import { scrapeContentDirectly } from "@/utils/frontend-scraper";

export default function AdminDashboard() {
  const { user: privyUser, authenticated, ready } = usePrivy();
  const address = privyUser?.wallet?.address;
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = authUser?.role === "admin";

  const [analytics, setAnalytics] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [approvalStats, setApprovalStats] = useState<any>(null);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allHackathons, setAllHackathons] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allNews, setAllNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination statuses
  const [eventsStatus, setEventsStatus] = useState<"CanLoadMore" | "Loading" | "AllLoaded">("CanLoadMore");
  const [jobsStatus, setJobsStatus] = useState<"CanLoadMore" | "Loading" | "AllLoaded">("CanLoadMore");
  const [productsStatus, setProductsStatus] = useState<"CanLoadMore" | "Loading" | "AllLoaded">("CanLoadMore");
  const [newsStatus, setNewsStatus] = useState<"CanLoadMore" | "Loading" | "AllLoaded">("CanLoadMore");
  const [hackathonsStatus, setHackathonsStatus] = useState<"CanLoadMore" | "Loading" | "AllLoaded">("CanLoadMore");

  // Tabs state
  const [activeTab, setActiveTab] = useState("overview");

  // Missing form and scraping states
  const [newAdminWallet, setNewAdminWallet] = useState("");
  const [newLeaderEntry, setNewLeaderEntry] = useState({ userName: "", score: 0, rank: 1, achievements: "" });
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    logo: "",
    website: "",
    twitter: "",
    discord: "",
    partnershipType: "community",
    partnerCategory: "community"
  });
  const [newNewsPost, setNewNewsPost] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    coverImage: "",
    category: "announcement",
    tags: "",
    isPublished: true,
    isFeatured: false
  });
  const [newsUrl, setNewsUrl] = useState("");
  const [partnerUrl, setPartnerUrl] = useState("");
  const [isScrapingJobs, setIsScrapingJobs] = useState(false);
  const [isScrapingEvents, setIsScrapingEvents] = useState(false);
  const [isScrapingProducts, setIsScrapingProducts] = useState(false);
  const [isScrapingNews, setIsScrapingNews] = useState(false);
  const [isScrapingPartner, setIsScrapingPartner] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) {
      navigate("/");
      toast.error("Please connect your wallet to access admin dashboard");
    }
  }, [authenticated, ready, navigate]);

  useEffect(() => {
    if (ready && authenticated && !isAuthLoading && authUser && !isAdmin) {
      navigate("/");
      toast.error("You don't have admin permissions");
    }
  }, [authUser, isAdmin, isAuthLoading, navigate, authenticated, ready]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch stats and lists
      const [
        { count: usersCount },
        { count: hackathonsCount },
        { count: eventsCount },
        { count: jobsCount },
        { count: productsCount },
        { count: newsCount },
        { count: registrationsCount },
        { data: adminsData },
        { data: leaderboardData },
        { data: communitiesData }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('hackathons').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('hackathon_teams').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*').eq('role', 'admin'),
        supabase.from('leaderboard').select('*').order('score', { ascending: false }),
        supabase.from('communities').select('*')
      ]);

      setAnalytics({
        totalUsers: usersCount,
        totalHackathons: hackathonsCount,
        totalEvents: eventsCount,
        totalJobs: jobsCount,
        totalProducts: productsCount,
        totalNews: newsCount,
        totalRegistrations: registrationsCount
      });
      setAdmins(adminsData || []);
      setLeaderboard(leaderboardData || []);
      setCommunities(communitiesData || []);

      // Fetch approval stats
      const [
        { count: pendingHackathons },
        { count: pendingEvents },
        { count: pendingJobs }
      ] = await Promise.all([
        supabase.from('hackathons').select('*', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_approved', false)
      ]);

      setApprovalStats({
        pending: (pendingHackathons || 0) + (pendingEvents || 0) + (pendingJobs || 0)
      });

      // Fetch paginated lists (initial)
      const [
        { data: usersList },
        { data: hackathonsList },
        { data: eventsList },
        { data: jobsList },
        { data: productsList },
        { data: newsList }
      ] = await Promise.all([
        supabase.from('users').select('*').limit(20),
        supabase.from('hackathons').select('*').limit(10),
        supabase.from('events').select('*').limit(10),
        supabase.from('jobs').select('*').limit(10),
        supabase.from('products').select('*').limit(10),
        supabase.from('news').select('*').limit(10)
      ]);

      setAllUsers(usersList || []);
      setAllHackathons(hackathonsList || []);
      setAllEvents(eventsList || []);
      setAllJobs(jobsList || []);
      setAllProducts(productsList || []);
      setAllNews(newsList || []);

    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthLoading || !authenticated || !isAdmin) return null;

  const handleMakeAdmin = async () => {
    if (!address || !newAdminWallet) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('wallet_address', newAdminWallet);

      if (error) throw error;
      
      toast.success("Admin added successfully");
      setNewAdminWallet("");
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add admin");
    }
  };

  const handleRemoveAdmin = async (targetWallet: string) => {
    if (!address) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'user' })
        .eq('wallet_address', targetWallet);

      if (error) throw error;
      
      toast.success("Admin removed successfully");
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove admin");
    }
  };

  const handleDeleteHackathon = async (id: any) => {
    if (!address) return;
    try {
      const { error } = await supabase
        .from('hackathons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Hackathon deleted successfully");
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete hackathon");
    }
  };

  const handleDeleteEvent = async (id: any) => {
    if (!address) return;
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Event deleted successfully");
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete event");
    }
  };

  const handleDeleteJob = async (id: any) => {
    if (!address) return;
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Job deleted successfully");
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete job");
    }
  };

  const handleDeleteProduct = async (id: any) => {
    if (!address) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Product deleted successfully");
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handleDeleteNews = async (id: any) => {
    if (!address) return;
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success("News post deleted successfully");
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete news post");
    }
  };

  const handleToggleFeaturedHackathon = async (id: any, currentStatus: boolean) => {
    if (!address) return;
    try {
      const { error } = await supabase
        .from('hackathons')
        .update({ is_featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Hackathon ${!currentStatus ? 'featured' : 'unfeatured'}`);
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle featured status");
    }
  };

  const handleToggleFeaturedEvent = async (id: any, currentStatus: boolean) => {
    if (!address) return;
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Event ${!currentStatus ? 'featured' : 'unfeatured'}`);
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle featured status");
    }
  };

  const handleToggleFeaturedJob = async (id: any, currentStatus: boolean) => {
    if (!address) return;
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Job ${!currentStatus ? 'featured' : 'unfeatured'}`);
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle featured status");
    }
  };

  const handleToggleFeaturedCommunity = async (id: any, currentStatus: boolean) => {
    if (!address) return;
    try {
      const { error } = await supabase
        .from('communities')
        .update({ is_featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Partnership ${!currentStatus ? 'featured' : 'unfeatured'}`);
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle featured status");
    }
  };

  const handleToggleFeaturedProduct = async (id: any, currentStatus: boolean) => {
    if (!address) return;
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Product ${!currentStatus ? 'featured' : 'unfeatured'}`);
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle featured status");
    }
  };

  const handleToggleFeaturedNews = async (id: any, currentStatus: boolean) => {
    if (!address) return;
    try {
      const { error } = await supabase
        .from('news')
        .update({ is_featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`News ${!currentStatus ? 'featured' : 'unfeatured'}`);
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle featured status");
    }
  };

  const handleAddLeaderboardEntry = async () => {
    if (!address) return;
    try {
      const { error } = await supabase
        .from('leaderboard')
        .insert({
          user_name: newLeaderEntry.userName,
          score: newLeaderEntry.score,
          rank: newLeaderEntry.rank,
          achievements: newLeaderEntry.achievements.split(",").map(a => a.trim()),
        });

      if (error) throw error;
      
      toast.success("Leaderboard entry added");
      setNewLeaderEntry({ userName: "", score: 0, rank: 1, achievements: "" });
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add entry");
    }
  };

  const handleAddCommunity = async () => {
    if (!address) return;
    try {
      const { error } = await supabase
        .from('communities')
        .insert({
          name: newCommunity.name,
          slug: newCommunity.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: newCommunity.description,
          logo: newCommunity.logo,
          website: newCommunity.website,
          twitter: newCommunity.twitter,
          discord: newCommunity.discord,
          partnership_type: newCommunity.partnershipType,
          partner_category: newCommunity.partnerCategory
        });

      if (error) throw error;
      
      toast.success("Partnership added successfully");
      setNewCommunity({
        name: "",
        description: "",
        logo: "",
        website: "",
        twitter: "",
        discord: "",
        partnershipType: "community",
        partnerCategory: "community"
      });
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add partnership");
    }
  };

  const handleCreateNews = async () => {
    if (!address || !newNewsPost.title || !newNewsPost.slug || !newNewsPost.content) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const { error } = await supabase
        .from('news')
        .insert({
          title: newNewsPost.title,
          slug: newNewsPost.slug,
          content: newNewsPost.content,
          excerpt: newNewsPost.excerpt || null,
          cover_image: newNewsPost.coverImage || null,
          category: newNewsPost.category,
          tags: newNewsPost.tags.split(",").map(t => t.trim()).filter(t => t),
          is_published: newNewsPost.isPublished,
          is_featured: newNewsPost.isFeatured
        });

      if (error) throw error;
      
      toast.success("News post created successfully");
      setNewNewsPost({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        coverImage: "",
        category: "announcement",
        tags: "",
        isPublished: true,
        isFeatured: false
      });
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create news post");
    }
  };

  const handleScrapeJobs = async () => {
    setIsScrapingJobs(true);
    try {
      toast.info("AI Generation mode is currently transitioning to frontend. Generating samples now...");
      
      // In a real scenario, we'd have a list of URLs or a more advanced AI call.
      // For now, let's simulate the generation of 5 jobs using the scraper logic.
      const sampleUrls = [
        "https://jobs.lever.co/chainlink",
        "https://jobs.lever.co/uniswap",
        "https://jobs.lever.co/aave",
        "https://jobs.lever.co/polygon",
        "https://jobs.lever.co/ethereum"
      ];

      for (const url of sampleUrls) {
        const result = await scrapeContentDirectly(url, 'jobs');
        if (result.success) {
          await supabase.from('jobs').insert({
            ...result.data,
            wallet_address: address,
            is_approved: false
          });
        }
      }

      toast.success("✅ AI extraction/generation completed!");
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to connect to AI service");
    } finally {
      setIsScrapingJobs(false);
    }
  };

  const handleScrapeEvents = async () => {
    setIsScrapingEvents(true);
    try {
      toast.info("Scraping events from Luma...");
      const sampleUrls = [
        "https://lu.ma/bangalore-web3-meetup",
        "https://lu.ma/delhi-eth-builders",
        "https://lu.ma/mumbai-crypto-night"
      ];

      for (const url of sampleUrls) {
        const result = await scrapeContentDirectly(url, 'events');
        if (result.success) {
          await supabase.from('events').insert({
            ...result.data,
            wallet_address: address,
            is_approved: false
          });
        }
      }
      
      toast.success("✅ AI extraction completed!");
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to connect to AI service");
    } finally {
      setIsScrapingEvents(false);
    }
  };

  const handleScrapeProducts = async () => {
    setIsScrapingProducts(true);
    try {
      toast.info("Scraping products from ecosystem...");
      const sampleUrls = [
        "https://uniswap.org",
        "https://aave.com",
        "https://compound.finance"
      ];

      for (const url of sampleUrls) {
        const result = await scrapeContentDirectly(url, 'products');
        if (result.success) {
          await supabase.from('products').insert({
            ...result.data,
            wallet_address: address,
            is_approved: false,
            status: 'pending'
          });
        }
      }

      toast.success("✅ AI extraction completed!");
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to connect to AI service");
    } finally {
      setIsScrapingProducts(false);
    }
  };

  const handleSubmitNewsUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsUrl.trim()) return;
    setIsScrapingNews(true);
    try {
      const result = await scrapeContentDirectly(newsUrl.trim(), 'news');
      
      if (!result.success) throw new Error(result.error || "Scraping failed");

      const { error: insertError } = await supabase.from('news').insert({
        ...result.data,
        wallet_address: address,
        is_published: true
      });

      if (insertError) throw insertError;

      toast.success("✅ News post created successfully!");
      setNewsUrl("");
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to scrape news");
    } finally {
      setIsScrapingNews(false);
    }
  };

  const handleSubmitPartnerUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerUrl.trim()) return;
    setIsScrapingPartner(true);
    try {
      const result = await scrapeContentDirectly(partnerUrl.trim(), 'communities');
      
      if (!result.success) throw new Error(result.error || "Scraping failed");

      const { error: insertError } = await supabase.from('communities').insert({
        ...result.data,
        slug: result.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        wallet_address: address,
        is_published: true
      });

      if (insertError) throw insertError;

      toast.success("✅ Partner added successfully!");
      setPartnerUrl("");
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || "Failed to scrape partner");
    } finally {
      setIsScrapingPartner(false);
    }
  };

  const loadMoreHackathons = async (count: number) => {
    setHackathonsStatus("Loading");
    const { data } = await supabase.from('hackathons').select('*').range(allHackathons.length, allHackathons.length + count - 1);
    if (data && data.length > 0) {
      setAllHackathons([...allHackathons, ...data]);
      if (data.length < count) setHackathonsStatus("AllLoaded");
      else setHackathonsStatus("CanLoadMore");
    } else {
      setHackathonsStatus("AllLoaded");
    }
  };

  const loadMoreEvents = async (count: number) => {
    setEventsStatus("Loading");
    const { data } = await supabase.from('events').select('*').range(allEvents.length, allEvents.length + count - 1);
    if (data && data.length > 0) {
      setAllEvents([...allEvents, ...data]);
      if (data.length < count) setEventsStatus("AllLoaded");
      else setEventsStatus("CanLoadMore");
    } else {
      setEventsStatus("AllLoaded");
    }
  };

  const loadMoreJobs = async (count: number) => {
    setJobsStatus("Loading");
    const { data } = await supabase.from('jobs').select('*').range(allJobs.length, allJobs.length + count - 1);
    if (data && data.length > 0) {
      setAllJobs([...allJobs, ...data]);
      if (data.length < count) setJobsStatus("AllLoaded");
      else setJobsStatus("CanLoadMore");
    } else {
      setJobsStatus("AllLoaded");
    }
  };

  const loadMoreProducts = async (count: number) => {
    setProductsStatus("Loading");
    const { data } = await supabase.from('products').select('*').range(allProducts.length, allProducts.length + count - 1);
    if (data && data.length > 0) {
      setAllProducts([...allProducts, ...data]);
      if (data.length < count) setProductsStatus("AllLoaded");
      else setProductsStatus("CanLoadMore");
    } else {
      setProductsStatus("AllLoaded");
    }
  };

  const loadMoreNews = async (count: number) => {
    setNewsStatus("Loading");
    const { data } = await supabase.from('news').select('*').range(allNews.length, allNews.length + count - 1);
    if (data && data.length > 0) {
      setAllNews([...allNews, ...data]);
      if (data.length < count) setNewsStatus("AllLoaded");
      else setNewsStatus("CanLoadMore");
    } else {
      setNewsStatus("AllLoaded");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 cyber-glitch flex items-center gap-2" data-text="Admin Dashboard">
              <Shield className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage platform content, users, and analytics</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Button
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate("/admin/certificates")}
            >
              <Award className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Certificate Manager</div>
                <div className="text-xs opacity-80">Generate NFT Certificates</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate("/issue-certificate")}
            >
              <Plus className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Issue Certificate</div>
                <div className="text-xs opacity-80">Single Certificate</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate("/certificates")}
            >
              <Eye className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">View Certificates</div>
                <div className="text-xs opacity-80">All Certificates</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate("/verify")}
            >
              <Shield className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Verify Certificate</div>
                <div className="text-xs opacity-80">Check Authenticity</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 border-primary/40 bg-primary/5"
              onClick={() => setActiveTab("library")}
            >
              <Database className="h-6 w-6 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Master Manager</div>
                <div className="text-xs opacity-80">All Content Library</div>
              </div>
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 h-auto p-3 w-full bg-card/50 border border-primary/20 rounded-lg">
              <TabsTrigger value="overview" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Eye className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="publisher" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Sparkles className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Publisher</span>
              </TabsTrigger>
              <TabsTrigger value="approvals" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem] relative">
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Approvals</span>
                {approvalStats && approvalStats.pending > 0 && (
                  <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-[10px] h-4 flex-shrink-0">
                    {approvalStats.pending}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="library" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem] bg-primary/5">
                <Database className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Content Library</span>
              </TabsTrigger>
              <TabsTrigger value="bulk" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Package className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Bulk</span>
              </TabsTrigger>
              <TabsTrigger value="search" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Search className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Search</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Activity className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">System</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Activity</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Download className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Export</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <BarChart3 className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="backup" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Database className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Backup</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Settings className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Settings</span>
              </TabsTrigger>
              <TabsTrigger value="permissions" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Permissions</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <BarChart3 className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Users</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Package className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Content</span>
              </TabsTrigger>
              <TabsTrigger value="news" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Newspaper className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">News</span>
              </TabsTrigger>
              <TabsTrigger value="communities" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Communities</span>
              </TabsTrigger>
              <TabsTrigger value="event-groups" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Event Groups</span>
              </TabsTrigger>
              <TabsTrigger value="aiagent" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Bot className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">AI Agent</span>
              </TabsTrigger>
              <TabsTrigger value="ai-email" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">AI Email</span>
              </TabsTrigger>
              <TabsTrigger value="bulk-email" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Bulk Email</span>
              </TabsTrigger>
              <TabsTrigger value="admins" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Admins</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Trophy className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Leaderboard</span>
              </TabsTrigger>
              <TabsTrigger value="partnerships" className="text-xs sm:text-sm flex items-center justify-center gap-1 px-3 py-2 min-h-[2.5rem]">
                <Star className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Partners</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <QuickStats />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <QuickActions onTabChange={setActiveTab} />
                <RecentActivity />
              </div>
            </TabsContent>

            {/* Publisher Tab */}
            <TabsContent value="publisher" className="space-y-6">
              <ContentPublisher onSuccess={() => {
                // Refresh approvals after successful publish
                window.location.reload();
              }} />
            </TabsContent>

            {/* Approvals Tab */}
            <TabsContent value="approvals" className="space-y-6">
              <PendingApprovals />
            </TabsContent>

            {/* Content Library Tab */}
            <TabsContent value="library" className="space-y-6">
              <GlobalContentExplorer />
            </TabsContent>

            {/* Bulk Actions Tab */}
            <TabsContent value="bulk" className="space-y-6">
              <BulkImport />
              <BulkActions />
            </TabsContent>

            {/* Search & Filter Tab */}
            <TabsContent value="search" className="space-y-6">
              <SearchFilter />
            </TabsContent>

            {/* System Health Tab */}
            <TabsContent value="system" className="space-y-6">
              <SystemHealth />
            </TabsContent>

            {/* Activity Log Tab */}
            <TabsContent value="activity" className="space-y-6">
              <ActivityLog />
            </TabsContent>

            {/* Data Export Tab */}
            <TabsContent value="export" className="space-y-6">
              <DataExport />
            </TabsContent>

            {/* Reports & Analytics Tab */}
            <TabsContent value="reports" className="space-y-6">
              <ReportsAnalytics />
            </TabsContent>

            {/* Backup & Restore Tab */}
            <TabsContent value="backup" className="space-y-6">
              <BackupRestore />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <SettingsManager />
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions" className="space-y-6">
              <PermissionsManager />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <Card className="border-primary/20 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Total Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary">{analytics?.totalUsers || 0}</p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-accent" />
                      Hackathons
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-accent">{analytics?.totalHackathons || 0}</p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-secondary" />
                      Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-secondary">{analytics?.totalEvents || 0}</p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Jobs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary">{analytics?.totalJobs || 0}</p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-accent" />
                      Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-accent">{analytics?.totalProducts || 0}</p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Newspaper className="h-5 w-5 text-secondary" />
                      News Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-secondary">{analytics?.totalNews || 0}</p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Registrations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary">{analytics?.totalRegistrations || 0}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    All Registered Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allUsers?.map((user) => (
                      <div key={user.id} className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border border-primary/10">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-lg">{user.name || "Unnamed User"}</p>
                            {user.role === "admin" && (
                              <Badge variant="default" className="bg-primary/20 text-primary">Admin</Badge>
                            )}
                          </div>
                          {user.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          )}
                          {user.wallet_address && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                              <Wallet className="h-3 w-3" />
                              {user.wallet_address}
                            </div>
                          )}
                          {user.bio && (
                            <p className="text-sm text-muted-foreground mt-2">{user.bio}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {/* Pagination removed for now, can be reimplemented with Supabase limit/offset */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Management Tab */}
            <TabsContent value="content" className="space-y-6">
              {/* Hackathons Section */}
              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    Manage Hackathons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allHackathons?.map((hackathon) => (
                      <div key={hackathon.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/30 rounded-lg border border-primary/10 gap-3">
                        <div className="flex-1 w-full sm:w-auto">
                          <p className="font-semibold">{hackathon.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{hackathon.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline">{hackathon.status}</Badge>
                            <Badge variant="outline">Prizes: {hackathon.prizes}</Badge>
                            {hackathon.is_featured && <Badge variant="default"><Star className="h-3 w-3 mr-1" />Featured</Badge>}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Switch
                              checked={hackathon.is_featured || false}
                              onCheckedChange={() => handleToggleFeaturedHackathon(hackathon.id, hackathon.is_featured || false)}
                            />
                            <Label className="text-xs cursor-pointer" onClick={() => handleToggleFeaturedHackathon(hackathon.id, hackathon.is_featured || false)}>
                              {hackathon.is_featured ? '⭐ Featured' : '☆ Not Featured'}
                            </Label>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteHackathon(hackathon.id)}
                          className="w-full sm:w-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {hackathonsStatus === "CanLoadMore" && (
                      <Button onClick={() => loadMoreHackathons(10)} variant="outline" className="w-full">
                        Load More Hackathons
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Events Section */}
              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-secondary" />
                    Manage Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allEvents?.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-primary/10">
                        <div className="flex-1">
                          <p className="font-semibold">{event.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{event.type}</Badge>
                            <Badge variant="outline">{event.location}</Badge>
                            {event.is_featured && <Badge variant="default"><Star className="h-3 w-3 mr-1" />Featured</Badge>}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Switch
                              checked={event.is_featured || false}
                              onCheckedChange={() => handleToggleFeaturedEvent(event.id, event.is_featured || false)}
                            />
                            <Label className="text-xs cursor-pointer" onClick={() => handleToggleFeaturedEvent(event.id, event.is_featured || false)}>
                              {event.is_featured ? '⭐ Featured' : '☆ Not Featured'}
                            </Label>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {eventsStatus === "CanLoadMore" && (
                      <Button onClick={() => loadMoreEvents(10)} variant="outline" className="w-full">
                        Load More Events
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Jobs Section */}
              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Manage Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allJobs?.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-primary/10">
                        <div className="flex-1">
                          <p className="font-semibold">{job.title}</p>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{job.type}</Badge>
                            <Badge variant="outline">{job.location}</Badge>
                            {job.salary && <Badge variant="outline">{job.salary}</Badge>}
                            {job.is_featured && <Badge variant="default"><Star className="h-3 w-3 mr-1" />Featured</Badge>}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Switch
                              checked={job.is_featured || false}
                              onCheckedChange={() => handleToggleFeaturedJob(job.id, job.is_featured || false)}
                            />
                            <Label className="text-xs cursor-pointer" onClick={() => handleToggleFeaturedJob(job.id, job.is_featured || false)}>
                              {job.is_featured ? '⭐ Featured' : '☆ Not Featured'}
                            </Label>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {jobsStatus === "CanLoadMore" && (
                      <Button onClick={() => loadMoreJobs(10)} variant="outline" className="w-full">
                        Load More Jobs
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Job Scraper Section */}
              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-accent" />
                    AI Job Scraper
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Use AI to automatically scrape and generate Web3 job listings from various sources.
                      This will create 8-10 realistic blockchain and crypto job postings.
                    </p>
                    <Button
                      onClick={handleScrapeJobs}
                      disabled={isScrapingJobs}
                      className="w-full"
                    >
                      {isScrapingJobs ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Scraping Jobs...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Scrape Web3 Jobs with AI
                        </>
                      )}
                    </Button>
                    <div className="p-3 bg-primary/5 rounded-md border border-primary/20">
                      <p className="text-xs text-muted-foreground">
                        💡 <strong>Note:</strong> The AI will generate realistic job listings from companies like
                        Uniswap, Aave, Polygon, Chainlink, and more. Duplicates are automatically skipped.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Event Scraper Section */}
              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-secondary" />
                    AI Event Scraper
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Use AI to automatically generate Web3 event listings. This will create 8-10 realistic
                      conferences, workshops, meetups, and webinars in India.
                    </p>
                    <Button
                      onClick={handleScrapeEvents}
                      disabled={isScrapingEvents}
                      className="w-full"
                    >
                      {isScrapingEvents ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Scraping Events...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Scrape Web3 Events with AI
                        </>
                      )}
                    </Button>
                    <div className="p-3 bg-secondary/5 rounded-md border border-secondary/20">
                      <p className="text-xs text-muted-foreground">
                        💡 <strong>Note:</strong> The AI will generate realistic event listings in Bangalore, Delhi,
                        Mumbai, and other major Indian cities. Duplicates are automatically skipped.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Product Scraper Section */}
              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-accent" />
                    AI Product Scraper
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Use AI to automatically generate Web3 product listings. This will create 8-10 realistic
                      DeFi, NFT, DAO, Gaming, and Infrastructure products.
                    </p>
                    <Button
                      onClick={handleScrapeProducts}
                      disabled={isScrapingProducts}
                      className="w-full"
                    >
                      {isScrapingProducts ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Scraping Products...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Scrape Web3 Products with AI
                        </>
                      )}
                    </Button>
                    <div className="p-3 bg-accent/5 rounded-md border border-accent/20">
                      <p className="text-xs text-muted-foreground">
                        💡 <strong>Note:</strong> The AI will generate realistic product listings across various
                        Web3 categories like DeFi protocols, NFT platforms, DAOs, and more.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products Section */}
              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-accent" />
                    Manage Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allProducts?.map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-primary/10">
                        <div className="flex-1">
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{product.category}</Badge>
                            <Badge variant={product.is_published ? "default" : "secondary"}>
                              {product.is_published ? "Published" : "Draft"}
                            </Badge>
                            <Badge variant="outline">{product.likes} likes</Badge>
                            <Badge variant="outline">{product.views} views</Badge>
                            {product.is_featured && <Badge variant="default"><Star className="h-3 w-3 mr-1" />Featured</Badge>}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Switch
                              checked={product.is_featured || false}
                              onCheckedChange={() => handleToggleFeaturedProduct(product.id, product.is_featured || false)}
                            />
                            <Label className="text-xs cursor-pointer" onClick={() => handleToggleFeaturedProduct(product.id, product.is_featured || false)}>
                              {product.is_featured ? '⭐ Featured' : '☆ Not Featured'}
                            </Label>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {productsStatus === "CanLoadMore" && (
                      <Button onClick={() => loadMoreProducts(10)} variant="outline" className="w-full">
                        Load More Products
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Admins Tab */}
            <TabsContent value="admins" className="space-y-6">
              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle>Add New Admin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Wallet Address"
                    value={newAdminWallet}
                    onChange={(e) => setNewAdminWallet(e.target.value)}
                    className="bg-background/50 border-primary/20"
                  />
                  <Button onClick={handleMakeAdmin} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Admin
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle>Current Admins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {admins?.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-3 bg-muted/30 rounded border border-primary/10">
                        <div>
                          <p className="font-medium">{admin.name || "Unnamed"}</p>
                          <p className="text-sm text-muted-foreground font-mono">{admin.wallet_address}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => admin.wallet_address && handleRemoveAdmin(admin.wallet_address)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-6">
              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle>Add Leaderboard Entry</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="User Name"
                    value={newLeaderEntry.userName}
                    onChange={(e) => setNewLeaderEntry({ ...newLeaderEntry, userName: e.target.value })}
                    className="bg-background/50 border-primary/20"
                  />
                  <Input
                    type="number"
                    placeholder="Score"
                    value={newLeaderEntry.score}
                    onChange={(e) => setNewLeaderEntry({ ...newLeaderEntry, score: parseInt(e.target.value) || 0 })}
                    className="bg-background/50 border-primary/20"
                  />
                  <Input
                    type="number"
                    placeholder="Rank"
                    value={newLeaderEntry.rank}
                    onChange={(e) => setNewLeaderEntry({ ...newLeaderEntry, rank: parseInt(e.target.value) || 1 })}
                    className="bg-background/50 border-primary/20"
                  />
                  <Input
                    placeholder="Achievements (comma separated)"
                    value={newLeaderEntry.achievements}
                    onChange={(e) => setNewLeaderEntry({ ...newLeaderEntry, achievements: e.target.value })}
                    className="bg-background/50 border-primary/20"
                  />
                  <Button onClick={handleAddLeaderboardEntry} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle>Current Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {leaderboard?.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/30 rounded border border-primary/10">
                        <div>
                          <p className="font-medium">#{entry.rank} - {entry.user_name}</p>
                          <p className="text-sm text-muted-foreground">Score: {entry.score}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (address) {
                                supabase.from('leaderboard').delete().eq('id', entry.id).then(() => fetchAdminData());
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Communities Tab */}
            <TabsContent value="communities" className="space-y-6">
              <CommunityPagesManager />
            </TabsContent>

            {/* Event Groups Tab */}
            <TabsContent value="event-groups" className="space-y-6">
              <EventGroupsManager />
            </TabsContent>

            {/* AI Agent Tab */}
            <TabsContent value="aiagent" className="space-y-6">
              <AIAgentManager />
            </TabsContent>

            {/* AI Email Agent Tab */}
            <TabsContent value="ai-email" className="space-y-6">
              <AIEmailAgent />
            </TabsContent>

            {/* Bulk Email Tab */}
            <TabsContent value="bulk-email" className="space-y-6">
              <BulkEmailSender />
            </TabsContent>

            {/* Partnerships Tab */}
            <TabsContent value="partnerships" className="space-y-6">
              {/* AI Partner Scraper Card */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Partner Scraper - Quick Add from URL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitPartnerUrl} className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        placeholder="https://example-dao.xyz or https://partner-website.com"
                        value={partnerUrl}
                        onChange={(e) => setPartnerUrl(e.target.value)}
                        disabled={isScrapingPartner}
                        className="flex-1 bg-background/50 border-primary/20"
                      />
                      <Button
                        type="submit"
                        disabled={isScrapingPartner || !partnerUrl.trim()}
                        className="bg-primary hover:bg-primary/90 min-w-[140px]"
                      >
                        {isScrapingPartner ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Scraping...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Scrape & Add
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      💡 Paste any partner/DAO/protocol website URL. AI will extract name, logo, description, and social links automatically.
                      Partners will be immediately visible on the Partnerships page.
                    </p>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle>Add Partnership Manually</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Partner Name"
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                    className="bg-background/50 border-primary/20"
                  />
                  <Textarea
                    placeholder="Description"
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                    className="bg-background/50 border-primary/20"
                  />
                  <Input
                    placeholder="Logo URL"
                    value={newCommunity.logo}
                    onChange={(e) => setNewCommunity({ ...newCommunity, logo: e.target.value })}
                    className="bg-background/50 border-primary/20"
                  />
                  <Input
                    placeholder="Website URL"
                    value={newCommunity.website}
                    onChange={(e) => setNewCommunity({ ...newCommunity, website: e.target.value })}
                    className="bg-background/50 border-primary/20"
                  />
                  <Input
                    placeholder="Twitter URL"
                    value={newCommunity.twitter}
                    onChange={(e) => setNewCommunity({ ...newCommunity, twitter: e.target.value })}
                    className="bg-background/50 border-primary/20"
                  />
                  <Input
                    placeholder="Discord URL"
                    value={newCommunity.discord}
                    onChange={(e) => setNewCommunity({ ...newCommunity, discord: e.target.value })}
                    className="bg-background/50 border-primary/20"
                  />
                  <div className="space-y-2">
                    <Label>Partnership Type</Label>
                    <select
                      value={newCommunity.partnershipType}
                      onChange={(e) => setNewCommunity({ ...newCommunity, partnershipType: e.target.value })}
                      className="w-full p-2 bg-background/50 border border-primary/20 rounded-md"
                    >
                      <option value="community">Community</option>
                      <option value="sponsor">Sponsor</option>
                      <option value="official">Official</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Partner Category (Row)</Label>
                    <select
                      value={newCommunity.partnerCategory}
                      onChange={(e) => setNewCommunity({ ...newCommunity, partnerCategory: e.target.value })}
                      className="w-full p-2 bg-background/50 border border-primary/20 rounded-md"
                    >
                      <option value="media">Media Partners</option>
                      <option value="community">Community Partners</option>
                      <option value="conference">Conference Partners</option>
                      <option value="sponsor">Sponsors</option>
                    </select>
                  </div>
                  <Button onClick={handleAddCommunity} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Partnership
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle>Current Partnerships</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {communities?.map((community: any) => (
                      <div
                        key={community.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded border border-primary/10"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            {community.logo && (
                              <img
                                src={community.logo}
                                alt={community.name}
                                className="h-8 w-8 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{community.name}</p>
                              <div className="flex gap-2 items-center flex-wrap">
                                <p className="text-sm text-muted-foreground">{community.partnershipType}</p>
                                {community.partnerCategory && (
                                  <Badge variant="outline" className="h-5 text-xs">
                                    {community.partnerCategory}
                                  </Badge>
                                )}
                                  {community.is_featured && <Badge variant="default" className="h-5"><Star className="h-2 w-2 mr-1" />Featured</Badge>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2 ml-11">
                            <Switch
                              checked={community.is_featured || false}
                              onCheckedChange={() => handleToggleFeaturedCommunity(community.id, community.is_featured || false)}
                            />
                            <Label className="text-xs cursor-pointer" onClick={() => handleToggleFeaturedCommunity(community.id, community.is_featured || false)}>
                              {community.is_featured ? '⭐ Featured' : '☆ Not Featured'}
                            </Label>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (address) {
                                supabase.from('communities').delete().eq('id', community.id).then(() => fetchAdminData());
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news" className="space-y-6">
              {/* Quick Scrape Card */}
              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Quick Add News from Link
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Paste a news article URL and our scraper will automatically extract and create the post
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitNewsUrl} className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://example.com/article"
                      value={newsUrl}
                      onChange={(e) => setNewsUrl(e.target.value)}
                      className="flex-1 bg-background/50 border-primary/20"
                      disabled={isScrapingNews}
                    />
                    <Button type="submit" disabled={isScrapingNews || !newsUrl.trim()}>
                      {isScrapingNews ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Scraping...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Scrape & Add
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5" />
                    Create News Post Manually
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Post Title"
                    value={newNewsPost.title}
                    onChange={(e) => setNewNewsPost({ ...newNewsPost, title: e.target.value })}
                    className="bg-background/50 border-primary/20"
                  />
                  <Input
                    placeholder="URL Slug (e.g., my-first-post)"
                    value={newNewsPost.slug}
                    onChange={(e) => setNewNewsPost({ ...newNewsPost, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="bg-background/50 border-primary/20"
                  />
                  <Textarea
                    placeholder="Post Content (HTML supported)"
                    value={newNewsPost.content}
                    onChange={(e) => setNewNewsPost({ ...newNewsPost, content: e.target.value })}
                    className="bg-background/50 border-primary/20 min-h-[200px]"
                  />
                  <Textarea
                    placeholder="Short Excerpt (optional)"
                    value={newNewsPost.excerpt}
                    onChange={(e) => setNewNewsPost({ ...newNewsPost, excerpt: e.target.value })}
                    className="bg-background/50 border-primary/20"
                  />
                  <Input
                    placeholder="Cover Image URL (optional)"
                    value={newNewsPost.coverImage}
                    onChange={(e) => setNewNewsPost({ ...newNewsPost, coverImage: e.target.value })}
                    className="bg-background/50 border-primary/20"
                  />
                  <select
                    value={newNewsPost.category}
                    onChange={(e) => setNewNewsPost({ ...newNewsPost, category: e.target.value })}
                    className="w-full p-2 bg-background/50 border border-primary/20 rounded-md"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="event">Event</option>
                    <option value="update">Update</option>
                  </select>
                  <Input
                    placeholder="Tags (comma separated)"
                    value={newNewsPost.tags}
                    onChange={(e) => setNewNewsPost({ ...newNewsPost, tags: e.target.value })}
                    className="bg-background/50 border-primary/20"
                  />
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newNewsPost.isPublished}
                        onChange={(e) => setNewNewsPost({ ...newNewsPost, isPublished: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Published</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newNewsPost.isFeatured}
                        onChange={(e) => setNewNewsPost({ ...newNewsPost, isFeatured: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Featured</span>
                    </label>
                  </div>
                  <Button onClick={handleCreateNews} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Create News Post
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/50">
                <CardHeader>
                  <CardTitle>All News Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allNews && allNews.length > 0 ? (
                      allNews.map((post: any) => (
                        <div
                          key={post.id}
                          className="flex items-start justify-between p-4 border border-primary/20 rounded-lg bg-background/30"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{post.title}</h3>
                              <Badge variant={post.isPublished ? "default" : "secondary"}>
                                {post.isPublished ? "Published" : "Draft"}
                              </Badge>
                              {post.isFeatured && <Badge variant="default"><Star className="h-3 w-3 mr-1" />Featured</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              /{post.slug}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {post.views || 0} views
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {post.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Switch
                                checked={post.is_featured || false}
                                onCheckedChange={() => handleToggleFeaturedNews(post.id, post.is_featured || false)}
                              />
                              <Label className="text-xs cursor-pointer" onClick={() => handleToggleFeaturedNews(post.id, post.is_featured || false)}>
                                {post.is_featured ? '⭐ Featured' : '☆ Not Featured'}
                              </Label>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (!address) return;
                              handleDeleteNews(post.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No news posts yet</p>
                    )}
                    {newsStatus === "CanLoadMore" && (
                      <Button onClick={() => loadMoreNews(10)} variant="outline" className="w-full mt-4">
                        Load More News
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}