import { supabase } from "@/lib/supabase";
import { usePrivy } from "@privy-io/react-auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CertificateViewer } from "@/components/CertificateViewer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Certificates() {
  const { user: privyUser, authenticated, ready } = usePrivy();
  const address = privyUser?.wallet?.address;
  const [activeUser, setActiveUser] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[] | undefined>(undefined);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserAndCertificates = async () => {
    if (!address) return;
    setLoading(true);
    try {
      // Fetch user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address)
        .single();
      
      if (userData) {
        setActiveUser(userData);
        
        // Fetch certificates
        const { data: certData, error: certError } = await supabase
          .from('certificates')
          .select('*')
          .eq('user_id', userData.id);
        
        if (certError) throw certError;
        setCertificates(certData || []);
      } else {
        setCertificates([]);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready && authenticated && address) {
      fetchUserAndCertificates();
    } else if (ready) {
      setLoading(false);
    }
  }, [authenticated, address, ready]);

  if (ready && !authenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to view your certificates
            </p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Award className="w-10 h-10 text-primary" />
            My Certificates
          </h1>
          <p className="text-muted-foreground">
            View and download your hackathon certificates
          </p>
        </motion.div>

        {selectedCertificate ? (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedCertificate(null)}
              className="text-primary hover:underline"
            >
              ← Back to all certificates
            </button>
            <CertificateViewer certificate={selectedCertificate} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-pulse text-muted-foreground">Loading certificates...</div>
              </div>
            ) : !certificates || certificates.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
                <p className="text-muted-foreground">
                  Participate in hackathons to earn certificates
                </p>
              </div>
            ) : (
              certificates.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="p-6 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedCertificate(cert)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {cert.certificate_type === "winner" ? (
                          <Trophy className="w-6 h-6 text-primary" />
                        ) : (
                          <Award className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      {cert.verified && (
                        <Badge variant="default" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-bold mb-2 line-clamp-2">
                      {cert.event_name || cert.hackathon_title}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-3">
                      {cert.certificate_type?.charAt(0).toUpperCase() + cert.certificate_type?.slice(1)}
                    </p>

                    {cert.achievement && (
                      <Badge variant="outline" className="mb-3">
                        {cert.achievement}
                      </Badge>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {cert.event_date || cert.hackathon_date}
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
