import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Award, ExternalLink, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";

interface Certificate {
  id: string;
  event_name: string;
  event_type: string;
  certificate_type: string;
  achievement?: string;
  verified: boolean;
  nft_minted: boolean;
}

interface ActivityStatsCardProps {
  certificates: Certificate[] | undefined;
}

export function ActivityStatsCard({ certificates }: ActivityStatsCardProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Your Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded border border-primary/10">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" />
              <span className="text-sm">Hackathons</span>
            </div>
            <span className="font-bold text-accent">0</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded border border-primary/10">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-secondary" />
              <span className="text-sm">Events</span>
            </div>
            <span className="font-bold text-secondary">0</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded border border-primary/10">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm">Certificates</span>
            </div>
            <span className="font-bold text-primary">{certificates?.length || 0}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            My Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certificates === undefined ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Loading certificates...
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-6">
              <Award className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No certificates yet</p>
              <p className="text-xs text-muted-foreground mt-1">Participate in hackathons to earn certificates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.slice(0, 3).map((cert) => (
                <div
                  key={cert.id}
                  className="p-3 bg-muted/30 rounded border border-primary/10 hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => navigate("/certificates")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate">
                        {cert.event_name}
                      </h4>
                      <div className="flex gap-2 items-center mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {cert.event_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {cert.certificate_type.charAt(0).toUpperCase() + cert.certificate_type.slice(1)}
                        </span>
                      </div>
                      {cert.achievement && (
                        <p className="text-xs text-primary mt-1">{cert.achievement}</p>
                      )}
                    </div>
                    {cert.nft_minted ? (
                      <Sparkles className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : cert.verified ? (
                      <Trophy className="h-4 w-4 text-accent flex-shrink-0" />
                    ) : null}
                  </div>
                </div>
              ))}
              {certificates.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate("/certificates")}
                >
                  View All {certificates.length} Certificates
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm">
        <CardContent className="pt-6">
          <h3 className="font-bold mb-2">Ready to contribute?</h3>
          <p className="text-sm text-muted-foreground mb-4">Start creating hackathons, events, and job postings.</p>
          <div className="space-y-2">
            <Button onClick={() => navigate("/hackathons")} variant="outline" className="w-full border-primary/30">
              Create Hackathon
            </Button>
            <Button onClick={() => navigate("/events")} variant="outline" className="w-full border-primary/30">
              Create Event
            </Button>
            <Button onClick={() => navigate("/certificates")} variant="outline" className="w-full border-primary/30">
              View Certificates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
