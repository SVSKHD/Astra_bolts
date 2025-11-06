import React, { useState, useCallback, useMemo } from 'react';
import { SocialPlatform, Post } from '../types';
import { generateCaption, suggestNiches } from '../services/geminiService';
import { InstagramIcon, FacebookIcon, TwitterIcon, LinkedInIcon, TikTokIcon, UploadIcon, SparklesIcon, CalendarIcon, XIcon, TagIcon } from './IconComponents';
import LoadingSpinner from './LoadingSpinner';

interface PostCreatorProps {
  onCreatePost: (post: Omit<Post, 'id' | 'status'>) => void;
  onClose: () => void;
}

const platformConfig = {
    [SocialPlatform.Instagram]: { icon: InstagramIcon, color: 'hover:text-pink-500', name: 'Instagram' },
    [SocialPlatform.Facebook]: { icon: FacebookIcon, color: 'hover:text-blue-600', name: 'Facebook' },
    [SocialPlatform.Twitter]: { icon: TwitterIcon, color: 'hover:text-sky-500', name: 'Twitter' },
    [SocialPlatform.LinkedIn]: { icon: LinkedInIcon, color: 'hover:text-blue-700', name: 'LinkedIn' },
    [SocialPlatform.TikTok]: { icon: TikTokIcon, color: 'hover:text-red-500', name: 'TikTok' },
};


const PostCreator: React.FC<PostCreatorProps> = ({ onCreatePost, onClose }) => {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<SocialPlatform>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [niche, setNiche] = useState('');
  const [suggestedNiches, setSuggestedNiches] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const mediaType = useMemo(() => {
    if (!mediaFile) return null;
    return mediaFile.type.startsWith('image/') ? 'image' : 'video';
  }, [mediaFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(platform)) {
        newSet.delete(platform);
      } else {
        newSet.add(platform);
      }
      return newSet;
    });
  };

  const handleGenerateCaption = useCallback(async () => {
    if (!mediaFile || mediaType !== 'image') {
      setError('Please upload an image to generate a caption.');
      return;
    }
    setIsGenerating(true);
    setError('');
    try {
      const generated = await generateCaption(mediaFile);
      setCaption(generated);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  }, [mediaFile, mediaType]);

  const handleSuggestNiches = useCallback(async () => {
    setIsSuggesting(true);
    setError('');
    setSuggestedNiches([]);
    try {
        const suggestions = await suggestNiches();
        setSuggestedNiches(suggestions);
    } catch (err) {
        setError((err as Error).message);
    } finally {
        setIsSuggesting(false);
    }
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!mediaFile || selectedPlatforms.size === 0 || !scheduledAt) {
      setError('Please fill all fields: upload media, select at least one platform, and set a schedule time.');
      return;
    }
    onCreatePost({
      mediaFile,
      mediaPreviewUrl: mediaPreview!,
      mediaType: mediaType!,
      caption,
      platforms: Array.from(selectedPlatforms),
      scheduledAt: new Date(scheduledAt),
      niche: niche.trim() || undefined,
    });
  };
  
  const minDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  }, []);

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6 max-w-2xl w-full text-white relative shadow-2xl shadow-black/50">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--border-color)]">
        <h2 className="text-2xl font-bold">Create New Post</h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
            <XIcon className="w-6 h-6"/>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md text-sm">{error}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Media Upload & Preview */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Media</label>
            <div className="w-full aspect-square mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-[var(--border-color)] border-dashed rounded-md hover:border-indigo-500 transition-colors bg-[var(--bg-primary)] relative overflow-hidden">
                {mediaPreview ? (
                   mediaType === 'image' ? (
                        <img src={mediaPreview} alt="Preview" className="absolute inset-0 h-full w-full object-cover" />
                   ) : (
                        <video src={mediaPreview} className="absolute inset-0 h-full w-full object-cover" controls/>
                   )
                ) : (
                    <div className="space-y-1 text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                        <div className="flex text-sm text-gray-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-indigo-500">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,video/*" />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">Image or Video up to 50MB</p>
                    </div>
                )}
            </div>
          </div>
          
          {/* Right Column: Details */}
          <div className="space-y-4">
            <div>
                <label htmlFor="caption" className="block text-sm font-medium text-[var(--text-secondary)]">Caption</label>
                <div className="relative">
                    <textarea id="caption" name="caption" rows={4} className="mt-1 block w-full shadow-sm sm:text-sm border-[var(--border-color)] bg-[var(--bg-primary)] rounded-md focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="What's on your mind?"></textarea>
                    <button type="button" onClick={handleGenerateCaption} disabled={isGenerating || !mediaFile || mediaType !== 'image'} className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                        {isGenerating ? <LoadingSpinner className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4"/>}
                        AI Generate
                    </button>
                </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Platforms</label>
              <div className="mt-2 flex items-center space-x-2">
                {Object.values(SocialPlatform).map(platform => {
                  const config = platformConfig[platform];
                  return (
                    <button key={platform} type="button" onClick={() => handlePlatformToggle(platform)} className={`p-2 rounded-lg transition-all duration-200 border-2 ${selectedPlatforms.has(platform) ? 'border-indigo-500 bg-indigo-500/10' : 'border-transparent bg-[var(--bg-primary)] hover:bg-white/5'}`} aria-label={`Select ${config.name}`}>
                      <config.icon className="w-6 h-6" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
                <label htmlFor="schedule" className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                    <CalendarIcon className="w-5 h-5"/>
                    Schedule Time
                </label>
                <input type="datetime-local" id="schedule" name="schedule" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} min={minDateTime} className="mt-1 w-full text-white appearance-none bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
        </div>

        <div>
            <label htmlFor="niche" className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                <TagIcon className="w-5 h-5"/>
                Niche (Optional)
            </label>
            <div className="relative mt-1">
                <input 
                    type="text" 
                    id="niche" 
                    name="niche" 
                    value={niche} 
                    onChange={(e) => setNiche(e.target.value)} 
                    className="block w-full shadow-sm sm:text-sm border-[var(--border-color)] bg-[var(--bg-primary)] rounded-md focus:ring-indigo-500 focus:border-indigo-500 pl-3 pr-28 py-2"
                    placeholder="e.g., Fitness, Travel, Tech"
                />
                <button 
                    type="button" 
                    onClick={handleSuggestNiches}
                    disabled={isSuggesting}
                    className="absolute inset-y-0 right-0 flex items-center gap-1.5 px-3 text-xs font-semibold text-white bg-indigo-600 rounded-r-md hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    {isSuggesting ? <LoadingSpinner className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4"/>}
                    Suggest
                </button>
            </div>
             {suggestedNiches.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {suggestedNiches.map((s_niche, index) => (
                        <button 
                            key={index}
                            type="button"
                            onClick={() => setNiche(s_niche)}
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-xs text-[var(--text-secondary)] rounded-full transition-colors"
                        >
                            {s_niche}
                        </button>
                    ))}
                </div>
            )}
        </div>
        
        <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-color)]">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg shadow-md hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Schedule Post</button>
        </div>
      </form>
    </div>
  );
};

export default PostCreator;