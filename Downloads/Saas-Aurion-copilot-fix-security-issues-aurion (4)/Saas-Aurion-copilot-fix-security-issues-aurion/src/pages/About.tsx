import React from "react";
import { LegalLayout } from "../components/layout/LegalLayout";

export default function About() {
  return (
    <LegalLayout 
      title="About Us" 
      subtitle="We're building the future of creative expression."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold font-display mb-6">Our Mission</h2>
        <p className="text-xl text-gray-500 leading-relaxed font-light font-body">
          At AURION, we believe that productivity is a fundamental human right. Our mission is to democratize access to advanced AI tools, enabling anyone—regardless of technical skill—to enhance their workflow through the power of artificial intelligence.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-gray-100 rounded-3xl h-64 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop" 
            alt="Team working" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="text-xl font-bold font-display mb-4">Who We Are</h3>
          <p className="text-gray-600 font-body mb-6">
            Founded in 2024 in San Francisco, AURION is a team of engineers, artists, and researchers passionate about the intersection of technology and art.
          </p>
          <div className="flex gap-8">
            <div>
              <span className="block text-3xl font-bold font-display text-black">20+</span>
              <span className="text-sm text-gray-500 font-body">Team Members</span>
            </div>
            <div>
              <span className="block text-3xl font-bold font-display text-black">10k+</span>
              <span className="text-sm text-gray-500 font-body">Creators</span>
            </div>
            <div>
              <span className="block text-3xl font-bold font-display text-black">1M+</span>
              <span className="text-sm text-gray-500 font-body">Generations</span>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold font-display mb-6">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-gray-100 rounded-2xl">
            <h3 className="font-bold font-display mb-2">Innovation First</h3>
            <p className="text-sm text-gray-500 font-body">We push the boundaries of what's possible with generative AI every single day.</p>
          </div>
          <div className="p-6 bg-white border border-gray-100 rounded-2xl">
            <h3 className="font-bold font-display mb-2">Creator Centric</h3>
            <p className="text-sm text-gray-500 font-body">We build tools that empower artists, not replace them. Human intent is at the core.</p>
          </div>
          <div className="p-6 bg-white border border-gray-100 rounded-2xl">
            <h3 className="font-bold font-display mb-2">Ethical AI</h3>
            <p className="text-sm text-gray-500 font-body">We are committed to responsible AI development, safety, and transparency.</p>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}

