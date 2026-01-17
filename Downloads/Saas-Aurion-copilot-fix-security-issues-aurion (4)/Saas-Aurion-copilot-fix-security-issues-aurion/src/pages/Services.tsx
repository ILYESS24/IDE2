import { GrainGradient } from "@paper-design/shaders-react";

const Services: React.FC = () => {
  return (
    <div
      className="fixed inset-0 bg-background flex items-center justify-center relative overflow-hidden"
      style={{
        zIndex: 9999,
        width: "calc(100vw - 16px)",
        height: "calc(100vh - 16px)",
        borderRadius: "32px",
        border: "16px solid black",
        margin: "8px"
      }}
    >
      {/* Background with GrainGradient */}
      <div className="absolute inset-0">
        <GrainGradient
          style={{ height: "100%", width: "100%" }}
          colorBack="hsl(0, 0%, 5%)"
          softness={0.76}
          intensity={0.3}
          noise={0.02}
          shape="corners"
          offsetX={0}
          offsetY={0}
          scale={1}
          rotation={135}
          speed={0.3}
          colors={["hsl(200, 100%, 50%)", "hsl(220, 90%, 56%)", "hsl(280, 80%, 60%)"]}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 max-w-7xl mx-auto py-20 w-full">
        {/* Header Section */}
        <div className="text-center mb-20">
        <span className="text-white/60 text-sm md:text-base uppercase tracking-[0.3em] font-medium block mb-6">
          AI App Builder - No-Code Mobile Apps
        </span>
        <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-bold mb-8">
          App Builder
        </h1>
        <p className="text-white/80 text-lg md:text-xl lg:text-2xl font-light max-w-4xl mx-auto mb-16">
          Build mobile apps without coding. Generate code, design interfaces, deploy to stores.
        </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Left Column */}
          <div className="space-y-16">
            {/* Service 1 */}
            <div className="group">
              <div className="flex-1">
                  <h2 className="text-white text-2xl md:text-3xl font-bold mb-4">
                    Cross-Platform App Development - iOS, Android & Web
                  </h2>
                  <p className="text-white/70 text-lg leading-relaxed mb-6">
                    Build apps for iOS, Android, web. Cross-platform code generation. Multi-platform solution.
                  </p>
                  <ul className="text-white/60 space-y-2">
                    <li className="flex items-center gap-3">
                      <span className="text-white/40">•</span>
                      iOS & Android App Builder
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-white/40">•</span>
                      React Native Development
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-white/40">•</span>
                      Flutter App Creator
                    </li>
                  </ul>
              </div>
            </div>

            {/* Service 2 */}
            <div className="group">
              <div className="flex-1">
                  <h2 className="text-white text-2xl md:text-3xl font-bold mb-4">
                    AI App Code Generation - Automatic Programming
                  </h2>
                  <p className="text-white/70 text-lg leading-relaxed mb-6">
                    Generate mobile app code with AI. Create components, API integrations. AI code generator.
                  </p>
                  <ul className="text-white/60 space-y-2">
                    <li className="flex items-center gap-3">
                      <span className="text-white/40">•</span>
                      AI Code Generation Tool
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-white/40">•</span>
                      Automated App Development
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-white/40">•</span>
                      AI Programming Assistant
                    </li>
                  </ul>
              </div>
            </div>

            {/* Service 3 */}
            <div className="group">
              <div className="flex-1">
                <h2 className="text-white text-2xl md:text-3xl font-bold mb-4">
                  Automated Testing
                </h2>
                <p className="text-white/70 text-lg leading-relaxed mb-6">
                  Ensure app quality with AI-generated test suites. Automated testing for UI components, API endpoints, and user flows with intelligent test case generation.
                </p>
                <ul className="text-white/60 space-y-2">
                  <li className="flex items-center gap-3">
                    <span className="text-white/40">•</span>
                    Unit & Integration Tests
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-white/40">•</span>
                    UI Testing Automation
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-white/40">•</span>
                    Performance Testing
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-16">
            {/* Service 4 */}
            <div className="group">
              <div className="flex-1">
                <h2 className="text-white text-2xl md:text-3xl font-bold mb-4">
                  App Store Deployment
                </h2>
                <p className="text-white/70 text-lg leading-relaxed mb-6">
                  Deploy your apps to app stores with automated build and submission processes. Handle certificates, provisioning profiles, and store guidelines automatically.
                </p>
                <ul className="text-white/60 space-y-2">
                  <li className="flex items-center gap-3">
                    <span className="text-white/40">•</span>
                    App Store Submission
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-white/40">•</span>
                    Build Automation
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-white/40">•</span>
                      Certificate Management
                  </li>
                </ul>
              </div>
            </div>

            {/* Service 5 */}
            <div className="group">
              <div className="flex-1">
                <h2 className="text-white text-2xl md:text-3xl font-bold mb-4">
                  Backend Integration
                </h2>
                <p className="text-white/70 text-lg leading-relaxed mb-6">
                  Connect your apps to powerful backend services with AI-generated integrations. Database setup, API connections, and cloud service integration made simple.
                </p>
                <ul className="text-white/60 space-y-2">
                  <li className="flex items-center gap-3">
                    <span className="text-white/40">•</span>
                    Database Integration
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-white/40">•</span>
                    API Connection Setup
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-white/40">•</span>
                    Cloud Service Integration
                  </li>
                </ul>
              </div>
            </div>

            {/* Service 6 */}
            <div className="group">
              <div className="flex-1">
                <h2 className="text-white text-2xl md:text-3xl font-bold mb-4">
                  Real-Time Collaboration
                </h2>
                <p className="text-white/70 text-lg leading-relaxed mb-6">
                  Work together on app development with real-time collaboration tools. Share projects, review code changes, and manage development workflows as a team.
                </p>
                <ul className="text-white/60 space-y-2">
                  <li className="flex items-center gap-3">
                    <span className="text-white/40">•</span>
                    Live Code Sharing
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-white/40">•</span>
                    Code Review Tools
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-white/40">•</span>
                    Project Management
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-white text-3xl md:text-4xl font-bold mb-6">
            Start Building Your App Today
          </h2>
          <p className="text-white/70 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Transform your app ideas into reality with AI-powered development tools. From concept to launch, we've got you covered.
          </p>
          <button className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full transition-all duration-300 border border-black">
            Build Your App
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Services;
