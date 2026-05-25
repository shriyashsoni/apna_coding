import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Search, CheckCircle, XCircle, Award, Calendar, ExternalLink, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { getCurrentFlowConfig } from "@/lib/flowConfig";
import { supabase } from "@/lib/supabase";

export default function VerifyCertificate() {
  const { certificateNumber: urlCertNumber } = useParams();
  const [searchNumber, setSearchNumber] = useState(urlCertNumber || "");
  const [searchQuery, setSearchQuery] = useState(urlCertNumber || "");
  const [verification, setVerification] = useState<any>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery) {
      verifyCertificate(searchQuery);
    }
  }, [searchQuery]);

  const verifyCertificate = async (certNumber: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_number', certNumber)
        .single();
      
      if (error) {
        setVerification({ valid: false, message: "Certificate not found" });
      } else if (data) {
        // Map snake_case to camelCase for the UI if needed
        const certificate = {
          certificateNumber: data.certificate_number,
          participantName: data.participant_name,
          eventName: data.event_name,
          eventDate: data.event_date,
          certificateType: data.certificate_type,
          issuedAt: data.issued_at,
          achievement: data.achievement,
          nftMinted: data.nft_minted,
          flowTxHash: data.flow_tx_hash
        };
        setVerification({ valid: true, certificate });
      } else {
        setVerification({ valid: false, message: "Certificate not found" });
      }
    } catch (err) {
      setVerification({ valid: false, message: "Error verifying certificate" });
    } finally {
      setLoading(false);
    }
  };

  const flowConfig = getCurrentFlowConfig();

  const handleSearch = () => {
    setSearchQuery(searchNumber);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-32 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">Verify Certificate</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enter a certificate number to verify its authenticity on the Apna Coding platform.
              All certificates are secured with blockchain verification.
            </p>
          </div>

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Certificate Lookup</CardTitle>
              <CardDescription>
                Enter the certificate number (format: AC-TYPE-TIMESTAMP-XXXX)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., AC-PARTICIPATION-1234567890-1234"
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="font-mono"
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Verify
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {searchQuery && verification !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {verification && verification.valid && verification.certificate ? (
                <Card className="border-2 border-green-500">
                  <CardHeader className="bg-green-50 dark:bg-green-950">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <CardTitle className="text-green-900 dark:text-green-100">
                          Certificate Verified ✓
                        </CardTitle>
                        <CardDescription className="text-green-700 dark:text-green-300">
                          This certificate is authentic and verified
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {/* Certificate Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">
                          Certificate Number
                        </h3>
                        <p className="font-mono text-sm font-bold">
                          {verification.certificate.certificateNumber}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">
                          Recipient
                        </h3>
                        <p className="font-semibold">
                          {verification.certificate.participantName}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">
                          Event / Program
                        </h3>
                        <p className="font-semibold">
                          {verification.certificate.eventName}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">
                          Date
                        </h3>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{verification.certificate.eventDate}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">
                          Certificate Type
                        </h3>
                        <Badge variant="default">
                          {verification.certificate.certificateType}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">
                          Issued Date
                        </h3>
                        <p>
                          {new Date(verification.certificate.issuedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Achievement */}
                    {verification.certificate.achievement && (
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">
                          Achievement
                        </h3>
                        <Badge variant="secondary" className="text-base px-4 py-2">
                          <Award className="w-4 h-4 mr-2" />
                          {verification.certificate.achievement}
                        </Badge>
                      </div>
                    )}

                    {/* Blockchain Verification */}
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        {verification.certificate.nftMinted ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-semibold">
                              Minted as NFT on Flow Blockchain
                            </span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 text-orange-600" />
                            <span className="font-semibold">
                              Ready to mint as NFT
                            </span>
                          </>
                        )}
                      </div>

                      {verification.certificate.flowTxHash && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `${flowConfig.explorer}/tx/${verification.certificate.flowTxHash}`,
                                "_blank"
                              )
                            }
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Transaction on Flow
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Issuer */}
                    <div className="border-t pt-4">
                      <p className="text-sm text-center text-muted-foreground">
                        Issued by <span className="font-semibold">Apna Coding</span> Platform
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-red-500">
                  <CardHeader className="bg-red-50 dark:bg-red-950">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-8 h-8 text-red-600" />
                      <div>
                        <CardTitle className="text-red-900 dark:text-red-100">
                          Certificate Not Found
                        </CardTitle>
                        <CardDescription className="text-red-700 dark:text-red-300">
                          {verification?.message || "No certificate exists with this number"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Alert>
                      <AlertDescription>
                        Please check the certificate number and try again. If you believe this is an
                        error, contact support@apnacoding.com
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>About Certificate Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Secure & Tamper-Proof</h4>
                    <p className="text-sm text-muted-foreground">
                      All certificates are cryptographically verified and cannot be forged
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Flow Blockchain NFTs</h4>
                    <p className="text-sm text-muted-foreground">
                      Certificates can be minted as NFTs for permanent on-chain ownership
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Instant Verification</h4>
                    <p className="text-sm text-muted-foreground">
                      Anyone can verify certificate authenticity in seconds
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Award className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Lifetime Access</h4>
                    <p className="text-sm text-muted-foreground">
                      Certificates remain accessible forever, even as NFTs in your wallet
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
