import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import authReducer from "./slices/authSlice";
import menuReducer from "./slices/menuSlice";
import cartReducer from "./slices/cartSlice";
import orderReducer from "./slices/orderSlice";
import profileReducer from "./slices/profileSlice";

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user"],
};
const cartPersistConfig={
  key:"cart",
  storage
}

export const store = configureStore({
  reducer: {
    auth: persistReducer(authPersistConfig, authReducer),
    menu: menuReducer,
    cart: persistReducer(cartPersistConfig,cartReducer),
    orders: orderReducer,
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
