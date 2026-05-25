import { Link } from "react-router";
import { Github, Twitter, Linkedin, Instagram, Globe, Mail, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    // Check initial language from google translate cookie
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    if (match && match[1]) {
      setLanguage(match[1]);
    }
  }, []);

  const handleLanguageChange = (langCode: string) => {
    if (langCode === "en") {
      // Clear cookies for English (default)
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${window.location.hostname}; path=/;`;
    } else {
      // Set Google Translate cookies
      document.cookie = `googtrans=/en/${langCode}; path=/`;
      document.cookie = `googtrans=/en/${langCode}; domain=.${window.location.hostname}; path=/`;
    }
    
    setLanguage(langCode);
    // Reload to apply translation instantly
    window.location.reload();
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("🎉 Thanks for subscribing to Apna Coding!");
    setEmail("");
  };

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "zh-CN", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 relative z-10 font-sans">
      <motion.footer 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        className="liquid-glass w-full rounded-3xl p-6 md:p-10 text-white/70 mt-16 md:mt-24"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-10">
          
          {/* First column (md:col-span-5) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <img src="/apna-logo-transparent.png" alt="Apna Coding Logo" className="h-12 w-auto object-contain drop-shadow-md" />
              <span className="text-xl font-semibold tracking-tight text-white font-sans">APNA CODING</span>
            </div>
            
            <p className="text-sm leading-relaxed max-w-sm text-white/60">
              Apna Coding provides premium clarity, hackathons, and global opportunities across blockchain ecosystems - shared with all builders for free.
            </p>
          </div>

          {/* md:col-span-7 */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            {/* Discover */}
            <div>
              <h4 className="text-sm uppercase tracking-wider text-white font-semibold mb-6">Discover</h4>
              <ul className="space-y-3">
                <li><Link to="/events" className="text-xs text-white/50 hover:text-white transition-colors">Events</Link></li>
                <li><Link to="/hackathons" className="text-xs text-white/50 hover:text-white transition-colors">Hackathons</Link></li>
                <li><Link to="/products" className="text-xs text-white/50 hover:text-white transition-colors">Products</Link></li>
                <li><Link to="/jobs" className="text-xs text-white/50 hover:text-white transition-colors">Jobs</Link></li>
                <li><Link to="/news" className="text-xs text-white/50 hover:text-white transition-colors">News</Link></li>
                <li><Link to="/partnerships" className="text-xs text-white/50 hover:text-white transition-colors">Partnerships</Link></li>
              </ul>
            </div>

            {/* The Mission */}
            <div>
              <h4 className="text-sm uppercase tracking-wider text-white font-semibold mb-6">Community</h4>
              <ul className="space-y-3">
                <li><Link to="/communities" className="text-xs text-white/50 hover:text-white transition-colors">Communities</Link></li>
                <li><a href="https://discord.gg/8E7ER4wq" target="_blank" rel="noopener noreferrer" className="text-xs text-white/50 hover:text-white transition-colors">Discord Server</a></li>
                <li><a href="https://t.me/apnacodingtech" target="_blank" rel="noopener noreferrer" className="text-xs text-white/50 hover:text-white transition-colors">Telegram Group</a></li>
                <li><a href="https://chat.whatsapp.com/HqVg4ctR6QKJnfvemsEQ8H" target="_blank" rel="noopener noreferrer" className="text-xs text-white/50 hover:text-white transition-colors">WhatsApp Group</a></li>
                <li><a href="https://whatsapp.com/channel/0029VbAedaw8aKvNRdkNJr3s" target="_blank" rel="noopener noreferrer" className="text-xs text-white/50 hover:text-white transition-colors">WhatsApp Channel</a></li>
              </ul>
            </div>

            {/* Concierge */}
            <div>
              <h4 className="text-sm uppercase tracking-wider text-white font-semibold mb-6">Concierge</h4>
              <ul className="space-y-3">
                <li><Link to="/contact" className="text-xs text-white/50 hover:text-white transition-colors">Get in Touch</Link></li>
                <li><Link to="/privacy" className="text-xs text-white/50 hover:text-white transition-colors">Legal Privacy</Link></li>
                <li><Link to="/terms" className="text-xs text-white/50 hover:text-white transition-colors">User Agreement</Link></li>
                <li><Link to="/services" className="text-xs text-white/50 hover:text-white transition-colors">Promotion Services</Link></li>
                <li><Link to="/branding-kit" className="text-xs text-white/50 hover:text-white transition-colors">Branding Kit</Link></li>
                <li><a href="mailto:apnacoding.tech@gmail.com" className="text-xs text-white/50 hover:text-white transition-colors">Report Concern</a></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-[10px] uppercase tracking-widest opacity-50">
              Curated by @shriyashsoni
            </p>
            <span className="hidden md:inline text-[10px] opacity-35">|</span>
            <p className="text-[10px] uppercase tracking-widest opacity-50">
              &copy; {new Date().getFullYear()} Apna Coding. Powered by Web3.
            </p>
          </div>

          <div className="flex items-center gap-6">
            
            {/* Language Selector */}
            <div className="relative group notranslate">
              <button className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors">
                <Globe className="h-4 w-4" />
                <span>{languages.find(l => l.code === language)?.flag}</span>
              </button>
              <div className="absolute bottom-full right-0 mb-2 bg-[#000] border border-white/15 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[140px] z-50">
                <div className="p-2 space-y-1">
                  {languages.slice(0, 10).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-3 py-1.5 rounded text-xs hover:bg-white/10 transition-colors flex items-center gap-2 ${
                        language === lang.code ? "text-white bg-white/5" : "text-white/60"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest opacity-50">Join the Journey:</span>
              <a href="https://github.com/shriyashsoni" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-colors hover:text-white">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://x.com/apna_coding" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-colors hover:text-white">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://www.linkedin.com/company/apna-coding-by-apna-counsellors/" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-colors hover:text-white">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com/apnacoding.tech" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-colors hover:text-white">
                <Instagram className="h-4 w-4" />
              </a>
            </div>

          </div>

        </div>

      </motion.footer>
    </div>
  );
}
