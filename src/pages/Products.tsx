import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Package,
  Heart,
  Eye,
  ExternalLink,
  Plus,
  Upload,
  Sparkles,
  User,
  Link as LinkIcon,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProductLaunch } from "@/hooks/useProductLaunch";
import { LAUNCH_FEE } from "@/contracts/ProductLaunchVerification";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { useSupabaseMutation } from "@/hooks/useSupabase";

const PRODUCT_CATEGORIES = [
  "DeFi",
  "NFT",
  "DAO",
  "Gaming",
  "Infrastructure",
  "Metaverse",
  "Social",
  "Wallet",
  "Analytics",
  "Other"
];

import { PublicSubmissionDialog } from "@/components/PublicSubmissionDialog";

export default function Products() {
  const [products, setProducts] = useState<any[] | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<any[] | null>(null);
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const address = user?.wallet_address;
  const isConnected = isAuthenticated;
  const chain = undefined; // Chain info needs to be derived differently if needed
  const navigate = useNavigate();
  const { launchProduct, isLaunching } = useProductLaunch();
  const createProductMutation = useSupabaseMutation("products");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    content: "",
    pdf_url: "",
    image_url: "",
    website_url: "",
    github_url: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchFeaturedProducts();
  }, [refreshKey]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          author:users!author_id(*)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setFeaturedProducts(data);
    } catch (error) {
      console.error("Error fetching featured products:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const generateAIContent = async () => {
    if (!formData.name || !formData.description) {
      toast.error("Please provide product name and description first");
      return;
    }

    setIsGeneratingAI(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const aiContent = `## ${formData.name}

${formData.description}

### Key Features
- Decentralized architecture
- Web3 integration
- User-friendly interface
- Secure and transparent

### Technology Stack
Built with modern Web3 technologies including smart contracts, IPFS, and more.

### Use Cases
Perfect for developers and users looking to explore ${formData.category || "Web3"} solutions.

*Generated with AI assistance*`;

      setFormData(prev => ({ ...prev, content: aiContent }));
      toast.success("AI content generated successfully!");
    } catch (error) {
      toast.error("Failed to generate AI content");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to add products");
      return;
    }

    if (!formData.name || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      toast.info(`Launching product with ${LAUNCH_FEE} ETH fee...`);
      const txHash = await launchProduct(
        formData.name,
        formData.description,
        formData.category,
        formData.image_url,
        formData.website_url,
        formData.tags
      );

      if (!txHash) {
        toast.error("Payment cancelled or failed");
        setIsSubmitting(false);
        return;
      }

      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      await createProductMutation.mutate('insert', {
        ...formData,
        wallet_address: address,
        slug,
        author_id: user?.id,
        status: "approved",
        views: 0,
        likes: 0,
        is_featured: false
      });

      toast.success("Product launched successfully! It is now live.");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        category: "",
        content: "",
        pdf_url: "",
        image_url: "",
        website_url: "",
        github_url: "",
        tags: [],
      });
      fetchProducts();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to launch product";
      toast.error(errorMessage);
      console.error("Error launching product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-32 pb-12">
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 cyber-glitch" data-text="Web3 Products">
                Web3 Products
              </h1>
              <p className="text-muted-foreground">
                Discover and share amazing Web3 products, dApps, and projects
              </p>
            </div>

            <PublicSubmissionDialog type="product" onSuccess={() => setRefreshKey(prev => prev + 1)} />
          </div>
        </div>

        {/* Featured Products Carousel */}
        {featuredProducts && featuredProducts.length > 0 && (
          <FeaturedCarousel
            items={featuredProducts}
            title="⭐ Featured Products"
            renderCard={(product) => (
              <Card
                className="hover:shadow-lg transition-all cursor-pointer border-2 border-yellow-500/20"
                onClick={() => navigate(`/products/${product.slug}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {product.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {product.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="secondary">{product.category}</Badge>
                    {product.tags?.slice(0, 3).map((tag: string, i: number) => (
                      <Badge key={i} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {product.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {product.views}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          />
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!products ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-primary/10 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-primary/10 rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-primary/10 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-20 border border-dashed border-primary/20 rounded-lg">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to share a Web3 product!</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add First Product
              </Button>
            </div>
          ) : (
            products.map((product: any, i: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/products/${product.slug}`}>
                  <Card className="h-full hover:border-primary/30 transition-all cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="border-primary/50 text-primary">
                          {product.category}
                        </Badge>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {product.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" /> {product.likes}
                          </span>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {product.description}
                      </CardDescription>
                    </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Avatar className="h-6 w-6 border border-primary/30">
                          <AvatarImage src={product.author?.image} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <span>{product.author?.name || "Anonymous"}</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          <LinkIcon className="mr-1 h-3 w-3" /> View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
