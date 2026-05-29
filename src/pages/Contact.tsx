import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Twitter, Send, Linkedin, Github, Globe, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { sendEmailUnified } from "@/lib/resend";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: ""
  });

  const subjectOptions = [
    { value: "general", label: "General Inquiry" },
    { value: "partnership", label: "Partnership Opportunity" },
    { value: "collaboration", label: "Collaboration Request" },
    { value: "support", label: "Technical Support" },
    { value: "feedback", label: "Feedback & Suggestions" },
    { value: "sponsorship", label: "Sponsorship" },
    { value: "other", label: "Other" }
  ];

  const socialLinks = [
    {
      name: "Twitter",
      icon: Twitter,
      url: "https://twitter.com/apnacoding",
      color: "hover:text-[#1DA1F2]"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "https://linkedin.com/company/apnacoding",
      color: "hover:text-[#0A66C2]"
    },
    {
      name: "GitHub",
      icon: Github,
      url: "https://github.com/apnacoding",
      color: "hover:text-foreground"
    },
    {
      name: "Discord",
      icon: MessageSquare,
      url: "https://discord.gg/apnacoding",
      color: "hover:text-[#5865F2]"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get the subject label
      const subjectLabel = subjectOptions.find(opt => opt.value === formData.subject)?.label || "Contact Form Inquiry";

      const htmlContent = `
        <div style="font-family: sans-serif; padding: 25px; border: 1px solid #eaeaea; border-radius: 8px; max-width: 600px; color: #1f2937;">
          <h2 style="color: #6366f1; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px; margin-bottom: 20px; font-size: 20px;">Apna Coding - Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 120px; color: #4b5563;">Sender Name:</td>
              <td style="padding: 6px 0; color: #1f2937;">${formData.name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #4b5563;">Sender Email:</td>
              <td style="padding: 6px 0; color: #1f2937;">
                <a href="mailto:${formData.email}" style="color: #6366f1; text-decoration: none;">${formData.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #4b5563;">Subject:</td>
              <td style="padding: 6px 0; color: #1f2937;">${subjectLabel}</td>
            </tr>
          </table>
          <div style="padding: 15px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #6366f1;">
            <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 13px; color: #4b5563;">Message Details:</p>
            <p style="margin: 0; font-size: 14px; color: #1f2937; white-space: pre-wrap; line-height: 1.6;">${formData.message}</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 25px 0 15px 0;" />
          <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">Sent securely via Zoho ZeptoMail from Apna Coding Website Contact Portal.</p>
        </div>
      `;

      // Submit email directly to administrative inbox via Zoho ZeptoMail
      const result = await sendEmailUnified(
        "apnacoding.tech@gmail.com",
        "Apna Coding Support Team",
        `[Website Inquiry] ${subjectLabel} from ${formData.name}`,
        htmlContent
      );

      if (result.success) {
        toast.success("Thank you! Your message has been sent successfully.");
        setFormData({ name: "", email: "", subject: "general", message: "" });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Submission failed:", error);
      toast.error(`Submission Error: ${error.message || "Failed to submit message."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
      <SEO
        title="Contact Apna Coding - Web3 Support & Partnerships"
        description="Get in touch with Apna Coding team. Reach out for partnership opportunities, collaboration proposals, technical support, or platform suggestions."
        keywords={["contact apna coding", "apna coding support", "web3 collaborations", "partnership inquiries"]}
        url="/contact"
        type="website"
      />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-32 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Have a question, proposal, or just want to say hi? We'd love to hear from you!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-2"
            >
              <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll respond within 24-48 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-background/50 border-primary/20"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-background/50 border-primary/20"
                      />
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <select
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full p-2 bg-background/50 border border-primary/20 rounded-md"
                      >
                        {subjectOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="bg-background/50 border-primary/20 resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info & Social Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Direct Contact */}
              <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Direct Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <a
                        href="mailto:apnacoding.tech@gmail.com"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        apnacoding.tech@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Website</p>
                      <a
                        href="https://apnacoding.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        apnacoding.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Connect With Us</CardTitle>
                  <CardDescription>Follow us on social media</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 p-3 rounded-lg border border-primary/20 bg-background/50 hover:bg-primary/10 transition-all duration-300 ${social.color}`}
                      >
                        <social.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{social.name}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Response Time */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10">
                <CardContent className="pt-6">
                  <p className="text-sm text-center">
                    <span className="font-semibold text-primary">⚡ Fast Response</span>
                    <br />
                    <span className="text-muted-foreground">
                      We typically respond within 24-48 hours
                    </span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
