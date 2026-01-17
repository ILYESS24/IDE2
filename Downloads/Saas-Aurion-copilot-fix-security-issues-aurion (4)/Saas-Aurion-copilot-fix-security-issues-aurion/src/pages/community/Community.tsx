/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCommunityPosts } from "@/hooks/use-extended-data";
import { MessageSquare, Heart, Share2, Search, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function Community() {
  const { data: posts, isLoading } = useCommunityPosts();

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="h-full p-6 bg-[#F2F2EE] overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Community</h1>
          <p className="text-gray-500">Connect with other creators</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
          <Plus size={18} />
          New Post
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {posts?.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-[32px] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full" />
                <div>
                  <h3 className="font-bold text-gray-900">{post.author.name}</h3>
                  <p className="text-xs text-gray-500">{post.date}</p>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">{post.content}</p>

              <div className="flex gap-2 mb-6">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-6 pt-6 border-t border-gray-100">
                <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                  <Heart size={20} />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                  <MessageSquare size={20} />
                  <span>{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors ml-auto">
                  <Share2 size={20} />
                  <span>Share</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Trending Tags</h3>
            <div className="flex flex-wrap gap-2">
              {['AI Art', 'Web Design', 'Tutorial', 'Showcase', 'Help'].map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-sm text-gray-700 cursor-pointer transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

