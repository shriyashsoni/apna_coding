import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, UserCheck, Mail } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <Shield className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 cyber-glitch" data-text="Privacy Policy">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-8">
            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Introduction</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Apna Coding. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you about how we look after your personal data when you visit our 
                platform and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Information We Collect</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Name and email address</li>
                    <li>Profile information (bio, skills, profile picture)</li>
                    <li>Authentication data (OAuth tokens, session information)</li>
                    <li>Account preferences and settings</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Usage Data</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Pages visited and features used</li>
                    <li>Time spent on the platform</li>
                    <li>Posts, comments, and community interactions</li>
                    <li>Event and hackathon registrations</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Technical Data</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>IP address and browser type</li>
                    <li>Device information</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">How We Use Your Information</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>To provide and maintain our services</li>
                <li>To authenticate and secure your account</li>
                <li>To personalize your learning experience</li>
                <li>To send you notifications about events, hackathons, and opportunities</li>
                <li>To improve our platform and develop new features</li>
                <li>To communicate with you about updates and support</li>
                <li>To analyze usage patterns and optimize performance</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Data Sharing and Disclosure</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>We do not sell your personal information. We may share your data with:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> Third-party services that help us operate our platform (Supabase for backend, authentication providers)</li>
                  <li><strong>Event Organizers:</strong> When you register for events or hackathons, your registration information is shared with organizers</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition</li>
                </ul>
              </div>
            </section>

            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Data Security</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal data 
                against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure 
                authentication protocols, and regular security audits. However, no method of transmission over the 
                internet is 100% secure.
              </p>
            </section>

            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Your Rights</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Access:</strong> Request access to your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to processing of your personal data</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
              </ul>
            </section>

            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Contact Us</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:
              </p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> apnacoding.tech@gmail.com</p>
                <p><strong>Phone:</strong> +91 8989976990</p>
                <p><strong>Address:</strong> Jabalpur, MP 482001</p>
              </div>
            </section>

            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review 
                this Privacy Policy periodically for any changes.
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
