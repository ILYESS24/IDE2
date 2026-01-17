/* eslint-disable @typescript-eslint/no-unused-vars */
import { useProfile } from "@/hooks/use-data";
import { User, CreditCard, Bell, Shield, Key, Globe, Moon, Monitor, Check, Copy, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Type definitions for notification settings
type EmailNotificationKey = 'updates' | 'reports' | 'invoices' | 'features';
type PushNotificationKey = 'comments' | 'generation' | 'team';

interface NotificationSettings {
  email: Record<EmailNotificationKey, boolean>;
  push: Record<PushNotificationKey, boolean>;
}

export default function Settings() {
  const { data: profile } = useProfile();
  const [activeTab, setActiveTab] = useState('general');
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Production Key', key: 'pk_live_...', created: '2 months ago' },
    { id: '2', name: 'Test Key', key: 'pk_test_...', created: '1 week ago' },
  ]);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      updates: true,
      reports: true,
      invoices: true,
      features: false
    },
    push: {
      comments: true,
      generation: true,
      team: false
    }
  });

  const toggleNotification = (type: 'email' | 'push', key: EmailNotificationKey | PushNotificationKey) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: !prev[type][key as keyof typeof prev[typeof type]]
      }
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api', label: 'API Keys', icon: Key },
  ];

  return (
    <div className="h-full p-6 bg-[#F2F2EE] overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-2 flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-black text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* ================= GENERAL TAB ================= */}
                {activeTab === 'general' && (
                  <>
                    <div className="bg-white p-8 rounded-[32px] shadow-sm">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                      
                      <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-4 border-gray-50">
                          <img src={profile?.avatar_url || "https://github.com/shadcn.png"} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <button className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                            Change Avatar
                          </button>
                          <button className="ml-3 px-4 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-full transition-colors">
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            defaultValue={profile?.full_name || ""}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-black/20 focus:ring-2 focus:ring-black/30 focus:border-black/40 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            defaultValue={profile?.email || ""}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-black/20 focus:ring-2 focus:ring-black/30 focus:border-black/40 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] shadow-sm">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Appearance</h2>
                      <div className="grid grid-cols-3 gap-4">
                        <button className="p-4 rounded-2xl border-2 border-black bg-gray-50 flex flex-col items-center gap-3 relative">
                          <div className="absolute top-3 right-3 text-black"><Check size={16} /></div>
                          <Monitor size={24} />
                          <span className="text-sm font-medium">System</span>
                        </button>
                        <button className="p-4 rounded-2xl border-2 border-transparent bg-gray-50 flex flex-col items-center gap-3 hover:bg-gray-100 transition-colors">
                          <Moon size={24} />
                          <span className="text-sm font-medium">Dark</span>
                        </button>
                        <button className="p-4 rounded-2xl border-2 border-transparent bg-gray-50 flex flex-col items-center gap-3 hover:bg-gray-100 transition-colors">
                          <Globe size={24} />
                          <span className="text-sm font-medium">Light</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* ================= BILLING TAB ================= */}
                {activeTab === 'billing' && (
                  <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[32px] shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Current Plan</h2>
                          <p className="text-gray-500">You are on the Pro plan</p>
                        </div>
                        <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">Active</span>
                      </div>
                      
                      <div className="flex items-end gap-2 mb-6">
                        <span className="text-4xl font-bold text-gray-900">$29</span>
                        <span className="text-gray-500 mb-1">/ month</span>
                      </div>

                      <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                        <div className="bg-green-500 h-full w-3/4 rounded-full"></div>
                      </div>
                      <p className="text-sm text-gray-500 mb-6">750 / 1000 credits used</p>

                      <div className="flex gap-3">
                        <button className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
                          Upgrade Plan
                        </button>
                        <button className="px-6 py-3 border border-gray-200 text-gray-900 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                          Manage Subscription
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] shadow-sm">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
                      <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <CreditCard size={24} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">•••• •••• •••• 4242</p>
                            <p className="text-sm text-gray-500">Expires 12/24</p>
                          </div>
                        </div>
                        <button className="text-sm font-medium text-gray-600 hover:text-black">Edit</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= NOTIFICATIONS TAB ================= */}
                {activeTab === 'notifications' && (
                  <div className="bg-white p-8 rounded-[32px] shadow-sm space-y-8">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Email Notifications</h2>
                      <div className="space-y-4">
                        {([
                          { key: 'updates' as EmailNotificationKey, label: 'Product updates and announcements' },
                          { key: 'reports' as EmailNotificationKey, label: 'Weekly usage reports' },
                          { key: 'invoices' as EmailNotificationKey, label: 'Payment success and invoice' },
                          { key: 'features' as EmailNotificationKey, label: 'New features and tips' }
                        ]).map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <span className="text-gray-700">{item.label}</span>
                            <button
                              
                              onClick={() => toggleNotification('email', item.key)}
                              
                              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${notificationSettings.email[item.key] ? 'bg-black' : 'bg-gray-200'}`}
                            >
                              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform duration-200 ${
                                
                                notificationSettings.email[item.key] ? 'right-0.5' : 'left-0.5'
                              }`}></div>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Push Notifications</h2>
                      <div className="space-y-4">
                        {([
                          { key: 'comments' as PushNotificationKey, label: 'Comments on your projects' },
                          { key: 'generation' as PushNotificationKey, label: 'Generation completed' },
                          { key: 'team' as PushNotificationKey, label: 'New team member joined' }
                        ]).map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <span className="text-gray-700">{item.label}</span>
                            <button
                              
                              onClick={() => toggleNotification('push', item.key)}
                              
                              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${notificationSettings.push[item.key] ? 'bg-black' : 'bg-gray-200'}`}
                            >
                              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform duration-200 ${
                                
                                notificationSettings.push[item.key] ? 'right-0.5' : 'left-0.5'
                              }`}></div>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= SECURITY TAB ================= */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[32px] shadow-sm">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Password</h2>
                      <div className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                          <input type="password" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-black/20 focus:ring-2 focus:ring-black/30 focus:border-black/40 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <input type="password" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-black/20 focus:ring-2 focus:ring-black/30 focus:border-black/40 outline-none transition-all" />
                        </div>
                        <button className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-1">Two-Factor Authentication</h2>
                          <p className="text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <button className="px-6 py-3 border border-gray-200 text-gray-900 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= API KEYS TAB ================= */}
                {activeTab === 'api' && (
                  <div className="bg-white p-8 rounded-[32px] shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">API Keys</h2>
                        <p className="text-gray-500">Manage your API access keys</p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm font-medium">
                        <Plus size={16} />
                        Create New Key
                      </button>
                    </div>

                    <div className="space-y-4">
                      {apiKeys.map((key) => (
                        <div key={key.id} className="p-4 border border-gray-100 rounded-2xl flex items-center justify-between hover:border-gray-300 transition-colors">
                          <div>
                            <h3 className="font-bold text-gray-900">{key.name}</h3>
                            <p className="text-xs text-gray-400">Created {key.created}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <code className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-600 font-mono">
                              {key.key}
                            </code>
                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                              <Copy size={16} />
                            </button>
                            <button className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-400 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
