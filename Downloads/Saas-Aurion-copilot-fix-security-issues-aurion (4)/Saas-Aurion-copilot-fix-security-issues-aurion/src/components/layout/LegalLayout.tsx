import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  lastUpdated?: string;
}

export function LegalLayout({ title, subtitle, children, lastUpdated }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <Link to="/" className="font-bold text-xl tracking-tight">AURION</Link>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-gray-500 mb-6">
              {subtitle}
            </p>
          )}
          {lastUpdated && (
            <p className="text-sm text-gray-400 uppercase tracking-widest font-medium">
              Last Updated: {lastUpdated}
            </p>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="prose prose-gray prose-lg max-w-none">
          {children}
        </div>
      </main>

      {/* Simple Footer for Legal Pages */}
      <footer className="border-t border-gray-200 py-12 bg-white mt-auto">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} AURION. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-black">Privacy</Link>
            <Link to="/terms" className="hover:text-black">Terms</Link>
            <Link to="/contact" className="hover:text-black">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

