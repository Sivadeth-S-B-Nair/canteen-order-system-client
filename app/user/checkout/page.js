"use client";

import api from "@/lib/axios";
import { clearCart } from "@/store/slices/cartSlice";
import {
  setProfile,
  setProfileError,
  setProfileLoading,
} from "@/store/slices/profileSlice";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function TipTapToolbar({ editor }) {
  if (!editor) {
    return null;
  }
  const buttons = [
    {
      label: "B",
      title: "Bold",
      active: editor.isActive("bold"),
      action: () => editor.chain().focus().toggleBold().run(),
      className: "font-bold",
    },
    {
      label: "I",
      title: "Italic",
      active: editor.isActive("italic"),
      action: () => editor.chain().focus().toggleItalic().run(),
      className: "italic",
    },
    {
      label: "•",
      title: "Bullet list",
      active: editor.isActive("bulletList"),
      action: () => editor.chain().focus().toggleBulletList().run(),
      className: "",
    },
    {
      label: "1.",
      title: "Ordered list",
      active: editor.isActive("orderedList"),
      action: () => editor.chain().focus().toggleOrderedList().run(),
      className: "",
    },
  ];

  return (
    <div className="flex gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      {buttons.map((btn) => (
        <button 
          key={btn.title}
          type="button"
          title={btn.title}
          onClick={btn.action}
          onMouseDown={(e) => e.preventDefault()}
          className={`px-2.5 py-1 rounded text-sm transition-colors ${btn.className} ${
            btn.active
              ? "bg-gray-800 text-white shadow-inner scale-95" // Highly visible active state
              : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
          }`}
        >
          {btn.label}
        </button>
      ))}
      <div className="w-px bg-gray-200 mx-1" />
      <button
        type="button"
        title="Clear formatting"
        onClick={() =>
          editor.chain().focus().clearNodes().unsetAllMarks().run()
        }
        className="px-2.5 py-1 rounded text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
      >
        X
      </button>
    </div>
  );
}

