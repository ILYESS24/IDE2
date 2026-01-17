 
import { useDevices } from "@/hooks/use-extended-data";
import { Search, Plus, Monitor, Smartphone, Laptop, MoreVertical, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardDevices() {
  const { data: devices, isLoading } = useDevices();

  if (isLoading) return <div className="p-8">Loading...</div>;

  const getIcon = (type: string) => {
    switch (type) {
      case 'laptop': return <Laptop size={20} />;
      case 'phone': return <Smartphone size={20} />;
      default: return <Monitor size={20} />;
    }
  };

  return (
    <div className="h-full p-6 bg-[#F2F2EE] overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Devices</h1>
          <p className="text-gray-500">Inventory and asset management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
          <Plus size={18} />
          Add Device
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search serial number, name..." 
              className="w-full pl-12 pr-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <RefreshCw size={20} />
          </button>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Device Name</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Serial Number</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Purchase Date</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {devices?.map((device, index) => (
              <motion.tr 
                key={device.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                      {getIcon(device.type)}
                    </div>
                    <span className="font-medium text-gray-900">{device.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    device.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' :
                    device.status === 'maintenance' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                    'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                    {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  {device.assigned_to ? 'Assigned' : 'Unassigned'}
                </td>
                <td className="py-4 px-6 text-sm text-gray-500 font-mono">
                  {device.serial}
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  {device.purchase_date}
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

