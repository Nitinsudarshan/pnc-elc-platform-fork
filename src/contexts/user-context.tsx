"use client";

import React, { createContext, useContext } from "react";
import type { UserRole } from "@/lib/role-constants";

export type User = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role?: UserRole | null;
    originalRole?: UserRole | null;
    isEmulating?: boolean;
    team?: string | null;
    employeeType?: string | null;
    designation?: string | null;
};

const UserContext = createContext<User | null>(null);

export function UserProvider({
    user,
    children,
}: {
    user: User | null;
    children: React.ReactNode;
}) {
    return (
        <UserContext.Provider value={user}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserContext() {
    return useContext(UserContext);
}
