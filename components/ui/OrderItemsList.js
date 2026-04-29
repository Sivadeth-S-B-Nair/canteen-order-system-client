export default function OrderItemsList({orderItems}){

    if(!orderItems||orderItems.length===0){
        return <p className="text-sm text-gray-400 mt-2">No items</p>
    }

    return(
        <ul className="mt-2 space-y-1">
            {orderItems.map(item=>{
                return(
                    <li key={item.id} className="flex justify-between text-sm text-gray-600">
                        <span>{item.snapshotName} x {item.qty}</span>
                        <span>${(parseFloat(item.snapshotPrice)*item.qty).toFixed(2)}</span>
                    </li>
                )
            })}
        </ul>
    )
}