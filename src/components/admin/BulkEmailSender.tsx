import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  FileText,
  Upload,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface EmailRecipient {
  email: string;
  name: string;
}

interface EmailResult {
  email: string;
  name: string;
  status: "success" | "error";
  message: string;
}

export function BulkEmailSender() {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [recipientInput, setRecipientInput] = useState("");
  const [subject, setSubject] = useState("");
  const [template, setTemplate] = useState("");
  const [fromName, setFromName] = useState("Apna Coding Team");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");
  const [isSending, setIsSending] = useState(false);
  const [results, setResults] = useState<EmailResult[]>([]);
  const [previewName, setPreviewName] = useState("John Doe");
  const [previewHtml, setPreviewHtml] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiEmailType, setAiEmailType] = useState("general");
  const [aiTone, setAiTone] = useState("professional");
  const [isGenerating, setIsGenerating] = useState(false);

  // Predefined templates
  const templates = {
    welcome: {
      name: "Welcome Email",
      subject: "Welcome to Apna Coding, {{name}}!",
      template: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Welcome to Apna Coding!</h1></div>
    <div class="content">
      <p>Hi <strong>{{name}}</strong>,</p>
      <p>We're excited to have you join the Apna Coding community! 🎉</p>
      <p>Here's what you can do:</p>
      <ul>
        <li>📅 Discover hackathons and tech events</li>
        <li>💼 Find your dream job</li>
        <li>🤝 Connect with other developers</li>
      </ul>
      <a href="https://apnacoding.com" class="button">Explore Platform</a>
    </div>
  </div>
</body>
</html>`,
    },
    event: {
      name: "Event Invitation",
      subject: "You're Invited: Special Event for {{name}}",
      template: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🎉 You're Invited!</h1></div>
    <div class="content">
      <p>Dear <strong>{{name}}</strong>,</p>
      <p>We're thrilled to invite you to our upcoming event!</p>
      <p>Join us for an amazing experience with fellow developers.</p>
      <a href="https://apnacoding.com/events" class="button">Register Now</a>
    </div>
  </div>
</body>
</html>`,
    },
    newsletter: {
      name: "Newsletter",
      subject: "{{name}}, Check Out This Week's Updates!",
      template: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>📰 Weekly Newsletter</h1></div>
    <div class="content">
      <p>Hi <strong>{{name}}</strong>,</p>
      <p>Here's what's new this week at Apna Coding:</p>
      <ul>
        <li>🎯 New hackathons added</li>
        <li>💼 Fresh job opportunities</li>
        <li>📚 Latest tutorials</li>
      </ul>
    </div>
  </div>
</body>
</html>`,
    },
  };

  const parseRecipients = (input: string) => {
    const lines = input.split("\n").filter(line => line.trim());
    const parsed: EmailRecipient[] = [];

    for (const line of lines) {
      // Format: email, name or just email
      const parts = line.split(",").map(p => p.trim());
      if (parts.length >= 2) {
        parsed.push({ email: parts[0], name: parts[1] });
      } else if (parts[0].includes("@")) {
        // Just email, extract name from email
        const name = parts[0].split("@")[0].replace(/[._]/g, " ");
        parsed.push({ email: parts[0], name });
      }
    }

    return parsed;
  };

  const handleAddRecipients = () => {
    const newRecipients = parseRecipients(recipientInput);
    setRecipients([...recipients, ...newRecipients]);
    setRecipientInput("");
    toast.success(`Added ${newRecipients.length} recipients`);
  };

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    if (templateKey !== "custom" && templates[templateKey as keyof typeof templates]) {
      const tmpl = templates[templateKey as keyof typeof templates];
      setSubject(tmpl.subject);
      setTemplate(tmpl.template);
    }
  };

  const handlePreview = async () => {
    if (!template) {
      toast.error("Please enter a template");
      return;
    }

    // Local preview simulation
    let html = template.replace(/\{\{name\}\}/g, previewName);
    setPreviewHtml(html);
    toast.success("Preview generated locally!");
  };

  const handleGenerateWithAI = async () => {
    toast.info("AI email generation needs to be migrated to Supabase Edge Functions");
  };

  const handleSend = async () => {
    if (recipients.length === 0) {
      toast.error("Please add at least one recipient.");
      return;
    }
    if (!subject || !template) {
      toast.error("Subject and Template are required.");
      return;
    }

    setIsSending(true);
    setResults([]);
    
    const sendingResults: EmailResult[] = [];

    toast.info(`Starting bulk email delivery to ${recipients.length} recipients...`);

    for (const recipient of recipients) {
      try {
        const personalizedSubject = subject.replace(/\{\{name\}\}/g, recipient.name);
        const personalizedBody = template.replace(/\{\{name\}\}/g, recipient.name);

        const result = await sendEmailUnified(
          recipient.email,
          recipient.name,
          personalizedSubject,
          personalizedBody,
          "shriyash.soni@apnacoding.com",
          "Shriyash Soni"
        );

        if (!result.success) {
          throw new Error(result.message);
        }

        sendingResults.push({
          email: recipient.email,
          name: recipient.name,
          status: "success",
          message: `Delivered successfully (${result.provider})`
        });
      } catch (err: any) {
        console.error(`Failed sending to ${recipient.email}:`, err);
        sendingResults.push({
          email: recipient.email,
          name: recipient.name,
          status: "error",
          message: err.message || "Failed to send"
        });
      }
    }

    setResults(sendingResults);
    setIsSending(false);

    const successCount = sendingResults.filter(r => r.status === "success").length;
    const errorCount = sendingResults.length - successCount;

    if (errorCount === 0) {
      toast.success(`🎉 Bulk delivery completed successfully! Sent ${successCount} emails.`);
    } else {
      toast.warning(`⚠️ Bulk delivery finished with warnings. Success: ${successCount}, Failed: ${errorCount}. Check Results tab.`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Bulk Email Sender
          </CardTitle>
          <CardDescription>
            Send personalized emails to multiple recipients at once. Use {"{{name}}"} in your template for personalization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="compose" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="compose">Compose</TabsTrigger>
              <TabsTrigger value="recipients">Recipients ({recipients.length})</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            {/* Compose Tab */}
            <TabsContent value="compose" className="space-y-4">
              {/* AI Generator Section */}
              <Card className="border-primary/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    Generate Email with AI
                  </CardTitle>
                  <CardDescription>
                    Describe what you want and let AI create a professional email template for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>What do you want to write about?</Label>
                    <Textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g., Welcome email for new users joining our Web3 platform, announcing a new hackathon, inviting to a workshop, etc."
                      rows={3}
                      disabled={isGenerating}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Email Type</Label>
                      <Select value={aiEmailType} onValueChange={setAiEmailType} disabled={isGenerating}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="welcome">Welcome</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                          <SelectItem value="announcement">Announcement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tone</Label>
                      <Select value={aiTone} onValueChange={setAiTone} disabled={isGenerating}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateWithAI}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Email
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or use templates</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>From Name</Label>
                <Input
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Apna Coding Team"
                />
              </div>

              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Template</SelectItem>
                    <SelectItem value="welcome">Welcome Email</SelectItem>
                    <SelectItem value="event">Event Invitation</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject Line (use {"{{name}}"} for personalization)</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Welcome to Apna Coding, {{name}}!"
                />
              </div>

              <div className="space-y-2">
                <Label>Email Template (HTML with {"{{name}}"} placeholder)</Label>
                <Textarea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  placeholder="<p>Hi {{name}},</p><p>Welcome to our platform!</p>"
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Input
                  value={previewName}
                  onChange={(e) => setPreviewName(e.target.value)}
                  placeholder="Preview name"
                  className="flex-1"
                />
                <Button onClick={handlePreview} variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>

              {previewHtml && (
                <div className="border rounded-lg p-4 bg-muted">
                  <p className="text-sm font-semibold mb-2">Preview:</p>
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              )}
            </TabsContent>

            {/* Recipients Tab */}
            <TabsContent value="recipients" className="space-y-4">
              <div className="space-y-2">
                <Label>Add Recipients (one per line: email, name)</Label>
                <Textarea
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  placeholder={`john@example.com, John Doe\njane@example.com, Jane Smith\nbob@example.com, Bob Johnson`}
                  rows={8}
                />
                <Button onClick={handleAddRecipients} variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Add Recipients
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Current Recipients ({recipients.length})</Label>
                <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
                  {recipients.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recipients added yet</p>
                  ) : (
                    <div className="space-y-1">
                      {recipients.map((r, i) => (
                        <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-muted rounded">
                          <span>{r.name}</span>
                          <span className="text-muted-foreground">{r.email}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRecipients(recipients.filter((_, idx) => idx !== i))}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleSend}
                disabled={isSending || recipients.length === 0}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending to {recipients.length} recipients...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send to {recipients.length} Recipients
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-4">
              {results.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No results yet. Send emails to see results here.
                </p>
              ) : (
                <div className="space-y-2">
                  {results.map((result, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-3 rounded-lg border ${
                        result.status === "success"
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {result.status === "success" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">{result.name}</span>
                          <span className="text-sm text-muted-foreground">{result.email}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{result.message}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
