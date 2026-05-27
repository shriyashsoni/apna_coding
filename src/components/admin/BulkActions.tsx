import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Download, Loader2, Eye, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

type SelectedItem = {
  id: string;
  type: "hackathon" | "event" | "job";
};

export function BulkActions() {
  const { user: authUser } = useAuth();
  const address = authUser?.wallet_address;
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeduplicating, setIsDeduplicating] = useState(false);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleAIDeduplicate = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsDeduplicating(true);
    toast.info("🧠 AI Analysis: Scanning database for duplicates...");

    try {
      // 1. Scan Hackathons
      const { data: hackathons } = await supabase
        .from('hackathons')
        .select('id, name, registration_link')
        .order('created_at', { ascending: true });

      const seenHNames = new Set();
      const seenHLinks = new Set();
      const duplicateHIds: string[] = [];

      if (hackathons) {
        hackathons.forEach(h => {
          const cleanName = h.name.trim().toLowerCase();
          const cleanLink = h.registration_link ? h.registration_link.trim().toLowerCase().replace(/\/$/, "") : null;
          
          if (seenHNames.has(cleanName) || (cleanLink && seenHLinks.has(cleanLink))) {
            duplicateHIds.push(h.id);
          } else {
            seenHNames.add(cleanName);
            if (cleanLink) seenHLinks.add(cleanLink);
          }
        });
      }

      // 2. Scan Events
      const { data: events } = await supabase
        .from('events')
        .select('id, title, registration_link')
        .order('created_at', { ascending: true });

      const seenETitles = new Set();
      const seenELinks = new Set();
      const duplicateEIds: string[] = [];

      if (events) {
        events.forEach(e => {
          const cleanTitle = e.title.trim().toLowerCase();
          const cleanLink = e.registration_link ? e.registration_link.trim().toLowerCase().replace(/\/$/, "") : null;

          if (seenETitles.has(cleanTitle) || (cleanLink && seenELinks.has(cleanLink))) {
            duplicateEIds.push(e.id);
          } else {
            seenETitles.add(cleanTitle);
            if (cleanLink) seenELinks.add(cleanLink);
          }
        });
      }

      // 3. Scan Jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, link')
        .order('created_at', { ascending: true });

      const seenJTitles = new Set();
      const seenJLinks = new Set();
      const duplicateJIds: string[] = [];

      if (jobs) {
        jobs.forEach(j => {
          const cleanTitle = j.title.trim().toLowerCase();
          const cleanLink = j.link ? j.link.trim().toLowerCase().replace(/\/$/, "") : null;

          if (seenJTitles.has(cleanTitle) || (cleanLink && seenJLinks.has(cleanLink))) {
            duplicateJIds.push(j.id);
          } else {
            seenJTitles.add(cleanTitle);
            if (cleanLink) seenJLinks.add(cleanLink);
          }
        });
      }

      const totalDuplicates = duplicateHIds.length + duplicateEIds.length + duplicateJIds.length;

      if (totalDuplicates === 0) {
        toast.success("✨ Database is clean! No duplicates found.");
        setIsDeduplicating(false);
        return;
      }

      if (!confirm(`🧠 AI Analysis found ${totalDuplicates} duplicates:\n- Hackathons: ${duplicateHIds.length}\n- Events: ${duplicateEIds.length}\n- Jobs: ${duplicateJIds.length}\n\nDo you want to delete these duplicates, leaving exactly one distinct copy of each opportunity?`)) {
        setIsDeduplicating(false);
        return;
      }

      const deletePromises = [];
      if (duplicateHIds.length > 0) {
        deletePromises.push(supabase.from('hackathons').delete().in('id', duplicateHIds));
      }
      if (duplicateEIds.length > 0) {
        deletePromises.push(supabase.from('events').delete().in('id', duplicateEIds));
      }
      if (duplicateJIds.length > 0) {
        deletePromises.push(supabase.from('jobs').delete().in('id', duplicateJIds));
      }

      await Promise.all(deletePromises);
      toast.success(`🎉 AI Deduplication complete! Removed ${totalDuplicates} redundant items.`);
      fetchPendingItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to run AI Deduplication");
    } finally {
      setIsDeduplicating(false);
    }
  };

  const fetchPendingItems = async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const [
        { data: hackathons },
        { data: events },
        { data: jobs }
      ] = await Promise.all([
        supabase.from('hackathons').select('id, name').eq('is_approved', false),
        supabase.from('events').select('id, title').eq('is_approved', false),
        supabase.from('jobs').select('id, title').eq('is_approved', false)
      ]);

      const items: any[] = [];
      if (hackathons) {
        hackathons.forEach(h => items.push({ id: h.id, title: h.name, type: 'hackathon', status: 'pending' }));
      }
      if (events) {
        events.forEach(e => items.push({ id: e.id, title: e.title, type: 'event', status: 'pending' }));
      }
      if (jobs) {
        jobs.forEach(j => items.push({ id: j.id, title: j.title, type: 'job', status: 'pending' }));
      }
      setAllItems(items);
    } catch (err) {
      console.error("Error fetching pending items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingItems();
  }, [address]);

  const toggleItem = (id: string, type: "hackathon" | "event" | "job") => {
    setSelectedItems((prev) => {
      const exists = prev.find((item) => item.id === id);
      if (exists) {
        return prev.filter((item) => item.id !== id);
      } else {
        return [...prev, { id, type }];
      }
    });
  };

  const toggleAll = () => {
    if (selectedItems.length === allItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allItems.map((item) => ({ id: item.id, type: item.type })));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedItems.length === 0) return;
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsProcessing(true);
    try {
      const hackathonIds = selectedItems.filter(i => i.type === 'hackathon').map(i => i.id);
      const eventIds = selectedItems.filter(i => i.type === 'event').map(i => i.id);
      const jobIds = selectedItems.filter(i => i.type === 'job').map(i => i.id);

      const promises = [];
      if (hackathonIds.length > 0) {
        promises.push(supabase.from('hackathons').update({ is_approved: true }).in('id', hackathonIds));
      }
      if (eventIds.length > 0) {
        promises.push(supabase.from('events').update({ is_approved: true }).in('id', eventIds));
      }
      if (jobIds.length > 0) {
        promises.push(supabase.from('jobs').update({ is_approved: true }).in('id', jobIds));
      }

      await Promise.all(promises);
      toast.success(`✅ Bulk approved ${selectedItems.length} items!`);
      setSelectedItems([]);
      fetchPendingItems();
    } catch (error) {
      toast.error("Failed to process bulk approval");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedItems.length === 0) return;
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsProcessing(true);
    try {
      // Rejection in this context means deleting or marking as rejected. 
      // Current schema only has is_approved. Let's delete them for now or just skip if we want to preserve history.
      // But standard "rejection" in dashboard usually deletes unapproved content.
      const hackathonIds = selectedItems.filter(i => i.type === 'hackathon').map(i => i.id);
      const eventIds = selectedItems.filter(i => i.type === 'event').map(i => i.id);
      const jobIds = selectedItems.filter(i => i.type === 'job').map(i => i.id);

      const promises = [];
      if (hackathonIds.length > 0) {
        promises.push(supabase.from('hackathons').delete().in('id', hackathonIds));
      }
      if (eventIds.length > 0) {
        promises.push(supabase.from('events').delete().in('id', eventIds));
      }
      if (jobIds.length > 0) {
        promises.push(supabase.from('jobs').delete().in('id', jobIds));
      }

      await Promise.all(promises);
      toast.error(`❌ Rejected and removed ${selectedItems.length} items`);
      setSelectedItems([]);
      fetchPendingItems();
    } catch (error) {
      toast.error("Failed to process bulk rejection");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    const dataToExport = allItems.filter((item) =>
      selectedItems.some((selected) => selected.id === item.id)
    );

    const json = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bulk-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("📥 Exported data successfully!");
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Bulk Actions
          </CardTitle>
          <CardDescription>
            Select multiple items and perform actions in bulk to save time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-12 w-12 mx-auto mb-2 opacity-20 animate-spin" />
            <p>Loading pending items...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Standard Bulk Manager
            </CardTitle>
            <CardDescription>
              Select pending items below to approve, reject, or export in bulk.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-purple-500/20 bg-purple-500/5 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="h-24 w-24 text-purple-500" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
              AI-Driven Deduplicator
            </CardTitle>
            <CardDescription>
              Scan all listed hackathons, events, and jobs. Detect formatting variations and redundant URL links to automatically clean up database clutter, leaving exactly one unique record of each opportunity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleAIDeduplicate}
              disabled={isDeduplicating}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-500/30"
            >
              {isDeduplicating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing & Cleaning Database...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run AI Deduplication Tool
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {selectedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3"
        >
          <Badge variant="secondary" className="text-sm px-4 py-2">
            {selectedItems.length} items selected
          </Badge>
          <Button
            size="sm"
            variant="default"
            className="bg-green-500 hover:bg-green-600"
            onClick={handleBulkApprove}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve All
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleBulkReject}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Reject All
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            disabled={isProcessing || selectedItems.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </motion.div>
      )}

      {/* Items List */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Pending Items</CardTitle>
            <Button variant="outline" size="sm" onClick={toggleAll} disabled={isProcessing || allItems.length === 0}>
              {selectedItems.length === allItems.length && allItems.length > 0 ? "Deselect All" : "Select All"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No pending items</p>
              </div>
            ) : (
              allItems.map((item, index) => (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 border rounded-lg transition-all ${
                    selectedItems.some((selected) => selected.id === item.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    checked={selectedItems.some((selected) => selected.id === item.id)}
                    onCheckedChange={() => toggleItem(item.id, item.type)}
                    disabled={isProcessing}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
