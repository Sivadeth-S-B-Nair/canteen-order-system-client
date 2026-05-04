"use client"

import api from "@/lib/axios"
import { setAllOrders } from "@/store/slices/orderSlice"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

export default function KitchenDashboard(){
    const dispatch=useDispatch()
    const {allOrders}=useSelector(state=>state.orders)
    const {accessToken}=useSelector(state=>state.auth)

    useEffect(()=>{
        const fetchOrders=async()=>{
            try{
                const res=await api.get("/api/orders/all")
                dispatch(setAllOrders(res.data.data))
            }
            catch(err){
                console.error(err)
            }
        }
        fetchOrders()
    },[accessToken,dispatch])

    return(
        <div>
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Overview of canteen activity</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-sm text-gray-500">Active Orders</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{allOrders.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-sm text-gray-500">Cooking</p>
                    <p className="text-3xl font-bold text-orange-500 mt-1">{allOrders.filter(o=>o.status==="Cooking").length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-sm text-gray-500">Ready for Pickup</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{allOrders.filter(o=>o.status==="Ready").length}</p>
                </div>  
            </div>
        </div>
    )
}