"use client"

import AppShell from "@/components/layout/AppShell"
import useSocket from "@/hooks/useSocket"

export default function AgentLayout({children}){
    useSocket()
    return <AppShell>{children}</AppShell>
}