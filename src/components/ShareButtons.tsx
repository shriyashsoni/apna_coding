import { Button } from "@/components/ui/button";
import { Share2, Twitter, Facebook, Linkedin, Link2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { usePrivy } from "@privy-io/react-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  date?: string | number;
  location?: string;
  type?: 'event' | 'hackathon' | 'job' | 'general';
}

export function ShareButtons({ 
  url, 
  title, 
  description, 
  hashtags = [], 
  date, 
  location, 
  type = 'general' 
}: ShareButtonsProps) {
  const { user: privyUser } = usePrivy();
  const address = privyUser?.wallet?.address;
  const [isOpen, setIsOpen] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferralCode = async () => {
      if (!address) return;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('referral_code')
          .eq('wallet_address', address)
          .single();
        
        if (data) setReferralCode(data.referral_code);
      } catch (err) {
        console.error("Error fetching referral code:", err);
      }
    };
    fetchReferralCode();
  }, [address]);

  // Build base URL
  let baseUrl = url.startsWith('http') ? url : `https://apnacoding.com${url}`;

  // Add referral code if user has one
  if (referralCode) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    baseUrl = `${baseUrl}${separator}ref=${referralCode}`;
  }

  const shareUrl = baseUrl;
  const hashtagString = hashtags.join(',');

  // Helper to format date if present
  const getDateString = () => {
    if (!date) return '';
    try {
      const d = new Date(Number(date));
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return String(date);
    } catch {
      return String(date);
    }
  };

  const formattedDate = getDateString();
  const cleanDesc = description ? description.replace(/<[^>]*>/g, '').slice(0, 160).trim() + "..." : "";

  // 1. WhatsApp Custom Text
  const getWhatsAppText = () => {
    const typeLabel = type === 'hackathon' ? '🏆 *Web3 Hackathon*' : type === 'event' ? '📅 *Web3 Event*' : type === 'job' ? '💼 *Web3 Job*' : '🚀 *Opportunity*';
    return `*🔥 Premium Opportunity Alert from Apna Coding!* 🚀\n\n${typeLabel}:\n👉 *${title}*\n\n${cleanDesc ? `📝 *About:* ${cleanDesc}\n` : ''}${formattedDate ? `📅 *When:* ${formattedDate}\n` : ''}${location ? `📍 *Where:* ${location}\n` : ''}\n✨ Learn more & Apply here:\n👉 ${shareUrl}\n\n---\n🔔 *Follow Apna Coding for the latest Web3 and Tech Opportunities!*`;
  };

  // 2. Twitter/X Custom Text
  const getTwitterText = () => {
    const typeLabel = type === 'hackathon' ? '🚀 New Web3 Hackathon:' : type === 'event' ? '📅 New Web3 Event:' : type === 'job' ? '💼 New Web3 Job Opportunity:' : '🚀 Opportunity:';
    let text = `${typeLabel}\n✨ "${title}"\n`;
    if (formattedDate) text += `📅 ${formattedDate}\n`;
    if (location) text += `📍 ${location}\n`;
    text += `👉 Apply now via @apna_coding:`;
    return text;
  };

  // 3. LinkedIn Custom Text
  const getLinkedInText = () => {
    const typeLabel = type === 'hackathon' ? '🚀 Exciting Web3 Hackathon Alert!' : type === 'event' ? '📅 Exciting Web3 Event Alert!' : type === 'job' ? '💼 Premium Career Opportunity Alert!' : '🚀 Premium Opportunity Alert!';
    return `${typeLabel}\n\nI'm excited to share this incredible listing found on Apna Coding:\n👉 ${title}\n\n${cleanDesc ? `📝 Details: ${cleanDesc}\n` : ''}${formattedDate ? `📅 Date: ${formattedDate}\n` : ''}${location ? `📍 Location/Venue: ${location}\n` : ''}\n✨ Check out the full opportunity details and apply/register here:\n👉 ${shareUrl}\n\n---\n💡 Follow Apna Coding for curated daily opportunities, hackathons, and developer events!\n\n#web3 #blockchain #tech #careers #jobs #hackathons #apnacoding`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getTwitterText())}&url=${encodeURIComponent(shareUrl)}${hashtagString ? `&hashtags=${encodeURIComponent(hashtagString)}` : ''}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const handleLinkedInShare = () => {
    // LinkedIn share offsite parses the URL meta tags. To let the user post the customize message copy, we copy the LinkedIn post template to clipboard as a helpful helper, and open the LinkedIn Share screen!
    try {
      navigator.clipboard.writeText(getLinkedInText());
      toast.success("📝 Professional LinkedIn post template copied to clipboard! You can paste it directly when sharing.");
    } catch {}
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(getWhatsAppText())}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: title,
          text: cleanDesc || title,
          url: shareUrl,
        });
        setIsOpen(false);
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to copy link if native share not available
      handleCopyLink();
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <DropdownMenuItem onClick={handleNativeShare} className="gap-2 cursor-pointer">
            <Share2 className="h-4 w-4" />
            Share...
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleTwitterShare} className="gap-2 cursor-pointer">
          <Twitter className="h-4 w-4" />
          Share on Twitter
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleFacebookShare} className="gap-2 cursor-pointer">
          <Facebook className="h-4 w-4" />
          Share on Facebook
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleLinkedInShare} className="gap-2 cursor-pointer">
          <Linkedin className="h-4 w-4" />
          Share on LinkedIn
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleWhatsAppShare} className="gap-2 cursor-pointer">
          <MessageCircle className="h-4 w-4" />
          Share on WhatsApp
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
          <Link2 className="h-4 w-4" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
