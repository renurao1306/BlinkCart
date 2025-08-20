import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import ordersReducer from "./orderSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    orders: ordersReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
