"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { updateOrderStatus, setOrders } from "@/redux/orderSlice";
import { useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UpdateStatusPage() {
    const orders = useSelector((state: RootState) => state.orders.orders);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchAssignedOrders = async () => {
            console.log('hello')
            try {
                const res = await fetch("http://35.154.71.3:5000/api/delivery/orders/assigned", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch assigned orders");
                
                const data = await res.json();
                console.log(data)
                dispatch(setOrders(data));
            } catch (err) {
                console.error("Error fetching assigned orders:", err);
            }
        };

        fetchAssignedOrders();
    }, [dispatch]);

    const activeOrders = orders.filter((order) =>
        ["ACCEPTED", "PICKED_UP", "ON_THE_WAY", "DELIVERED"].includes(order.status)
    );

    const getNextStatus = (status: string) => {
        switch (status) {
            case "ACCEPTED": return "PICKED_UP";
            case "PICKED_UP": return "ON_THE_WAY";
            case "ON_THE_WAY": return "DELIVERED";
            default: return null;
        }
    };

    const getButtonLabel = (status: string) => {
        switch (status) {
            case "ACCEPTED": return "PICKED UP";
            case "PICKED_UP": return "ON THE WAY";
            case "ON_THE_WAY": return "DELIVERED";
            default: return null;
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        const nextStatus = getNextStatus(status);
        if (!nextStatus) return;

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`http://35.154.71.3:5000/api/delivery/orders/status/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: nextStatus }),
            });

            if (!res.ok) throw new Error("Failed to update order status");

            const updatedOrder = await res.json();

            dispatch(updateOrderStatus({ id, status: updatedOrder.status }));
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };


    if (activeOrders.length === 0)
        return (
            <div className="p-4">
                <div className="flex items-center mb-4">
                    <Link
                        href="/unassigned-orders"
                        className="absolute left-0 p-2 rounded hover:bg-gray-200"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-bold flex-1 text-center">
                        Update Order Status
                    </h1>
                </div>
                <p className="p-4 text-center">No active orders to update</p>
            </div>
        );

    return (
        <div className="p-4">
            <div className="flex items-center mb-4">
                <Link
                    href="/unassigned-orders"
                    className="absolute left-0 p-2 rounded hover:bg-gray-200"
                >
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-xl font-bold flex-1 text-center">
                    Update Order Status
                </h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeOrders.map((order) => (
                    <Card key={order._id} className="shadow-md">
                        <CardHeader className="pt-2">
                            <CardTitle className="flex justify-between items-center">
                                <span>Order ID: {order._id.slice(-6)}</span>
                                <Badge variant="outline">{order.status}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                            <p className="text-sm mb-2">
                                <strong>Address:</strong> {order.deliveryAddress}
                            </p>
                            <div>
                                <p className="font-semibold mb-1">Items:</p>
                                <ul className="text-sm list-disc list-inside space-y-1">
                                    {order.items.map((item) => (
                                        <li key={item._id}>
                                            {item.sku} — Qty: {item.quantity}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <p className="text-sm mt-2">
                                <strong>Total:</strong> ₹{order.totalAmount}
                            </p>
                        </CardContent>
                        {getButtonLabel(order.status) && (
                            <CardFooter className="pb-2">
                                <Button
                                    className="w-full"
                                    onClick={() => handleStatusChange(order._id, order.status)}
                                >
                                    Change To {getButtonLabel(order.status)}
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
