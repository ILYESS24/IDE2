import { motion } from "framer-motion";

const HeroTypography = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative"
    >
      <h1 className="font-display font-black text-white leading-[0.85] tracking-[-0.02em]">
        <span className="block text-[60px] sm:text-[100px] md:text-[140px] lg:text-[180px] xl:text-[200px]">
          aurion
          <span className="inline-flex items-start align-top">
            <span className="relative ml-1 md:ml-3">
              <span className="text-[30px] sm:text-[50px] md:text-[70px] lg:text-[90px] xl:text-[100px] font-bold border-[2px] md:border-[3px] lg:border-4 border-white rounded-full w-[40px] h-[40px] sm:w-[60px] sm:h-[60px] md:w-[80px] md:h-[80px] lg:w-[100px] lg:h-[100px] xl:w-[110px] xl:h-[110px] inline-flex items-center justify-center">
                R
              </span>
            </span>
          </span>
        </span>
        <span className="block text-[40px] sm:text-[70px] md:text-[90px] lg:text-[110px] xl:text-[120px] mt-0 md:mt-[-10px] ml-[20%] sm:ml-[25%] md:ml-[30%]">
          Studio
        </span>
      </h1>
    </motion.div>
  );
};

export default HeroTypography;