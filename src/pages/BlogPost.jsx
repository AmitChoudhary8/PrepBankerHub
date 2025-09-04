import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiArrowLeft, FiShare2, FiTag } from 'react-icons/fi';
import supabase from '../utils/supabase';
import toast from 'react-hot-toast';

function BlogPost() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      setBlog(data);
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Blog not found');
    } finally {
      setLoading(false);
    }
  };

  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Blog Not Found</h1>
          <Link to="/blogs" className="text-blue-600 hover:text-blue-700">
            ← Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/blogs"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <FiArrowLeft size={16} className="mr-2" />
          Back to Blogs
        </Link>

        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Cover Image */}
          {blog.cover_image_url && (
            <img
              src={blog.cover_image_url}
              alt={blog.title}
              className="w-full h-64 md:h-80 object-cover"
            />
          )}

          <div className="p-8">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
              <div className="flex items-center">
                <FiCalendar size={14} className="mr-2" />
                {new Date(blog.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <FiClock size={14} className="mr-2" />
                {blog.read_time} min read
              </div>
              <button
                onClick={sharePost}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <FiShare2 size={14} className="mr-2" />
                Share
              </button>
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full"
                  >
                    <FiTag size={12} className="mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}

export default BlogPost;
