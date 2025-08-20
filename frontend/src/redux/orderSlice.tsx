import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type OrderItem = {
  _id: string;
  product: string;
  sku: string;
  quantity: number;
};

type Order = {
  _id: string;
  customer: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress: string;
  status: string;
  createdAt: string;
};

interface OrdersState {
  orders: Order[];
}

const initialState: OrdersState = {
  orders: [],
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
    },
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    updateOrderStatus(
      state,
      action: PayloadAction<{ id: string; status: string }>
    ) {
      const order = state.orders.find((o) => o._id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
      }
    },
    clearOrders: (state) => {
      state.orders = [];
    },
  },
});

export const { addOrder, setOrders, updateOrderStatus, clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
