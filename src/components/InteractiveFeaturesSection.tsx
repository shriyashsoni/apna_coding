import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { 
  BarChart, 
  ArrowRight,
  Eye,
  Heart,
  MapPin,
  Building,
  Users
} from "lucide-react";

const tabs = [
  { id: "news", label: "News", link: "/news" },
  { id: "jobs", label: "Jobs", link: "/jobs" },
  { id: "communities", label: "Community", link: "/communities" },
  { id: "products", label: "Products", link: "/products" },
];

const typeWords = ["ECOSYSTEM", "NEWS", "JOBS", "COMMUNITIES", "PRODUCTS"];

export function InteractiveFeaturesSection() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [dataMap, setDataMap] = useState<Record<string, any[]>>({
    products: [],
    jobs: [],
    news: [],
    communities: [],
  });
  const [loading, setLoading] = useState(true);

  // Typing effect state
  const [typeText, setTypeText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          { data: pData },
          { data: jData },
          { data: nData },
          { data: cData }
        ] = await Promise.all([
          supabase.from("products").select("*").order("created_at", { ascending: false }).limit(3),
          supabase.from("jobs").select("*").order("created_at", { ascending: false }).limit(3),
          supabase.from("news").select("*").order("created_at", { ascending: false }).limit(3),
          supabase.from("communities").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(3),
        ]);
        
        setDataMap({
          products: pData || [],
          jobs: jData || [],
          news: nData || [],
          communities: cData || [],
        });
      } catch (error) {
        console.error("Error fetching ecosystem data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Typing effect hook
  useEffect(() => {
    const currentWord = typeWords[wordIndex];
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      timeout = setTimeout(() => {
        setTypeText(currentWord.substring(0, typeText.length - 1));
        if (typeText.length === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % typeWords.length);
        }
      }, 50); // Fast deletion speed
    } else {
      timeout = setTimeout(() => {
        setTypeText(currentWord.substring(0, typeText.length + 1));
        if (typeText.length === currentWord.length) {
          timeout = setTimeout(() => setIsDeleting(true), 2000); // Pause before deleting
        }
      }, 100); // Typing speed
    }

    return () => clearTimeout(timeout);
  }, [typeText, isDeleting, wordIndex]);

  const activeLink = tabs.find(t => t.id === activeTab)?.link || "/";
  const activeData = dataMap[activeTab] || [];

  return (
    <section className="py-20 bg-black text-white font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header matching screenshot */}
        <div className="mb-12">
          <div className="h-12 mb-8 flex items-center">
            <h2 className="text-3xl md:text-4xl font-mono tracking-widest font-bold uppercase">
              EXPLORE {typeText}<span className="animate-pulse">|</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      isActive 
                        ? "bg-[#2a2a2a] text-white" 
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            
            <Link 
              to={activeLink} 
              className="text-gray-400 hover:text-white text-sm font-medium flex items-center transition-colors"
            >
              More <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Content Cards matching screenshot */}
        <div className="min-h-[300px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[280px] bg-[#1c1c1c] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : activeData.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No data found for this category yet.
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {activeData.map((item: any, i: number) => {
                  
                  // Map data fields based on category
                  let title = "";
                  let description = "";
                  let label1 = "";
                  let url = "";

                  if (activeTab === "products") {
                    title = item.name;
                    description = item.description;
                    label1 = item.category || "PRODUCT";
                    url = `/products/${item.slug}`;
                  } else if (activeTab === "jobs") {
                    title = item.title;
                    description = item.description;
                    label1 = item.type || "JOB";
                    url = `/jobs/${item.slug || item.id}`;
                  } else if (activeTab === "news") {
                    title = item.title;
                    description = item.excerpt || item.description || "Read latest news update.";
                    label1 = item.category || "NEWS";
                    url = `/news/${item.slug}`;
                  } else if (activeTab === "communities") {
                    title = item.name;
                    description = item.description;
                    label1 = item.category || "COMMUNITY";
                    url = `/community/${item.slug}`;
                  }

                  return (
                    <Link to={url} key={item.id || i} className="block group">
                      <div className="bg-[#1c1c1c] border border-transparent group-hover:border-white/10 rounded-2xl p-6 h-[280px] flex flex-col transition-colors">
                        <h3 className="text-xl font-bold text-white mb-4 line-clamp-2">
                          {title}
                        </h3>
                        
                        <p className="text-gray-400 text-sm leading-relaxed flex-grow line-clamp-4 mb-6">
                          {description}
                        </p>

                        <div className="flex items-center gap-4 text-xs font-medium text-gray-400 mt-auto pt-4 border-t border-transparent group-hover:border-white/5 transition-colors">
                          <div className="flex items-center gap-1.5 uppercase">
                            <BarChart className="w-3.5 h-3.5 text-gray-500" />
                            {label1}
                          </div>
                          
                          <div className="flex items-center gap-2 ml-auto">
                            <span className="text-gray-500">From</span>
                            <div className="flex -space-x-1">
                              {activeTab === "products" && (
                                <>
                                  <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-[#1c1c1c] flex items-center justify-center"><Eye className="w-2.5 h-2.5 text-blue-400" /></div>
                                  <div className="w-5 h-5 rounded-full bg-pink-500/20 border border-[#1c1c1c] flex items-center justify-center"><Heart className="w-2.5 h-2.5 text-pink-400" /></div>
                                </>
                              )}
                              {activeTab === "jobs" && (
                                <>
                                  <div className="w-5 h-5 rounded-full bg-green-500/20 border border-[#1c1c1c] flex items-center justify-center"><Building className="w-2.5 h-2.5 text-green-400" /></div>
                                  <div className="w-5 h-5 rounded-full bg-orange-500/20 border border-[#1c1c1c] flex items-center justify-center"><MapPin className="w-2.5 h-2.5 text-orange-400" /></div>
                                </>
                              )}
                              {activeTab === "communities" && (
                                <>
                                  {item.logo ? (
                                    <div className="w-5 h-5 rounded-full overflow-hidden border border-[#1c1c1c] flex items-center justify-center bg-white/5 relative z-10">
                                      <img src={item.logo} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-[#1c1c1c] flex items-center justify-center relative z-10"><Users className="w-2.5 h-2.5 text-purple-400" /></div>
                                  )}
                                </>
                              )}
                              {activeTab === "news" && (
                                <>
                                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-[#1c1c1c] flex items-center justify-center"><Eye className="w-2.5 h-2.5 text-indigo-400" /></div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}

