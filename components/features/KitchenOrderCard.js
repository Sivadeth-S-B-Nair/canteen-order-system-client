"use client"

import { useDispatch } from "react-redux"
import OrderItemsList from "../ui/OrderItemsList"
import StatusBadge from "../ui/StatusBadge"
import { useState } from "react"
import api from "@/lib/axios"
import { updateOrderInList } from "@/store/slices/orderSlice"
const NEXT_STATUS={
    "Ordered":"Cooking",
    "Cooking":"Ready",
    "Ready":"Picked Up"
}
const BUTTON_LABEL={
    "Ordered":"Start Cooking",
    "Cooking":"Mark Ready",
    "Ready":"Mark Picked Up"
}   

export default function KitchenOrderCard({order}){
    const dispatch=useDispatch()
    const [loading,setLoading]=useState(false)
    const [error,setError]=useState(null)    
    const nextStatus=NEXT_STATUS[order.status]
    const buttonLabel=BUTTON_LABEL[order.status]
    const handleStatusUpdate=async()=>{
        if(!nextStatus) return
        setLoading(true)
        setError(null)
        try{
            const res=await api.patch(`/api/orders/${order.id}/status`,{status:nextStatus})
            dispatch(updateOrderInList(res.data.data))
        }
        catch(err){
            setError(err.response?.data?.message||"Failed to update status")
        }
        finally{
            setLoading(false)
        }
    }
    const placedAt=new Date(order.createdAt).toLocaleString()
    return(
        <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-start">
                <div>
                    <p>Order #{order.id}</p>
                    <p>{placedAt}</p>
                </div>
                <StatusBadge status={order.status}/>
            </div>
            <OrderItemsList orderItems={order.orderItems}/>
            <div className="flex justify-between border-t mt-3 pt-3 font-semibold">
                <span>Total</span>
                <span>${parseFloat(order.totalPrice).toFixed(2)}</span>
            </div>
            {error&&(
                <p className="text-red-500 text-xs mt-2">{error}</p>
            )}
            {
                nextStatus&&(
                    <button onClick={handleStatusUpdate} disabled={loading} className="w-full mt-3 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{loading?"Updating...":buttonLabel}</button>
                )
            }
        </div>
    )
}