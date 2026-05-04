"use client"

import { connectSocket } from "@/lib/socket"
import { updateOrderInList,addNewOrder } from "@/store/slices/orderSlice"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

export default function useSocket(){
    const dispatch=useDispatch()
    const {accessToken,user}=useSelector(state => state.auth)
    
    useEffect(()=>{
        if(!accessToken||!user) return
        const socket=connectSocket(accessToken)

        if(user.role==="kitchen"){
            socket.on("new-order",(order)=>{
                console.log("New order recieved:",order.id)
                dispatch(addNewOrder(order))
            })
            socket.on("order-updated",(order)=>{
                console.log("Order updated:",order.id,order.status)
                dispatch(updateOrderInList(order))
            })
        }
        if(user.role==="user"){
            socket.on("order-updated",(order)=>{
                console.log("Your order updated:",order.id,order.status)
                dispatch(updateOrderInList(order))
            })
        }

        return()=>{
            socket.off("new-order")
            socket.off("order-updated")
        }
    },[accessToken,user,dispatch])  
} 