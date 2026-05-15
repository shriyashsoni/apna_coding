import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, Shield, FileText, ChevronDown } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useAdmin } from "@/hooks/useAdmin";

export function LogoDropdown() {
  const { authenticated } = usePrivy();
  const { isAdmin } = useAdmin();


  if (!authenticated) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
        >
          <User className="mr-2 h-4 w-4" />
          Account
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 border-primary/30 bg-card">
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/my-content" className="cursor-pointer">
            <FileText className="mr-2 h-4 w-4" />
            My Content
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator className="bg-primary/20" />
            <DropdownMenuItem asChild>
              <Link to="/admin" className="cursor-pointer text-primary">
                <Shield className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
