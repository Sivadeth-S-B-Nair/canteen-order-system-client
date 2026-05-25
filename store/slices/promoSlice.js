import { createSlice } from "@reduxjs/toolkit";

const promoSlice = createSlice({
  name: "promo",
  initialState: {
    code: null,
    discountAmount: 0,
    discountType: null,
    discountValue: null,
    loading: false,
    error: null,
  },
  reducers: {
    setPromoLoading(state) {
      state.loading = true, 
      state.error = null
    },
    applyPromo(state, action) {
      state.code = action.payload.code;
      state.discountAmount = action.payload.discountAmount;
      state.discountType = action.payload.discountType;
      state.discountValue = action.payload.discountValue;
      state.loading = false;
      state.error = null;
    },
    setPromoError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    clearPromo(state) {
        state.code          = null;
        state.discountAmount = 0;
        state.discountType  = null;
        state.discountValue = null;
        state.loading       = false;
        state.error         = null;
    },
  },
});

export const {setPromoLoading,applyPromo,setPromoError,clearPromo}=promoSlice.actions
export default promoSlice.reducer
