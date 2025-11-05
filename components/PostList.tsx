
import React from 'react';
import { Post } from '../types';
import PostCard from './PostCard';
import { CalendarIcon } from './IconComponents';

interface PostListProps {
  posts: Post[];
  onDeletePost: (postId: string) => void;
}

const PostList: React.FC<PostListProps> = ({ posts, onDeletePost }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-300">No posts scheduled</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new post.</p>
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
