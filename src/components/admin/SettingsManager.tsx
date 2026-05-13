import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, Globe, Shield, Bell, Mail, Palette, Code } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function SettingsManager() {
  const [settings, setSettings] = useState({
    siteName: "Apna Coding",
    siteDescription: "Web3 learning and opportunities platform",
    siteUrl: "https://apnacoding.com",
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    autoApproval: false,
    maxUploadSize: "10",
    sessionTimeout: "30",
    darkMode: true,
    analyticsEnabled: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    toast.info("💾 Saving settings...");

    try {
      // Simulate save operation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("✅ Settings saved successfully!");
    } catch (error) {
      toast.error("❌ Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const settingSections = [
    {
      title: "General Settings",
      icon: Globe,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      fields: [
        {
          type: "text",
          key: "siteName",
          label: "Site Name",
          description: "The name of your platform",
        },
        {
          type: "textarea",
          key: "siteDescription",
          label: "Site Description",
          description: "A brief description of your platform",
        },
        {
          type: "text",
          key: "siteUrl",
          label: "Site URL",
          description: "Your platform's primary URL",
        },
      ],
    },
    {
      title: "Security & Access",
      icon: Shield,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      fields: [
        {
          type: "switch",
          key: "maintenanceMode",
          label: "Maintenance Mode",
          description: "Put the site in maintenance mode",
        },
        {
          type: "switch",
          key: "registrationEnabled",
          label: "User Registration",
          description: "Allow new user registrations",
        },
        {
          type: "text",
          key: "sessionTimeout",
          label: "Session Timeout (minutes)",
          description: "How long before users are logged out",
        },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      fields: [
        {
          type: "switch",
          key: "emailNotifications",
          label: "Email Notifications",
          description: "Send email notifications to users",
        },
        {
          type: "switch",
          key: "autoApproval",
          label: "Auto-Approve Content",
          description: "Automatically approve submitted content (not recommended)",
        },
      ],
    },
    {
      title: "Platform Settings",
      icon: Code,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      fields: [
        {
          type: "text",
          key: "maxUploadSize",
          label: "Max Upload Size (MB)",
          description: "Maximum file upload size",
        },
        {
          type: "switch",
          key: "analyticsEnabled",
          label: "Analytics Tracking",
          description: "Enable platform analytics",
        },
        {
          type: "switch",
          key: "darkMode",
          label: "Dark Mode Default",
          description: "Set dark mode as default theme",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Platform Settings
          </CardTitle>
          <CardDescription>
            Configure global settings and preferences for your platform
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {settingSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`${section.bgColor} p-3 rounded-lg`}>
                    <section.icon className={`h-5 w-5 ${section.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Configure {section.title.toLowerCase()} for your platform
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    {field.type === "switch" ? (
                      <div className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <Label htmlFor={field.key} className="text-base">
                            {field.label}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {field.description}
                          </p>
                        </div>
                        <Switch
                          id={field.key}
                          checked={settings[field.key as keyof typeof settings] as boolean}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, [field.key]: checked })
                          }
                        />
                      </div>
                    ) : field.type === "textarea" ? (
                      <div className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Textarea
                          id={field.key}
                          value={settings[field.key as keyof typeof settings] as string}
                          onChange={(e) =>
                            setSettings({ ...settings, [field.key]: e.target.value })
                          }
                          rows={3}
                        />
                        <p className="text-sm text-muted-foreground">{field.description}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Input
                          id={field.key}
                          value={settings[field.key as keyof typeof settings] as string}
                          onChange={(e) =>
                            setSettings({ ...settings, [field.key]: e.target.value })
                          }
                        />
                        <p className="text-sm text-muted-foreground">{field.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-primary/20 bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium mb-1">Save Changes</p>
              <p className="text-sm text-muted-foreground">
                Make sure to save your changes before leaving this page
              </p>
            </div>
            <Button onClick={handleSaveSettings} disabled={isSaving} size="lg">
              {isSaving ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-pulse" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
