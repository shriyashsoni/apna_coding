import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Sparkles, Mail, Send, Copy, RefreshCw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AIEmailAgent() {
  const [formData, setFormData] = useState({
    companyName: "",
    companyWebsite: "",
    recipientEmail: "",
    recipientName: "",
    purpose: "partnership",
    additionalContext: "",
    emailLength: "medium"
  });

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isScrapingWebsite, setIsScrapingWebsite] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [useColorfulTemplate, setUseColorfulTemplate] = useState(true); // Toggle for colored vs plain template
  const [generatedEmail, setGeneratedEmail] = useState<{
    subject: string;
    content: string;
    templates?: {
      formal: { subject: string; content: string };
      friendly: { subject: string; content: string };
      creative: { subject: string; content: string };
    };
  } | null>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<"formal" | "friendly" | "creative">("formal");

  const purposeOptions = [
    { value: "partnership", label: "General Partnership", icon: "🤝" },
    { value: "hackathon", label: "Hackathon Collaboration", icon: "💻" },
    { value: "sponsor", label: "Sponsorship Opportunity", icon: "💰" },
    { value: "event", label: "Event Partnership", icon: "📅" },
    { value: "media", label: "Media Partnership", icon: "📰" },
    { value: "collaboration", label: "Technical Collaboration", icon: "🔧" }
  ];

  const emailLengthOptions = [
    { value: "short", label: "Short (150-200 words)", description: "Quick and concise pitch" },
    { value: "medium", label: "Medium (250-350 words)", description: "Balanced detail and brevity" },
    { value: "long", label: "Long (400-500 words)", description: "Comprehensive proposal" }
  ];

  const emailTemplates = [
    {
      name: "🤝 General Partnership",
      companyName: "Web3 Protocol",
      purpose: "partnership",
      context: "Strategic partnership for developer ecosystem growth, cross-promotion, and community building"
    },
    {
      name: "💻 Hackathon Co-host",
      companyName: "DevFest Organizers",
      purpose: "hackathon",
      context: "Co-hosting a global Web3 hackathon with $100K+ prize pool, mentorship, and developer workshops"
    },
    {
      name: "💰 Sponsorship Deal",
      companyName: "Blockchain Foundation",
      purpose: "sponsor",
      context: "Seeking sponsorship for our Web3 developer events, hackathons, and educational programs"
    },
    {
      name: "📅 Event Collaboration",
      companyName: "Tech Conference",
      purpose: "event",
      context: "Partnering for workshops, speaker sessions, and developer meetups across multiple cities"
    },
    {
      name: "📰 Media Partnership",
      companyName: "Crypto News Network",
      purpose: "media",
      context: "Content collaboration, interviews, press releases, and cross-platform promotion"
    },
    {
      name: "🔧 Technical Integration",
      companyName: "DeFi Protocol",
      purpose: "collaboration",
      context: "Technical integration, API collaboration, SDK development, and joint developer resources"
    },
    {
      name: "🎓 Education Program",
      companyName: "Blockchain Academy",
      purpose: "collaboration",
      context: "Creating Web3 courses, certification programs, and developer training workshops"
    },
    {
      name: "🌐 Community Alliance",
      companyName: "DAO Community",
      purpose: "partnership",
      context: "Building a global Web3 community alliance with shared resources, events, and member benefits"
    }
  ];

  const handleGenerate = async () => {
    toast.info("Email generation logic needs to be migrated to Supabase Edge Functions");
  };

  const handleSendEmail = async () => {
    toast.info("Email sending logic needs to be migrated to Supabase Edge Functions");
  };

  const stripHtml = (html: string): string => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Convert colored template to plain simple template
  const convertToPlainTemplate = (htmlContent: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;

    // Extract just the body content (skip header, footer, stats, etc)
    const bodyContent = temp.querySelector('td[style*="padding: 50px 40px"]');
    const emailBody = bodyContent?.innerHTML || htmlContent;

    // Create simple plain template
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Email Body -->
    <div style="margin-bottom: 40px;">
      ${emailBody}
    </div>

    <!-- Signature -->
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0 0 5px 0; font-size: 14px; color: #333;">Best regards,</p>
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #333; font-weight: 600;">Apna Coding Team</p>

      <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">
        <strong>Email:</strong> <a href="mailto:apnacoding.tech@gmail.com" style="color: #0066cc; text-decoration: none;">apnacoding.tech@gmail.com</a>
      </p>
      <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">
        <strong>Website:</strong> <a href="https://apnacoding.com" style="color: #0066cc; text-decoration: none;">apnacoding.com</a>
      </p>

      <p style="margin: 15px 0 5px 0; font-size: 13px; color: #666;">
        <strong>Connect:</strong>
        <a href="https://x.com/apna_coding" style="color: #0066cc; text-decoration: none; margin-right: 10px;">Twitter</a>
        <a href="https://www.linkedin.com/company/apna-coding-by-apna-counsellors/" style="color: #0066cc; text-decoration: none; margin-right: 10px;">LinkedIn</a>
        <a href="https://www.instagram.com/apnacoding.tech" style="color: #0066cc; text-decoration: none; margin-right: 10px;">Instagram</a>
        <a href="https://github.com/shriyashsoni" style="color: #0066cc; text-decoration: none;">GitHub</a>
      </p>
    </div>

  </div>
</body>
</html>
    `.trim();
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const loadTemplate = (template: typeof emailTemplates[0]) => {
    setFormData({
      ...formData,
      companyName: template.companyName,
      purpose: template.purpose,
      additionalContext: template.context
    });
    toast.info(`Template "${template.name}" loaded!`);
  };

  const handleScrapeWebsite = async () => {
    toast.info("Website scraping logic needs to be migrated to Supabase Edge Functions");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Email Partnership Agent
          </CardTitle>
          <CardDescription className="text-base">
            Generate professional partnership emails powered by AI. Fill in the details and let AI craft the perfect proposal.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <Card className="border-primary/20 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Website Scraper */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Auto-Fill from Website
              </Label>
              <p className="text-xs text-muted-foreground">
                Enter a company website URL to automatically extract details
              </p>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://company.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="flex-1 bg-background"
                  disabled={isScrapingWebsite}
                />
                <Button
                  onClick={handleScrapeWebsite}
                  disabled={isScrapingWebsite}
                  variant="default"
                  size="sm"
                >
                  {isScrapingWebsite ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Templates */}
            <div>
              <Label className="text-xs text-muted-foreground">Quick Templates</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {emailTemplates.map((template) => (
                  <Button
                    key={template.name}
                    variant="outline"
                    size="sm"
                    onClick={() => loadTemplate(template)}
                    className="text-xs"
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="e.g., Polygon Labs"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="bg-background/50"
              />
            </div>

            {/* Company Website */}
            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Company Website</Label>
              <Input
                id="companyWebsite"
                type="url"
                placeholder="https://company.com"
                value={formData.companyWebsite}
                onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                className="bg-background/50"
              />
            </div>

            {/* Recipient Email */}
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email *</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="partnerships@company.com"
                value={formData.recipientEmail}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                className="bg-background/50"
              />
            </div>

            {/* Recipient Name */}
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name (Optional)</Label>
              <Input
                id="recipientName"
                placeholder="John Doe"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                className="bg-background/50"
              />
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Partnership Purpose *</Label>
              <select
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full p-2 bg-background/50 border border-primary/20 rounded-md"
              >
                {purposeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Length */}
            <div className="space-y-2">
              <Label htmlFor="emailLength">Email Length *</Label>
              <select
                id="emailLength"
                value={formData.emailLength}
                onChange={(e) => setFormData({ ...formData, emailLength: e.target.value })}
                className="w-full p-2 bg-background/50 border border-primary/20 rounded-md"
              >
                {emailLengthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {emailLengthOptions.find(opt => opt.value === formData.emailLength)?.description}
              </p>
            </div>

            {/* Additional Context */}
            <div className="space-y-2">
              <Label htmlFor="additionalContext">Additional Context (Optional)</Label>
              <Textarea
                id="additionalContext"
                placeholder="Any specific details you want to include..."
                rows={3}
                value={formData.additionalContext}
                onChange={(e) => setFormData({ ...formData, additionalContext: e.target.value })}
                className="bg-background/50 resize-none"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Email Preview */}
        <Card className="border-primary/20 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Generated Email
              </span>
              {generatedEmail && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {generatedEmail ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Template Selector */}
                  {generatedEmail.templates && (
                    <div className="space-y-2">
                      <Label className="font-semibold">Choose Template Style</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={selectedTemplate === "formal" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTemplate("formal")}
                          className="flex-1"
                        >
                          📄 Formal
                        </Button>
                        <Button
                          variant={selectedTemplate === "friendly" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTemplate("friendly")}
                          className="flex-1"
                        >
                          😊 Friendly
                        </Button>
                        <Button
                          variant={selectedTemplate === "creative" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTemplate("creative")}
                          className="flex-1"
                        >
                          ✨ Creative
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedTemplate === "formal" && "Professional, corporate tone with structured language"}
                        {selectedTemplate === "friendly" && "Warm, approachable tone while staying professional"}
                        {selectedTemplate === "creative" && "Bold, energetic tone with personality"}
                      </p>
                    </div>
                  )}

                  {/* Subject Line */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Subject Line</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(
                          generatedEmail.templates?.[selectedTemplate]?.subject || generatedEmail.subject,
                          "Subject"
                        )}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="p-4 bg-background border border-primary/20 rounded-md">
                      <p className="font-medium text-base">
                        {generatedEmail.templates?.[selectedTemplate]?.subject || generatedEmail.subject}
                      </p>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Email Body</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(
                            generatedEmail.templates?.[selectedTemplate]?.content || generatedEmail.content,
                            "HTML email"
                          )}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy HTML
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(
                            stripHtml(generatedEmail.templates?.[selectedTemplate]?.content || generatedEmail.content),
                            "Plain text"
                          )}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Text
                        </Button>
                      </div>
                    </div>
                    <div
                      className="p-6 bg-background border border-primary/20 rounded-md min-h-[500px] max-h-[700px] overflow-y-auto text-base leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: generatedEmail.templates?.[selectedTemplate]?.content || generatedEmail.content
                      }}
                    />
                  </div>

                  {/* Send Options */}
                  <div className="space-y-3">
                    {/* Template Style Toggle */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex-1">
                        <Label htmlFor="template-style" className="text-sm font-semibold cursor-pointer">
                          {useColorfulTemplate ? "🎨 Colorful Template" : "📄 Plain Template"}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {useColorfulTemplate
                            ? "Beautiful gradients, colors, stats badge, and social buttons"
                            : "Simple clean design with basic formatting"}
                        </p>
                      </div>
                      <Switch
                        id="template-style"
                        checked={useColorfulTemplate}
                        onCheckedChange={setUseColorfulTemplate}
                        className="ml-3"
                      />
                    </div>

                    {/* Primary Send Button - Direct Email Sending */}
                    <Button
                      onClick={handleSendEmail}
                      disabled={isSendingEmail}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      {isSendingEmail ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Sending Email...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Send Email Directly
                        </>
                      )}
                    </Button>

                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-2 border-green-500/30 rounded-lg">
                      <p className="text-sm font-bold mb-2 text-green-700 dark:text-green-400">
                        ✅ {useColorfulTemplate ? "Colorful Email Template" : "Plain Email Template"}
                      </p>
                      <ul className="text-xs space-y-1.5 ml-4">
                        {useColorfulTemplate ? (
                          <>
                            <li className="text-foreground">• Beautiful gradient header with brand colors</li>
                            <li className="text-foreground">• Professional stats badge and social media buttons</li>
                            <li className="text-foreground">• Colorful contact card with styled links</li>
                            <li className="text-foreground">• Perfect for impressive first impressions! ✨</li>
                          </>
                        ) : (
                          <>
                            <li className="text-foreground">• Clean simple design without fancy colors</li>
                            <li className="text-foreground">• Professional signature and contact info</li>
                            <li className="text-foreground">• All links and formatting work perfectly</li>
                            <li className="text-foreground">• Great for conservative/formal communication! 📧</li>
                          </>
                        )}
                      </ul>
                    </div>

                    {/* Alternative Copy Options */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => {
                          const currentTemplate = generatedEmail.templates?.[selectedTemplate];
                          const htmlContent = currentTemplate?.content || generatedEmail.content;
                          copyToClipboard(htmlContent, "Full HTML email");
                          toast.success("📋 HTML copied! Paste into Gmail/Outlook compose window");
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy HTML
                      </Button>
                      <Button
                        onClick={() => {
                          const currentTemplate = generatedEmail.templates?.[selectedTemplate];
                          const subject = currentTemplate?.subject || generatedEmail.subject;
                          copyToClipboard(subject, "Subject");
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Subject
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center min-h-[500px] text-center text-muted-foreground"
                >
                  <Mail className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg">Fill in the details and click "Generate AI Email"</p>
                  <p className="text-sm mt-2">AI will craft a professional partnership proposal</p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
