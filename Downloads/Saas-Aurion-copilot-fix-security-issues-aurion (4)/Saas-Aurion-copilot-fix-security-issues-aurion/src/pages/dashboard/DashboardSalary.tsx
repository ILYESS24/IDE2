 
import { useTeamMembers } from "@/hooks/use-data";
import { DollarSign, TrendingUp, Download, PieChart, CreditCard, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from "framer-motion";

export default function DashboardSalary() {
  const { data: people, isLoading } = useTeamMembers();

  if (isLoading) return <div className="p-8">Loading...</div>;

  const totalPayroll = people?.reduce((acc, curr) => acc + curr.salary, 0) || 0;
  const avgSalary = totalPayroll / (people?.length || 1);

  const chartData = people?.map(p => ({
    name: p.name.split(' ')[0],
    salary: p.salary,
  })) || [];

  return (
    <div className="h-full p-6 bg-[#F2F2EE] overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Salary & Payroll</h1>
          <p className="text-gray-500">Financial overview and payroll management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
          <Download size={18} />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-[32px] shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Payroll (Yearly)</p>
              <h3 className="text-2xl font-bold text-gray-900">${(totalPayroll / 1000).toFixed(1)}k</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-lg w-fit">
            <TrendingUp size={14} />
            +12% vs last year
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-[32px] shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
              <PieChart size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg. Salary</p>
              <h3 className="text-2xl font-bold text-gray-900">${(avgSalary / 1000).toFixed(1)}k</h3>
            </div>
          </div>
          <p className="text-sm text-gray-400">Across {people?.length} employees</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-[32px] shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Next Payday</p>
              <h3 className="text-2xl font-bold text-gray-900">Oct 30</h3>
            </div>
          </div>
          <p className="text-sm text-gray-400">12 days remaining</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[32px] shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Salary Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="salary" radius={[8, 8, 8, 8]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#18181B' : '#E4E4E7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Payments</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <CreditCard size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Payroll Run</p>
                    <p className="text-xs text-gray-500">Oct 15, 2023</p>
                  </div>
                </div>
                <span className="font-mono text-sm font-medium">-$42,350</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

