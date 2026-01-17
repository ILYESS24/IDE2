import React, { useState } from "react";
import { LegalLayout } from "../components/layout/LegalLayout";
import { Send, CheckCircle, Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Logic to send email would go here
  };

  if (submitted) {
    return (
      <LegalLayout title="Get In Touch" subtitle="We'd love to hear from you.">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
          <p className="text-gray-500 max-w-md">
            Thank you for reaching out. Our team will get back to you as soon as possible.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="mt-8 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            Send Another Message
          </button>
        </div>
      </LegalLayout>
    );
  }

  return (
    <LegalLayout title="Get In Touch" subtitle="Have questions? We're here to help.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-bold mb-6">Send us a message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                type="text" 
                id="name" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                id="email" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea 
                id="message" 
                required 
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-none"
                placeholder="How can we help?"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Send Message
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6">Contact Information</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail size={20} className="text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-gray-500 text-sm mb-1">Our friendly team is here to help.</p>
                <a href="mailto:contact@aurion.ai" className="text-black font-medium hover:underline">contact@aurion.ai</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin size={20} className="text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold">Office</h3>
                <p className="text-gray-500 text-sm mb-1">Come say hello at our office HQ.</p>
                <p className="text-black font-medium">123 AI Boulevard, San Francisco, CA</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone size={20} className="text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-gray-500 text-sm mb-1">Mon-Fri from 8am to 5pm.</p>
                <p className="text-black font-medium">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
            <h3 className="font-bold mb-2">Support</h3>
            <p className="text-gray-500 text-sm mb-4">
              Looking for technical support? Visit our Help Center for documentation and FAQs.
            </p>
            <a href="/creation/help" className="text-sm font-bold text-black hover:underline">Visit Help Center →</a>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
}

