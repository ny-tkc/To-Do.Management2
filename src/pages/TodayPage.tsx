import { ReactNode } from 'react';
import { Icon } from '@/components/Icon';

interface TodayPageProps {
  visits: ReactNode[];
  onAddVisit: () => void;
  today: Date;
}

export const TodayPage = ({ visits, onAddVisit, today }: TodayPageProps) => {
  const todayFormatted = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <p className="text-slate-500 font-semibold">{todayFormatted}</p>
        <button
          onClick={onAddVisit}
          className="flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-full hover:bg-cyan-700 transition"
          aria-label="本日の訪問を追加"
        >
          <Icon name="fa-plus" className="mr-2" size={16} />
          訪問を追加
        </button>
      </div>

      {visits.length > 0 ? (
        <div className="space-y-4">{visits}</div>
      ) : (
        <div className="text-center py-16">
          <Icon name="fa-calendar-check" className="text-slate-300 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-slate-700">本日の訪問予定はありません</h2>
          <p className="text-slate-500 mt-2">
            お疲れ様です！右上のボタンから訪問を追加するか、
            <br />
            カレンダーで先の予定を確認しましょう。
          </p>
        </div>
      )}
    </div>
  );
};
