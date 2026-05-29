import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { sendEmailUnified } from "@/lib/resend";
import {
  Mail,
  Send,
  Loader2,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Sparkles,
  Search,
  CheckSquare,
  Square,
  Globe,
  Settings2,
  ListTodo
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BlockchainLead {
  name: string;
  email: string;
  website: string;
  category: string;
  focus: string;
  selected: boolean;
}

interface CampaignLog {
  recipientName: string;
  recipientEmail: string;
  status: "pending" | "success" | "error";
  message: string;
  timestamp: string;
}

export function BulkEmailSender() {
  const [leadQuery, setLeadQuery] = useState("blockchain developer communities and Web3 start-ups");
  const [isFindingLeads, setIsFindingLeads] = useState(false);
  const [leads, setLeads] = useState<BlockchainLead[]>([
    {
      name: "Solana India Community",
      email: "india@solana.org",
      website: "https://solana.com",
      category: "Developer Alliance",
      focus: "Solana builder meetups, grants, and rust bootcamps in India",
      selected: true
    },
    {
      name: "Arbitrum Developers",
      email: "builders@arbitrum.foundation",
      website: "https://arbitrum.io",
      category: "Technical Integration",
      focus: "Layer 2 scaling integration, L2 hackathons, and gas optimization",
      selected: true
    },
    {
      name: "Polygon Labs",
      email: "partnerships@polygon.technology",
      website: "https://polygon.technology",
      category: "Community Alliance",
      focus: "Multi-chain scaling, developer outreach, and gasless dApp support",
      selected: true
    }
  ]);

  const [subject, setSubject] = useState("🤝 Partnership Proposal: Apna Coding × {{companyName}} Collaboration");
  const [templateContent, setTemplateContent] = useState(`Hi {{companyName}} Team,

I hope you are doing fantastic! I've been following your focus on {{focus}} and am extremely impressed by your builder ecosystem.

I'm reaching out from Apna Coding (https://apnacoding.com), India's premier high-growth platform for developers, Hackathons, and Web3 recruitment. We believe there is a massive opportunity to co-host builder meetups, distribute micro-grants, and accelerate technical integrations together.

Would you be open to a quick 10-minute introduction call next Tuesday to discuss how we can launch a joint developer campaign? 

Looking forward to building the future together!

Best regards,
Shriyash Soni
Founder, Apna Coding
shriyash.soni@apnacoding.com`);

  const [emailProvider, setEmailProvider] = useState<"resend" | "zeptomail" | "auto">("resend");
  const [useColorfulTemplate, setUseColorfulTemplate] = useState(true);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [aiGeneratorPrompt, setAiGeneratorPrompt] = useState("An invitation to co-host a national developer Web3 Hackathon with cash prizes");
  const [isLaunchingCampaign, setIsLaunchingCampaign] = useState(false);
  const [campaignLogs, setCampaignLogs] = useState<CampaignLog[]>([]);

  // Find targeted blockchain leads using our secure AI pipeline
  const handleFindLeads = async () => {
    if (!leadQuery.trim()) {
      toast.error("Please enter a lead search prompt.");
      return;
    }
    setIsFindingLeads(true);
    try {
      const response = await fetch("/api/generate-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: leadQuery })
      });

      if (!response.ok) {
        throw new Error("Failed to search targeted blockchain leads.");
      }

      const data = await response.json();
      if (data.leads && data.leads.length > 0) {
        const mappedLeads: BlockchainLead[] = data.leads.map((l: any) => ({
          ...l,
          selected: true
        }));
        setLeads(mappedLeads);
        toast.success(`Found ${mappedLeads.length} blockchain outreach leads via ${data.provider}!`);
      } else {
        toast.info("No new leads found, kept existing targets.");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to find leads. Please try again.");
    } finally {
      setIsFindingLeads(false);
    }
  };

  // Select all or Deselect all leads
  const toggleSelectAll = (select: boolean) => {
    setLeads(leads.map(l => ({ ...l, selected: select })));
    toast.info(select ? "Selected all blockchain leads" : "Deselected all leads");
  };

  // Toggle single lead selection
  const toggleLead = (index: number) => {
    const updated = [...leads];
    updated[index].selected = !updated[index].selected;
    setLeads(updated);
  };

  // Strip styling recursively to create pure plain template
  const convertToPlainTemplate = (htmlContent: string): string => {
    const temp = document.createElement("div");
    temp.innerHTML = htmlContent;

    const allElements = temp.querySelectorAll("*");
    allElements.forEach(el => {
      el.removeAttribute("style");
      el.removeAttribute("class");
    });

    return `
<!DOCTYPE html>
<html lang="en">
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto;">
    ${temp.innerHTML}
  </div>
</body>
</html>
    `.trim();
  };

  // Generate fancy HTML template around clean body text
  const generateColorfulTemplate = (bodyText: string): string => {
    const paragraphs = bodyText.split("\n\n").map(p => `<p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.8; color: #334155;">${p.replace(/\n/g, "<br>")}</p>`).join("");
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); padding: 32px 40px; text-align: center;">
              <h2 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 700; letter-spacing: -0.5px;">🤝 Partnership Collaboration Campaign</h2>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #e2e8f0;">Outreach via Apna Coding Administrative Hub</p>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 40px 40px 30px 40px; background-color: #ffffff;">
              ${paragraphs}
            </td>
          </tr>

          <!-- Custom Highlight Footer Action -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <div style="background-color: #f0fdfa; border-left: 4px solid #14b8a6; padding: 20px; border-radius: 8px; margin-top: 10px;">
                <h4 style="margin: 0 0 6px 0; font-size: 14px; color: #0f766e; font-weight: 600;">🚀 Let's Connect Today</h4>
                <p style="margin: 0; font-size: 13px; color: #115e59; line-height: 1.5;">To schedule a quick synchronization meeting or ask questions directly, please reply to this outreach email thread.</p>
              </div>
            </td>
          </tr>

          <!-- Brand Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;"><strong>Apna Coding Ecosystem</strong> — India's Premier Developer Network</p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                <a href="https://apnacoding.com" style="color: #4f46e5; text-decoration: none; margin: 0 6px;">Website</a> • 
                <a href="https://x.com/apna_coding" style="color: #4f46e5; text-decoration: none; margin: 0 6px;">Twitter</a> • 
                <a href="https://www.linkedin.com/company/apna-coding-by-apna-counsellors/" style="color: #4f46e5; text-decoration: none; margin: 0 6px;">LinkedIn</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  };

  // Generate dynamic customized email content with AI
  const handleGenerateTemplateWithAI = async () => {
    if (!aiGeneratorPrompt.trim()) {
      toast.error("Please enter what you want the campaign email to invite them for.");
      return;
    }
    setIsGeneratingTemplate(true);
    try {
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: "{{companyName}}",
          purpose: "partnership",
          additionalContext: `${aiGeneratorPrompt}. Ensure you reference the dynamic tags like {{companyName}} in the body, and make sure it has clear spacing.`,
          emailLength: "medium"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate campaign email via serverless model.");
      }

      const data = await response.json();
      const generated = data.templates?.[data.selectedTemplate] || data;
      if (generated && generated.content) {
        // Strip tags if AI wrapped it in a full colored template automatically, so we can save as raw text
        let cleanText = generated.content;
        const temp = document.createElement("div");
        temp.innerHTML = cleanText;
        // If it looks like a rich HTML banner, extract just paragraph blocks
        const paragraphs = temp.querySelectorAll("p");
        if (paragraphs.length > 0) {
          cleanText = Array.from(paragraphs).map(p => p.textContent).join("\n\n");
        } else {
          cleanText = temp.textContent || cleanText;
        }

        setSubject(generated.subject || "🤝 Collaboration Proposal: Apna Coding × {{companyName}}");
        setTemplateContent(cleanText);
        toast.success(`Generated personalized Mass Email template using ${data.provider}!`);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to generate campaign template.");
    } finally {
      setIsGeneratingTemplate(false);
    }
  };

  // Mass campaign launcher
  const handleLaunchCampaign = async () => {
    const selectedLeads = leads.filter(l => l.selected);
    if (selectedLeads.length === 0) {
      toast.error("Please select at least one blockchain lead to receive the campaign.");
      return;
    }

    setIsLaunchingCampaign(true);
    setCampaignLogs([]);
    toast.loading(`Launching massive outreach campaign to ${selectedLeads.length} leads...`);

    const newLogs: CampaignLog[] = selectedLeads.map(lead => ({
      recipientName: lead.name,
      recipientEmail: lead.email,
      status: "pending" as const,
      message: "Queued for sending...",
      timestamp: new Date().toLocaleTimeString()
    }));
    setCampaignLogs(newLogs);

    // Sequence loop dispatch to protect API rates
    for (let i = 0; i < selectedLeads.length; i++) {
      const lead = selectedLeads[i];
      try {
        // Replace placeholders in subject and body dynamically
        const personalizedSubject = subject.replace(/\{\{companyName\}\}/g, lead.name);
        let bodyText = templateContent
          .replace(/\{\{companyName\}\}/g, lead.name)
          .replace(/\{\{focus\}\}/g, lead.focus);

        const htmlLayout = useColorfulTemplate
          ? generateColorfulTemplate(bodyText)
          : convertToPlainTemplate(bodyText);

        const result = await sendEmailUnified(
          lead.email,
          lead.name,
          personalizedSubject,
          htmlLayout,
          "shriyash.soni@apnacoding.com",
          "Shriyash Soni",
          emailProvider
        );

        if (result.success) {
          setCampaignLogs(prev => prev.map((log, index) => 
            index === i 
              ? { ...log, status: "success" as const, message: `Sent successfully via ${result.provider}!` }
              : log
          ));
        } else {
          throw new Error(result.message);
        }
      } catch (e: any) {
        console.error(e);
        setCampaignLogs(prev => prev.map((log, index) => 
          index === i 
            ? { ...log, status: "error" as const, message: e.message || "Delivery failed" }
            : log
        ));
      }
      // Brief pause to satisfy SMTP rates
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    toast.dismiss();
    toast.success("🏆 Bulk Campaign Outreach completed!");
    setIsLaunchingCampaign(false);
  };

  return (
    <div className="space-y-6">
      {/* Search and AI Lead Finder Header */}
      <Card className="border-primary/20 bg-card/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Sparkles className="h-40 w-40 text-primary animate-pulse" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Search className="h-6 w-6 text-primary" />
            AI Blockchain Lead Campaign Finder
          </CardTitle>
          <CardDescription>
            Type a prompt to dynamically research and build targeted outreach lead portfolios for Web3 communities and protocols.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="lead-prompt" className="text-sm font-semibold">🔍 Target Community Focus Profile</Label>
              <Input
                id="lead-prompt"
                value={leadQuery}
                onChange={(e) => setLeadQuery(e.target.value)}
                placeholder="e.g. DeFi protocols on Solana or Layer-2 Ethereum scaling solutions in India"
                className="bg-background/40 border-primary/20"
                disabled={isFindingLeads}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleFindLeads}
                disabled={isFindingLeads}
                className="w-full md:w-auto bg-primary hover:bg-primary/80 text-primary-foreground font-bold px-6"
              >
                {isFindingLeads ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Finding Leads...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Find Leads with AI
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Blockchain Leads Selection Table */}
          <div className="space-y-3 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-base font-bold flex items-center gap-1.5">
                <ListTodo className="h-4 w-4 text-primary" />
                Target Leads Recipient Queue ({leads.length} available)
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSelectAll(true)}
                  className="text-xs"
                >
                  <CheckSquare className="h-3.5 w-3.5 mr-1" />
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSelectAll(false)}
                  className="text-xs"
                >
                  <Square className="h-3.5 w-3.5 mr-1" />
                  Deselect All
                </Button>
              </div>
            </div>

            <div className="border border-border/80 rounded-lg overflow-hidden bg-background/50 divide-y divide-border/80 max-h-[300px] overflow-y-auto">
              {leads.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No blockchain leads generated yet. Enter a query prompt above to auto-generate leads!
                </div>
              ) : (
                leads.map((lead, index) => (
                  <div key={index} className={`flex items-start p-4 transition-colors gap-3 ${lead.selected ? "bg-primary/5" : "hover:bg-muted/30"}`}>
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={lead.selected}
                        onChange={() => toggleLead(index)}
                        className="h-4.5 w-4.5 cursor-pointer rounded border-primary/20 accent-primary"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground text-sm sm:text-base">{lead.name}</span>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                          {lead.category}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">{lead.focus}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-primary" />
                          {lead.email}
                        </span>
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 hover:text-primary transition-colors text-primary"
                        >
                          <Globe className="h-3 w-3" />
                          {lead.website}
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Campaign Composer Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Composer Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-primary/20 bg-card/40">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-1.5">
                ✉️ Compose Mass Outreach Email Campaign
              </CardTitle>
              <CardDescription>
                Use <code className="text-primary font-mono text-xs">{"{{companyName}}"}</code> and <code className="text-primary font-mono text-xs">{"{{focus}}"}</code> to insert personalized variables into your campaign dynamically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Campaign template generator with AI */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-1">
                  ✨ Generate Mass Template Proposal with AI
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={aiGeneratorPrompt}
                    onChange={(e) => setAiGeneratorPrompt(e.target.value)}
                    placeholder="Invitation to collaborate on hackathons or sponsorship..."
                    className="bg-background/40 border-primary/20"
                    disabled={isGeneratingTemplate}
                  />
                  <Button
                    onClick={handleGenerateTemplateWithAI}
                    disabled={isGeneratingTemplate}
                    variant="secondary"
                    className="font-semibold text-xs whitespace-nowrap"
                  >
                    {isGeneratingTemplate ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "AI Generate"
                    )}
                  </Button>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="campaign-subject" className="font-semibold text-sm">Campaign Email Subject</Label>
                <Input
                  id="campaign-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="🤝 Partnership: Apna Coding × {{companyName}}"
                  className="bg-background/40 border-primary/20"
                />
              </div>

              {/* Body Textarea */}
              <div className="space-y-2">
                <Label htmlFor="campaign-template" className="font-semibold text-sm">Outreach Body Content Template</Label>
                <Textarea
                  id="campaign-template"
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  placeholder="Compose your personalized outreach template here..."
                  rows={14}
                  className="bg-background/40 border-primary/20 font-mono text-sm leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Settings and Send Dispatch panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-primary/20 bg-card/40">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-1.5">
                <Settings2 className="h-5 w-5 text-primary" />
                Campaign Execution Controls
              </CardTitle>
              <CardDescription>
                Configure layout, delivery API, and trigger mass mailings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plain / Colorful toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <div className="space-y-1">
                  <Label htmlFor="template-style" className="font-semibold text-sm block">🎨 Use Responsive Colorful Banner</Label>
                  <p className="text-xs text-muted-foreground">
                    {useColorfulTemplate 
                      ? "High-end email banner gradients and modern visual formatting" 
                      : "Completely stripped plain layout without any styles or highlights"}
                  </p>
                </div>
                <Switch
                  id="template-style"
                  checked={useColorfulTemplate}
                  onCheckedChange={setUseColorfulTemplate}
                />
              </div>

              {/* Delivery Service API Selector */}
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  ⚙️ Choose Outbound Delivery API
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={emailProvider === "resend" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEmailProvider("resend")}
                    className="flex-1 text-xs"
                  >
                    📨 Resend API
                  </Button>
                  <Button
                    type="button"
                    variant={emailProvider === "zeptomail" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEmailProvider("zeptomail")}
                    className="flex-1 text-xs"
                  >
                    ⚡ ZeptoMail
                  </Button>
                  <Button
                    type="button"
                    variant={emailProvider === "auto" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEmailProvider("auto")}
                    className="flex-1 text-xs"
                  >
                    🔄 Auto Cascade
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {emailProvider === "resend" && "Emails are sent securely through your verified Resend domain."}
                  {emailProvider === "zeptomail" && "Emails are sent securely through Zoho ZeptoMail transactional service."}
                  {emailProvider === "auto" && "Auto Cascade falls back to Resend if ZeptoMail reports sending errors."}
                </p>
              </div>

              {/* Campaign Trigger Button */}
              <Button
                onClick={handleLaunchCampaign}
                disabled={isLaunchingCampaign || leads.filter(l => l.selected).length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-base"
              >
                {isLaunchingCampaign ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Launching Outreach Campaign...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Launch Partnership Campaign ({leads.filter(l => l.selected).length} Leads)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Real-time Logger Panel */}
          <Card className="border-primary/20 bg-card/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                🛰️ Live Campaign Dispatch Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-border/80 rounded-lg p-3 bg-background/50 h-[220px] overflow-y-auto space-y-2 text-xs font-mono">
                {campaignLogs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-center">
                    No active campaign logs. Select leads and launch campaign to observe progress.
                  </div>
                ) : (
                  campaignLogs.map((log, i) => (
                    <div key={i} className="flex justify-between items-start border-b border-border/40 pb-2 gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          {log.status === "success" && <CheckCircle className="h-3 w-3 text-green-500" />}
                          {log.status === "error" && <XCircle className="h-3 w-3 text-red-500" />}
                          {log.status === "pending" && <Loader2 className="h-3 w-3 text-yellow-500 animate-spin" />}
                          {log.recipientName}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{log.recipientEmail}</span>
                        <p className="text-[10px] text-primary mt-0.5">{log.message}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{log.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
