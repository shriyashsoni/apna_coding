import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Users, Award, Trophy, Copy, Share2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ReferralStats {
  referralCode?: string;
  referralLink?: string | null;
  totalReferrals: number;
  totalPoints: number;
  tier: string;
  benefits: string[];
  nextMilestone?: {
    count: number;
    reward: string;
    remaining: number;
  };
  referredUsers?: Array<{
    name: string;
    walletAddress: string;
    timestamp: number;
    pointsAwarded: number;
    status: string;
  }>;
  premiumContentUnlocked?: boolean;
  freeCourseUnlocked?: boolean;
  internshipAccessUnlocked?: boolean;
}

interface ReferralCardProps {
  stats: ReferralStats | null | undefined;
  hasAppliedCode: boolean;
  appliedCode?: string;
  onApplyCode: (code: string) => Promise<void>;
}

export function ReferralCard({ stats, hasAppliedCode, appliedCode, onApplyCode }: ReferralCardProps) {
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "gold": return "text-yellow-400"; // 10+ referrals
      case "silver": return "text-gray-400"; // 5+ referrals
      case "bronze": return "text-orange-400"; // 1+ referrals
      default: return "text-muted-foreground";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "gold": return "🥇"; // Internship access
      case "silver": return "🥈"; // Free course
      case "bronze": return "🥉"; // Premium content
      default: return "🎯";
    }
  };

  const getTierGradient = (tier: string) => {
    switch (tier) {
      case "gold": return "from-yellow-500/20 via-orange-500/20 to-yellow-500/20";
      case "silver": return "from-gray-400/20 via-gray-300/20 to-gray-400/20";
      case "bronze": return "from-orange-500/20 via-amber-500/20 to-orange-500/20";
      default: return "from-primary/10 via-primary/5 to-primary/10";
    }
  };

  const getNextTierInfo = (tier: string) => {
    switch (tier) {
      case "gold": return { name: "MAX TIER", refs: "∞", color: "text-yellow-400" };
      case "silver": return { name: "Gold", refs: "10", color: "text-yellow-400" };
      case "bronze": return { name: "Silver", refs: "5", color: "text-gray-400" };
      default: return { name: "Bronze", refs: "1", color: "text-orange-400" };
    }
  };

  const copyReferralLink = () => {
    if (stats?.referralCode) {
      const link = `${window.location.origin}/?ref=${stats.referralCode}`;
      navigator.clipboard.writeText(link);
      toast.success("Referral link copied to clipboard!");
    }
  };

  const shareReferralLink = async () => {
    if (stats?.referralCode) {
      const link = `${window.location.origin}/?ref=${stats.referralCode}`;
      const text = `Join me on Apna Coding and earn 50 bonus points! Use my referral code: ${stats.referralCode}`;
      
      if (navigator.share) {
        try {
          await navigator.share({ title: "Join Apna Coding", text, url: link });
          toast.success("Shared successfully!");
        } catch (err) {
          copyReferralLink();
        }
      } else {
        copyReferralLink();
      }
    }
  };

  const handleApplyReferralCode = async () => {
    if (!referralCodeInput.trim()) return;
    
    setIsApplying(true);
    try {
      await onApplyCode(referralCodeInput.trim().toUpperCase());
      setShowReferralInput(false);
      setReferralCodeInput("");
    } catch (error: any) {
      toast.error(error.message || "Failed to apply referral code");
    } finally {
      setIsApplying(false);
    }
  };

  const nextTier = getNextTierInfo(stats?.tier || "bronze");
  const currentTier = stats?.tier || "bronze";

  return (
    <Card className={`border-primary/20 bg-gradient-to-br ${getTierGradient(currentTier)} backdrop-blur-sm`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Referral Program
            <motion.span 
              className={`text-3xl ${getTierColor(currentTier)}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {getTierIcon(currentTier)}
            </motion.span>
          </span>
          <span className={`text-sm font-bold ${getTierColor(currentTier)} uppercase tracking-wider`}>
            {currentTier} TIER
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-primary/30 hover:border-primary/50 transition-all"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Referrals</span>
            </div>
            <p className="text-3xl font-bold text-primary">{stats?.totalReferrals || 0}</p>
          </motion.div>
          
          <motion.div 
            className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-secondary/30 hover:border-secondary/50 transition-all"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-secondary" />
              <span className="text-sm text-muted-foreground">Total Points</span>
            </div>
            <p className="text-3xl font-bold text-secondary">{stats?.totalPoints || 0}</p>
          </motion.div>
          
          <motion.div 
            className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-accent/30 hover:border-accent/50 transition-all"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-sm text-muted-foreground">Next Tier</span>
            </div>
            <p className={`text-xl font-bold ${nextTier.color}`}>
              {nextTier.name === "MAX TIER" ? "MAX" : `${nextTier.refs} refs`}
            </p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        {currentTier !== "gold" && nextTier.refs !== "∞" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to {nextTier.name}</span>
              <span className={`font-bold ${nextTier.color}`}>
                {stats?.totalReferrals || 0} / {nextTier.refs}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${getTierGradient(nextTier.name.toLowerCase())}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((stats?.totalReferrals || 0) / parseInt(nextTier.refs)) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Referral Code Section */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Your Referral Code</label>
            <div className="flex gap-2">
              <Input
                value={stats?.referralCode || "Generating..."}
                readOnly
                className="bg-background/60 backdrop-blur-sm border-primary/30 font-mono text-lg font-bold text-center"
                placeholder="REF-XXXXXX"
              />
              <Button
                onClick={copyReferralLink}
                variant="outline"
                className="border-primary/30 hover:bg-primary/10"
                disabled={!stats?.referralCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                onClick={shareReferralLink}
                variant="outline"
                className="border-secondary/30 hover:bg-secondary/10"
                disabled={!stats?.referralCode}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            {!stats?.referralCode && (
              <p className="text-xs text-muted-foreground mt-1">
                Your referral code is being generated. Please refresh if it takes too long.
              </p>
            )}
          </div>

          {/* Apply Referral Code */}
          {!hasAppliedCode && (
            <div>
              {!showReferralInput ? (
                <Button 
                  onClick={() => setShowReferralInput(true)} 
                  variant="outline" 
                  className="w-full border-secondary/30 hover:bg-secondary/10"
                >
                  Have a referral code? Apply it here
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter referral code"
                    className="bg-background/60 backdrop-blur-sm border-secondary/30"
                    maxLength={10}
                  />
                  <Button 
                    onClick={handleApplyReferralCode} 
                    className="bg-secondary hover:bg-secondary/90"
                    disabled={isApplying || !referralCodeInput.trim()}
                  >
                    {isApplying ? "..." : "Apply"}
                  </Button>
                  <Button onClick={() => setShowReferralInput(false)} variant="ghost">
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}

          {hasAppliedCode && appliedCode && (
            <div className="bg-green-500/10 border border-green-500/30 p-3 rounded backdrop-blur-sm">
              <p className="text-sm text-green-400 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                You joined using referral code: <span className="font-mono font-bold">{appliedCode}</span>
              </p>
            </div>
          )}
        </div>

        {/* Benefits */}
        {stats?.benefits && stats.benefits.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Your Benefits:
            </h4>
            <div className="flex flex-wrap gap-2">
              {stats.benefits.map((benefit, idx) => (
                <motion.span 
                  key={idx} 
                  className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/30 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  ✓ {benefit}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Reward Milestones */}
        <div className="pt-4 border-t border-primary/10">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-secondary" />
            Reward Milestones:
          </h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">🥉</span>
              <span><span className="font-bold text-orange-400">1 referral</span> → Unlock premium content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">🥈</span>
              <span><span className="font-bold text-gray-400">5 referrals</span> → Free course access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-0.5">🥇</span>
              <span><span className="font-bold text-yellow-400">10 referrals</span> → Internship access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">💰</span>
              <span>Earn <span className="font-bold">100 points</span> per referral · Friends get <span className="font-bold">50 points</span></span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
