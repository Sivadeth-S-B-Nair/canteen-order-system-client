"use client"

import api from "@/lib/axios"
import { clearCredentials } from "@/store/slices/authSlice"
import { persistor } from "@/store/store"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"

export default function Navbar({isOpen,onToggle}){
    const dispatch=useDispatch()
    const {user}=useSelector(state=>state.auth)
    const router=useRouter()
    const [showMenu,setShowMenu]=useState(false)

    const handleLogout=async()=>{
        try{
            await api.post("/api/auth/logout")
        }
        catch(err){

        }
        finally{
            dispatch(clearCredentials)
            persistor.purge() //clear local storage
            router.push("/login")
        }
    }

    return(
        <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50">
            <div className="flex items-center gap-3">
                <button onClick={onToggle} className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                    <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
                    <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
                    <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
                </button>
                <span className="font-bold text-lg text-gray-800">Canteen</span>
            </div>
            <div className="relative">
                <button onClick={()=>setShowMenu(prev=>!prev)} className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">{user?.name?.charAt(0).toUpperCase()}</div>
                </button>
                {showMenu && (
                    <div className="absolute right-0 top-12 bg-white border-gray-200 rounded-lg shadow-lg w-48 py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                            <p className="test-sm font-medium text-gray-800">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Logout</button>
                    </div>
                )}
            </div>
        </nav>
    )
}