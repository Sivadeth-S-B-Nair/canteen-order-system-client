import OrderItemsList from "../ui/OrderItemsList"
import StatusBadge from "../ui/StatusBadge"

export default function OrderCard({order}){

    const placedAt=new Date(order.createdAt).toLocaleString()

    return(
        <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-gray-800">Order #{order.id}</p>
                    <p className="text-xs text-gray-400 mt-1">{placedAt}</p>
                </div>
                <StatusBadge status={order.status}/>
            </div>
            <OrderItemsList orderItems={order.orderItems}/>
            <div className="flex justify-between border-t mt-3 pt-3 font-semibold">
                <span>Total</span>
                <span>${parseFloat(order.totalPrice).toFixed(2)}</span>
            </div>
            {order.status==="Ready"&&(
                <div>Your order is ready! Please collect it.</div>
            )}
        </div>
    )
}