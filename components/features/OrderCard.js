"use client";
import { useRouter } from "next/navigation";
import OrderItemsList from "../ui/OrderItemsList";
import StatusBadge from "../ui/StatusBadge";
import { useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import RatingModal from "./RatingModal";

export default function OrderCard({ order }) {
  const placedAt = new Date(order.createdAt).toLocaleString();
  const router=useRouter()
  const [ratingData,setRatingData]=useState(null)
  const [loadingRating,setLoadingRating]=useState(false)

  const handleOpenRating=async()=>{
    setLoadingRating(true)
    try{
      const res=await api.get(`/api/ratings/order/${order.id}/status`)
      const data=res.data.data
      const hasUnrated=data.items.some((i)=>!i.isRated)
      if(!hasUnrated){
        toast("You have already rated all items in this order")
        return
      }
      setRatingData(data)
    }
    catch(err){
      toast.error("Could not load rating status")
    }
    finally{
      setLoadingRating(false)
    }
  }

  return (
    <>
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-gray-800">Order #{order.id}</p>
          <p className="text-xs text-gray-400 mt-1">{placedAt}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <OrderItemsList orderItems={order.orderItems} />
      <div className="flex justify-between border-t mt-3 pt-3 font-semibold">
        <span>Total</span>
        <span>${parseFloat(order.totalPrice).toFixed(2)}</span>
      </div>
      {order.status === "PAYMENT_PENDING" && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700 font-medium">
            Payment not completed
          </p>
          <p className="text-xs text-red-500 mt-0.5">
            Your order is reserved but not confirmed until payment is made.
          </p>
          <button
            onClick={() =>
              router.push(
                `/user/payment?orderId=${order.id}&amount=${order.totalPrice}`,
              )
            }
            className="mt-2 w-full bg-red-600 text-white py-1.5 rounded text-sm font-medium hover:bg-red-700"
          >
            Complete Payment . ${parseFloat(order.totalPrice).toFixed(2)}
          </button>
        </div>
      )}
      {order.status === "Ready" && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700 font-medium">Your order is ready! Please collect it.</p>
        </div>
      )}
      {order.status==="Picked Up"&&(
        <div className="mt-3">
          <button onClick={handleOpenRating} disabled={loadingRating} className="w-full border border-amber-400 text-amber-600 py-1.5 rounded text-sm font-medium hover:bg-amber-50 disabled:opacity-50">{loadingRating?"Loading...":'★ Rate this order'}</button>
        </div>
      )}
    </div>
      <RatingModal order={ratingData} onClose={()=>setRatingData(null)} onRated={()=>{}}/>
        </>
  );
}
