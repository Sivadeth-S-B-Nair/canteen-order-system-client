export default function StatusBadge({status}){
    const styles={
        "Ordered":"bg-yellow-100 text-yellow-800",
        "Cooking":"bg-blue-100 text-blue-800",
        "Ready":"bg-green-100 text-green-800",
        "Picked Up":"bg-gray-100 text-gray-600"
    }

    return(
        <span className={`${styles[status]} px-2 py-1 rounded-full text-xs font-semibold`}>{status}</span>
    )
}