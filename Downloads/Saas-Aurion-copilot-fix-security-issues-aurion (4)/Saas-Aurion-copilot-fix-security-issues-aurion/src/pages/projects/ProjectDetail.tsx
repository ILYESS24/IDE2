import { useParams } from "react-router-dom";
import { useProjects } from "@/hooks/use-extended-data";
import { CheckCircle, Clock, Users, MoreHorizontal, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();
  
  const project = projects?.find(p => p.id === id);

  if (isLoading) return <div className="p-8">Loading...</div>;

  if (!project) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#F2F2EE]">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h2>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="h-full p-6 bg-[#F2F2EE] overflow-y-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-[40px] p-8 shadow-sm">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{project.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.status === 'active' ? 'bg-green-100 text-green-700' :
                project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {project.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xl text-gray-500 max-w-2xl">{project.description}</p>
          </div>
          <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="p-6 bg-gray-50 rounded-3xl">
            <div className="flex items-center gap-3 mb-2 text-gray-600">
              <CheckCircle size={20} />
              <span className="font-medium">Progress</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-900">{project.progress}%</span>
              <div className="flex-1 h-3 bg-gray-200 rounded-full mb-2 overflow-hidden">
                <div className="h-full bg-black rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-3xl">
            <div className="flex items-center gap-3 mb-2 text-gray-600">
              <Users size={20} />
              <span className="font-medium">Team</span>
            </div>
            <div className="flex -space-x-3">
              {project.members.map((m, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-xs font-bold">
                  {m}
                </div>
              ))}
              <button className="w-10 h-10 rounded-full border-2 border-white bg-black text-white flex items-center justify-center text-xs font-bold hover:bg-gray-800 transition-colors">
                +
              </button>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-3xl">
            <div className="flex items-center gap-3 mb-2 text-gray-600">
              <Clock size={20} />
              <span className="font-medium">Last Update</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{project.updated_at}</span>
          </div>
        </div>

        {/* Placeholder for project content */}
        <div className="h-64 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
          Project Content Area
        </div>
      </div>
    </div>
  );
}

