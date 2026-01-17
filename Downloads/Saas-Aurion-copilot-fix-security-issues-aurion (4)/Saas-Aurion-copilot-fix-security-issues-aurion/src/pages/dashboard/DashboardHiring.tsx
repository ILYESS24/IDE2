/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCandidates } from "@/hooks/use-extended-data";
import { Search, Plus, Filter, MoreHorizontal, FileText, Calendar, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardHiring() {
  const { data: candidates, isLoading } = useCandidates();

  if (isLoading) return <div className="p-8">Loading...</div>;

  const stages = [
    { id: 'applied', label: 'Applied', color: 'bg-blue-500' },
    { id: 'screening', label: 'Screening', color: 'bg-yellow-500' },
    { id: 'interview', label: 'Interview', color: 'bg-purple-500' },
    { id: 'offer', label: 'Offer', color: 'bg-green-500' },
  ];

  return (
    <div className="h-full p-6 bg-[#F2F2EE] overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hiring</h1>
          <p className="text-gray-500">Track and manage candidates</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
          <Plus size={18} />
          Post Job
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6">
        {stages.map((stage) => (
          <div key={stage.id} className="min-w-[300px] flex-1">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                <span className="bg-white px-2 py-0.5 rounded-full text-xs text-gray-500 border border-gray-200">
                  {candidates?.filter(c => c.stage === stage.id).length}
                </span>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {candidates?.filter(c => c.stage === stage.id).map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <img src={candidate.avatar} alt={candidate.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{candidate.name}</h4>
                        <p className="text-gray-500 text-xs">{candidate.role}</p>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {candidate.score > 0 && (
                      <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
                        <Star size={12} fill="currentColor" />
                        {candidate.score}% Match
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-gray-400 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {candidate.applied_date}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText size={12} />
                      Resume
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

