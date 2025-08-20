"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { io } from "socket.io-client";

interface OrderItem {
  product: string;
  sku: string;
  quantity: number;
  _id: string;
}

interface Order {
  _id: string;
  customer: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress: string;
  status: string;
  createdAt: string;
}

const socket = io("http://localhost:5000", { transports: ["websocket"] });

export default function OrderStatusPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const hasJoined = useRef(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/customers/orders", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data: Order[] = await res.json();
        setOrders(data);

        if (!hasJoined.current && data.length > 0) {
          socket.emit("join", data[0].customer);
          hasJoined.current = true;
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    socket.on("order_update", (updatedOrder: Order) => {
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === updatedOrder._id ? { ...o, status: updatedOrder.status } : o
        )
      );
    });

    return () => {
      socket.off("order_update");
    };
  }, []);

  if (loading) return <p className="p-4">Loading orders...</p>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-center relative mb-6">
        <ArrowLeft
          className="absolute left-0 cursor-pointer"
          onClick={() => window.history.back()}
        />
        <h1 className="text-2xl font-bold">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <p className="text-center">No orders found.</p>
      ) : (
        orders.map((order) => (
          <Card key={order._id} className="p-4 shadow-md">
            <CardContent>
              <p className="font-semibold">Order ID: {order._id.slice(-6)}</p>
              <p>
                Status: <span className="font-bold">{order.status}</span>
              </p>
              <p>Total: ₹{order.totalAmount}</p>
              <p>Delivery Address: {order.deliveryAddress}</p>
              <p>Placed On: {new Date(order.createdAt).toLocaleString()}</p>

              <div className="mt-3">
                <p className="font-semibold">Items:</p>
                <ul className="list-disc pl-5">
                  {order.items.map((item) => (
                    <li key={item._id}>
                      SKU: {item.sku} | Qty: {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
