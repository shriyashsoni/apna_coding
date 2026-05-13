import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Calendar, Trophy, Briefcase, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export function SearchFilter() {
  const { user: authUser } = useAuth();
  const address = authUser?.wallet_address;
  const [searchTerm, setSearchTerm] = useState("");
  const [contentType, setContentType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!address) return;
    setIsSearching(true);
    try {
      let allResults: any[] = [];
      const typesToFetch = contentType === "all" 
        ? ["hackathons", "events", "jobs"] 
        : [contentType === "hackathon" ? "hackathons" : contentType === "event" ? "events" : "jobs"];

      const queries = typesToFetch.map(async (table) => {
        let query = supabase.from(table).select('*');
        
        if (searchTerm.trim()) {
          // Supabase doesn't support complex cross-table searches easily without edge functions or RPC
          // We'll do a simple text search if possible, or filter locally if needed.
          // For now, let's use ilike on name/title
          const column = table === 'hackathons' ? 'name' : 'title';
          query = query.ilike(column, `%${searchTerm}%`);
        }

        if (statusFilter !== "all") {
          query = query.eq('is_approved', statusFilter === 'approved');
        }

        const { data, error } = await query;
        if (error) throw error;
        
        return (data || []).map(item => ({
          ...item,
          type: table.replace('s', ''), // hackathons -> hackathon
          title: item.title || item.name,
          approvalStatus: item.is_approved ? 'approved' : 'pending',
          _id: item.id // for key compatibility
        }));
      });

      const resultsArray = await Promise.all(queries);
      allResults = resultsArray.flat();
      
      // Secondary local filter for description if needed
      if (searchTerm.trim()) {
        allResults = allResults.filter(item => 
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setResults(allResults);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setContentType("all");
    setStatusFilter("all");
    setResults([]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hackathon":
        return <Trophy className="h-4 w-4 text-purple-500" />;
      case "event":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "job":
        return <Briefcase className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "hackathon":
        return "text-purple-500 bg-purple-500/10";
      case "event":
        return "text-blue-500 bg-blue-500/10";
      case "job":
        return "text-green-500 bg-green-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
          <CardDescription>
            Search through all content and apply filters to find specific items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Term</label>
              <Input
                placeholder="Search by title, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content Type</label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hackathon">Hackathons</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="job">Jobs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex-1" disabled={isSearching}>
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {(searchTerm || contentType !== "all" || statusFilter !== "all") && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary">
                  Search: {searchTerm}
                </Badge>
              )}
              {contentType !== "all" && (
                <Badge variant="secondary">
                  Type: {contentType}
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary">
                  Status: {statusFilter}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Search Results ({results.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {item.description?.substring(0, 100)}...
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.type}
                      </Badge>
                      <Badge
                        variant={
                          item.approvalStatus === "approved"
                            ? "default"
                            : item.approvalStatus === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs capitalize"
                      >
                        {item.approvalStatus || "pending"}
                      </Badge>
                      {item.company && (
                        <span className="text-xs text-muted-foreground">
                          at {item.company}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
