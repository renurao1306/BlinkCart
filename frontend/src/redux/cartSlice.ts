import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  sku: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<string>) => {
      const existing = state.items.find((item) => item.sku === action.payload);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ sku: action.payload, quantity: 1 });
      }
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ sku: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.sku === action.payload.sku);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.sku !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
