import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { FileText, AlertCircle, Scale, Users, Code, Trophy } from "lucide-react";

export default function Terms() {
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
                <FileText className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 cyber-glitch" data-text="Terms of Service">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-8">
            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Agreement to Terms</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Apna Coding ("the Platform"), you agree to be bound by these Terms of Service 
                and all applicable laws and regulations. If you do not agree with any of these terms, you are 
                prohibited from using or accessing this site.
              </p>
            </section>

            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">User Accounts</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Account Creation</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>You must provide accurate and complete information when creating an account</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You must be at least 13 years old to use this platform</li>
                    <li>One person or entity may not maintain more than one account</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Account Responsibilities</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>You are responsible for all activities that occur under your account</li>
                    <li>Notify us immediately of any unauthorized use of your account</li>
                    <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Code className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Acceptable Use</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>You agree NOT to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the platform for any illegal or unauthorized purpose</li>
                  <li>Violate any laws in your jurisdiction</li>
                  <li>Infringe on intellectual property rights of others</li>
                  <li>Transmit any viruses, malware, or harmful code</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Spam or send unsolicited messages</li>
                  <li>Attempt to gain unauthorized access to the platform or other users' accounts</li>
                  <li>Scrape, crawl, or use automated tools without permission</li>
                  <li>Impersonate any person or entity</li>
                  <li>Post false, misleading, or fraudulent content</li>
                </ul>
              </div>
            </section>

            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Content and Intellectual Property</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Your Content</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>You retain ownership of content you post on the platform</li>
                    <li>By posting content, you grant us a worldwide, non-exclusive license to use, display, and distribute your content</li>
                    <li>You are responsible for ensuring you have rights to any content you post</li>
                    <li>We may remove content that violates these terms or applicable laws</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Our Content</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>All platform content, features, and functionality are owned by Apna Coding</li>
                    <li>You may not copy, modify, or distribute our content without permission</li>
                    <li>Our trademarks and logos may not be used without written consent</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Events and Hackathons</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Event and hackathon participation is subject to specific rules set by organizers</li>
                <li>Prize distribution is at the discretion of event organizers</li>
                <li>We are not responsible for disputes between participants and organizers</li>
                <li>Participants must comply with all event-specific terms and conditions</li>
                <li>Cheating, plagiarism, or unfair practices will result in disqualification</li>
              </ul>
            </section>

            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Disclaimers and Limitations</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Service "As Is"</h3>
                  <p>
                    The platform is provided "as is" without warranties of any kind, either express or implied. 
                    We do not guarantee that the service will be uninterrupted, secure, or error-free.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Limitation of Liability</h3>
                  <p>
                    To the maximum extent permitted by law, Apna Coding shall not be liable for any indirect, 
                    incidental, special, consequential, or punitive damages arising from your use of the platform.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Third-Party Links</h3>
                  <p>
                    Our platform may contain links to third-party websites. We are not responsible for the content 
                    or practices of these external sites.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Termination</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate your account and access to the platform at our sole 
                discretion, without notice, for conduct that we believe violates these Terms of Service or is 
                harmful to other users, us, or third parties, or for any other reason.
              </p>
            </section>

            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Governing Law</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of India, without 
                regard to its conflict of law provisions. Any disputes arising from these terms shall be subject 
                to the exclusive jurisdiction of the courts in Jabalpur, Madhya Pradesh.
              </p>
            </section>

            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Changes to Terms</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. We will notify users of any 
                material changes by posting the new terms on this page and updating the "Last updated" date. 
                Your continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="bg-card/30 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">Contact Information</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> apnacoding.tech@gmail.com</p>
                <p><strong>Phone:</strong> +91 8989976990</p>
                <p><strong>Address:</strong> Jabalpur, MP 482001</p>
              </div>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
