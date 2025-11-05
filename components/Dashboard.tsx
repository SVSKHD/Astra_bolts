import React, { useState, useCallback } from 'react';
// FIX: Import the `PostStatus` enum to use it for type safety.
import { Post, PostStatus } from '../types';
import PostCreator from './PostCreator';
import PostList from './PostList';
import Modal from './Modal';
import { PlusIcon } from './IconComponents';

const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const handleCreatePost = useCallback((newPost: Omit<Post, 'id' | 'status'>) => {
    const postWithId: Post = {
      ...newPost,
      id: new Date().toISOString(),
      // FIX: Assign status using the PostStatus enum member instead of a raw string.
      status: PostStatus.Scheduled,
    };
    setPosts(prevPosts => [postWithId, ...prevPosts]);
    setIsCreatorOpen(false);
  }, []);

  const handleDeletePost = useCallback((postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  }, []);


  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Your Posts</h1>
        <button
          onClick={() => setIsCreatorOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-colors duration-200"
        >
          <PlusIcon className="w-5 h-5" />
          Create Post
        </button>
      </div>

      <PostList posts={posts} onDeletePost={handleDeletePost}/>

      <Modal isOpen={isCreatorOpen} onClose={() => setIsCreatorOpen(false)}>
        <PostCreator onCreatePost={handleCreatePost} onClose={() => setIsCreatorOpen(false)} />
      </Modal>
    </div>
  );
};

export default Dashboard;