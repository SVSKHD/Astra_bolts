import React, { useState, useCallback, useMemo } from 'react';
import { SocialPlatform, Post } from '../types';
import { generateCaption, suggestNiches } from '../services/geminiService';
import { InstagramIcon, FacebookIcon, TwitterIcon, LinkedInIcon, TikTokIcon, UploadIcon, SparklesIcon, CalendarIcon, XIcon, TagIcon, PhotoIcon, ReelIcon, PlusIcon } from './IconComponents';
import LoadingSpinner from './LoadingSpinner';

interface PostCreatorProps {
  onCreatePost: (post: Omit<Post, 'id' | 'status' | 'mediaPreviewUrls'>) => void;
  onClose: () => void;
}

const platformConfig = {
    [SocialPlatform.Instagram]: { icon: InstagramIcon, color: 'hover:text-pink-500', name: 'Instagram' },
    [SocialPlatform.Facebook]: { icon: FacebookIcon, color: 'hover:text-blue-600', name: 'Facebook' },
    [SocialPlatform.Twitter]: { icon: TwitterIcon, color: 'hover:text-sky-500', name: 'Twitter' },
    [SocialPlatform.LinkedIn]: { icon: LinkedInIcon, color: 'hover:text-blue-700', name: 'LinkedIn' },
    [SocialPlatform.TikTok]: { icon: TikTokIcon, color: 'hover:text-red-500', name: 'TikTok' },
};

interface MediaPreview {
    url: string;
    file: File;
    type: 'image' | 'video';
}

const PostCreator: React.FC<PostCreatorProps> = ({ onCreatePost, onClose }) => {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
  const [caption, setCaption] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<SocialPlatform>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [niche, setNiche] = useState('');
  const [suggestedNiches, setSuggestedNiches] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedType, setSuggestedType] = useState<'Photo' | 'Reel' | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
        const newFiles = Array.from(files);
        
        // Logic to run analysis only on the first file added
        if (mediaFiles.length === 0 && newFiles.length > 0) {
            const firstFile = newFiles[0];
            setError('');
            setCaption('');
            setSuggestedType(null);
            setIsAnalyzing(true);
            
            const isImage = firstFile.type.startsWith('image/');
            const isVideo = firstFile.type.startsWith('video/');
            const objectUrl = URL.createObjectURL(firstFile);
            
            const element = isImage ? new Image() : document.createElement('video');
            
            const handleMetadata = () => {
                const width = isImage ? (element as HTMLImageElement).naturalWidth : (element as HTMLVideoElement).videoWidth;
                const height = isImage ? (element as HTMLImageElement).naturalHeight : (element as HTMLVideoElement).videoHeight;
                
                const aspectRatio = width / height;
                const suggestion = aspectRatio < 1 ? 'Reel' : 'Photo';
                setSuggestedType(suggestion);
                
                if (isImage) {
                    setIsGenerating(true);
                    generateCaption(firstFile, suggestion)
                    .then(generatedCaption => setCaption(generatedCaption))
                    .catch(err => setError((err as Error).message))
                    .finally(() => {
                        setIsAnalyzing(false);
                        setIsGenerating(false);
                    });
                } else {
                    setIsAnalyzing(false);
                }
            };
            
            if (isImage) (element as HTMLImageElement).onload = handleMetadata;
            else if (isVideo) (element as HTMLVideoElement).onloadedmetadata = handleMetadata;
            element.src = objectUrl;
            element.addEventListener('error', () => {
                setError("Could not load media file for analysis.");
                setIsAnalyzing(false);
              });
        }
        
        const newPreviews: MediaPreview[] = newFiles.map(file => ({
            file,
            url: URL.createObjectURL(file),
            type: file.type.startsWith('image/') ? 'image' : 'video'
        }));

        setMediaFiles(prev => [...prev, ...newFiles]);
        setMediaPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveMedia = (indexToRemove: number) => {
    // If we remove the first image, clear the AI suggestions
    if (indexToRemove === 0) {
        setSuggestedType(null);
        setCaption('');
    }
    setMediaFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setMediaPreviews(prev => {
        const newPreviews = prev.filter((_, index) => index !== indexToRemove);
        // Clean up object URL
        URL.revokeObjectURL(prev[indexToRemove].url);
        return newPreviews;
    });
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
    if (mediaFiles.length === 0 || !mediaFiles[0].type.startsWith('image/')) {
      setError('Please upload an image to generate a caption.');
      return;
    }
    setIsGenerating(true);
    setError('');
    try {
      const generated = await generateCaption(mediaFiles[0], suggestedType || undefined);
      setCaption(generated);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  }, [mediaFiles, suggestedType]);

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
    if (mediaFiles.length === 0 || selectedPlatforms.size === 0 || !scheduledAt) {
      setError('Please fill all fields: upload media, select at least one platform, and set a schedule time.');
      return;
    }
    onCreatePost({
      mediaFiles,
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
            <div className="grid grid-cols-3 gap-2 p-2 border-2 border-[var(--border-color)] border-dashed rounded-md bg-[var(--bg-primary)] min-h-[100px]">
                {mediaPreviews.map((preview, index) => (
                    <div key={preview.file.name + index} className="relative aspect-square rounded-md overflow-hidden group">
                        {preview.type === 'image' ? (
                            <img src={preview.url} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <video src={preview.url} className="w-full h-full object-cover" muted loop playsInline />
                        )}
                        <button 
                            type="button" 
                            onClick={() => handleRemoveMedia(index)}
                            className="absolute top-1 right-1 z-10 p-1 bg-black/50 hover:bg-red-600 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 duration-200"
                            aria-label="Remove media"
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                
                <label htmlFor="file-upload" className="relative aspect-square flex flex-col items-center justify-center text-center bg-white/5 hover:bg-white/10 rounded-md cursor-pointer transition-colors text-[var(--text-secondary)]">
                    <PlusIcon className="w-6 h-6" />
                    <span className="text-xs mt-1">Add Media</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,video/*" multiple />
                </label>
                
                {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-4 z-10">
                        <LoadingSpinner className="w-10 h-10" />
                        <p className="mt-4 text-sm font-semibold">Analyzing Media...</p>
                    </div>
                )}
            </div>
          </div>
          
          {/* Right Column: Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Suggested Format</label>
              <div className="mt-1">
                  {suggestedType ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md">
                          {suggestedType === 'Reel' ? <ReelIcon className="w-5 h-5 text-indigo-400" /> : <PhotoIcon className="w-5 h-5 text-indigo-400" />}
                          <span className="font-semibold">{suggestedType}</span>
                      </div>
                  ) : (
                      <div className="px-3 py-2 text-sm text-[var(--text-secondary)] bg-[var(--bg-primary)] border border-dashed border-[var(--border-color)] rounded-md">
                          Upload media to get a suggestion.
                      </div>
                  )}
              </div>
            </div>
            <div>
                <label htmlFor="caption" className="block text-sm font-medium text-[var(--text-secondary)]">Caption</label>
                <div className="relative">
                    <textarea id="caption" name="caption" rows={4} className="mt-1 block w-full shadow-sm sm:text-sm border-[var(--border-color)] bg-[var(--bg-primary)] rounded-md focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="What's on your mind?"></textarea>
                    <button type="button" onClick={handleGenerateCaption} disabled={isGenerating || mediaFiles.length === 0 || !mediaFiles[0].type.startsWith('image/')} className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
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
                    className="block w-full shadow-sm sm:text-sm border-[var(--border-color)] bg-[var(--bg-primary)] rounded-md focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
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