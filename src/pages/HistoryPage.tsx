import { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from '@/components/Icon';
import type { Visit, Firm } from '@/types';

interface HistoryPageProps {
  visits: Visit[];
  firms: Firm[];
  renderVisitCards: (visits: Visit[]) => React.ReactNode;
}

export const HistoryPage = ({ visits, firms, renderVisitCards }: HistoryPageProps) => {
  const [selectedFirmId, setSelectedFirmId] = useState<string>('');
  const [firmSearch, setFirmSearch] = useState('');
  const [showFirmList, setShowFirmList] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Visit[] | null>(null);
  const firmContainerRef = useRef<HTMLDivElement>(null);

  // Close firm list when tapping outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (firmContainerRef.current && !firmContainerRef.current.contains(event.target as Node)) {
        setShowFirmList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const filteredFirms = useMemo(() => {
    if (!firmSearch) return firms;
    const q = firmSearch.toLowerCase();
    return firms.filter(
      (f) => f.name.toLowerCase().includes(q) || f.code.includes(firmSearch)
    );
  }, [firms, firmSearch]);

  const handleSelectFirm = (firm: Firm) => {
    setSelectedFirmId(firm.id);
    setFirmSearch(`${firm.code} ${firm.name}`);
    setShowFirmList(false);
  };

  const handleClearFirm = () => {
    setSelectedFirmId('');
    setFirmSearch('');
  };

  const handleSearch = () => {
    setShowFirmList(false);
    let results = visits.filter((v) => v.status === 'completed');

    if (selectedFirmId) {
      results = results.filter((v) => v.firmId === selectedFirmId);
    }

    if (dateFrom) {
      results = results.filter((v) => v.date >= dateFrom);
    }

    if (dateTo) {
      results = results.filter((v) => v.date <= dateTo);
    }

    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      results = results.filter(
        (v) =>
          v.firmName.toLowerCase().includes(kw) ||
          v.todos.some(
            (t) =>
              t.text.toLowerCase().includes(kw) ||
              t.subTasks?.some((s) => s.text.toLowerCase().includes(kw))
          )
      );
    }

    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setSearchResults(results);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h2 className="text-xl font-bold text-slate-800 mb-4">訪問履歴</h2>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 space-y-3">
        {/* Firm selection */}
        <div className="relative" ref={firmContainerRef}>
          <label className="block text-xs font-medium text-slate-500 mb-1">事務所</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={firmSearch}
              onChange={(e) => {
                setFirmSearch(e.target.value);
                setSelectedFirmId('');
                setShowFirmList(true);
              }}
              onFocus={() => setShowFirmList(true)}
              placeholder="事務所を検索..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              autoComplete="off"
            />
            {(selectedFirmId || firmSearch) && (
              <button
                onClick={handleClearFirm}
                className="px-2 text-slate-400 hover:text-red-500"
              >
                <Icon name="fa-times" size={16} />
              </button>
            )}
          </div>
          {showFirmList && !selectedFirmId && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filteredFirms.length === 0 ? (
                <li className="px-4 py-2 text-sm text-slate-400">該当なし</li>
              ) : (
                filteredFirms.map((firm) => (
                  <li
                    key={firm.id}
                    onClick={() => handleSelectFirm(firm)}
                    className="px-4 py-2 hover:bg-cyan-50 cursor-pointer text-sm"
                  >
                    <span className="font-bold">{firm.code}</span> - {firm.name}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* Date range - stacked vertically for mobile */}
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">開始日</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">終了日</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Keyword */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">キーワード</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="タスク名等で検索..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="w-full py-2.5 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition font-bold text-sm"
        >
          <Icon name="fa-search" className="mr-2" size={14} />
          検索
        </button>
      </div>

      {/* Results */}
      {searchResults !== null && (
        <div>
          <p className="text-sm text-slate-500 mb-3">
            {searchResults.length}件の結果
          </p>
          {searchResults.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm">該当する履歴がありません</p>
          ) : (
            <div className="space-y-4">
              {renderVisitCards(searchResults)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
