import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Shield, Coins } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useSubmissionStaking, SubmissionType } from "@/hooks/useSubmissionStaking";
import { motion, AnimatePresence } from "framer-motion";
import { decodeEventLog } from "viem";
import { PUBLIC_SUBMISSION_STAKING_ABI } from "@/contracts/PublicSubmissionStaking";
import { generateSlug } from "@/utils/slugify";

interface PublicSubmissionDialogProps {
  type: "event" | "hackathon" | "product";
  onSuccess?: () => void;
}

export function PublicSubmissionDialog({ type, onSuccess }: PublicSubmissionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1: Form, 2: Staking
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const { user: authUser, isAuthenticated } = useAuth();
  const { submitWithStake, isSubmitting: isStaking } = useSubmissionStaking();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    image: "",
    location: "",
    date: "",
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // First, save to Supabase with is_approved: false
      const table = type === "hackathon" ? "hackathons" : type === "event" ? "events" : "products";
      const slug = generateSlug(formData.title);
      
      let payload: any;
      if (type === "hackathon") {
        payload = {
          name: formData.title,
          slug: slug,
          description: formData.description,
          registration_link: formData.link,
          image: formData.image,
          location: formData.location || "Online",
          start_date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
          wallet_address: authUser?.wallet_address,
          is_approved: true
        };
      } else if (type === "event") {
        payload = {
          title: formData.title,
          slug: slug,
          description: formData.description,
          registration_link: formData.link,
          image: formData.image,
          location: formData.location || "TBA",
          date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
          wallet_address: authUser?.wallet_address,
          is_approved: true
        };
      } else {
        // product
        payload = {
          name: formData.title,
          slug: slug,
          description: formData.description,
          website_url: formData.link,
          image_url: formData.image,
          wallet_address: authUser?.wallet_address,
          status: "approved" // Auto-approve for now
        };
      }

      const { data, error } = await supabase.from(table).insert(payload).select().single();

      if (error) throw error;

      setSubmittedId(data.id);
      setStep(2); // Move to staking step
      toast.success("Details saved! Now proceed to on-chain staking.");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to save submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStaking = async () => {
    if (!submittedId) return;

    const subType = type === "event" ? SubmissionType.Event : type === "hackathon" ? SubmissionType.Hackathon : SubmissionType.Product;
    
    const result = await submitWithStake(subType, submittedId);

    if (result && result.receipt) {
      try {
        // Decode the Submitted event to get the on-chain ID
        const log = result.receipt.logs[0];
        const decoded = decodeEventLog({
          abi: PUBLIC_SUBMISSION_STAKING_ABI,
          data: log.data,
          topics: log.topics,
        });

        const onChainId = (decoded.args as any).id;
        
        // Update Supabase with the on-chain ID
        const table = type === "hackathon" ? "hackathons" : type === "event" ? "events" : "products";
        await supabase.from(table).update({ 
          on_chain_id: onChainId.toString(),
          staking_tx_hash: result.hash 
        }).eq('id', submittedId);

        toast.success("🎉 Submission successful! Stake confirmed.");
        setIsOpen(false);
        resetForm();
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error("Error updating on-chain ID:", err);
        toast.error("Stake confirmed but failed to update record. Please contact admin.");
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", link: "", image: "", location: "", date: "" });
    setStep(1);
    setSubmittedId(null);
  };

  const typeLabels = {
    event: "Event",
    hackathon: "Hackathon",
    product: "Product"
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/50 hover:bg-primary/10">
          <Plus className="h-4 w-4" />
          Submit {typeLabels[type]}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {step === 1 ? <Plus className="text-primary" /> : <Shield className="text-primary" />}
            {step === 1 ? `Submit ${typeLabels[type]}` : "Complete Staking"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? `Fill in the details for your ${type}. Once saved, you'll need to stake 0.01 ETH.`
              : (
                <div className="space-y-2">
                  <p>To prevent spam, a small stake of 0.01 ETH is required. It will be refunded once an admin approves your submission.</p>
                  <p className="text-xs text-primary font-medium">
                    Don't have Sepolia ETH? <a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary/80 transition-colors">Claim free test tokens here</a>
                  </p>
                </div>
              )}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleFormSubmit}
              className="space-y-4 mt-4"
            >
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder={`My Awesome ${typeLabels[type]}`}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us more about it..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              {(type === "event" || type === "hackathon") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="City, Country or Online"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">{type === "event" ? "Event Date" : "Start Date"} *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="link">{type === "product" ? "Website URL" : "Registration Link"}</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://..."
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image/Logo URL</Label>
                <Input
                  id="image"
                  type="url"
                  placeholder="https://.../image.png"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Save & Continue to Stake"}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              key="staking"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 mt-4 p-6 border border-primary/20 rounded-lg bg-primary/5 text-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/20 rounded-full">
                  <Coins className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-primary">0.01 ETH</p>
                  <p className="text-sm text-muted-foreground">Required Stake (Ethereum Sepolia)</p>
                </div>
                <div className="text-sm bg-background/50 p-3 rounded border border-primary/10">
                  <p className="font-semibold text-primary mb-1">How it works:</p>
                  <ul className="text-left space-y-1 opacity-80 list-disc pl-4">
                    <li>Submit your stake to verify authenticity</li>
                    <li>Admin reviews your submission</li>
                    <li>On approval, your **0.01 ETH is fully refunded**</li>
                    <li>On rejection, the stake is kept in the contract</li>
                  </ul>
                </div>
              </div>
              <Button onClick={handleStaking} className="w-full h-12 text-lg" disabled={isStaking}>
                {isStaking ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Stake & Publish"
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Network: Ethereum Sepolia Testnet
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
