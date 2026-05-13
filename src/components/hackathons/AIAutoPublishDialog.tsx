import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

interface AIAutoPublishDialogProps {
  onSuccess: () => void;
}

export function AIAutoPublishDialog({ onSuccess }: AIAutoPublishDialogProps) {
  const { user: authUser } = useAuth();
  const address = authUser?.wallet_address;
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [eventUrl, setEventUrl] = useState("");
  const [isScrapingAI, setIsScrapingAI] = useState(false);

  const handleAIScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventUrl.trim()) {
      toast.error("Please enter a valid event URL");
      return;
    }

    setIsScrapingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-hackathon', {
        body: {
          url: eventUrl.trim(),
          wallet_address: address,
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("✅ Hackathon submitted for review! Admin will approve it soon.");
        setAiDialogOpen(false);
        setEventUrl("");
        onSuccess();
      } else {
        toast.error(data?.error || "Failed to scrape and publish");
      }
    } catch (error) {
      toast.error("AI scraping failed. Please try again.");
      console.error(error);
    } finally {
      setIsScrapingAI(false);
    }
  };

  return (
    <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600">
          <Sparkles className="mr-2 h-4 w-4" /> AI Auto-Publish
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Hackathon Auto-Publisher
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAIScrape} className="space-y-4">
          <div>
            <Label htmlFor="eventUrl">Hackathon Event URL</Label>
            <Textarea
              id="eventUrl"
              value={eventUrl}
              onChange={(e) => setEventUrl(e.target.value)}
              placeholder="https://devpost.com/hackathons/..."
              className="min-h-[80px] mt-2"
              disabled={isScrapingAI}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Paste any hackathon link. AI will scrape, extract data, and auto-publish it!
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" 
            disabled={isScrapingAI}
          >
            {isScrapingAI ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI Processing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Scrape & Publish with AI
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
