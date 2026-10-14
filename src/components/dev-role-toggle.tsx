"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  ShieldAlert,
  UserCheck,
  Check,
  RotateCcw,
  Users,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { useUserContext } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/lib/role-constants";

const ALL_ROLES: { label: string; value: UserRole; description: string }[] = [
  { label: "Super Admin", value: "Super Admin", description: "Full system administration and user role management" },
  { label: "Admin", value: "Admin", description: "Manage workflows, reports, and organization settings" },
  { label: "PnC", value: "PnC", description: "People & Culture operations, onboarding, and appraisals" },
  { label: "Finance", value: "Finance", description: "Compensation structures, CTC, and payroll oversight" },
  { label: "Manager", value: "Manager", description: "Appraisal reviews, confirmations, and peer evaluations" },
  { label: "Program", value: "Program", description: "Program coordination and cohort tracking" },
  { label: "Operations", value: "Operations", description: "Day-to-day facilities, logistics, and assets" },
  { label: "Viewer", value: "Viewer", description: "Read-only access across approved reporting modules" },
  { label: "Member", value: "Member", description: "Standard community and internal portal member" },
  { label: "Employee", value: "Employee", description: "Standard employee: self profile, forms, feedback" },
];

const EMULATION_PERSONAS = [
  {
    name: "Admin User",
    email: "admin@navgurukul.org",
    role: "Super Admin" as UserRole,
    team: "Operations",
    employeeType: "Full-Time",
  },
  {
    name: "Priya Verma",
    email: "priya.verma@navgurukul.org",
    role: "PnC" as UserRole,
    team: "PnC",
    employeeType: "Full-Time",
  },
  {
    name: "Rajesh Sharma",
    email: "rajesh.sharma@navgurukul.org",
    role: "Manager" as UserRole,
    team: "Engineering",
    employeeType: "Full-Time",
  },
  {
    name: "Amit Saxena",
    email: "amit.saxena@navgurukul.org",
    role: "Finance" as UserRole,
    team: "Finance",
    employeeType: "Full-Time",
  },
  {
    name: "Neha Patel",
    email: "neha.patel@navgurukul.org",
    role: "Employee" as UserRole,
    team: "Engineering",
    employeeType: "FTE",
  },
];

export function DevRoleToggle() {
  const router = useRouter();
  const user = useUserContext();
  const [activeOverride, setActiveOverride] = useState<string>("");
  const [isEmulatingUser, setIsEmulatingUser] = useState<boolean>(false);

  useEffect(() => {
    const roleMatch = document.cookie.match(/dev-role-override=([^;]+)/);
    const userMatch = document.cookie.match(/dev-user-override=([^;]+)/);
    if (roleMatch) {
      setActiveOverride(decodeURIComponent(roleMatch[1]));
    }
    if (userMatch) {
      setIsEmulatingUser(true);
    }
  }, []);

  const effectiveRole = user?.role || "Employee";
  const isEmulating = Boolean(activeOverride || isEmulatingUser || user?.isEmulating);

  const handleSelectRole = (roleValue: string) => {
    if (roleValue) {
      document.cookie = `dev-role-override=${encodeURIComponent(roleValue)}; path=/; max-age=86400`;
    } else {
      document.cookie = `dev-role-override=; path=/; max-age=0`;
    }
    setActiveOverride(roleValue);
    router.refresh();
  };

  const handleSelectPersona = (persona: (typeof EMULATION_PERSONAS)[0]) => {
    document.cookie = `dev-role-override=${encodeURIComponent(persona.role)}; path=/; max-age=86400`;
    document.cookie = `dev-user-override=${encodeURIComponent(JSON.stringify(persona))}; path=/; max-age=86400`;
    setActiveOverride(persona.role);
    setIsEmulatingUser(true);
    router.refresh();
  };

  const handleResetAll = () => {
    document.cookie = `dev-role-override=; path=/; max-age=0`;
    document.cookie = `dev-user-override=; path=/; max-age=0`;
    setActiveOverride("");
    setIsEmulatingUser(false);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 gap-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all ${
            isEmulating
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20 shadow-xs animate-in fade-in"
              : "bg-background/80 hover:bg-muted border-border/80 text-foreground"
          }`}
        >
          {isEmulating ? (
            <>
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="hidden md:inline font-mono text-[11px]">Emulating:</span>
              <span className="font-bold">{effectiveRole}</span>
              <span className="ml-0.5 px-1 py-0.2 text-[9px] rounded bg-amber-500/20 text-amber-800 dark:text-amber-200">
                ACTIVE
              </span>
            </>
          ) : (
            <>
              <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="hidden sm:inline text-muted-foreground font-normal">Role:</span>
              <span className="font-semibold">{effectiveRole}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 p-1.5 rounded-lg shadow-xl border bg-card">
        <DropdownMenuLabel className="px-2 py-1.5 font-normal">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Role & Emulation Switcher
            </span>
            {isEmulating && (
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30">
                Emulating
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Test route guards, navigation, and permissions live.
          </p>
        </DropdownMenuLabel>

        {isEmulating && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleResetAll}
              className="text-xs text-rose-600 dark:text-rose-400 font-semibold cursor-pointer flex items-center gap-2 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-950/40 rounded-lg p-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to Actual Role & User</span>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-2 py-1">
          Switch System Role
        </DropdownMenuLabel>

        <DropdownMenuGroup className="max-h-52 overflow-y-auto space-y-0.5">
          {ALL_ROLES.map((roleItem) => {
            const isSelected = effectiveRole === roleItem.value;
            return (
              <DropdownMenuItem
                key={roleItem.value}
                onClick={() => handleSelectRole(roleItem.value)}
                className={`text-xs flex items-center justify-between cursor-pointer rounded-lg p-2 transition-colors ${
                  isSelected ? "bg-muted font-bold text-foreground" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="leading-tight">{roleItem.label}</span>
                  <span className="text-[10px] text-muted-foreground truncate font-normal">
                    {roleItem.description}
                  </span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-2 py-1 flex items-center gap-1.5">
          <Users className="h-3 w-3 text-muted-foreground" />
          Persona Emulation
        </DropdownMenuLabel>

        <DropdownMenuGroup className="space-y-0.5">
          {EMULATION_PERSONAS.map((persona) => {
            const isSelected = isEmulatingUser && user?.email === persona.email;
            return (
              <DropdownMenuItem
                key={persona.email}
                onClick={() => handleSelectPersona(persona)}
                className={`text-xs flex items-center justify-between cursor-pointer rounded-lg p-2 transition-colors ${
                  isSelected ? "bg-muted font-bold" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">{persona.name}</span>
                    <Badge variant="outline" className="text-[9px] py-0 px-1 border-muted-foreground/30 font-mono">
                      {persona.role}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate">{persona.email}</span>
                </div>
                {isSelected && <UserCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
