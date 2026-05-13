import { motion } from "framer-motion";
import { Award, Download, Share2, CheckCircle, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getCurrentFlowConfig } from "@/lib/flowConfig";

interface Certificate {
  _id: string;
  certificateNumber: string;
  participantName: string;
  hackathonTitle?: string; // Legacy field
  hackathonDate?: string; // Legacy field
  eventName: string;
  eventDate: string;
  eventType: string;
  certificateType: string;
  achievementLevel: string;
  achievement?: string;
  projectName?: string;
  teamName?: string;
  skills?: string[];
  issuedAt: number;
  verified: boolean;
  nftMinted: boolean;
  claimStatus: string;
  flowNftId?: number;
  flowTxHash?: string;
  flowWalletAddress?: string;
  blockchainTxHash?: string; // Legacy field
}

interface CertificateViewerProps {
  certificate: Certificate;
}

export function CertificateViewer({ certificate }: CertificateViewerProps) {
  const flowConfig = getCurrentFlowConfig();

  const handleDownload = () => {
    // Generate certificate image and download
    toast.success("Certificate download started");
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/verify/${certificate.certificateNumber}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Certificate link copied to clipboard");
  };

  const handleViewOnFlow = () => {
    if (certificate.flowTxHash) {
      window.open(`${flowConfig.explorer}/tx/${certificate.flowTxHash}`, "_blank");
    }
  };

  const getCertificateTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      participation: "Certificate of Participation",
      winner: "Winner Certificate",
      "runner-up": "Runner-Up Certificate",
      "special-mention": "Special Mention Certificate",
    };
    return labels[type] || "Certificate";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="overflow-hidden border-2 border-primary/20">
        {/* Certificate Design */}
        <div className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8 md:p-12">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-primary/30" />
          <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-primary/30" />
          <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-primary/30" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-primary/30" />

          {/* Certificate Content */}
          <div className="text-center space-y-6 relative z-10">
            {/* Logo/Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="w-12 h-12 text-primary" />
              </div>
            </div>

            {/* Certificate Type */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {getCertificateTypeLabel(certificate.certificateType)}
              </h2>
              <p className="text-sm text-muted-foreground">
                Apna Coding Platform
              </p>
            </div>

            {/* Recipient */}
            <div className="py-6">
              <p className="text-sm text-muted-foreground mb-2">This is to certify that</p>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {certificate.participantName}
              </h3>
              <p className="text-muted-foreground">
                has successfully participated in
              </p>
            </div>

            {/* Event Details */}
            <div className="py-4 border-t border-b border-primary/20">
              <Badge className="mb-2">{certificate.eventType.toUpperCase()}</Badge>
              <h4 className="text-xl md:text-2xl font-bold mb-2">
                {certificate.eventName || certificate.hackathonTitle}
              </h4>
              <p className="text-sm text-muted-foreground">
                {certificate.eventDate || certificate.hackathonDate}
              </p>
            </div>

            {/* Skills */}
            {certificate.skills && certificate.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {certificate.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            {/* Achievement */}
            {certificate.achievement && (
              <div className="py-4">
                <Badge variant="default" className="text-lg px-4 py-2">
                  {certificate.achievement}
                </Badge>
              </div>
            )}

            {/* Project/Team Info */}
            {(certificate.projectName || certificate.teamName) && (
              <div className="text-sm text-muted-foreground space-y-1">
                {certificate.projectName && (
                  <p>Project: <span className="font-semibold">{certificate.projectName}</span></p>
                )}
                {certificate.teamName && (
                  <p>Team: <span className="font-semibold">{certificate.teamName}</span></p>
                )}
              </div>
            )}

            {/* Certificate Number & Verification */}
            <div className="pt-6 space-y-2">
              <p className="text-xs text-muted-foreground">
                Certificate No: <span className="font-mono font-semibold">{certificate.certificateNumber}</span>
              </p>
              {certificate.nftMinted && (
                <div className="flex items-center justify-center gap-2 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">Minted as NFT on Flow Blockchain</span>
                </div>
              )}
              {certificate.flowNftId && (
                <p className="text-xs text-muted-foreground">
                  Flow NFT ID: <span className="font-mono">{certificate.flowNftId}</span>
                </p>
              )}
              {!certificate.nftMinted && (
                <div className="flex items-center justify-center gap-2 text-orange-500">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs">Ready to mint as NFT</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-card border-t flex flex-wrap gap-3 justify-center">
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button onClick={handleShare} variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          {certificate.flowTxHash && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleViewOnFlow}
            >
              <ExternalLink className="w-4 h-4" />
              View on Flow
            </Button>
          )}
          {!certificate.nftMinted && (
            <Button variant="default" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Mint as NFT
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
