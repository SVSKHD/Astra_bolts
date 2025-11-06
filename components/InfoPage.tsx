import React from 'react';
import { ChevronLeftIcon, FacebookIcon, InstagramIcon, LinkedInIcon, TikTokIcon, TwitterIcon } from './IconComponents';
import { SocialPlatform } from '../types';

interface InfoPageProps {
    onBack: () => void;
}

const platformInfo = {
    [SocialPlatform.Facebook]: {
        icon: FacebookIcon,
        name: 'Meta (Facebook & Instagram)',
        description: `Visit the Meta for Developers portal. Create a new app, then add the "Instagram Graph API" and "Facebook Graph API" products. You'll need to generate a User Access Token with the necessary permissions.`,
        permissions: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'instagram_basic', 'instagram_content_publish'],
        link: 'https://developers.facebook.com/'
    },
    [SocialPlatform.Twitter]: {
        icon: TwitterIcon,
        name: 'X (formerly Twitter)',
        description: `Go to the X Developer Portal. Create a project and an app within it. You will likely need to apply for "Elevated" or "Basic" access level. Once approved, generate your API Key & Secret, and an Access Token & Secret.`,
        permissions: ['tweet_read', 'tweet_write', 'users_read', 'offline.access'],
        link: 'https://developer.x.com/'
    },
    [SocialPlatform.LinkedIn]: {
        icon: LinkedInIcon,
        name: 'LinkedIn',
        description: `In the LinkedIn Developer portal, create an application. After your app is created, you will need to request access to the appropriate products, such as "Share on LinkedIn" and "Sign In with LinkedIn using OpenID Connect".`,
        permissions: ['openid', 'profile', 'w_member_social'],
        link: 'https://www.linkedin.com/developers/'
    },
    [SocialPlatform.TikTok]: {
        icon: TikTokIcon,
        name: 'TikTok',
        description: `Navigate to the TikTok for Developers portal. Create a new app and request access to the required scopes for posting content. This process often involves a review and approval from TikTok.`,
        permissions: ['video.upload', 'video.publish'],
        link: 'https://developers.tiktok.com/'
    },
};

const InfoPage: React.FC<InfoPageProps> = ({ onBack }) => {
    return (
        <div className="container mx-auto max-w-4xl text-white">
            <div className="mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-white transition-colors mb-4"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                    Back to Dashboard
                </button>
                <h1 className="text-4xl font-extrabold tracking-tight">Obtaining API Keys</h1>
                <p className="mt-2 text-lg text-[var(--text-secondary)]">
                    To schedule posts, Astra Boltz needs API access to your social media accounts. Here’s how to get the required keys.
                </p>
            </div>

            <div className="space-y-6">
                {Object.values(platformInfo).map(platform => {
                    const Icon = platform.icon;
                    return (
                        <div key={platform.name} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6">
                            <div className="flex items-center gap-4 mb-3">
                                <Icon className="w-8 h-8 text-gray-300" />
                                <h3 className="text-xl font-bold">{platform.name}</h3>
                            </div>
                            <p className="text-[var(--text-secondary)] mb-4">{platform.description}</p>
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-300 mb-2">Required Permissions/Scopes:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {platform.permissions.map(p => (
                                        <code key={p} className="text-xs bg-black/50 text-indigo-300 px-2 py-1 rounded">{p}</code>
                                    ))}
                                </div>
                            </div>
                            <a 
                                href={platform.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-block px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
                            >
                                Go to Developer Portal
                            </a>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-8 p-4 text-center text-yellow-300 bg-yellow-900/30 rounded-lg border border-yellow-700/50">
                <p className="font-bold">Important Notice</p>
                <p className="text-sm">Always keep your API keys secure. These processes can change frequently, so always refer to the official platform documentation for the most up-to-date instructions.</p>
            </div>
        </div>
    );
};

export default InfoPage;
