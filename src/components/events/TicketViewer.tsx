import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, User, ShieldCheck } from "lucide-react";

interface TicketViewerProps {
  registrationId: string;
  eventTitle: string;
  eventDate: number | string;
  eventLocation: string;
  guestName: string;
  guestWallet: string;
  status: string;
}

export function TicketViewer({
  registrationId,
  eventTitle,
  eventDate,
  eventLocation,
  guestName,
  guestWallet,
  status
}: TicketViewerProps) {
  const dateObj = new Date(eventDate);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    JSON.stringify({ registrationId, type: "checkin" })
  )}&color=0-255-255&bgcolor=10-10-20`;

  return (
    <Card className="relative overflow-hidden border-2 border-cyan-500/30 bg-slate-950 text-slate-100 max-w-sm mx-auto shadow-[0_0_25px_rgba(6,182,212,0.15)]">
      {/* Decorative cyber elements */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500" />
      
      {/* Ticket Tear Line (dashed line with punches) */}
      <div className="absolute left-0 right-0 top-[65%] flex items-center justify-between pointer-events-none">
        <div className="w-4 h-8 bg-background rounded-r-full -ml-2 border-r border-cyan-500/20" />
        <div className="flex-1 border-t-2 border-dashed border-cyan-500/30 mx-2" />
        <div className="w-4 h-8 bg-background rounded-l-full -mr-2 border-l border-cyan-500/20" />
      </div>

      <CardContent className="p-6 pb-8">
        {/* Badge status */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" />
            Verified Pass
          </span>
          <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {status}
          </span>
        </div>

        {/* Event Meta */}
        <div className="space-y-4 mb-8">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white mb-1 line-clamp-2">
              {eventTitle}
            </h3>
            <p className="text-xs text-slate-400">APNA_CODING OFFICIAL EVENT</p>
          </div>

          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan-500 flex-shrink-0" />
              <span>{formattedDate} at {formattedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-500 flex-shrink-0" />
              <span className="truncate">{eventLocation}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-cyan-500 flex-shrink-0" />
              <span className="truncate">{guestName} ({guestWallet.slice(0, 6)}...{guestWallet.slice(-4)})</span>
            </div>
          </div>
        </div>

        {/* QR Scanner Area */}
        <div className="flex flex-col items-center justify-center pt-8 border-t border-slate-800">
          <div className="p-2 bg-slate-900 border border-cyan-500/20 rounded-lg mb-3">
            <img
              src={qrCodeUrl}
              alt="Scan Check-in QR"
              className="w-[140px] h-[140px] object-contain"
            />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-cyan-500/60 uppercase">
            REF: {registrationId.slice(0, 8)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
