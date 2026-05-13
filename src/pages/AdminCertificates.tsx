import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Award, Users, CheckCircle, Clock, Sparkles, ExternalLink, Search, Filter, Download } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import * as fcl from "@onflow/fcl";
import { FLOW_CONFIG } from "@/lib/flowConfig";

// Configure FCL for Flow blockchain
fcl.config()
  .put("accessNode.api", FLOW_CONFIG.testnet.accessNode)
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn");

export default function AdminCertificates() {
  const { user: authUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const address = authUser?.wallet_address;
  const isConnected = isAuthenticated;
  const isAdmin = authUser?.role === "admin";

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [pendingCertificates, setPendingCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address && isAdmin) {
      fetchData();
    }
  }, [isConnected, address, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("name", { ascending: true });
      
      if (usersError) throw usersError;
      setAllUsers(usersData || []);

      // Fetch pending certificates (not yet minted)
      const { data: certsData, error: certsError } = await supabase
        .from("certificates")
        .select("*")
        .is("flow_nft_id", null)
        .order("created_at", { ascending: false });
      
      if (certsError) throw certsError;
      setPendingCertificates(certsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isMintingNft, setIsMintingNft] = useState(false);

  const [bulkFormData, setBulkFormData] = useState({
    eventId: "",
    eventType: "hackathon",
    eventName: "",
    eventDate: "",
    certificateType: "participation",
    achievementLevel: "participant",
  });

  const [singleFormData, setSingleFormData] = useState({
    userId: "",
    eventId: "",
    eventType: "hackathon",
    eventName: "",
    eventDate: "",
    certificateType: "participation",
    achievementLevel: "participant",
    achievement: "",
    projectName: "",
    teamName: "",
  });

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return allUsers;

    const query = searchQuery.toLowerCase();
    return allUsers.filter(user =>
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.wallet_address?.toLowerCase().includes(query)
    );
  }, [allUsers, searchQuery]);

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Select all users
  const selectAllUsers = () => {
    setSelectedUsers(filteredUsers.map(u => u.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedUsers([]);
  };

  // Helper to generate certificate number
  const generateCertNumber = () => {
    return `AC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  };

  // Handle bulk certificate generation
  const handleBulkGenerate = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    if (!bulkFormData.eventName || !bulkFormData.eventDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const certificatesToInsert = selectedUsers.map(userId => {
        const user = allUsers.find(u => u.id === userId);
        return {
          user_id: userId,
          event_id: bulkFormData.eventId || bulkFormData.eventName.toLowerCase().replace(/\s+/g, "-"),
          event_type: bulkFormData.eventType,
          event_name: bulkFormData.eventName,
          event_date: bulkFormData.eventDate,
          certificate_type: bulkFormData.certificateType,
          achievement_level: bulkFormData.achievementLevel,
          certificate_number: generateCertNumber(),
          participant_name: user?.name || "Anonymous",
          participant_wallet: user?.wallet_address || null
        };
      });

      const { data, error } = await supabase
        .from("certificates")
        .insert(certificatesToInsert)
        .select();

      if (error) throw error;

      toast.success(`✅ Generated ${data.length} certificates!`);
      setIsBulkDialogOpen(false);
      clearSelection();
      fetchData(); // Refresh list
    } catch (error: any) {
      toast.error(`Failed to generate certificates: ${error.message}`);
    }
  };

  // Handle single certificate generation
  const handleSingleGenerate = async () => {
    if (!singleFormData.userId || !singleFormData.eventName || !singleFormData.eventDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const user = allUsers.find(u => u.id === singleFormData.userId);
      const { data, error } = await supabase
        .from("certificates")
        .insert({
          user_id: singleFormData.userId,
          event_id: singleFormData.eventId || singleFormData.eventName.toLowerCase().replace(/\s+/g, "-"),
          event_type: singleFormData.eventType,
          event_name: singleFormData.eventName,
          event_date: singleFormData.eventDate,
          certificate_type: singleFormData.certificateType,
          achievement_level: singleFormData.achievementLevel,
          achievement: singleFormData.achievement || null,
          project_name: singleFormData.projectName || null,
          team_name: singleFormData.teamName || null,
          certificate_number: generateCertNumber(),
          participant_name: user?.name || "Anonymous",
          participant_wallet: user?.wallet_address || null
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`✅ Certificate generated! Number: ${data.certificate_number}`);
      setIsDialogOpen(false);
      fetchData(); // Refresh list
    } catch (error: any) {
      toast.error(`Failed to generate certificate: ${error.message}`);
    }
  };

  // Mint NFT on Flow blockchain
  const handleMintNft = async (certificate: any) => {
    if (!certificate.participant_wallet) {
      toast.error("User doesn't have a wallet address");
      return;
    }

    setIsMintingNft(true);
    toast.info("🔄 Minting NFT on Flow blockchain...");

    try {
      // Connect to Flow wallet
      await fcl.authenticate();
      const user = await fcl.currentUser().snapshot();

      if (!user.addr) {
        toast.error("Please connect your Flow wallet");
        setIsMintingNft(false);
        return;
      }

      // Mint NFT transaction
      const transactionId = await fcl.mutate({
        cadence: `
          import ApnaCodingCertificate from ${FLOW_CONFIG.testnet.contractAddress}

          transaction(
            recipient: Address,
            certificateNumber: String,
            eventName: String,
            participantName: String,
            achievementLevel: String
          ) {
            prepare(signer: AuthAccount) {
              // Get reference to the admin resource
              let adminRef = signer.borrow<&ApnaCodingCertificate.Admin>(from: ApnaCodingCertificate.AdminStoragePath)
                ?? panic("Could not borrow admin reference")

              // Mint the NFT
              adminRef.mintNFT(
                recipient: recipient,
                certificateNumber: certificateNumber,
                eventName: eventName,
                participantName: participantName,
                achievementLevel: achievementLevel
              )
            }
          }
        `,
        args: (arg: any, t: any) => [
          arg(certificate.participant_wallet, t.Address),
          arg(certificate.certificate_number, t.String),
          arg(certificate.event_name, t.String),
          arg(certificate.participant_name, t.String),
          arg(certificate.achievement_level, t.String),
        ],
        limit: 9999,
      });

      // Wait for transaction to be sealed
      const txResult = await fcl.tx(transactionId).onceSealed();

      // Extract NFT ID from events
      const mintEvent = txResult.events.find((e: any) => e.type.includes("Minted"));
      const nftId = mintEvent?.data?.id || Date.now().toString();

      // Update certificate with NFT info
      const { error } = await supabase
        .from("certificates")
        .update({
          flow_nft_id: nftId,
          flow_tx_hash: transactionId,
          flow_contract_address: FLOW_CONFIG.testnet.contractAddress,
          flow_wallet_address: certificate.participant_wallet,
          status: 'issued'
        })
        .eq("id", certificate.id);

      if (error) throw error;

      toast.success("✅ NFT minted successfully on Flow blockchain!");
      fetchData(); // Refresh list
    } catch (error: any) {
      console.error("NFT minting error:", error);
      toast.error(`Failed to mint NFT: ${error.message}`);
    } finally {
      setIsMintingNft(false);
    }
  };

  if (!isConnected || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>{!isConnected ? "Connect Wallet" : "Access Denied"}</CardTitle>
              <CardDescription>
                {!isConnected 
                  ? "Please connect your wallet to access admin features"
                  : "You need admin privileges to access this page"}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              Certificate Management
            </h1>
            <p className="text-muted-foreground">
              Generate and manage NFT certificates on Flow blockchain
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allUsers.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Certificates</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCertificates?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Selected Users</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedUsers.length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="bulk" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="bulk">Bulk Generate</TabsTrigger>
              <TabsTrigger value="pending">Pending NFTs</TabsTrigger>
            </TabsList>

            {/* Bulk Generate Tab */}
            <TabsContent value="bulk" className="space-y-6">
              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={selectedUsers.length === 0}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate for {selectedUsers.length} Selected
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Bulk Generate Certificates</DialogTitle>
                      <DialogDescription>
                        Generate certificates for {selectedUsers.length} selected users
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Event Name *</Label>
                        <Input
                          value={bulkFormData.eventName}
                          onChange={(e) => setBulkFormData({ ...bulkFormData, eventName: e.target.value })}
                          placeholder="Web3 Hackathon 2024"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Event Date *</Label>
                        <Input
                          type="date"
                          value={bulkFormData.eventDate}
                          onChange={(e) => setBulkFormData({ ...bulkFormData, eventDate: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Event Type</Label>
                          <Select value={bulkFormData.eventType} onValueChange={(value) => setBulkFormData({ ...bulkFormData, eventType: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hackathon">Hackathon</SelectItem>
                              <SelectItem value="event">Event</SelectItem>
                              <SelectItem value="course">Course</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Certificate Type</Label>
                          <Select value={bulkFormData.certificateType} onValueChange={(value) => setBulkFormData({ ...bulkFormData, certificateType: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="participation">Participation</SelectItem>
                              <SelectItem value="winner">Winner</SelectItem>
                              <SelectItem value="completion">Completion</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" className="flex-1" onClick={() => setIsBulkDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button className="flex-1" onClick={handleBulkGenerate}>
                          Generate Certificates
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={selectAllUsers}>
                  Select All ({filteredUsers.length})
                </Button>

                <Button variant="outline" onClick={clearSelection} disabled={selectedUsers.length === 0}>
                  Clear Selection
                </Button>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Award className="mr-2 h-4 w-4" />
                      Generate Single Certificate
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Generate Single Certificate</DialogTitle>
                      <DialogDescription>Create a certificate for a specific user</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select User *</Label>
                        <Select value={singleFormData.userId} onValueChange={(value) => setSingleFormData({ ...singleFormData, userId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a user" />
                          </SelectTrigger>
                          <SelectContent>
                            {allUsers.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name || user.wallet_address || "Anonymous"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Event Name *</Label>
                        <Input
                          value={singleFormData.eventName}
                          onChange={(e) => setSingleFormData({ ...singleFormData, eventName: e.target.value })}
                          placeholder="Web3 Hackathon 2024"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Event Date *</Label>
                        <Input
                          type="date"
                          value={singleFormData.eventDate}
                          onChange={(e) => setSingleFormData({ ...singleFormData, eventDate: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Event Type</Label>
                          <Select value={singleFormData.eventType} onValueChange={(value) => setSingleFormData({ ...singleFormData, eventType: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hackathon">Hackathon</SelectItem>
                              <SelectItem value="event">Event</SelectItem>
                              <SelectItem value="course">Course</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Certificate Type</Label>
                          <Select value={singleFormData.certificateType} onValueChange={(value) => setSingleFormData({ ...singleFormData, certificateType: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="participation">Participation</SelectItem>
                              <SelectItem value="winner">Winner</SelectItem>
                              <SelectItem value="completion">Completion</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button className="flex-1" onClick={handleSingleGenerate}>
                          Generate Certificate
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search users by name, email, or wallet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Users List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <Card
                    key={user.id}
                    className={`cursor-pointer transition-all ${
                      selectedUsers.includes(user.id) ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => toggleUserSelection(user.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{user.name || "Anonymous"}</CardTitle>
                          <CardDescription className="text-xs truncate">
                            {user.email || user.wallet_address}
                          </CardDescription>
                        </div>
                        {selectedUsers.includes(user.id) && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Badge variant="outline">{user.role || "user"}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Pending NFTs Tab */}
            <TabsContent value="pending" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending NFT Minting</CardTitle>
                  <CardDescription>
                    Certificates that need to be minted as NFTs on Flow blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingCertificates && pendingCertificates.length > 0 ? (
                      pendingCertificates.map((cert) => (
                        <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{cert.participant_name}</div>
                            <div className="text-sm text-muted-foreground">{cert.event_name}</div>
                            <div className="text-xs text-muted-foreground">
                              Certificate: {cert.certificate_number}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge>{cert.certificate_type}</Badge>
                            <Button
                              size="sm"
                              onClick={() => handleMintNft(cert)}
                              disabled={isMintingNft}
                            >
                              {isMintingNft ? "Minting..." : "Mint NFT"}
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No pending certificates
                      </div>
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
