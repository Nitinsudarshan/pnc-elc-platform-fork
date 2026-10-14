"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
  Sparkles,
  Shield,
  ShieldAlert,
  History,
  Building,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserContext } from "@/contexts/user-context";
import { CURRENT_VERSION } from "@/lib/version-config";
import { createBrowserClient } from "@supabase/ssr";

function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function HeaderUserMenu() {
  const router = useRouter();
  const user = useUserContext();

  const signOut = async () => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase.auth.signOut();
    } catch {
      // Fallback redirect
    }
    router.push("/login");
  };

  const fullName = user?.name ? toTitleCase(user.name) : "Admin User";
  const firstName = fullName.split(" ")[0];
  const userEmail = user?.email || "admin@navgurukul.org";
  const userAvatar = user?.avatar || "";
  const userRole = user?.role || "Employee";
  const isEmulating = Boolean(user?.isEmulating);
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-2 rounded-lg hover:bg-muted/60 transition-colors">
          <Avatar className="h-7 w-7 rounded-lg border border-border">
            <AvatarImage src={userAvatar} alt={fullName} />
            <AvatarFallback className="rounded-lg text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col text-left leading-tight max-w-[120px]">
            <span className="text-xs font-semibold text-foreground truncate">{firstName}</span>
            <span className="text-[10px] text-muted-foreground truncate">{userRole}</span>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-1 rounded-xl shadow-xl border bg-card">
        <DropdownMenuLabel className="p-2.5 font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 rounded-lg border border-border shrink-0">
              <AvatarImage src={userAvatar} alt={fullName} />
              <AvatarFallback className="rounded-lg text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm font-bold text-foreground truncate">{fullName}</span>
              </div>
              <span className="text-xs text-muted-foreground truncate font-mono">{userEmail}</span>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono bg-muted/50 border-border">
              {userRole}
            </Badge>
            {user?.team && (
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-medium">
                <Building className="h-2.5 w-2.5 mr-1" />
                {user.team}
              </Badge>
            )}
            {isEmulating && (
              <Badge className="text-[10px] py-0 px-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <ShieldAlert className="h-2.5 w-2.5 mr-1" />
                Emulating
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup className="space-y-0.5">
          <DropdownMenuItem asChild className="cursor-pointer text-xs rounded-lg">
            <Link href="/employees">
              <BadgeCheck className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              Employee Directory
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer text-xs rounded-lg">
            <Link href="/changelog">
              <History className="mr-2 h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Changelog & Releases</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">v{CURRENT_VERSION}</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer text-xs rounded-lg">
            <Link href="/manage/settings">
              <Shield className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              Platform Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-xs text-rose-600 dark:text-rose-400 font-semibold cursor-pointer rounded-lg focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-950/30"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
