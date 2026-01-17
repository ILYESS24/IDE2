 
import { useState } from "react";
import { useTeamMembers } from "@/hooks/use-data";
import { Search, Plus, MoreHorizontal, Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPeople() {
  const { data: people, isLoading } = useTeamMembers();
  const [filter, setFilter] = useState("");

  if (isLoading) return <div className="p-8">Loading...</div>;

  const filteredPeople = people?.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) || 
    p.role.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="h-full p-6 bg-[#F2F2EE] overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">People</h1>
          <p className="text-gray-500">Manage your team and employees</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search employees..." 
          className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-black/5"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPeople?.map((person, index) => (
          <motion.div 
            key={person.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[32px] p-6 shadow-sm hover:shadow-md transition-shadow relative group"
          >
            <button className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
              <MoreHorizontal size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-gray-50">
                <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{person.name}</h3>
              <p className="text-gray-500 font-medium">{person.role}</p>
              <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                person.status === 'active' ? 'bg-green-100 text-green-700' :
                person.status === 'vacation' ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {person.status}
              </span>
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail size={16} />
                <span>{person.name.toLowerCase().replace(' ', '.')}@aurion.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={16} />
                <span>+1 (555) 000-0000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin size={16} />
                <span>San Francisco, CA</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 py-2 rounded-xl bg-gray-50 text-gray-900 font-medium hover:bg-gray-100 transition-colors">
                Profile
              </button>
              <button className="flex-1 py-2 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-colors">
                Message
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
