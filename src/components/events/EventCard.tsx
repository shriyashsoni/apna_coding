import { motion } from "framer-motion";
import { Calendar, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupabaseMutation } from "@/hooks/useSupabase";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router";
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

interface EventCardProps {
  event: any;
  index: number;
  showDelete?: boolean;
  onDelete?: () => void;
}

export function EventCard({ event, index, showDelete = false, onDelete }: EventCardProps) {
  const { user } = useAuth();
  const { mutate: deleteEventMutate } = useSupabaseMutation('events');

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    if (!user?.walletAddress) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      await deleteEventMutate('delete', null, { id: event.id });
      toast.success("Event deleted successfully");
      if (onDelete) onDelete();
    } catch (error) {
      toast.error("Failed to delete event");
      console.error(error);
    }
  };

  // Check if current user can delete this event
  const SUPER_ADMIN_WALLET = "0x9D307F0C1B614C9088Aa83eAE9AA3D9779c4921D";
  const isAdmin = user?.role === "admin" || user?.wallet_address?.toLowerCase() === SUPER_ADMIN_WALLET.toLowerCase();
  const isCreator = event.organizer_wallet && user?.wallet_address && 
    event.organizer_wallet.toLowerCase() === user.wallet_address.toLowerCase();
  const canDelete = showDelete && (isAdmin || isCreator);

  return (
    <Link to={`/events/${event.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-all hover:shadow-lg cursor-pointer"
      >
        <div className="h-48 bg-muted/50 relative">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const img = e.currentTarget;
              img.style.display = 'none';
              img.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10"><svg class="h-12 w-12 text-primary/40" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg></div>';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <Calendar className="h-12 w-12 text-primary/40" />
          </div>
        )}
        <div className="absolute top-2 left-2 bg-background/90 text-foreground text-xs px-2 py-1 rounded border border-border uppercase font-bold backdrop-blur-sm">
          {event.type}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
            {event.title}
          </h3>
        </div>
        
        <p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
        
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground items-center pt-4 border-t border-border">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            {event.location}
          </div>
          
          {canDelete && (
            <div className="ml-auto">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Event</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{event.title}"? This action cannot be undone.
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
            </div>
          )}
        </div>
      </div>
    </motion.div>
    </Link>
  );
}