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
  mediaFiles: File[];
  mediaPreviewUrls: string[];
  caption: string;
  platforms: SocialPlatform[];
  scheduledAt: Date;
  status: PostStatus;
  niche?: string;
}

export type ApiKeys = Partial<Record<SocialPlatform, string>>;