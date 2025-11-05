
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
    [SocialPlatform.Instagram]: { icon: InstagramIcon, color: 'hover:text-pink-500' },
    [SocialPlatform.Facebook]: { icon: FacebookIcon, color: 'hover:text-blue-600' },
    [SocialPlatform.Twitter]: { icon: TwitterIcon, color: 'hover:text-sky-500' },
    [SocialPlatform.LinkedIn]: { icon: LinkedInIcon, color: 'hover:text-blue-700' },
    [SocialPlatform.TikTok]: { icon: TikTokIcon, color: 'hover:text-red-500' },
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
    <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full text-white relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Create a New Post</h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
            <XIcon className="w-6 h-6"/>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md text-sm">{error}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Media Upload & Preview */}
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">Media</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    {mediaPreview ? (
                       mediaType === 'image' ? (
                            <img src={mediaPreview} alt="Preview" className="mx-auto h-32 w-auto object-cover rounded-md" />
                       ) : (
                            <video src={mediaPreview} className="mx-auto h-32 w-auto rounded-md" controls/>
                       )
                    ) : (
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                    )}
                    <div className="flex text-sm text-gray-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-indigo-500">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,video/*" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, MP4 up to 50MB</p>
                </div>
            </div>
          </div>
          
          {/* Right Column: Details */}
          <div className="space-y-6">
            <div>
                <label htmlFor="caption" className="block text-sm font-medium text-gray-300">Caption</label>
                <div className="relative">
                    <textarea id="caption" name="caption" rows={3} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 bg-gray-700 rounded-md focus:ring-indigo-500 focus:border-indigo-500" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="What's on your mind?"></textarea>
                    <button type="button" onClick={handleGenerateCaption} disabled={isGenerating || !mediaFile || mediaType !== 'image'} className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                        {isGenerating ? <LoadingSpinner className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4"/>}
                        AI
                    </button>
                </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300">Platforms</label>
              <div className="mt-2 flex items-center space-x-4">
                {Object.values(SocialPlatform).map(platform => {
                  const Icon = platformConfig[platform].icon;
                  const color = platformConfig[platform].color;
                  return (
                    <button key={platform} type="button" onClick={() => handlePlatformToggle(platform)} className={`p-2 rounded-full transition-colors duration-200 ${selectedPlatforms.has(platform) ? 'bg-gray-600' : 'bg-gray-700'} ${color}`}>
                      <Icon className="w-6 h-6" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
                <label htmlFor="niche" className="flex items-center gap-2 text-sm font-medium text-gray-300">
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
                        className="block w-full shadow-sm sm:text-sm border-gray-600 bg-gray-700 rounded-md focus:ring-indigo-500 focus:border-indigo-500 pr-24"
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
                                className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-xs text-gray-200 rounded-md transition-colors"
                            >
                                {s_niche}
                            </button>
                        ))}
                    </div>
                )}
            </div>
          </div>
        </div>

        <div>
            <label htmlFor="schedule" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <CalendarIcon className="w-5 h-5"/>
                Schedule Time
            </label>
            <input type="datetime-local" id="schedule" name="schedule" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} min={minDateTime} className="w-full sm:w-auto text-white appearance-none bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Schedule Post</button>
        </div>
      </form>
    </div>
  );
};

export default PostCreator;
