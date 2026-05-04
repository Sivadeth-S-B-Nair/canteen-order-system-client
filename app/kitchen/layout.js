"use client"

import AppShell from "@/components/layout/AppShell";
import useSocket from "@/hooks/useSocket";

export default function KitchenLayout({children}){
    useSocket()
    return(
        <AppShell>{children}</AppShell>
    )
}