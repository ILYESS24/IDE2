import { useNotifications } from "@/hooks/use-extended-data";
import { Bell, Check, Info, AlertTriangle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Notifications() {
  const { data: notifications, isLoading } = useNotifications();

  if (isLoading) return <div className="p-8">Loading...</div>;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check size={20} className="text-green-600" />;
      case 'warning': return <AlertTriangle size={20} className="text-orange-600" />;
      case 'error': return <XCircle size={20} className="text-red-600" />;
      default: return <Info size={20} className="text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100';
      case 'warning': return 'bg-orange-100';
      case 'error': return 'bg-red-100';
      default: return 'bg-blue-100';
    }
  };

  return (
    <div className="h-full p-6 bg-[#F2F2EE] overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-gray-500">Stay updated with latest activity</p>
        </div>
        <button className="text-sm text-gray-600 hover:text-black font-medium">
          Mark all as read
        </button>
      </div>

      <div className="max-w-3xl space-y-4">
        {notifications?.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl flex gap-4 ${notification.read ? 'bg-white' : 'bg-white border-l-4 border-black'}`}
          >
            <div className={`w-12 h-12 rounded-full ${getBgColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
              {getIcon(notification.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className={`font-bold text-gray-900 ${!notification.read && 'text-lg'}`}>
                  {notification.title}
                </h3>
                <span className="text-xs text-gray-400">{notification.date}</span>
              </div>
              <p className="text-gray-600 mt-1">{notification.message}</p>
            </div>
          </motion.div>
        ))}

        {notifications?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}

