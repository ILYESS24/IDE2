import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="flex flex-wrap items-center gap-3 md:gap-4 text-white/40 text-[10px] md:text-xs font-body"
    >
      <Link to="/privacy" className="hover:text-white/60 transition-colors">Confidentialité</Link>
      <span className="text-white/20">|</span>
      <Link to="/terms" className="hover:text-white/60 transition-colors">Conditions d'utilisation</Link>
      <span className="text-white/20">|</span>
      <Link to="/cookies" className="hover:text-white/60 transition-colors">Politique des cookies</Link>
      <span className="text-white/20">|</span>
      <Link to="/legal" className="hover:text-white/60 transition-colors">Mentions légales</Link>
    </motion.div>
  );
};

export default Footer;