"use client";

import api from "@/lib/axios";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";
import toast from "react-hot-toast";

function Star({ filled, onClick, onHover }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      className="text-3xl focus:outline-none transition-transform hover:scale-110"
    >
      <span className={filled ? "text-amber-400" : "text-gray-300"}>★</span>
    </button>
  );
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex gap-1 " onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          filled={star <= display}
          onClick={() => onChange(star)}
          onHover={() => setHovered(star)}
        />
      ))}
    </div>
  );
}

export default function RatingModal({ order, onClose, onRated }) {
  const rateableItems = order?.items?.filter((i) => !i.isRated) || [];
  const [ratings, setRatings] = useState(
    () =>
      Object.fromEntries(
        rateableItems.map((i) => [i.menuItemId, { rating: 0, review: "" }]),
      ),
    //{ menuItemId: { rating: 3, review: "Nice!" }, ... }
  );
  const [submitting,setSubmitting]=useState(false)
  const [submitted,setSubmitted]=useState([])

  const handleSubmitOne=async(menuItemId)=>{
    const {rating,review}=ratings[menuItemId]
    if(rating===0){
        toast.error("Please select a star rating")
        return
    }
    setSubmitting(true)
    try{
        await api.post("/api/ratings",{
            orderId:order.id,
            menuItemId,
            rating,
            review
        })
        setSubmitted((prev)=>[...prev,menuItemId])
        toast.success("Rating submitted")
        onRated?.()
    }
    catch(err){
        toast.error(err.response?.data?.message||"Failed to submit rating")
    }
    finally{
        setSubmitting(false)
    }
  }
  const allDone=rateableItems.every((i)=>submitted.includes(i.menuItemId))
  return(
    <Dialog open={!!order} onClose={onClose} className="relative z-50">
        <DialogBackdrop transition className="fixed inset-0 bg-gray-900/50 transistion-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"/>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-white px-6 pt-5 pb-4">
              <DialogTitle className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">
                Rate your order
              </DialogTitle>

              {allDone ? (
                <div className="text-center py-6">
                  <p className="text-2xl mb-2">★</p>
                  <p className="font-semibold text-gray-800">All items rated!</p>
                  <p className="text-sm text-gray-500 mt-1">Thanks for your feedback.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {rateableItems.map((item) => {
                    const isDone = submitted.includes(item.menuItemId);
                    return (
                      <div key={item.menuItemId} className={`${isDone ? 'opacity-50' : ''}`}>
                        <p className="font-medium text-gray-800 mb-2">{item.snapshotName}</p>

                        {isDone ? (
                          <p className="text-sm text-green-600">✓ Rated</p>
                        ) : (
                          <>
                            <StarPicker
                              value={ratings[item.menuItemId]?.rating || 0}
                              onChange={(val) =>
                                setRatings((prev) => ({
                                  ...prev,
                                  [item.menuItemId]: { ...prev[item.menuItemId], rating: val },
                                }))
                              }
                            />
                            <textarea
                              rows={2}
                              placeholder="Write a review"
                              value={ratings[item.menuItemId]?.review || ''}
                              onChange={(e) =>
                                setRatings((prev) => ({
                                  ...prev,
                                  [item.menuItemId]: {
                                    ...prev[item.menuItemId],
                                    review: e.target.value,
                                  },
                                }))
                              }
                              className="mt-2 w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <button
                              onClick={() => handleSubmitOne(item.menuItemId)}
                              disabled={submitting}
                              className="mt-2 bg-amber-500 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
                            >
                              {submitting ? 'Submitting...' : 'Submit rating'}
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-end">
              <button
                onClick={onClose}
                className="inline-flex rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
