"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut } from "lucide-react"
import AllOrdersTab from "./AllOrdersTab"
import { useRouter } from "next/navigation"
import AllDeliveryPartners from "./AllDeliveryPartners"

export default function AdminDashboard() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.clear()
    router.push("/login")
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1" />
        <h1 className="text-2xl font-bold text-center flex-1">Admin Dashboard</h1>
        <div className="flex-1 flex justify-end">
          <LogOut
            onClick={handleLogout}
            className="w-6 h-6 text-black cursor-pointer hover:text-red-600 transition-colors"
          />
        </div>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="orders">All Orders</TabsTrigger>
          <TabsTrigger value="delivery">All Delivery Partners</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <AllOrdersTab />
        </TabsContent>

        <TabsContent value="delivery">
          <AllDeliveryPartners />
        </TabsContent>
      </Tabs>
    </div>
  )
}