function AddressOption({ address, isSelected, onSelect }) {
  const LABEL_COLORS = {
    Home: "bg-blue-50 text-blue-700",
    Work: "bg-purple-50 text-purple-700",
    Hostel: "bg-amber-50 text-amber-700",
    Other: "bg-gray-100 text-gray-600",
  };
  const labelColor = LABEL_COLORS[address.label] || LABEL_COLORS.Other;
  return (
    <button
      type="button"
      onClick={() => onSelect(address.id)}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <span
            className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${labelColor}`}
          >
            {address.label}
          </span>
          {address.isDefault && (
            // Shown next to the label if this is the user's default address
            <span className="ml-1 text-xs text-blue-600 font-medium">
              Default
            </span>
          )}
          <p className="text-sm text-gray-800 font-medium">
            {address.addressLine}
          </p>
          {(address.city || address.state) && (
            <p className="text-xs text-gray-500 mt-0.5">
              {[address.city, address.state, address.pincode]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
        </div>
        <div
          className={`w-4 h-4 rounded-full border-2 shrink-0 ml-3 mt-0.5 flex items-center justify-center ${
            isSelected ? "border-blue-500" : "border-gray-300"
          }`}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
        </div>
      </div>
    </button>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const { data: profile } = useSelector((state) => state.profile);
  const [diningOption, setDiningOption] = useState("dine_in");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    const [isOrdered,setIsOrdered]=useState(false)
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[80px] px-3 py-2 text-sm text-gray-800 focus:outline-none [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4",
      },
    },
  });

  useEffect(() => {
    if (cartItems.length === 0 && !loading && !isOrdered) {
      router.replace("/user/restaurants");
    }
  }, [cartItems,loading, isOrdered, router]);

  useEffect(() => {
    if (!profile) {
      const fetchProfile = async () => {
        dispatch(setProfileLoading());
        try {
          const res = await api.get("/api/profile");
          dispatch(setProfile(res.data.data));
        } catch (err) {
          console.error("Failed to load profile:", err);
        }
      };
      fetchProfile();
    }
  }, [profile, dispatch]);

  useEffect(() => {
    if (profile?.addresses?.length > 0 &&!selectedAddressId) {
      const defaultAddr = profile.addresses.find((a) => a.isDefault);
      setSelectedAddressId(defaultAddr?.id || profile.addresses[0]?.id || null);
    }
  }, [profile,selectedAddressId]);

  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.qty,
    0,
  );

  const addresses = profile?.addresses || [];

  const handleConfirm = async () => {
    if (diningOption === "delivery" && !selectedAddressId) {
      setError("Please select a delivery address");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const htmlInstructions = editor?.getHTML().trim() || "";
      const specialInstructions =
        editor?.isEmpty ? null : (editor?.getHTML().trim() || null);
      const payload = {
        items: cartItems.map((item) => ({
          menuItemId: item.menuItemId,
          qty: item.qty,
        })),
        deliveryType: diningOption,
        deliveryAddressId:
          diningOption === "delivery" ? selectedAddressId : null,
        specialInstructions,
      };
      const res = await api.post("/api/orders", payload);
      const order = res.data.data;
      setIsOrdered(true)
      dispatch(clearCart());
      router.push(
        `/user/payment?orderId=${order.id}&amount=${order.totalPrice}`,
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to place order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-3"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Review Your Order</h1>
        <p className="text-gray-500 text-sm mt-1">
          Confirm your items, choose how you'd like it served, and add any
          instructions.
        </p>
      </div>

      <div className="space-y-6">
        {/* SECTION 1: Order Summary */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Order Summary</h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.menuItemId}
                className="flex justify-between items-center"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    ${parseFloat(item.price).toFixed(2)} × {item.qty}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  ${(parseFloat(item.price) * item.qty).toFixed(2)}
                </p>
              </div>
            ))}
            {/* Total row */}
            <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span className="text-blue-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: Dining Option */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">
              How would you like it?
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Dine In option */}
              <button
                type="button"
                onClick={() => setDiningOption("dine_in")}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  diningOption === "dine_in"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-2">🍽️</div>
                <p
                  className={`text-sm font-semibold ${
                    diningOption === "dine_in"
                      ? "text-blue-700"
                      : "text-gray-800"
                  }`}
                >
                  Dine In
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pick up from the counter
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDiningOption("delivery")}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  diningOption === "delivery"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-2">🚚</div>
                <p
                  className={`text-sm font-semibold ${
                    diningOption === "delivery"
                      ? "text-blue-700"
                      : "text-gray-800"
                  }`}
                >
                  Delivery
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Delivered to your address
                </p>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 3: Address Selector */}
        {diningOption === "delivery" && (
          <section className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Delivery Address</h2>
              <a
                href="/user/profile"
                className="text-xs text-blue-600 hover:underline"
              >
                + Add new
              </a>
            </div>
            <div className="px-6 py-4">
              {addresses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No saved addresses</p>
                  <a
                    href="/user/profile"
                    className="text-blue-600 text-sm mt-2 inline-block hover:underline"
                  >
                    Add an address in your profile
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <AddressOption
                      key={address.id}
                      address={address}
                      isSelected={selectedAddressId === address.id}
                      onSelect={setSelectedAddressId}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
        {/* SECTION 4: Special Instructions (TipTap editor)*/}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">
              Special Instructions
              <span className="text-gray-400 font-normal text-sm ml-2">
                (optional)
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Allergies, preferences, or notes for the kitchen
            </p>
          </div>
          <div className="px-6 py-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-300 transition-all">
              {/* Our custom toolbar — passes the editor instance down */}
              <TipTapToolbar editor={editor} />
              <EditorContent editor={editor} />
              {/* <div className="px-3 pb-2 text-right">
                <span
                  className={`text-xs ${
                    (editor?.getText().length || 0) > 450
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {editor?.getText().length || 0}/500
                </span>
              </div> */}
            </div>

            {/* <p className="text-xs text-gray-400 mt-2">
              Tip: Use <strong className="font-medium">B</strong> for bold,{" "}
              <em className="italic">I</em> for italic, or bullet lists for
              multiple notes.
            </p> */}
          </div>
        </section>

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-50 rounded-lg py-3 px-4">
            {error}
          </p>
        )}

        <button
          onClick={handleConfirm}
          disabled={loading || cartItems.length === 0}
          className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {loading
            ? "Placing Order..."
            : `Confirm & Pay · $${total.toFixed(2)}`}
        </button>

        <p className="text-center text-xs text-gray-400 pb-4">
          You'll complete payment on the next screen
        </p>
      </div>
    </div>
  );
}
