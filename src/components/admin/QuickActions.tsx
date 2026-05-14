import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Users, Mail, Settings, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface QuickActionsProps {
  onTabChange: (tab: string) => void;
}

export function QuickActions({ onTabChange }: QuickActionsProps) {
  const actions = [
    {
      title: "Publish Content",
      description: "Add hackathons, events, or jobs",
      icon: Sparkles,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      action: () => onTabChange("publisher"),
    },
    {
      title: "Review Approvals",
      description: "Approve pending content",
      icon: Shield,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      action: () => onTabChange("approvals"),
    },
    {
      title: "Manage Permissions",
      description: "Grant user permissions",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      action: () => onTabChange("permissions"),
    },
    {
      title: "Send Email Campaign",
      description: "Email partnerships",
      icon: Mail,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      action: () => onTabChange("ai-email"),
    },
    {
      title: "Update Sitemap",
      description: "Refresh SEO indexing",
      icon: FileText,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      action: async () => {
        try {
          const { data, error } = await supabase.functions.invoke('generate-sitemap');
          if (error) throw error;
          toast.success("Sitemap XML generated successfully!");
          // Open in new tab to verify
          const blob = new Blob([data], { type: 'application/xml' });
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
        } catch (err) {
          toast.error("Failed to generate sitemap");
        }
      },
    },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>Common admin tasks at your fingertips</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className="w-full h-auto p-4 flex flex-col items-start gap-2 hover:border-primary/50"
                onClick={action.action}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={`${action.bgColor} p-2 rounded-lg`}>
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
