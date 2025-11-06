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

const statusConfig: { [key in PostStatus]: { dot: string; text: string; } } = {
    [PostStatus.Scheduled]: { dot: 'bg-yellow-400', text: 'text-yellow-300' },
    [PostStatus.Published]: { dot: 'bg-green-400', text: 'text-green-300' },
    [PostStatus.Failed]: { dot: 'bg-red-400', text: 'text-red-300' },
};

const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(post.scheduledAt);

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl shadow-lg overflow-hidden flex flex-col group relative border border-[var(--border-color)] hover:border-indigo-500/50 transition-all duration-300">
        <button 
            onClick={onDelete} 
            className="absolute top-3 right-3 z-10 p-2 bg-red-600/50 hover:bg-red-600 text-white rounded-full transition-all scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 duration-200"
            aria-label="Delete post"
        >
            <TrashIcon className="w-5 h-5"/>
        </button>

      <div className="relative aspect-square w-full bg-gray-700">
        {post.mediaType === 'image' ? (
          <img src={post.mediaPreviewUrl} alt="Post media" className="w-full h-full object-cover" />
        ) : (
          <video src={post.mediaPreviewUrl} className="w-full h-full object-cover" muted loop playsInline />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 w-full">
            <div className="flex items-center space-x-2">
                {post.platforms.map(platform => {
                const Icon = platformIcons[platform];
                return <Icon key={platform} className="w-5 h-5 text-gray-300" />;
                })}
            </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <p className="text-[var(--text-primary)] text-sm mb-4 flex-grow break-words line-clamp-3">{post.caption || <span className="text-[var(--text-secondary)]">No caption provided</span>}</p>
        
        <div className="mt-auto space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5`}>
                    <span className={`w-2 h-2 rounded-full ${statusConfig[post.status].dot}`}></span>
                    <span className={statusConfig[post.status].text}>{post.status}</span>
                </div>
                {post.niche && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300">
                        <TagIcon className="w-3.5 h-3.5"/>
                        {post.niche}
                    </div>
                )}
            </div>
            
            <div className="text-xs text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-2">
                Scheduled: <span className="font-semibold text-[var(--text-primary)]">{formattedDate}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;