// store/slices/profileSlice.js
import { createSlice } from '@reduxjs/toolkit';

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data: null,             
    loading: false,
    error: null,
  },
  reducers: {
    setProfileLoading(state) {
      state.loading = true;
      state.error   = null;
    },
    setProfile(state, action) {
      state.data    = action.payload;
      state.loading = false;
      state.error   = null;
    },
    setProfileError(state, action) {
      state.loading = false;
      state.error   = action.payload;
    },
    upsertAddress(state, action) {
      if (!state.data) return;
      const idx = state.data.addresses.findIndex(a => a.id === action.payload.id);
      if (idx !== -1) {
        state.data.addresses[idx] = action.payload;
      } else {
        state.data.addresses.push(action.payload);
      }
    },
    removeAddress(state, action) {
      if (!state.data) return;
      state.data.addresses = state.data.addresses.filter(a => a.id !== action.payload);
    },
  },
});

export const {
  setProfileLoading,
  setProfile,
  setProfileError,
  upsertAddress,
  removeAddress,
} = profileSlice.actions;

export default profileSlice.reducer;