"use client"

import { useState } from "react"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"

export default function AppShell({children}){
    const[isOpen,setIsOpen]=useState(false)
    const toggleSidebar=()=>setIsOpen(prev=>!prev)
    const closeSidebar=()=>setIsOpen(false)
    return(
        <div className="min-h-screen bg-gray-50">
            <Navbar isOpen={isOpen} onToggle={toggleSidebar}/>  
            <Sidebar isOpen={isOpen} onClose={closeSidebar}/>
            <main className={`pt-16 min-h-screen ${isOpen?"md:ml-64":"ml-0"}`}>
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}