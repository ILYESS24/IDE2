import React from "react";
import { Link } from "react-router-dom";
import { LegalLayout } from "../components/layout/LegalLayout";
import { ArrowRight } from "lucide-react";

interface BlogPostProps {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
}

const BlogPost = ({ title, excerpt, date, category, image }: BlogPostProps) => (
  <article className="group cursor-pointer">
    <div className="rounded-2xl overflow-hidden mb-6 h-64 bg-gray-100 relative">
      <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
        {category}
      </div>
    </div>
    <div className="space-y-3">
      <span className="text-sm text-gray-400">{date}</span>
      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
        {title}
      </h3>
      <p className="text-gray-500 leading-relaxed">
        {excerpt}
      </p>
      <Link to="#" className="inline-flex items-center gap-2 text-sm font-bold text-black hover:gap-3 transition-all pt-2">
        Read Article <ArrowRight size={16} />
      </Link>
    </div>
  </article>
);

export default function Blog() {
  return (
    <LegalLayout 
      title="Blog" 
      subtitle="Latest news, tutorials, and insights from the AURION team."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 -mt-8">
        <BlogPost 
          title="The Future of Multimodal AI Creation"
          excerpt="How combining text, image, and video models creates a seamless workflow for digital artists."
          date="Dec 12, 2025"
          category="Technology"
          image="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop"
        />
        <BlogPost 
          title="Introducing AURION 4.0"
          excerpt="Our biggest update yet brings real-time collaboration and 8k video generation to the browser."
          date="Dec 05, 2025"
          category="Product"
          image="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
        />
        <BlogPost 
          title="10 Tips for Better Prompts"
          excerpt="Learn how to structure your text inputs to get exactly the result you imagined."
          date="Nov 28, 2025"
          category="Tutorial"
          image="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop"
        />
        <BlogPost 
          title="From Sketch to Masterpiece"
          excerpt="A case study on how designers are using our Sketch-to-Image tool to speed up prototyping."
          date="Nov 15, 2025"
          category="Case Study"
          image="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop"
        />
      </div>

      <div className="mt-16 pt-16 border-t border-gray-100 text-center">
        <h3 className="text-2xl font-bold mb-4">Subscribe to our newsletter</h3>
        <p className="text-gray-500 mb-8">Get the latest updates directly in your inbox.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
          />
          <button className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </LegalLayout>
  );
}

