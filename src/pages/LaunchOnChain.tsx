import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProductLaunch } from "@/hooks/useProductLaunch";
import { createPublicClient, http, parseEther } from "viem";
import { base, baseSepolia } from "viem/chains";
import { 
  PRODUCT_LAUNCH_ABI, 
  PRODUCT_LAUNCH_CONTRACT,
  LAUNCH_FEE 
} from "@/contracts/ProductLaunchVerification";
import { toast } from "sonner";
import { 
  Rocket, 
  TrendingUp, 
  Shield, 
  Coins, 
  FileCode, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Loader2 
} from "lucide-react";
import { useEffect } from "react";

const CONTRACT_ADDRESSES = {
  ProductStaking: "0xE114AA229DE7c88BC22d2F5ec628532c9c46663c"
};

export default function LaunchOnChain() {
  const { user: authUser, isAuthenticated } = useAuth();
  const { launchProduct, isLaunching, isSuccess } = useProductLaunch();
  const [productCount, setProductCount] = useState<bigint | null>(null);
  const isConnected = isAuthenticated;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "DeFi",
    logoUrl: "",
    websiteUrl: "",
    socialLinks: ["", "", ""]
  });

  const fetchContractData = async () => {
    try {
      const publicClient = createPublicClient({
        chain: baseSepolia, // Default to baseSepolia for now, or detect from wallet
        transport: http()
      });

      const count = await publicClient.readContract({
        address: PRODUCT_LAUNCH_CONTRACT['base-sepolia'].address as `0x${string}`,
        abi: PRODUCT_LAUNCH_ABI,
        functionName: 'productCount',
      });
      setProductCount(count as bigint);
    } catch (err) {
      console.error("Error fetching contract data:", err);
    }
  };

  useEffect(() => {
    fetchContractData();
  }, []);

  const handleLaunch = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!formData.name || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const filteredSocialLinks = formData.socialLinks.filter(link => link.trim() !== "");

      const hash = await launchProduct(
        formData.name,
        formData.description,
        formData.category,
        formData.logoUrl,
        formData.websiteUrl,
        filteredSocialLinks
      );

      if (hash) {
        // Reset form on success (this could also be handled by isSuccess effect)
        setFormData({
          name: "",
          description: "",
          category: "DeFi",
          logoUrl: "",
          websiteUrl: "",
          socialLinks: ["", "", ""]
        });
        fetchContractData(); // Refresh count
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to launch product");
    }
  };

  const features = [
    {
      icon: Shield,
      title: "Immutable",
      description: "Your product launch is permanently recorded on the blockchain"
    },
    {
      icon: TrendingUp,
      title: "Upvoting",
      description: "Community members can upvote your product on-chain"
    },
    {
      icon: Coins,
      title: "Staking",
      description: "Users can stake ETH to support your product"
    },
    {
      icon: CheckCircle,
      title: "Verification",
      description: "Get verified status for your product by admins"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="container mx-auto max-w-7xl relative z-10"
          >
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/40">
                <Rocket className="h-3 w-3 mr-1" />
                Launch On-Chain
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Launch Your Product On-Chain
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
                Deploy your Web3 product to the blockchain with permanent, immutable records. Enable community upvoting and staking support.
              </p>

              {productCount && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {productCount.toString()} Products Launched
                  </Badge>
                </div>
              )}
            </div>

            {/* Contract Info */}
            <div className="max-w-3xl mx-auto mb-12">
              <Card className="border-primary/20 bg-card/50">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Deployer Address</Label>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted p-2 rounded flex-1 overflow-x-auto">
                          0x6F9788e39e8C629f73C27db48cce03eA1fB9Acc1
                        </code>
                        <ExternalLink className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Staking Contract</Label>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted p-2 rounded flex-1 overflow-x-auto">
                          {CONTRACT_ADDRESSES.ProductStaking}
                        </code>
                        <ExternalLink className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-primary/20 bg-card/50 h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Launch Form Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Launch Your Product
                </CardTitle>
                <CardDescription>
                  Fill in the details below to launch your product on the blockchain
                  {LAUNCH_FEE && ` (Fee: ${(Number(LAUNCH_FEE) / 1e18).toFixed(3)} ETH)`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Awesome DeFi Protocol"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your product..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 bg-background border border-input rounded-md"
                  >
                    <option value="DeFi">DeFi</option>
                    <option value="NFT">NFT</option>
                    <option value="DAO">DAO</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Social">Social</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Social Links (optional)</Label>
                  {formData.socialLinks.map((link, index) => (
                    <Input
                      key={index}
                      value={link}
                      onChange={(e) => {
                        const newLinks = [...formData.socialLinks];
                        newLinks[index] = e.target.value;
                        setFormData({ ...formData, socialLinks: newLinks });
                      }}
                      placeholder={`Social link ${index + 1} (Twitter, Discord, etc.)`}
                    />
                  ))}
                </div>

                {!isConnected ? (
                  <div className="flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <p className="text-sm text-yellow-500">Please connect your wallet to launch a product</p>
                  </div>
                ) : (
                  <Button
                    onClick={handleLaunch}
                    disabled={isLaunching || !formData.name || !formData.description}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    size="lg"
                  >
                    {isLaunching ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Launching...
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 h-5 w-5" />
                        Launch Product On-Chain
                      </>
                    )}
                  </Button>
                )}

                <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <FileCode className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="text-blue-500 font-medium">Smart Contract Features:</p>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      <li>✅ Permanent on-chain record</li>
                      <li>✅ Community upvoting system</li>
                      <li>✅ Staking pool creation</li>
                      <li>✅ Admin verification</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
