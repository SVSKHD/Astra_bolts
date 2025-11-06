import React, { useState, useMemo } from 'react';
import { Post, PostStatus } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

interface CalendarViewProps {
  posts: Post[];
}

const statusIndicatorColors: { [key in PostStatus]: string } = {
    [PostStatus.Scheduled]: 'bg-yellow-400',
    [PostStatus.Published]: 'bg-green-400',
    [PostStatus.Failed]: 'bg-red-400',
};

const CalendarView: React.FC<CalendarViewProps> = ({ posts }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const postsByDate = useMemo(() => {
    const map = new Map<string, Post[]>();
    posts.forEach(post => {
      const dateKey = post.scheduledAt.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(post);
    });
    return map;
  }, [posts]);

  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days: Date[] = [];
    const startDate = new Date(year, month, 1);
    startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1)); // Start on Monday

    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days to cover all possible layouts
      days.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg p-4 sm:p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Previous month">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Next month">
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-[var(--text-secondary)] font-semibold mb-2">
        {daysOfWeek.map(day => <div key={day} className="py-2">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarGrid.map((day, index) => {
          const dateKey = day.toISOString().split('T')[0];
          const postsForDay = postsByDate.get(dateKey) || [];
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();

          return (
            <div
              key={index}
              className={`h-36 rounded-md p-1.5 flex flex-col overflow-hidden transition-colors ${
                isCurrentMonth ? 'bg-[var(--bg-primary)] hover:bg-black/20' : 'bg-transparent'
              }`}
            >
              <div
                className={`flex items-center justify-center text-sm font-semibold h-7 w-7 rounded-full ${
                  isToday(day) ? 'ring-2 ring-indigo-500 text-indigo-400' : ''
                } ${isCurrentMonth ? 'text-gray-200' : 'text-gray-700'}`}
              >
                {day.getDate()}
              </div>
              {isCurrentMonth && (
                <div className="flex-grow overflow-y-auto space-y-1.5 -mr-2 pr-2 mt-1">
                    {postsForDay.slice(0, 2).map(post => (
                        <div key={post.id} className="bg-gray-700/50 p-1 rounded-md text-xs flex items-center gap-1.5 cursor-pointer hover:bg-gray-700/80">
                             <img src={post.mediaPreviewUrls[0]} alt="media" className="w-5 h-5 rounded-sm object-cover flex-shrink-0" />
                             <p className="truncate text-gray-300 flex-grow">{post.caption || "Post"}</p>
                             <span className={`w-1.5 h-1.5 rounded-full ${statusIndicatorColors[post.status]} flex-shrink-0`}></span>
                        </div>
                    ))}
                    {postsForDay.length > 2 && (
                        <div className="text-center text-xs text-indigo-400 font-semibold pt-1">
                            +{postsForDay.length - 2} more
                        </div>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;