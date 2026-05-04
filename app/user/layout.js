"use client"

import AppShell from "@/components/layout/AppShell";
import useSocket from "@/hooks/useSocket";

export default function UserLayout({children}){
    useSocket()
    return(
        <AppShell>{children}</AppShell>
    )
}