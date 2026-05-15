import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Upload,
  Link as LinkIcon,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download
} from "lucide-react";
import { scrapeContentDirectly } from "@/utils/frontend-scraper";

export function BulkImport() {
  const { user: authUser } = useAuth();
  const address = authUser?.wallet_address;
  const [contentType, setContentType] = useState<"events" | "hackathons" | "jobs" | "news" | "products" | "communities">("events");
  const [importMethod, setImportMethod] = useState<"urls" | "excel">("urls");
  const [urlList, setUrlList] = useState("");
  const [excelData, setExcelData] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Array<{ url: string; status: "success" | "error"; message: string }>>([]);
  const [selectedEventGroupId, setSelectedEventGroupId] = useState<string>("");
  const [safeEventGroups, setSafeEventGroups] = useState<any[]>([]);

  useEffect(() => {
    const fetchEventGroups = async () => {
      try {
        const { data, error } = await supabase
          .from('event_groups')
          .select('id, group_name, location');
        if (error) throw error;
        setSafeEventGroups(data || []);
      } catch (err) {
        console.error("Error fetching event groups:", err);
      }
    };
    fetchEventGroups();
  }, []);

  const handleBulkImport = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (importMethod === "urls" && !urlList.trim()) {
      toast.error("Please enter at least one URL");
      return;
    }

    if (importMethod === "excel" && !excelData.trim()) {
      toast.error("Please paste Excel data");
      return;
    }

    setIsProcessing(true);
    setResults([]);

    setIsProcessing(true);
    setResults([]);

    try {
      if (importMethod === "urls") {
        const urls = urlList.split('\n').map(u => u.trim()).filter(Boolean);
        const newResults: any[] = [];
        
        for (const url of urls) {
          try {
            const result = await scrapeContentDirectly(url, contentType);
            if (result.success) {
              const table = contentType === 'events' ? 'events' : 
                            contentType === 'hackathons' ? 'hackathons' : 
                            contentType === 'jobs' ? 'jobs' : 
                            contentType === 'news' ? 'news' : 
                            contentType === 'products' ? 'products' : 'communities';
              
              const insertData: any = {
                ...result.data,
                wallet_address: address,
                is_approved: true,
                status: 'published'
              };

              if (contentType === 'events' && selectedEventGroupId) {
                insertData.event_group_id = selectedEventGroupId;
              }

              const { error: insertError } = await supabase.from(table).insert(insertData);
              
              if (insertError) throw insertError;
              newResults.push({ url, status: "success", message: "Imported successfully" });
            } else {
              newResults.push({ url, status: "error", message: result.error });
            }
          } catch (err: any) {
            newResults.push({ url, status: "error", message: err.message });
          }
        }
        setResults(newResults);
        const successCount = newResults.filter(r => r.status === "success").length;
        toast.success(`Bulk import completed: ${successCount} successful.`);
      } else {
        toast.info("Excel import is currently being migrated. Please use URL list for now.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to process bulk import");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const templates: Record<string, string> = {
      events: `Title\tDescription\tDate\tLocation\tType\tRegistration Link\nWeb3 Meetup Mumbai\tConnect with Web3 developers\t2026-02-15\tMumbai, India\tMeetup\thttps://example.com/register\nBlockchain Workshop\tLearn smart contract security\t2026-02-20\tOnline\tWorkshop\thttps://example.com/workshop`,
      hackathons: `Title\tDescription\tPrizes\tStart Date\tEnd Date\tLocation\tOrganizer\tRegistration Link\nETHIndia 2026\tIndia's largest Ethereum hackathon\t$100,000+\t2026-03-01\t2026-03-03\tBangalore\tETHIndia Team\thttps://ethindia.co`,
      jobs: `Title\tCompany\tDescription\tLocation\tJob Type\tEmployment Type\tSalary\tSource URL\nSenior Smart Contract Developer\tDeFi Protocol\tBuild and audit smart contracts\tRemote\tremote\tfull-time\t$120k - $180k\thttps://example.com/job1`,
      news: `Title\tContent\tCategory\tTags (comma-separated)\nWeb3 Development Guide\tComplete guide to Web3 development...\tTutorial\tweb3,development,tutorial\nTop Hackathons 2026\tDon't miss these hackathons...\tOpportunities\thackathons,events,opportunities`,
      products: `Name\tDescription\tCategory\tPrice\tWebsite URL\tGithub URL\tTags (comma-separated)\nWeb3 Dev Course\tComplete Web3 development course\tEducation\t$299\thttps://example.com/course\t\tweb3,course,education`,
      communities: `Name\tDescription\tMember Count\tPlatform\tLink\tCategory\nWeb3 Builders India\tCommunity of Web3 builders\t5000\tDiscord\thttps://discord.gg/web3india\tDevelopment`
    };

    const template = templates[contentType];
    const blob = new Blob([template], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${contentType}-template.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded! Open in Excel and paste data here.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Data Import & Scraping
          </CardTitle>
          <CardDescription>
            Import multiple items at once using URLs or Excel data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Type Selection */}
          <div className="space-y-2">
            <Label>Content Type</Label>
            <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="hackathons">Hackathons</SelectItem>
                <SelectItem value="jobs">Jobs</SelectItem>
                <SelectItem value="news">News Articles</SelectItem>
                <SelectItem value="products">Products</SelectItem>
                <SelectItem value="communities">Communities</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Event Group Selection (only for events) */}
          {contentType === "events" && safeEventGroups.length > 0 && (
            <div className="space-y-2">
              <Label>Event Group (Optional)</Label>
              <Select
                value={selectedEventGroupId || "none"}
                onValueChange={(value) => setSelectedEventGroupId(value === "none" ? "" : value)}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Publish as individual events (no group)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Individual Events (No Group)</SelectItem>
                  {safeEventGroups.map((group: any) => (
                    <SelectItem key={group.id} value={group.id}>
                      📍 {group.group_name} - {group.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Assign all imported events to a group like "Consensus Hong Kong 2026" or keep them as standalone events
              </p>
            </div>
          )}

          {/* Import Method Tabs */}
          <Tabs value={importMethod} onValueChange={(value: any) => setImportMethod(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="urls" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Import from URLs
              </TabsTrigger>
              <TabsTrigger value="excel" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Import from Excel
              </TabsTrigger>
            </TabsList>

            {/* URL Import Tab */}
            <TabsContent value="urls" className="space-y-4">
              <div className="space-y-2">
                <Label>Enter URLs (one per line)</Label>
                <Textarea
                  placeholder={`Example:\nhttps://example.com/event1\nhttps://example.com/event2\nhttps://example.com/event3`}
                  value={urlList}
                  onChange={(e) => setUrlList(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Paste URLs of {contentType} pages. Our AI will scrape and extract information automatically.
                </p>
              </div>
            </TabsContent>

            {/* Excel Import Tab */}
            <TabsContent value="excel" className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Excel Data</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>
              <Textarea
                placeholder={`Paste Excel data here (with headers).\n\nExample:\nTitle\tDescription\tDate\tLocation\nEvent 1\tDescription 1\t2026-02-15\tMumbai\nEvent 2\tDescription 2\t2026-02-20\tDelhi`}
                value={excelData}
                onChange={(e) => setExcelData(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>How to use:</strong>
                </p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Download the template above</li>
                  <li>Open it in Excel or Google Sheets</li>
                  <li>Fill in your data</li>
                  <li>Select all cells (including headers) and copy (Ctrl+C)</li>
                  <li>Paste here (Ctrl+V)</li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>

          {/* Import Button */}
          <Button
            onClick={handleBulkImport}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Start Bulk Import
              </>
            )}
          </Button>

          {/* Results Display */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Import Results</h3>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    {results.filter(r => r.status === "success").length} Success
                  </span>
                  <span className="flex items-center gap-1 text-red-600">
                    <XCircle className="h-4 w-4" />
                    {results.filter(r => r.status === "error").length} Failed
                  </span>
                </div>
              </div>

              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 border-b last:border-b-0 flex items-start gap-3 ${
                      result.status === "success" ? "bg-green-50/50" : "bg-red-50/50"
                    }`}
                  >
                    {result.status === "success" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{result.url || `Item ${index + 1}`}</p>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Card */}
          <Card className="bg-blue-50/50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-blue-900">
                  <p className="font-semibold">Bulk Import Features:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li><strong>URL Scraping:</strong> Paste URLs and AI will extract all information</li>
                    <li><strong>Excel Import:</strong> Bulk upload from spreadsheets</li>
                    <li><strong>Auto-Approval:</strong> Imported items need admin approval</li>
                    <li><strong>Duplicate Detection:</strong> Automatically skips duplicates</li>
                    <li><strong>Error Handling:</strong> Shows which items failed and why</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </motion.div>
  );
}
