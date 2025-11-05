
import React from 'react';
import { Post, PostStatus, SocialPlatform } from '../types';
import { InstagramIcon, FacebookIcon, TwitterIcon, LinkedInIcon, TikTokIcon, TrashIcon, TagIcon } from './IconComponents';

interface PostCardProps {
  post: Post;
  onDelete: () => void;
}

const platformIcons: { [key in SocialPlatform]: React.ElementType } = {
  [SocialPlatform.Instagram]: InstagramIcon,
  [SocialPlatform.Facebook]: FacebookIcon,
  [SocialPlatform.Twitter]: TwitterIcon,
  [SocialPlatform.LinkedIn]: LinkedInIcon,
  [SocialPlatform.TikTok]: TikTokIcon,
};

const statusColors: { [key in PostStatus]: string } = {
    [PostStatus.Scheduled]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    [PostStatus.Published]: 'bg-green-500/20 text-green-300 border-green-500/30',
    [PostStatus.Failed]: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(post.scheduledAt);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col group relative">
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={onDelete} 
                className="p-2 bg-red-600/50 hover:bg-red-600 text-white rounded-full transition-colors"
                aria-label="Delete post"
            >
                <TrashIcon className="w-5 h-5"/>
            </button>
        </div>

      <div className="aspect-square w-full bg-gray-700">
        {post.mediaType === 'image' ? (
          <img src={post.mediaPreviewUrl} alt="Post media" className="w-full h-full object-cover" />
        ) : (
          <video src={post.mediaPreviewUrl} className="w-full h-full object-cover" controls />
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-gray-300 text-sm mb-4 flex-grow break-words whitespace-pre-wrap">{post.caption || <span className="text-gray-500">No caption</span>}</p>
        
        <div className="mt-auto">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusColors[post.status]}`}>
                        {post.status}
                    </div>
                    {post.niche && (
                        <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-sky-500/20 text-sky-300 border-sky-500/30">
                            <TagIcon className="w-3 h-3"/>
                            {post.niche}
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {post.platforms.map(platform => {
                    const Icon = platformIcons[platform];
                    return <Icon key={platform} className="w-5 h-5 text-gray-400" />;
                    })}
                </div>
            </div>
            
            <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
                Scheduled for: {formattedDate}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
