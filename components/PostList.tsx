import React from 'react';
import { Post } from '../types';
import PostCard from './PostCard';
import { BoltIcon } from './IconComponents';

interface PostListProps {
  posts: Post[];
  onDeletePost: (postId: string) => void;
}

const PostList: React.FC<PostListProps> = ({ posts, onDeletePost }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-20 px-6 border-2 border-dashed border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)]/50">
        <BoltIcon className="mx-auto h-12 w-12 text-gray-600" />
        <h3 className="mt-4 text-lg font-semibold text-white">Your Dashboard is Empty</h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Click 'Create Post' to schedule your first piece of content.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {posts.map(post => (
        <PostCard key={post.id} post={post} onDelete={() => onDeletePost(post.id)} />
      ))}
    </div>
  );
};

export default PostList;