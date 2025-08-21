"use client"
import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { io } from "socket.io-client";


interface Order {
    _id: string
    customer: {
        _id: string
        name: string
        email: string
    }
    items: {
        _id: string
        sku: string
        quantity: number
    }[]
    totalAmount: number
    deliveryAddress: string
    deliveryPartner: {
        _id: string
        name: string
        phone: string
    } | null
    status: string
    createdAt: string
}

const socket = io("http://43.205.203.2:5000", { transports: ["websocket"] });

export default function AllOrdersTab() {
    const [orders, setOrders] = useState<Order[]>([]);
    const hasJoined = useRef(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch("http://43.205.203.2:5000/api/admin/all-orders", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                });

                const data = await res.json();
                setOrders(data);
                console.log('Orders revd are: ', orders)
                console.log('data[0].cust: ', data[0].customer);

                if (!hasJoined.current && data.length > 0) {
                    socket.emit("join_admin");
                    hasJoined.current = true;
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
            }
        };

        fetchOrders();

        socket.on("order_update", (updatedOrder: Order) => {
            console.log("Order update received:", updatedOrder);
            setOrders((prev) =>
                prev.map((order) =>
                    order._id === updatedOrder._id ? { ...order, status: updatedOrder.status } : order
                )
            );
        });
    }, []);


    return (
        <div className="grid gap-4 md:grid-cols-2">
            {orders.map(order => (
                <Card key={order._id} className="shadow-lg rounded-2xl pt-2">
                    <CardHeader>
                        <CardTitle>Order #{order._id.slice(-6)}</CardTitle>
                        <p className="text-sm text-gray-500">
                            Status: <span className="font-medium">{order.status}</span>
                        </p>
                    </CardHeader>
                    <CardContent className="pb-2">
                        <p>
                            <strong>Customer:</strong> {order.customer?.name} ({order.customer?.email})
                        </p>
                        <p>
                            <strong>Delivery Address:</strong> {order.deliveryAddress}
                        </p>
                        <p>
                            <strong>Delivery Partner:</strong>{" "}
                            {order.deliveryPartner ? (
                                `${order.deliveryPartner.name} (${order.deliveryPartner.phone})`
                            ) : (
                                "Not Assigned"
                            )}
                        </p>
                        <p className="mt-2 font-semibold">Items:</p>
                        <ul className="list-disc list-inside">
                            {order.items.map(item => (
                                <li key={item._id}>
                                    {item.sku} × {item.quantity}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-2">
                            <strong>Total:</strong> ₹{order.totalAmount}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
