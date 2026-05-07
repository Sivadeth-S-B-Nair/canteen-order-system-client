export default function StatusBadge({ status }) {
  const styles = {
    PAYMENT_PENDING: "bg-red-100 text-red-800",
    CONFIRMED: "bg-indigo-100 text-indigo-800", 
    Ordered: "bg-yellow-100 text-yellow-800",
    Cooking: "bg-blue-100 text-blue-800",
    Ready: "bg-green-100 text-green-800",
    "Picked Up": "bg-gray-100 text-gray-600",
  };
  const labels = {
    PAYMENT_PENDING: 'Awaiting Payment',
    CONFIRMED:       'Confirmed',
    Ordered:         'Ordered',
    Cooking:         'Cooking',
    Ready:           'Ready',
    'Picked Up':     'Picked Up',
  };

  return (
    <span
      className={`${styles[status]||"bg-gray-100 text-gray-600"} px-2 py-1 rounded-full text-xs font-semibold`}
    >
      {labels[status]||status}
    </span>
  );
}
