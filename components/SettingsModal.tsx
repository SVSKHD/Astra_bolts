import React, { useState, useEffect } from 'react';
import { SocialPlatform, ApiKeys } from '../types';
import { XIcon, InstagramIcon, FacebookIcon, TwitterIcon, LinkedInIcon, TikTokIcon } from './IconComponents';

interface SettingsModalProps {
  onClose: () => void;
  onNavigateToInfo: () => void;
}

const platformConfig = {
    [SocialPlatform.Instagram]: { icon: InstagramIcon, name: 'Instagram (Meta)' },
    [SocialPlatform.Facebook]: { icon: FacebookIcon, name: 'Facebook (Meta)' },
    [SocialPlatform.Twitter]: { icon: TwitterIcon, name: 'X (Twitter)' },
    [SocialPlatform.LinkedIn]: { icon: LinkedInIcon, name: 'LinkedIn' },
    [SocialPlatform.TikTok]: { icon: TikTokIcon, name: 'TikTok' },
};

const API_KEYS_STORAGE_KEY = 'astra-boltz-api-keys';

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onNavigateToInfo }) => {
    const [apiKeys, setApiKeys] = useState<ApiKeys>({});
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        try {
            const storedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
            if (storedKeys) {
                setApiKeys(JSON.parse(storedKeys));
            }
        } catch (error) {
            console.error("Failed to parse API keys from localStorage", error);
        }
    }, []);

    const handleKeyChange = (platform: SocialPlatform, value: string) => {
        setApiKeys(prev => ({ ...prev, [platform]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        try {
            localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(apiKeys));
            setSaved(true);
            setTimeout(() => setSaved(false), 2000); // Hide message after 2s
        } catch (error) {
            console.error("Failed to save API keys to localStorage", error);
        }
    };

    return (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6 max-w-xl w-full text-white relative shadow-2xl shadow-black/50">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--border-color)]">
                <h2 className="text-2xl font-bold">Platform API Keys</h2>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                    <XIcon className="w-6 h-6"/>
                </button>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
                Enter your API keys to enable posting. Keys are stored securely in your browser's local storage.
                <button onClick={onNavigateToInfo} className="text-indigo-400 hover:underline ml-1 font-semibold">
                    How do I get these?
                </button>
            </p>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 -mr-2">
                {Object.values(SocialPlatform).map(platform => {
                    const Icon = platformConfig[platform].icon;
                    const name = platformConfig[platform].name;
                    return (
                        <div key={platform}>
                            <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-1">
                                <Icon className="w-5 h-5 text-gray-400" />
                                {name}
                            </label>
                            <input
                                type="password"
                                value={apiKeys[platform] || ''}
                                onChange={(e) => handleKeyChange(platform, e.target.value)}
                                placeholder={`Enter your key for ${platform}`}
                                className="block w-full shadow-sm sm:text-sm border border-[var(--border-color)] bg-[var(--bg-primary)] rounded-md focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
                            />
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-end items-center gap-4 pt-6 mt-6 border-t border-[var(--border-color)]">
                {saved && <span className="text-green-400 text-sm transition-opacity duration-300">Saved successfully!</span>}
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors">Close</button>
                <button type="button" onClick={handleSave} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-indigo-500/40 transition-all">Save Keys</button>
            </div>
        </div>
    );
};

export default SettingsModal;