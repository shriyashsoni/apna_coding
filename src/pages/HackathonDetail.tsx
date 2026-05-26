import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useSupabaseMutation } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Trophy, Users, MessageSquare, Lightbulb, ExternalLink, Clock, MapPin, Plus, Upload, X } from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { useAuth } from "@/hooks/use-auth";
import { SEO } from "@/components/SEO";
import { ShareButtons } from "@/components/ShareButtons";
import { useEffect } from "react";

export default function HackathonDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading, signIn } = useAuth();
  const address = user?.wallet_address;
  const [hackathon, setHackathon] = useState<any>(undefined);
  const [teams, setTeams] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      
      let query = supabase.from('hackathons').select('*');
      
      if (slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        query = query.eq('id', slug);
      } else {
        query = query.eq('slug', slug);
      }

      const { data: h, error: he } = await query.single();
      
      if (h) {
        setHackathon(h);
        const { data: t } = await supabase.from('hackathon_teams').select('*').eq('hackathon_id', h.id);
        setTeams(t || []);
        const { data: a } = await supabase.from('hackathon_announcements').select('*').eq('hackathon_id', h.id);
        setAnnouncements(a || []);
        const { data: q } = await supabase.from('hackathon_questions').select('*').eq('hackathon_id', h.id);
        setQuestions(q || []);
      } else {
        setHackathon(null);
      }
    }
    fetchData();
  }, [slug]);

  const { mutate: createTeamMutate } = useSupabaseMutation('hackathon_teams');
  const { mutate: askQuestionMutate } = useSupabaseMutation('hackathon_questions');
  const { mutate: updateHackathonMutate } = useSupabaseMutation('hackathons');
  
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isSponsorDialogOpen, setIsSponsorDialogOpen] = useState(false);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [isMentorDialogOpen, setIsMentorDialogOpen] = useState(false);
  const [isJudgeDialogOpen, setIsJudgeDialogOpen] = useState(false);
  
  const [teamForm, setTeamForm] = useState({
    name: "",
    description: "",
    lookingForMembers: true,
    requiredSkills: "",
    projectIdea: "",
  });
  const [questionText, setQuestionText] = useState("");
  
  // Management forms
  const [sponsorForm, setSponsorsForm] = useState<Array<{name: string, logo: string, tier?: string, website?: string}>>([]);
  const [partnerForm, setPartnerForm] = useState<Array<{name: string, logo: string, website?: string}>>([]);
  const [mediaForm, setMediaForm] = useState<Array<{name: string, logo: string, website?: string}>>([]);
  const [mentorForm, setMentorForm] = useState<Array<{name: string, image: string, role: string, company?: string, bio?: string}>>([]);
  const [judgeForm, setJudgeForm] = useState<Array<{name: string, image: string, title: string, company?: string, bio?: string}>>([]);
  const [sponsorTier, setSponsorTier] = useState<"title" | "gold" | "silver">("gold");
  
  // Dialog state for adding entities
  const [showAddTitleSponsor, setShowAddTitleSponsor] = useState(false);
  const [showAddGoldSponsor, setShowAddGoldSponsor] = useState(false);
  const [showAddSilverSponsor, setShowAddSilverSponsor] = useState(false);
  const [showAddPoweredBy, setShowAddPoweredBy] = useState(false);
  const [showAddCommunityPartner, setShowAddCommunityPartner] = useState(false);
  const [showAddMediaPartner, setShowAddMediaPartner] = useState(false);
  const [showAddMentor, setShowAddMentor] = useState(false);
  const [showAddJudge, setShowAddJudge] = useState(false);

  // Check if user is organizer
  const isOrganizer = hackathon?.organizer_wallet?.toLowerCase() === address?.toLowerCase();

  if (hackathon === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (hackathon === null) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Hackathon Not Found</h1>
            <Button onClick={() => navigate("/hackathons")}>Back to Hackathons</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (hackathon.external_url) {
    window.location.href = hackathon.external_url;
    return null;
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Hackathon not found</h2>
          <p className="text-muted-foreground mb-4">The hackathon you're looking for doesn't exist.</p>
          <Button onClick={() => window.location.href = "/hackathons"}>
            Back to Hackathons
          </Button>
        </div>
      </div>
    );
  }

  const currentUrl = `${window.location.origin}/hackathons/${slug}`;
  const metaImage = hackathon.banner_image || hackathon.image || hackathon.poster_image;
  const metaDescription = hackathon.short_description || hackathon.tagline || hackathon.description?.slice(0, 160) || `Join ${hackathon.title} - ${hackathon.prize_pool || 'Amazing prizes'} | ${new Date(hackathon.start_date).toLocaleDateString()}`;

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTeamMutate('insert', {
        hackathon_id: hackathon.id,
        name: teamForm.name,
        description: teamForm.description,
        looking_for_members: teamForm.lookingForMembers,
        required_skills: teamForm.requiredSkills ? teamForm.requiredSkills.split(",").map(s => s.trim()) : undefined,
        project_idea: teamForm.projectIdea,
        leader_id: user?.id
      });
      toast.success("Team created successfully!");
      setIsTeamDialogOpen(false);
      setTeamForm({ name: "", description: "", lookingForMembers: true, requiredSkills: "", projectIdea: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to create team");
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await askQuestionMutate('insert', {
        hackathon_id: hackathon.id,
        question: questionText,
        author_id: user?.id
      });
      toast.success("Question posted!");
      setIsQuestionDialogOpen(false);
      setQuestionText("");
    } catch (error: any) {
      toast.error(error.message || "Failed to post question");
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `hackathons/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast.error("Failed to upload image");
      console.error(error);
      return "";
    }
  };

  const addSponsorEntry = () => {
    setSponsorsForm([...sponsorForm, { name: "", logo: "", tier: sponsorTier, website: "" }]);
  };

  const addPartnerEntry = () => {
    setPartnerForm([...partnerForm, { name: "", logo: "", website: "" }]);
  };

  const addMediaEntry = () => {
    setMediaForm([...mediaForm, { name: "", logo: "", website: "" }]);
  };

  const addMentorEntry = () => {
    setMentorForm([...mentorForm, { name: "", image: "", role: "", company: "", bio: "" }]);
  };

  const addJudgeEntry = () => {
    setJudgeForm([...judgeForm, { name: "", image: "", title: "", company: "", bio: "" }]);
  };

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use the appropriate mutation based on sponsor tier
      if (sponsorTier === "title") {
        await updateHackathonMutate('update', {
          title_sponsor: sponsorForm[0] || { name: "", logo: "" },
        }, { id: hackathon.id });
      } else if (sponsorTier === "gold") {
        await updateHackathonMutate('update', {
          gold_sponsors: sponsorForm,
        }, { id: hackathon.id });
      } else if (sponsorTier === "silver") {
        await updateHackathonMutate('update', {
          silver_sponsors: sponsorForm,
        }, { id: hackathon.id });
      }
      toast.success("Sponsors updated!");
      setIsSponsorDialogOpen(false);
      setSponsorsForm([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to update sponsors");
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateHackathonMutate('update', {
        community_partners: partnerForm,
      }, { id: hackathon.id });
      toast.success("Community partners updated!");
      setIsPartnerDialogOpen(false);
      setPartnerForm([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to update partners");
    }
  };

  const handleMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateHackathonMutate('update', {
        media_partners: mediaForm,
      }, { id: hackathon.id });
      toast.success("Media partners updated!");
      setIsMediaDialogOpen(false);
      setMediaForm([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to update media partners");
    }
  };

  const handleMentorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Filter out mentors without required role field
      const validMentors = mentorForm.filter(m => m.role && m.role.trim() !== "");
      if (validMentors.length === 0) {
        toast.error("Please provide a role for at least one mentor");
        return;
      }
      await updateHackathonMutate('update', {
        mentors: validMentors as Array<{name: string, image: string, role: string, company?: string, bio?: string}>,
      }, { id: hackathon.id });
      toast.success("Mentors updated!");
      setIsMentorDialogOpen(false);
      setMentorForm([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to update mentors");
    }
  };

  const handleJudgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Filter out judges without required title field
      const validJudges = judgeForm.filter(j => j.title && j.title.trim() !== "");
      if (validJudges.length === 0) {
        toast.error("Please provide a title for at least one judge");
        return;
      }
      await updateHackathonMutate('update', {
        judges: validJudges as Array<{name: string, image: string, title: string, company?: string, bio?: string}>,
      }, { id: hackathon.id });
      toast.success("Judges updated!");
      setIsJudgeDialogOpen(false);
      setJudgeForm([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to update judges");
    }
  };

  const handleAddSponsor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hackathon) return;

    const formData = new FormData(e.currentTarget);
    const newSponsor = {
      name: formData.get("name") as string,
      logo: formData.get("logo") as string,
      website: formData.get("website") as string || undefined,
    };

    try {
      // Add to the appropriate sponsor tier based on which dialog is open
      if (showAddTitleSponsor) {
        await updateHackathonMutate('update', {
          title_sponsor: newSponsor,
        }, { id: hackathon.id });
      } else if (showAddGoldSponsor) {
        const currentGold = hackathon.gold_sponsors || [];
        await updateHackathonMutate('update', {
          gold_sponsors: [...currentGold, newSponsor],
        }, { id: hackathon.id });
      } else if (showAddSilverSponsor) {
        const currentSilver = hackathon.silver_sponsors || [];
        await updateHackathonMutate('update', {
          silver_sponsors: [...currentSilver, newSponsor],
        }, { id: hackathon.id });
      } else if (showAddPoweredBy) {
        const currentPowered = hackathon.powered_by || [];
        await updateHackathonMutate('update', {
          powered_by: [...currentPowered, newSponsor],
        }, { id: hackathon.id });
      }
      
      toast.success("Sponsor added successfully!");
      setShowAddTitleSponsor(false);
      setShowAddGoldSponsor(false);
      setShowAddSilverSponsor(false);
      setShowAddPoweredBy(false);
    } catch (error) {
      console.error("Error adding sponsor:", error);
      toast.error("Failed to add sponsor. Please try again.");
    }
  };

  const handleAddCommunityPartner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hackathon) return;

    const formData = new FormData(e.currentTarget);
    const newPartner = {
      name: formData.get("name") as string,
      image: formData.get("image") as string,
      website: formData.get("website") as string || undefined,
      photos: [],
    };

    try {
      const currentPartners = Array.isArray(hackathon.community_partners) 
        ? hackathon.community_partners 
        : [];
      
      await updateHackathonMutate('update', {
        community_partners: [...currentPartners, newPartner],
      }, { id: hackathon.id });
      
      toast.success("Community partner added successfully!");
      setShowAddCommunityPartner(false);
    } catch (error) {
      console.error("Error adding community partner:", error);
      toast.error("Failed to add community partner. Please try again.");
    }
  };

  const handleAddMediaPartner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hackathon) return;

    const formData = new FormData(e.currentTarget);
    const newPartner = {
      name: formData.get("name") as string,
      image: formData.get("image") as string,
      website: formData.get("website") as string || undefined,
      photos: [],
    };

    try {
      const currentPartners = Array.isArray(hackathon.media_partners) 
        ? hackathon.media_partners 
        : [];
      
      await updateHackathonMutate('update', {
        media_partners: [...currentPartners, newPartner],
      }, { id: hackathon.id });
      
      toast.success("Media partner added successfully!");
      setShowAddMediaPartner(false);
    } catch (error) {
      console.error("Error adding media partner:", error);
      toast.error("Failed to add media partner. Please try again.");
    }
  };

  const handleAddMentor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hackathon) return;

    const formData = new FormData(e.currentTarget);
    const newMentor = {
      name: formData.get("name") as string,
      image: formData.get("image") as string,
      role: formData.get("role") as string,
      bio: formData.get("bio") as string || undefined,
      company: formData.get("company") as string || undefined,
      photos: [],
    };

    try {
      const currentMentors = Array.isArray(hackathon.mentors) 
        ? hackathon.mentors 
        : [];
      
      await updateHackathonMutate('update', {
        mentors: [...currentMentors, newMentor],
      }, { id: hackathon.id });
      
      toast.success("Mentor added successfully!");
      setShowAddMentor(false);
    } catch (error) {
      console.error("Error adding mentor:", error);
      toast.error("Failed to add mentor. Please try again.");
    }
  };

  const handleAddJudge = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hackathon) return;

    const formData = new FormData(e.currentTarget);
    const newJudge = {
      name: formData.get("name") as string,
      image: formData.get("image") as string,
      title: formData.get("title") as string,
      bio: formData.get("bio") as string || undefined,
      company: formData.get("company") as string || undefined,
      photos: [],
    };

    try {
      const currentJudges = Array.isArray(hackathon.judges) 
        ? hackathon.judges 
        : [];
      
      await updateHackathonMutate('update', {
        judges: [...currentJudges, newJudge],
      }, { id: hackathon.id });
      
      toast.success("Judge added successfully!");
      setShowAddJudge(false);
    } catch (error) {
      console.error("Error adding judge:", error);
      toast.error("Failed to add judge. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
      <SEO
        title={hackathon.title}
        description={metaDescription}
        image={metaImage || undefined}
        url={currentUrl}
        type="event"
        keywords={hackathon.tags || []}
        publishedTime={new Date(hackathon.created_at || Date.now()).toISOString()}
        startDate={hackathon.start_date}
        endDate={hackathon.end_date}
        location={hackathon.location || hackathon.mode}
        organization={hackathon.organizer_name || hackathon.organized_by}
      />
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative h-96 bg-gradient-to-br from-primary/20 to-secondary/20 border-b border-primary/20">
          {(hackathon.banner_image || hackathon.image) && (
            <img src={hackathon.banner_image || hackathon.image} alt={hackathon.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8 relative z-10">
            <Badge className="w-fit mb-4 bg-primary/20 text-primary border-primary/50">{hackathon.status}</Badge>
            <h1 className="text-5xl font-bold mb-2 cyber-glitch" data-text={hackathon.title}>{hackathon.title}</h1>
            {hackathon.tagline && <p className="text-xl text-muted-foreground mb-4">{hackathon.tagline}</p>}
            {hackathon.organized_by && <p className="text-sm text-muted-foreground mb-4">Organized by {hackathon.organized_by}</p>}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
              </div>
              {hackathon.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {hackathon.duration}
                </div>
              )}
              {hackathon.mode && (
                <Badge variant="outline">{hackathon.mode}</Badge>
              )}
              {hackathon.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {hackathon.location}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-accent" />
                {hackathon.prize_pool || hackathon.prizes}
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {hackathon.total_hackers || 0} Hackers • {hackathon.total_teams || 0} Teams
              </div>
            </div>
            {hackathon.registration_link && (
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => {
                    if (!isAuthenticated && signIn) {
                      toast.error("Please connect your wallet to register");
                      signIn();
                      return;
                    }
                    window.open(hackathon.registration_link, "_blank");
                  }}
                >
                  Register Now <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                <ShareButtons
                  url={`/hackathons/${slug}`}
                  title={hackathon.title || hackathon.name}
                  description={hackathon.tagline || hackathon.short_description || hackathon.description}
                  hashtags={['web3', 'hackathon', 'blockchain', 'apnacoding']}
                />
              </div>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="container mx-auto px-4 pt-32 pb-12">
          <Tabs defaultValue="overview" className="w-full">
            <div className="w-full overflow-x-auto mb-8 -mx-4 px-4 md:mx-0 md:px-0">
              <TabsList className="inline-flex w-auto min-w-full md:min-w-0 md:grid md:w-full md:grid-cols-5 lg:w-auto">
                <TabsTrigger value="overview" className="whitespace-nowrap">Overview</TabsTrigger>
                <TabsTrigger value="prizes" className="whitespace-nowrap">Prizes & Judges</TabsTrigger>
                <TabsTrigger value="schedule" className="whitespace-nowrap">Schedule</TabsTrigger>
                <TabsTrigger value="teams" className="whitespace-nowrap">Teams ({teams?.length || 0})</TabsTrigger>
                <TabsTrigger value="community" className="whitespace-nowrap">Community</TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {hackathon.short_description && (
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <p className="text-lg font-medium">{hackathon.short_description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Registration Link Card - Prominent display */}
              {hackathon.registration_link && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ExternalLink className="h-5 w-5 text-primary" />
                      Registration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Ready to participate? Register for this hackathon using the link below.
                    </p>
                    <Button 
                      size="lg" 
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => {
                        if (!isAuthenticated && signIn) {
                          toast.error("Please connect your wallet to register");
                          signIn();
                          return;
                        }
                        window.open(hackathon.registration_link, "_blank");
                      }}
                    >
                      Register Now <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>About This Hackathon</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground whitespace-pre-line">{hackathon.overview || hackathon.description}</p>
                </CardContent>
              </Card>

              {/* Participation Info */}
              <div className="grid md:grid-cols-2 gap-6">
                {hackathon.eligibility && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Eligibility</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{hackathon.eligibility}</p>
                    </CardContent>
                  </Card>
                )}

                {(hackathon.min_team_size || hackathon.max_team_size) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Size</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {hackathon.min_team_size && hackathon.max_team_size 
                          ? `${hackathon.min_team_size} - ${hackathon.max_team_size} members`
                          : hackathon.max_team_size 
                          ? `Up to ${hackathon.max_team_size} members`
                          : `Minimum ${hackathon.min_team_size} members`}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Themes & Tech Stack */}
              {(hackathon.themes || hackathon.tech_stack) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Themes & Technologies</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hackathon.themes && hackathon.themes.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Themes / Tracks</h4>
                        <div className="flex flex-wrap gap-2">
                          {hackathon.themes.map((theme: string, idx: number) => (
                            <Badge key={idx} variant="secondary">{theme}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {hackathon.tech_stack && hackathon.tech_stack.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                          {hackathon.tech_stack.map((tech: string, idx: number) => (
                            <Badge key={idx} variant="outline">{tech}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {hackathon.rules && (
                <Card>
                  <CardHeader>
                    <CardTitle>Rules & Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line">{hackathon.rules}</p>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {hackathon.benefits && hackathon.benefits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>What Participants Get</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {hackathon.benefits.map((benefit: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">✓</span>
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Sponsors & Partners with Management */}
              {(hackathon.title_sponsor || hackathon.gold_sponsors || hackathon.silver_sponsors || hackathon.powered_by || hackathon.community_partners || hackathon.media_partners || isOrganizer) && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Sponsors & Partners</CardTitle>
                      {isOrganizer && (
                        <div className="flex gap-2">
                          <Dialog open={isSponsorDialogOpen} onOpenChange={setIsSponsorDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Sponsors</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Manage Sponsors</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleSponsorSubmit} className="space-y-4">
                                <div>
                                  <Label>Sponsor Tier</Label>
                                  <select 
                                    className="w-full p-2 border rounded"
                                    value={sponsorTier}
                                    onChange={(e) => setSponsorTier(e.target.value as any)}
                                  >
                                    <option value="title">Title Sponsor</option>
                                    <option value="gold">Gold Sponsor</option>
                                    <option value="silver">Silver Sponsor</option>
                                  </select>
                                </div>
                                {sponsorForm.map((sponsor, idx) => (
                                  <Card key={idx} className="p-4">
                                    <div className="flex justify-between mb-2">
                                      <h4 className="font-semibold">Sponsor {idx + 1}</h4>
                                      <Button 
                                        type="button" 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={() => setSponsorsForm(sponsorForm.filter((_, i) => i !== idx))}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="space-y-2">
                                      <Input 
                                        placeholder="Name" 
                                        value={sponsor.name}
                                        onChange={(e) => {
                                          const updated = [...sponsorForm];
                                          updated[idx].name = e.target.value;
                                          setSponsorsForm(updated);
                                        }}
                                        required
                                      />
                                      <Input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const url = await handleImageUpload(file);
                                            const updated = [...sponsorForm];
                                            updated[idx].logo = url;
                                            setSponsorsForm(updated);
                                          }
                                        }}
                                      />
                                      <Input 
                                        placeholder="Website (optional)" 
                                        value={sponsor.website || ""}
                                        onChange={(e) => {
                                          const updated = [...sponsorForm];
                                          updated[idx].website = e.target.value;
                                          setSponsorsForm(updated);
                                        }}
                                      />
                                    </div>
                                  </Card>
                                ))}
                                <Button type="button" variant="outline" onClick={addSponsorEntry} className="w-full">
                                  <Plus className="h-4 w-4 mr-2" /> Add Sponsor
                                </Button>
                                <Button type="submit" className="w-full">Save Sponsors</Button>
                              </form>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Community</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Manage Community Partners</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handlePartnerSubmit} className="space-y-4">
                                {partnerForm.map((partner, idx) => (
                                  <Card key={idx} className="p-4">
                                    <div className="flex justify-between mb-2">
                                      <h4 className="font-semibold">Partner {idx + 1}</h4>
                                      <Button 
                                        type="button" 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={() => setPartnerForm(partnerForm.filter((_, i) => i !== idx))}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="space-y-2">
                                      <Input 
                                        placeholder="Name" 
                                        value={partner.name}
                                        onChange={(e) => {
                                          const updated = [...partnerForm];
                                          updated[idx].name = e.target.value;
                                          setPartnerForm(updated);
                                        }}
                                        required
                                      />
                                      <Input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const url = await handleImageUpload(file);
                                            const updated = [...partnerForm];
                                            updated[idx].logo = url;
                                            setPartnerForm(updated);
                                          }
                                        }}
                                      />
                                      <Input 
                                        placeholder="Website (optional)" 
                                        value={partner.website || ""}
                                        onChange={(e) => {
                                          const updated = [...partnerForm];
                                          updated[idx].website = e.target.value;
                                          setPartnerForm(updated);
                                        }}
                                      />
                                    </div>
                                  </Card>
                                ))}
                                <Button type="button" variant="outline" onClick={addPartnerEntry} className="w-full">
                                  <Plus className="h-4 w-4 mr-2" /> Add Partner
                                </Button>
                                <Button type="submit" className="w-full">Save Partners</Button>
                              </form>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Media</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Manage Media Partners</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleMediaSubmit} className="space-y-4">
                                {mediaForm.map((media, idx) => (
                                  <Card key={idx} className="p-4">
                                    <div className="flex justify-between mb-2">
                                      <h4 className="font-semibold">Media Partner {idx + 1}</h4>
                                      <Button 
                                        type="button" 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={() => setMediaForm(mediaForm.filter((_, i) => i !== idx))}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="space-y-2">
                                      <Input 
                                        placeholder="Name" 
                                        value={media.name}
                                        onChange={(e) => {
                                          const updated = [...mediaForm];
                                          updated[idx].name = e.target.value;
                                          setMediaForm(updated);
                                        }}
                                        required
                                      />
                                      <Input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const url = await handleImageUpload(file);
                                            const updated = [...mediaForm];
                                            updated[idx].logo = url;
                                            setMediaForm(updated);
                                          }
                                        }}
                                      />
                                      <Input 
                                        placeholder="Website (optional)" 
                                        value={media.website || ""}
                                        onChange={(e) => {
                                          const updated = [...mediaForm];
                                          updated[idx].website = e.target.value;
                                          setMediaForm(updated);
                                        }}
                                      />
                                    </div>
                                  </Card>
                                ))}
                                <Button type="button" variant="outline" onClick={addMediaEntry} className="w-full">
                                  <Plus className="h-4 w-4 mr-2" /> Add Media Partner
                                </Button>
                                <Button type="submit" className="w-full">Save Media Partners</Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {hackathon.title_sponsor && (
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Title Sponsor</h4>
                        <div className="flex items-center gap-4 p-4 border border-primary/20 rounded-lg">
                          {hackathon.title_sponsor.logo && <img src={hackathon.title_sponsor.logo} alt={hackathon.title_sponsor.name} className="h-12 object-contain" />}
                          <span className="font-semibold">{hackathon.title_sponsor.name}</span>
                        </div>
                      </div>
                    )}
                    
                    {hackathon.gold_sponsors && hackathon.gold_sponsors.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Gold Sponsors</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {hackathon.gold_sponsors.map((sponsor: any, idx: number) => (
                            <div key={idx} className="p-4 border border-primary/20 rounded-lg flex flex-col items-center gap-2">
                              {sponsor.logo && <img src={sponsor.logo} alt={sponsor.name} className="h-10 object-contain" />}
                              <span className="text-sm text-center">{sponsor.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {hackathon.silver_sponsors && hackathon.silver_sponsors.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Silver Sponsors</h4>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                          {hackathon.silver_sponsors.map((sponsor: any, idx: number) => (
                            <div key={idx} className="p-3 border border-primary/20 rounded-lg flex flex-col items-center gap-2">
                              {sponsor.logo && <img src={sponsor.logo} alt={sponsor.name} className="h-8 object-contain" />}
                              <span className="text-xs text-center">{sponsor.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {hackathon.powered_by && hackathon.powered_by.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Powered By</h4>
                        <div className="flex flex-wrap gap-4">
                          {hackathon.powered_by.map((partner: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                              {partner.logo && <img src={partner.logo} alt={partner.name} className="h-6 object-contain" />}
                              <span className="text-sm">{partner.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {hackathon.community_partners && hackathon.community_partners.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Community Partners</h4>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                          {hackathon.community_partners.map((partner: any, idx: number) => (
                            <div key={idx} className="p-2 border border-primary/20 rounded-lg flex flex-col items-center gap-1">
                              {partner.logo && <img src={partner.logo} alt={partner.name} className="h-6 object-contain" />}
                              <span className="text-xs text-center">{partner.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {hackathon.media_partners && hackathon.media_partners.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Media Partners</h4>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                          {hackathon.media_partners.map((partner: any, idx: number) => (
                            <div key={idx} className="p-2 border border-primary/20 rounded-lg flex flex-col items-center gap-1">
                              {partner.logo && <img src={partner.logo} alt={partner.name} className="h-6 object-contain" />}
                              <span className="text-xs text-center">{partner.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Contact & Links */}
              {(hackathon.website_url || hackathon.discord_url || hackathon.telegram_url || hackathon.whatsapp_url || hackathon.twitter_url || hackathon.contact_email) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Important Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {hackathon.website_url && (
                        <a href={hackathon.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                          <ExternalLink className="h-4 w-4" />
                          Official Website
                        </a>
                      )}
                      {hackathon.discord_url && (
                        <a href={hackathon.discord_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                          <ExternalLink className="h-4 w-4" />
                          Discord Community
                        </a>
                      )}
                      {hackathon.telegram_url && (
                        <a href={hackathon.telegram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                          <ExternalLink className="h-4 w-4" />
                          Telegram Group
                        </a>
                      )}
                      {hackathon.whatsapp_url && (
                        <a href={hackathon.whatsapp_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                          <ExternalLink className="h-4 w-4" />
                          WhatsApp Group
                        </a>
                      )}
                      {hackathon.twitter_url && (
                        <a href={hackathon.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                          <ExternalLink className="h-4 w-4" />
                          Twitter / X
                        </a>
                      )}
                      {hackathon.contact_email && (
                        <a href={`mailto:${hackathon.contact_email}`} className="flex items-center gap-2 text-primary hover:underline">
                          <ExternalLink className="h-4 w-4" />
                          {hackathon.contact_email}
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Prizes & Judges Tab */}
            <TabsContent value="prizes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prize Pool</CardTitle>
                  <CardDescription className="text-2xl font-bold text-primary">{hackathon.prize_pool || hackathon.prizes}</CardDescription>
                </CardHeader>
                <CardContent>
                  {hackathon.prize_details && hackathon.prize_details.length > 0 ? (
                    <div className="grid gap-4">
                      {hackathon.prize_details.map((prize: any, idx: number) => (
                        <div key={idx} className="p-4 border border-primary/20 rounded-lg bg-card/50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-lg">{prize.place}</h4>
                            <span className="text-xl font-bold text-primary">{prize.amount}</span>
                          </div>
                          {prize.description && <p className="text-sm text-muted-foreground">{prize.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Prize details will be announced soon.</p>
                  )}
                </CardContent>
              </Card>

              {/* Judges with Management */}
              {(hackathon.judges && hackathon.judges.length > 0) || isOrganizer ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Judges</CardTitle>
                      {isOrganizer && (
                        <Dialog open={isJudgeDialogOpen} onOpenChange={setIsJudgeDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Add Judges</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Manage Judges</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleJudgeSubmit} className="space-y-4">
                              {judgeForm.map((judge, idx) => (
                                <Card key={idx} className="p-4">
                                  <div className="flex justify-between mb-2">
                                    <h4 className="font-semibold">Judge {idx + 1}</h4>
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => setJudgeForm(judgeForm.filter((_, i) => i !== idx))}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    <Input 
                                      placeholder="Name" 
                                      value={judge.name}
                                      onChange={(e) => {
                                        const updated = [...judgeForm];
                                        updated[idx].name = e.target.value;
                                        setJudgeForm(updated);
                                      }}
                                      required
                                    />
                                    <Input 
                                      type="file" 
                                      accept="image/*"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const url = await handleImageUpload(file);
                                          const updated = [...judgeForm];
                                          updated[idx].image = url;
                                          setJudgeForm(updated);
                                        }
                                      }}
                                    />
                                    <Input 
                                      placeholder="Title (optional)" 
                                      value={judge.title || ""}
                                      onChange={(e) => {
                                        const updated = [...judgeForm];
                                        updated[idx].title = e.target.value;
                                        setJudgeForm(updated);
                                      }}
                                    />
                                    <Input 
                                      placeholder="Company (optional)" 
                                      value={judge.company || ""}
                                      onChange={(e) => {
                                        const updated = [...judgeForm];
                                        updated[idx].company = e.target.value;
                                        setJudgeForm(updated);
                                      }}
                                    />
                                    <Textarea 
                                      placeholder="Bio (optional)" 
                                      value={judge.bio || ""}
                                      onChange={(e) => {
                                        const updated = [...judgeForm];
                                        updated[idx].bio = e.target.value;
                                        setJudgeForm(updated);
                                      }}
                                    />
                                  </div>
                                </Card>
                              ))}
                              <Button type="button" variant="outline" onClick={addJudgeEntry} className="w-full">
                                <Plus className="h-4 w-4 mr-2" /> Add Judge
                              </Button>
                              <Button type="submit" className="w-full">Save Judges</Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {hackathon.judges?.map((judge: any, idx: number) => (
                        <div key={idx} className="p-4 border border-primary/20 rounded-lg">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={judge.image} />
                              <AvatarFallback>{judge.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold">{judge.name}</h4>
                              <p className="text-sm text-muted-foreground">{judge.title}</p>
                              {judge.company && <p className="text-xs text-muted-foreground">{judge.company}</p>}
                              {judge.bio && <p className="text-xs text-muted-foreground mt-2">{judge.bio}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {/* Mentors with Management */}
              {(hackathon.mentors && hackathon.mentors.length > 0) || isOrganizer ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Mentors</CardTitle>
                      {isOrganizer && (
                        <Dialog open={isMentorDialogOpen} onOpenChange={setIsMentorDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Add Mentors</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Manage Mentors</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleMentorSubmit} className="space-y-4">
                              {mentorForm.map((mentor, idx) => (
                                <Card key={idx} className="p-4">
                                  <div className="flex justify-between mb-2">
                                    <h4 className="font-semibold">Mentor {idx + 1}</h4>
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => setMentorForm(mentorForm.filter((_, i) => i !== idx))}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    <Input 
                                      placeholder="Name" 
                                      value={mentor.name}
                                      onChange={(e) => {
                                        const updated = [...mentorForm];
                                        updated[idx].name = e.target.value;
                                        setMentorForm(updated);
                                      }}
                                      required
                                    />
                                    <Input 
                                      type="file" 
                                      accept="image/*"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const url = await handleImageUpload(file);
                                          const updated = [...mentorForm];
                                          updated[idx].image = url;
                                          setMentorForm(updated);
                                        }
                                      }}
                                    />
                                    <Input 
                                      placeholder="Role (optional)" 
                                      value={mentor.role || ""}
                                      onChange={(e) => {
                                        const updated = [...mentorForm];
                                        updated[idx].role = e.target.value;
                                        setMentorForm(updated);
                                      }}
                                    />
                                    <Input 
                                      placeholder="Company (optional)" 
                                      value={mentor.company || ""}
                                      onChange={(e) => {
                                        const updated = [...mentorForm];
                                        updated[idx].company = e.target.value;
                                        setMentorForm(updated);
                                      }}
                                    />
                                    <Textarea 
                                      placeholder="Bio (optional)" 
                                      value={mentor.bio || ""}
                                      onChange={(e) => {
                                        const updated = [...mentorForm];
                                        updated[idx].bio = e.target.value;
                                        setMentorForm(updated);
                                      }}
                                    />
                                  </div>
                                </Card>
                              ))}
                              <Button type="button" variant="outline" onClick={addMentorEntry} className="w-full">
                                <Plus className="h-4 w-4 mr-2" /> Add Mentor
                              </Button>
                              <Button type="submit" className="w-full">Save Mentors</Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {hackathon.mentors?.map((mentor: any, idx: number) => (
                        <div key={idx} className="p-4 border border-primary/20 rounded-lg">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={mentor.image} />
                              <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{mentor.name}</h4>
                              <p className="text-xs text-muted-foreground">{mentor.role}</p>
                              {mentor.company && <p className="text-xs text-muted-foreground">{mentor.company}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Event Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  {hackathon.schedule && hackathon.schedule.length > 0 ? (
                    <div className="space-y-4">
                      {hackathon.schedule.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4 p-4 border-l-2 border-primary/50 bg-card/50">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[150px]">
                            <Clock className="h-4 w-4" />
                            {item.time}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{item.title}</h4>
                            {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Schedule will be announced soon.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Teams Tab */}
            <TabsContent value="teams" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Teams</h2>
                  <p className="text-muted-foreground">Join a team or create your own</p>
                </div>
                <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary">Create Team</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a New Team</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateTeam} className="space-y-4">
                      <div>
                        <Label htmlFor="team-name">Team Name *</Label>
                        <Input
                          id="team-name"
                          value={teamForm.name}
                          onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="team-desc">Description</Label>
                        <Textarea
                          id="team-desc"
                          value={teamForm.description}
                          onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="team-skills">Required Skills (comma-separated)</Label>
                        <Input
                          id="team-skills"
                          value={teamForm.requiredSkills}
                          onChange={(e) => setTeamForm({ ...teamForm, requiredSkills: e.target.value })}
                          placeholder="React, Node.js, Web3"
                        />
                      </div>
                      <div>
                        <Label htmlFor="team-idea">Project Idea</Label>
                        <Textarea
                          id="team-idea"
                          value={teamForm.projectIdea}
                          onChange={(e) => setTeamForm({ ...teamForm, projectIdea: e.target.value })}
                        />
                      </div>
                      <Button type="submit" className="w-full">Create Team</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams?.map((team) => (
                  <Card key={team.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {team.name}
                        {team.looking_for_members && (
                          <Badge variant="outline" className="text-green-500 border-green-500">Looking for Members</Badge>
                        )}
                      </CardTitle>
                      {team.description && <CardDescription>{team.description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Team Leader</h4>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={team.leader?.image} />
                            <AvatarFallback>{team.leader?.name?.charAt(0) || "?"}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{team.leader?.name || "Anonymous"}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Members ({team.members?.length || 0})</h4>
                        <div className="flex -space-x-2">
                          {team.members?.slice(0, 5).map((member: any, idx: number) => (
                            <Avatar key={idx} className="h-8 w-8 border-2 border-background">
                              <AvatarImage src={member?.image} />
                              <AvatarFallback>{member?.name?.charAt(0) || "?"}</AvatarFallback>
                            </Avatar>
                          ))}
                          {(team.members?.length || 0) > 5 && (
                            <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                              +{(team.members?.length || 0) - 5}
                            </div>
                          )}
                        </div>
                      </div>

                      {team.required_skills && team.required_skills.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Looking for</h4>
                          <div className="flex flex-wrap gap-2">
                            {team.required_skills.map((skill: string, idx: number) => (
                              <Badge key={idx} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {team.looking_for_members && (
                        <Button variant="outline" className="w-full">Request to Join</Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {(!teams || teams.length === 0) && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold mb-2">No teams yet</h3>
                    <p className="text-muted-foreground mb-4">Be the first to create a team!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community" className="space-y-6">
              <Tabs defaultValue="announcements" className="w-full">
                <TabsList>
                  <TabsTrigger value="announcements">Announcements ({announcements?.length || 0})</TabsTrigger>
                  <TabsTrigger value="questions">Q&A ({questions?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="announcements" className="space-y-4 mt-6">
                  {announcements?.map((announcement) => (
                    <Card key={announcement.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{announcement.title}</CardTitle>
                            <CardDescription>
                              By {announcement.author?.name || "Organizer"} • {new Date(announcement.created_at).toLocaleString()}
                            </CardDescription>
                          </div>
                          {announcement.is_pinned && (
                            <Badge variant="outline" className="text-yellow-500 border-yellow-500">Pinned</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground whitespace-pre-line">{announcement.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {(!announcements || announcements.length === 0) && (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No announcements yet</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="questions" className="space-y-4 mt-6">
                  <div className="flex justify-end mb-4">
                    <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">Ask Question</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ask a Question</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAskQuestion} className="space-y-4">
                          <Textarea
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder="What would you like to know?"
                            className="min-h-[100px]"
                            required
                          />
                          <Button type="submit" className="w-full">Post Question</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {questions?.map((question) => (
                    <Card key={question.id}>
                      <CardHeader>
                        <CardDescription>
                          Asked by {question.author?.name || "Anonymous"} • {new Date(question.created_at).toLocaleString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="font-medium">{question.question}</p>
                        {question.answer ? (
                          <div className="bg-primary/5 border-l-2 border-primary p-4 rounded">
                            <p className="text-sm text-muted-foreground mb-2">
                              Answered by {question.answerer?.name || "Organizer"}
                            </p>
                            <p className="whitespace-pre-line">{question.answer}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Awaiting answer...</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {(!questions || questions.length === 0) && (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No questions yet. Be the first to ask!</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
