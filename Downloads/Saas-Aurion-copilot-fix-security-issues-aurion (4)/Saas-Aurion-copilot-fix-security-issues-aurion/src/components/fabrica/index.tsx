import Navigation from "./Navigation";
import HeroTypography from "./HeroTypography";
import ServiceList from "./ServiceList";
import MissionStatement from "./MissionStatement";
import Footer from "./Footer";
import LavaLampBackground from "./LavaLampBackground";
import CustomCursor from "./CustomCursor";

const FabricaLanding = () => {
  return (
    <div className="relative min-h-screen h-screen w-full bg-black overflow-hidden cursor-none md:cursor-none">
      {/* Top Border Bar - black */}
      <div className="fixed top-0 left-0 right-0 h-2 md:h-3 bg-black z-[100]" />

      {/* Custom Cursor */}
      <CustomCursor />

      {/* Animated Background */}
      <LavaLampBackground />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="relative z-10 h-full flex flex-col px-6 md:px-12 lg:px-16 pt-20 md:pt-24 pb-6 md:pb-8">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-16">
          {/* Left: Hero Typography */}
          <div className="flex-1">
            <HeroTypography />
          </div>

          {/* Right: Services */}
          <div className="lg:self-start lg:mt-[15%]">
            <ServiceList />
          </div>
        </div>



        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 lg:gap-16">
          {/* Left: Mission Statement */}
          <div className="order-2 lg:order-1 max-w-md">
            <MissionStatement />
          </div>

          {/* Right: Footer (Confidentialité & Politique) */}
          <div className="order-1 lg:order-2">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FabricaLanding;