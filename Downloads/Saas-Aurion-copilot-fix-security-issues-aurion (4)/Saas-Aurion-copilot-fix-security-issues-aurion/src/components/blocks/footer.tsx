import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Linkedin, Github, Instagram, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#F8F9FB] border-t border-gray-200 py-16 px-6 relative z-50 text-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4 tracking-tight">AURION</h2>
            <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
              Empowering the next generation of digital creators with AI-powered tools that inspire and enable innovation across all mediums.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email for updates"
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all w-full sm:w-64"
              />
              <button className="px-6 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                Subscribe <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="font-bold mb-6">Company</h3>
            <ul className="space-y-3 text-gray-500">
              <li><Link to="/about" className="hover:text-black transition-colors">About Us</Link></li>
              <li><Link to="/features" className="hover:text-black transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-black transition-colors">Pricing</Link></li>
              <li><Link to="/blog" className="hover:text-black transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-black transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="font-bold mb-6">Legal</h3>
            <ul className="space-y-3 text-gray-500">
              <li><Link to="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-black transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-black transition-colors">Cookie Policy</Link></li>
              <li><Link to="/gdpr" className="hover:text-black transition-colors">GDPR Compliance</Link></li>
              <li><Link to="/legal-notice" className="hover:text-black transition-colors">Legal Notice</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} AURION Inc. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors">
              <Twitter size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors">
              <Linkedin size={20} />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors">
              <Github size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors">
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
