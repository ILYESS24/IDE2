import { motion } from "framer-motion";

const MissionStatement = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="max-w-xs md:max-w-sm"
    >
      <p className="text-white text-xs md:text-sm leading-relaxed font-body">
        <span className="font-semibold">No generic websites. No empty marketing promises.</span>{" "}
        <span className="text-white/60">
          Just tools and strategies that help your business grow and your brand shine.
        </span>
      </p>
    </motion.div>
  );
};

export default MissionStatement;