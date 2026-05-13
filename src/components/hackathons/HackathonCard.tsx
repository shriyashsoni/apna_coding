import { motion } from "framer-motion";
import { Trophy, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useSupabaseMutation } from "@/hooks/useSupabase";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HackathonCardProps {
  hackathon: any;
  index: number;
  showDelete?: boolean;
}

export function HackathonCard({ hackathon, index, showDelete = true }: HackathonCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutate: deleteHackathonMutate } = useSupabaseMutation('hackathons');

  const formatDateLabel = (value?: number) => {
    if (typeof value !== "number") return "Date TBA";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date TBA";
    return date.toLocaleDateString();
  };

  const handleDelete = async () => {
    try {
      await deleteHackathonMutate('delete', null, { id: hackathon.id });
      toast.success("Hackathon deleted successfully");
    } catch (error) {
      toast.error("Failed to delete hackathon");
      console.error(error);
    }
  };

  const prizeLabel = hackathon.prizes || hackathon.prizePool || "Prize TBA";
  const statusLabel = hackathon.status || "upcoming";
  const startLabel = formatDateLabel(hackathon.start_date);
  const endLabel = formatDateLabel(hackathon.end_date);

  // Check if current user can delete this hackathon
  const SUPER_ADMIN_WALLET = "0x9D307F0C1B614C9088Aa83eAE9AA3D9779c4921D";
  const isAdmin = user?.role === "admin" || user?.wallet_address?.toLowerCase() === SUPER_ADMIN_WALLET.toLowerCase();
  const isCreator = hackathon.organizer_wallet && user?.wallet_address && 
    hackathon.organizer_wallet.toLowerCase() === user.wallet_address.toLowerCase();
  const canDelete = showDelete && (isAdmin || isCreator);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group flex flex-col md:flex-row bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-all hover:shadow-lg"
    >
      <div className="md:w-64 h-48 md:h-auto bg-muted/50 relative">
        {(hackathon.bannerImage || hackathon.posterImage || hackathon.image) ? (
          <img
            src={hackathon.bannerImage || hackathon.posterImage || hackathon.image}
            alt={hackathon.title || hackathon.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src === hackathon.bannerImage && hackathon.posterImage) {
                img.src = hackathon.posterImage;
              } else if (img.src === hackathon.posterImage && hackathon.image) {
                img.src = hackathon.image;
              } else {
                img.style.display = 'none';
                img.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10"><svg class="h-12 w-12 text-primary/40" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></div>';
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <Trophy className="h-12 w-12 text-primary/40" />
          </div>
        )}
        <div className="absolute top-2 left-2 bg-background/90 text-foreground text-xs px-2 py-1 rounded border border-border uppercase font-bold backdrop-blur-sm">
          {statusLabel}
        </div>
      </div>
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
              {hackathon.title || hackathon.name}
            </h3>
            <span className="text-primary font-mono text-sm border border-primary/30 px-2 py-1 rounded bg-primary/10">
              {prizeLabel}
            </span>
          </div>
          <p className="text-muted-foreground mb-4 line-clamp-2">{hackathon.description}</p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground items-center mt-4 pt-4 border-t border-border">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            {startLabel} - {endLabel}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/hackathons/${hackathon.slug || hackathon.id}`)}
            >
              View Details
            </Button>
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Hackathon</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{hackathon.title || hackathon.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}