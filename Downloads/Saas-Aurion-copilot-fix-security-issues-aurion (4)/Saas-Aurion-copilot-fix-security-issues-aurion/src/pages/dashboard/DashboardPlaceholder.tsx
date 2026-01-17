 
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { 
  Briefcase, 
  Laptop, 
  DollarSign, 
  Star,
  Construction,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const pageConfig: Record<string, { title: string; description: string; icon: React.ElementType; color: string }> = {
  hiring: {
    title: "Recrutement",
    description: "Gérez vos offres d'emploi et candidatures",
    icon: Briefcase,
    color: "from-green-400 to-emerald-500"
  },
  devices: {
    title: "Appareils",
    description: "Gérez les équipements de votre équipe",
    icon: Laptop,
    color: "from-gray-400 to-slate-500"
  },
  salary: {
    title: "Salaires",
    description: "Consultez et gérez les rémunérations",
    icon: DollarSign,
    color: "from-yellow-400 to-orange-500"
  },
  reviews: {
    title: "Évaluations",
    description: "Suivez les performances de votre équipe",
    icon: Star,
    color: "from-purple-400 to-pink-500"
  }
};

export default function DashboardPlaceholder() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegment = location.pathname.split('/').pop() || 'hiring';
  const config = pageConfig[pathSegment] || pageConfig.hiring;
  const Icon = config.icon;

  return (
    <div className="flex-1 flex items-center justify-center h-full px-10 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className={`w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
          <Icon size={40} className="text-white" />
        </div>

        <h1 className="text-3xl font-semibold text-gray-900 mb-3">
          {config.title}
        </h1>
        
        <p className="text-gray-500 mb-8">
          {config.description}
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center gap-2 text-yellow-700 mb-2">
            <Construction size={20} />
            <span className="font-medium">En construction</span>
          </div>
          <p className="text-sm text-yellow-600">
            Cette fonctionnalité sera bientôt disponible. 
            Nous travaillons dur pour vous offrir la meilleure expérience.
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-crextio-dark text-white rounded-xl hover:bg-black transition-colors"
        >
          <ArrowLeft size={18} />
          Retour au Dashboard
        </button>
      </motion.div>
    </div>
  );
}

