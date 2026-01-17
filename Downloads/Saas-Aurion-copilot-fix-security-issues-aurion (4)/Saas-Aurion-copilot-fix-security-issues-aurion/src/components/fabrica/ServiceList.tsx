import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const services = [
  "Code Editor",
  "Intelligent Canvas",
  "Text Editor",
  "App Builder",
  "Agent AI",
];

// Mapping des services vers les routes d'outils
const serviceToToolId = {
  "Code Editor": "code-editor",
  "Intelligent Canvas": "content-generator", // Canvas intelligent → Content Generator
  "Text Editor": "text-editor",
  "App Builder": "app-builder",
  "Agent AI": "ai-agents",
};

const ServiceList = () => {
  const navigate = useNavigate();

  const handleServiceClick = (serviceName: string) => {
    const toolId = serviceToToolId[serviceName as keyof typeof serviceToToolId];
    if (toolId) {
      navigate(`/tools/${toolId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="flex flex-col gap-2 md:gap-3 text-right"
    >
      {services.map((service, index) => (
        <motion.div
          key={service}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
          className="group cursor-pointer"
          onClick={() => handleServiceClick(service)}
        >
          <motion.span
            className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-relaxed block font-display hover:text-white/80 transition-colors"
            whileHover={{ x: -8 }}
            transition={{ duration: 0.2 }}
          >
            {service}
          </motion.span>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ServiceList;