
export enum SocialPlatform {
  Instagram = 'Instagram',
  Facebook = 'Facebook',
  Twitter = 'Twitter',
  LinkedIn = 'LinkedIn',
  TikTok = 'TikTok',
}

export enum PostStatus {
  Scheduled = 'Scheduled',
  Published = 'Published',
  Failed = 'Failed',
}

export interface Post {
  id: string;
  mediaFile: File;
  mediaPreviewUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  platforms: SocialPlatform[];
  scheduledAt: Date;
  status: PostStatus;
  niche?: string;
}
