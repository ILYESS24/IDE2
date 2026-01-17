import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ButtonGetStarted } from "@/components/ui/button-get-started";

const navItems = [
  { name: "Home", href: "#home" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0 }}
      className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 flex items-center justify-between px-6 md:px-12 lg:px-16"
    >
      {/* Logo */}
      <a href="/" className="text-white text-base md:text-lg font-medium tracking-tight font-display">
        aurion<span className="text-[10px] md:text-xs align-super">®</span>
      </a>

      {/* Desktop Navigation - Centered */}
      <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 gap-12 lg:gap-16">
        {navItems.map((item) => (
          <motion.a
            key={item.name}
            href={item.href.startsWith('/') ? undefined : item.href}
            onClick={(e) => {
              if (item.href.startsWith('/')) {
                e.preventDefault();
                navigate(item.href);
              }
            }}
            className="text-white text-sm lg:text-base font-normal relative group font-body cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {item.name}
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-300" />
          </motion.a>
        ))}
      </div>

      {/* Get Started Button - CONNECTÉ À CLERK */}
      <ButtonGetStarted />

    </motion.nav>
  );
};

export default Navigation;