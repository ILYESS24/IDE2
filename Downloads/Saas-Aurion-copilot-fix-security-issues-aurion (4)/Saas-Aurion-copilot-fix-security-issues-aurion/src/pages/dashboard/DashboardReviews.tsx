/* eslint-disable @typescript-eslint/no-unused-vars */
import { useTeamMembers } from "@/hooks/use-data";
import { Star, MessageSquare, ThumbsUp, Calendar, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardReviews() {
  const { data: people, isLoading } = useTeamMembers();

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="h-full p-6 bg-[#F2F2EE] overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Performance Reviews</h1>
          <p className="text-gray-500">Employee feedback and evaluations</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white text-gray-900 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
            Cycle Settings
          </button>
          <button className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
            Start New Cycle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {people?.map((person, index) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[32px] p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h3 className="font-bold text-gray-900">{person.name}</h3>
                  <p className="text-sm text-gray-500">{person.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-sm font-bold">
                <Star size={14} fill="currentColor" />
                4.8
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-sm text-gray-600 italic">"Consistent high performer, great leadership skills..."</p>
                <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                  <span>Last review: 2 months ago</span>
                  <span>By Manager</span>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 p-3 border border-gray-100 rounded-xl text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Goals</p>
                  <p className="font-bold text-gray-900">8/10</p>
                </div>
                <div className="flex-1 p-3 border border-gray-100 rounded-xl text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Growth</p>
                  <p className="font-bold text-gray-900">+15%</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <MessageSquare size={18} />
              Write Review
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

