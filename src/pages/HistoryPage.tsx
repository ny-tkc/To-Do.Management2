import { useState } from 'react';
import { Icon } from '@/components/Icon';
import type { Visit } from '@/types';

interface HistoryPageProps {
  visits: Visit[];
  onGenerateReport: (visit: Visit) => void;
  onRevertCompleteVisit: (visitId: string) => void;
}

export const HistoryPage = ({ visits }: HistoryPageProps) => {
  const [filter, setFilter] = useState('');

  const completedVisits = visits
    .filter((v) => v.status === 'completed')
    .filter((v) => v.firmName.includes(filter) || v.date.includes(filter))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">訪問履歴</h2>
        <div className="relative">
          <Icon name="fa-search" className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="検索..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-full text-sm focus:ring-2 focus:ring-cyan-500 w-48"
          />
        </div>
      </div>

      {completedVisits.length === 0 && (
        <p className="text-center text-slate-500 py-8">履歴がありません</p>
      )}
    </div>
  );
};
