"use client"
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";
import { io } from "socket.io-client";

interface User {
  _id: string;
  name: string;
  phone: string;
}

interface DeliveryPartner {
  _id: string;
  user: User;
  vehicleNumber: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AllDeliveryPartners() {
    const [partners, setPartners] = useState<DeliveryPartner[]>([]);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const token = localStorage.getItem("token")
                const res = await fetch("http://35.154.71.3:5000/api/admin/all-deliveryPartners", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!res.ok) {
                    throw new Error(`HTTP error ${res.status}`)
                }

                const data = await res.json();
                console.log("Fetched partners:", data)
                setPartners(data)
            } catch (err: any) {
                console.error("Fetch error:", err);
            }
        }

        fetchPartners()
    }, [])


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {partners.map((partner) => (
                <Card key={partner._id} className="shadow-md rounded-2xl border">
                    <CardHeader className="flex items-center gap-2 pt-2">
                        <Truck className="w-6 h-6 text-blue-600" />
                        <CardTitle>Delivery Partner</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                        <p>
                            <strong>ID:</strong> {partner._id.slice(-6)}
                        </p>
                        <p>
                            <strong>Name:</strong> {partner.user.name}
                        </p>
                        <p>
                            <strong>Phone:</strong> {partner.user.phone}
                        </p>
                        <p>
                            <strong>Vehicle:</strong> {partner.vehicleNumber}
                        </p>
                        <p>
                            <strong>Status:</strong>{" "}
                            <span
                                className={
                                    partner.isAvailable ? "text-green-600" : "text-red-600"
                                }
                            >
                                {partner.isAvailable ? "Available" : "Unavailable"}
                            </span>
                        </p>
                        <p>
                            <strong>Created:</strong>{" "}
                            {new Date(partner.createdAt).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
