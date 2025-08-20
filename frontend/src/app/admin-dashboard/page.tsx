"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center flex-1">
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-black hover:text-red-800 font-medium"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      <Tabs defaultValue="orders" className="w-full max-w-5xl">
        <TabsList className="w-full justify-between bg-gray-200 rounded-lg">
          <TabsTrigger value="orders" className="flex-1 border-2 data-[state=active]:border-black">
            View All Orders
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex-1 border-2 data-[state=active]:border-black">
            View All Delivery Partners
          </TabsTrigger>
          <TabsTrigger value="status" className="flex-1 border-2 data-[state=active]:border-black">
            View Live Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="p-4 bg-white shadow-md rounded-lg mt-4">
          <h2 className="text-xl font-semibold mb-4">All Orders</h2>
          <p>Orders list will be displayed here...</p>
        </TabsContent>

        <TabsContent value="delivery" className="p-4 bg-white shadow-md rounded-lg mt-4">
          <h2 className="text-xl font-semibold mb-4">All Delivery Partners</h2>
          <p>Delivery partners list will be displayed here...</p>
        </TabsContent>

        <TabsContent value="status" className="p-4 bg-white shadow-md rounded-lg mt-4">
          <h2 className="text-xl font-semibold mb-4">Live Status</h2>
          <p>Live status updates will be displayed here...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
