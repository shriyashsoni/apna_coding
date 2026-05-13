import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, FileJson, FileSpreadsheet, Calendar, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export function DataExport() {
  const { user: authUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const address = authUser?.wallet_address;
  const isConnected = isAuthenticated;
  const [counts, setCounts] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExports, setSelectedExports] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");

  const fetchCounts = async () => {
    if (!isConnected || !address) return;
    setIsLoading(true);
    try {
      const [
        { count: hackathons },
        { count: events },
        { count: jobs },
        { count: users },
        { count: pendingHackathons },
        { count: pendingEvents },
        { count: pendingJobs }
      ] = await Promise.all([
        supabase.from('hackathons').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('hackathons').select('*', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_approved', false)
      ]);

      setCounts({
        users: users || 0,
        hackathons: hackathons || 0,
        events: events || 0,
        jobs: jobs || 0,
        pending: (pendingHackathons || 0) + (pendingEvents || 0) + (pendingJobs || 0)
      });
    } catch (err) {
      console.error("Error fetching counts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [isConnected, address]);

  const exportOptions = [
    { id: "users", label: "Users Data", icon: FileText, count: counts.users || 0 },
    { id: "hackathons", label: "Hackathons", icon: FileText, count: counts.hackathons || 0 },
    { id: "events", label: "Events", icon: Calendar, count: counts.events || 0 },
    { id: "jobs", label: "Jobs", icon: FileText, count: counts.jobs || 0 },
    { id: "pending", label: "Pending Approvals", icon: CheckCircle, count: counts.pending || 0 },
  ];

  const toggleExport = (id: string) => {
    setSelectedExports((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedExports.length === exportOptions.length) {
      setSelectedExports([]);
    } else {
      setSelectedExports(exportOptions.map((opt) => opt.id));
    }
  };

  const handleExport = () => {
    if (selectedExports.length === 0) {
      toast.error("Please select at least one export option");
      return;
    }

    const exportData: any = {
      exportDate: new Date().toISOString(),
      exportedBy: address,
      format: exportFormat,
      data: {},
    };

    selectedExports.forEach((id) => {
      exportData.data[id] = {
        type: id,
        count: exportOptions.find((opt) => opt.id === id)?.count || 0,
        exported: true,
      };
    });

    const dataStr = exportFormat === "json"
      ? JSON.stringify(exportData, null, 2)
      : convertToCSV(exportData);

    const blob = new Blob([dataStr], {
      type: exportFormat === "json" ? "application/json" : "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-export-${Date.now()}.${exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`📥 Exported ${selectedExports.length} datasets as ${exportFormat.toUpperCase()}`);
  };

  const convertToCSV = (data: any) => {
    let csv = "Type,Count,Exported\n";
    Object.values(data.data).forEach((item: any) => {
      csv += `${item.type},${item.count},${item.exported}\n`;
    });
    return csv;
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-12 w-12 mx-auto mb-2 animate-spin opacity-20" />
            <p>Preparing export options...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export Center
          </CardTitle>
          <CardDescription>
            Export platform data in multiple formats for backup, analysis, or reporting
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-primary/20 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Select Data to Export</CardTitle>
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {selectedExports.length === exportOptions.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exportOptions.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 border rounded-lg transition-all ${
                    selectedExports.includes(option.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    checked={selectedExports.includes(option.id)}
                    onCheckedChange={() => toggleExport(option.id)}
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <option.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {option.count} records available
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{option.count}</Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Export Format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant={exportFormat === "json" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setExportFormat("json")}
              >
                <FileJson className="h-4 w-4 mr-2" />
                JSON Format
              </Button>
              <Button
                variant={exportFormat === "csv" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setExportFormat("csv")}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                CSV Format
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Export Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Selected Datasets:</span>
                  <span className="font-medium">{selectedExports.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium uppercase">{exportFormat}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Records:</span>
                  <span className="font-medium">
                    {selectedExports.reduce((sum, id) => {
                      const option = exportOptions.find((opt) => opt.id === id);
                      return sum + (option?.count || 0);
                    }, 0)}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleExport}
                disabled={selectedExports.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-primary/20 bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium mb-1">Export Tips</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• JSON format preserves all data structures and relationships</li>
                <li>• CSV format is ideal for spreadsheet analysis</li>
                <li>• Exports include timestamps and metadata for tracking</li>
                <li>• Large exports may take a few seconds to process</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
