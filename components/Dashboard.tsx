import React, { useState, useCallback, useEffect } from 'react';
import { Post, PostStatus } from '../types';
import PostCreator from './PostCreator';
import PostList from './PostList';
import CalendarView from './CalendarView';
import Modal from './Modal';
import { PlusIcon, ListIcon, CalendarIcon } from './IconComponents';

const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const handleCreatePost = useCallback((newPost: Omit<Post, 'id' | 'status'>) => {
    const postWithId: Post = {
      ...newPost,
      id: new Date().toISOString() + Math.random(), // Add random number to ensure unique ID
      status: PostStatus.Scheduled,
    };
    setPosts(prevPosts => [...prevPosts, postWithId].sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime()));
    setIsCreatorOpen(false);
  }, []);

  const handleDeletePost = useCallback((postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  }, []);

  // Effect for simulating real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let hasUpdates = false;

      const updatedPosts = posts.map(post => {
        if (post.status === PostStatus.Scheduled && post.scheduledAt <= now) {
          hasUpdates = true;
          // Simulate a 90% success rate
          const newStatus = Math.random() < 0.9 ? PostStatus.Published : PostStatus.Failed;
          return { ...post, status: newStatus };
        }
        return post;
      });

      if (hasUpdates) {
        setPosts(updatedPosts.sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime()));
      }
    }, 5000); // Check for updates every 5 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [posts]);


  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <button 
                    onClick={() => setView('list')} 
                    className={`px-3 py-1.5 rounded-md transition-all text-sm font-semibold ${view === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-white'}`}
                    aria-label="List view"
                >
                    <ListIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => setView('calendar')} 
                    className={`px-3 py-1.5 rounded-md transition-all text-sm font-semibold ${view === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-white'}`}
                    aria-label="Calendar view"
                >
                    <CalendarIcon className="w-5 h-5" />
                </button>
            </div>
            <button
                onClick={() => setIsCreatorOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] focus:ring-indigo-400 transform hover:scale-105 transition-all duration-200"
            >
                <PlusIcon className="w-5 h-5" />
                Create Post
            </button>
        </div>
      </div>

      {view === 'list' ? (
        <PostList posts={posts} onDeletePost={handleDeletePost}/>
      ) : (
        <CalendarView posts={posts} />
      )}

      <Modal isOpen={isCreatorOpen} onClose={() => setIsCreatorOpen(false)}>
        <PostCreator onCreatePost={handleCreatePost} onClose={() => setIsCreatorOpen(false)} />
      </Modal>
    </div>
  );
};

export default Dashboard;