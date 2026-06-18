import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Github, Twitter, Linkedin, Instagram, Users, MessageCircle, MessageSquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const socials = [
  {
    id: "discord",
    name: "Discord Community",
    description: "Join our active developer community, participate in events, and connect with peers.",
    url: "https://discord.gg/8E7ER4wq",
    icon: MessageSquare,
    color: "bg-[#5865F2]",
    hoverColor: "hover:bg-[#4752C4]"
  },
  {
    id: "telegram",
    name: "Telegram Group",
    description: "Real-time updates, discussions, and networking with other developers.",
    url: "https://t.me/apnacodingtech",
    icon: MessageCircle,
    color: "bg-[#229ED9]",
    hoverColor: "hover:bg-[#1A82B5]"
  },
  {
    id: "whatsapp-group",
    name: "WhatsApp Group",
    description: "Instant notifications for hackathons, jobs, and exclusive opportunities.",
    url: "https://chat.whatsapp.com/HqVg4ctR6QKJnfvemsEQ8H",
    icon: Users,
    color: "bg-[#25D366]",
    hoverColor: "hover:bg-[#1EBE55]"
  },
  {
    id: "whatsapp-channel",
    name: "WhatsApp Channel",
    description: "Subscribe to our broadcast channel for the latest news directly on WhatsApp.",
    url: "https://whatsapp.com/channel/0029VbAedaw8aKvNRdkNJr3s",
    icon: MessageCircle,
    color: "bg-[#128C7E]",
    hoverColor: "hover:bg-[#075E54]"
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    description: "Follow us for daily coding tips, platform updates, and tech news.",
    url: "https://x.com/apna_coding",
    icon: Twitter,
    color: "bg-black",
    hoverColor: "hover:bg-neutral-800"
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Connect professionally, view our job updates, and company news.",
    url: "https://www.linkedin.com/company/apna-coding-by-apna-counsellors/",
    icon: Linkedin,
    color: "bg-[#0A66C2]",
    hoverColor: "hover:bg-[#084F96]"
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Behind the scenes, short-form content, and developer lifestyle.",
    url: "https://www.instagram.com/apnacoding.tech",
    icon: Instagram,
    color: "bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
    hoverColor: "hover:opacity-90"
  },
  {
    id: "github",
    name: "GitHub",
    description: "Explore our open-source projects and contribute to the community.",
    url: "https://github.com/shriyashsoni",
    icon: Github,
    color: "bg-[#181717]",
    hoverColor: "hover:bg-[#0A0A0A]"
  }
];

export default function Social() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-32 pb-16 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-2 mb-8">
            <Users className="h-4 w-4 text-white/60" />
            <span className="text-xs font-medium tracking-wider uppercase text-white/60">Connect With Us</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Social & Communities
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
            Join the Apna Coding network across all our platforms. Be the first to know about hackathons, job openings, events, and community updates.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {socials.map((social, index) => (
            <motion.a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="group block"
            >
              <div className="liquid-glass rounded-2xl p-6 h-full hover:border-white/20 transition-all flex flex-col">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white shadow-lg ${social.color} transition-all duration-300 ${social.hoverColor}`}>
                  <social.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-xl mb-3 text-white group-hover:text-blue-400 transition-colors">
                  {social.name}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed flex-1">
                  {social.description}
                </p>
                <div className="mt-6 flex items-center text-xs font-medium text-white/30 group-hover:text-white/70 transition-colors uppercase tracking-widest">
                  Connect <ArrowRight className="ml-2 h-3 w-3" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
