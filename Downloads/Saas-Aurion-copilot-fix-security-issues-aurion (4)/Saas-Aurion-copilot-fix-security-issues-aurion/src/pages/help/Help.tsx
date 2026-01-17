import { Search, Book, MessageCircle, FileQuestion, Mail } from "lucide-react";

export default function Help() {
  return (
    <div className="h-full p-6 bg-[#F2F2EE] overflow-y-auto">
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
        <p className="text-gray-500 text-lg mb-8">Search our knowledge base or contact support</p>
        
        <div className="relative max-w-2xl mx-auto mb-12">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          <input 
            type="text" 
            placeholder="Search for answers..." 
            className="w-full pl-16 pr-6 py-4 bg-white rounded-full shadow-lg border-none focus:ring-2 focus:ring-black/5 text-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
              <Book size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Documentation</h3>
            <p className="text-gray-500">Guides, API references, and code examples.</p>
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
              <MessageCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Community Forum</h3>
            <p className="text-gray-500">Connect with other developers and share knowledge.</p>
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
              <FileQuestion size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">FAQs</h3>
            <p className="text-gray-500">Answers to common questions about billing and accounts.</p>
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
              <Mail size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Support</h3>
            <p className="text-gray-500">Get in touch with our team for personalized help.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

