import { Link } from "react-router";
import { Terminal, Github, Twitter, Linkedin, Instagram, Globe } from "lucide-react";
import { useState } from "react";

export function Footer() {
  const [language, setLanguage] = useState("en");

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
  ];

  return (
    <footer className="border-t border-primary/30 bg-background/50 backdrop-blur-sm pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="https://harmless-tapir-303.convex.cloud/api/storage/1afb27dd-9d64-48c2-be2e-ada93b76526a" 
                alt="Apna Coding Logo" 
                className="h-8 w-auto"
              />
              <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Apna Coding
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The Web3-powered global coding community for learning, hackathons, events, and opportunities.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/shriyashsoni" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Github className="h-5 w-5" /></a>
              <a href="https://x.com/apna_coding" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="https://www.linkedin.com/company/apna-coding-by-apna-counsellors/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></a>
              <a href="https://www.instagram.com/apnacoding.tech" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-primary">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/events" className="hover:text-primary transition-colors">Events</Link></li>
              <li><Link to="/hackathons" className="hover:text-primary transition-colors">Hackathons</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">Products</Link></li>
              <li><Link to="/jobs" className="hover:text-primary transition-colors">Jobs</Link></li>
              <li><Link to="/news" className="hover:text-primary transition-colors">News</Link></li>
              <li><Link to="/partnerships" className="hover:text-primary transition-colors">Partnerships</Link></li>
              <li><Link to="/branding" className="hover:text-primary transition-colors">Branding Kit</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-primary">Community</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/communities" className="hover:text-primary transition-colors">Communities</Link></li>
              <li><a href="https://discord.gg/8E7ER4wq" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Discord Server</a></li>
              <li><a href="https://t.me/apnacodingtech" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Telegram Group</a></li>
              <li><a href="https://chat.whatsapp.com/HqVg4ctR6QKJnfvemsEQ8H" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp Group</a></li>
              <li><a href="https://whatsapp.com/channel/0029VbAedaw8aKvNRdkNJr3s" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp Channel</a></li>
              <li><a href="https://x.com/apna_coding" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Twitter/X</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-primary">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/services" className="hover:text-primary transition-colors">Promotion Services</Link></li>
              <li><a href="mailto:apnacoding.tech@gmail.com" className="hover:text-primary transition-colors">apnacoding.tech@gmail.com</a></li>
              <li>Global Community</li>
              <li>Decentralized Platform</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Apna Coding. Powered by Web3.</p>
          <div className="flex gap-6 items-center">
            <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
            <div className="relative group">
              <button className="flex items-center gap-2 hover:text-primary transition-colors">
                <Globe className="h-4 w-4" />
                <span>{languages.find(l => l.code === language)?.flag}</span>
              </button>
              <div className="absolute bottom-full right-0 mb-2 bg-card border border-primary/30 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[160px]">
                <div className="p-2 space-y-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-primary/10 transition-colors flex items-center gap-2 ${
                        language === lang.code ? "text-primary bg-primary/5" : "text-muted-foreground"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}