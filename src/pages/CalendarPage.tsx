import { useState } from 'react';
import { Icon } from '@/components/Icon';
import type { Visit } from '@/types';

interface CalendarPageProps {
  visits: Visit[];
  onDateSelect: (date: string) => void;
  selectedDate: string;
}

export const CalendarPage = ({ visits, onDateSelect, selectedDate }: CalendarPageProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-14 bg-slate-50/50" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayVisits = visits.filter((v) => v.date === dateStr);
    const isSelected = selectedDate === dateStr;
    const isToday = dateStr === new Date().toISOString().slice(0, 10);

    const pendingCount = dayVisits.filter((v) => v.status === 'pending').length;
    const completedCount = dayVisits.filter((v) => v.status === 'completed').length;

    days.push(
      <div
        key={day}
        onClick={() => onDateSelect(dateStr)}
        className={`h-14 border border-slate-100 p-1 cursor-pointer flex flex-col items-center justify-between transition relative
          ${isSelected ? 'bg-cyan-50 border-cyan-300' : 'bg-white hover:bg-slate-50'}
          ${isToday ? 'font-bold' : ''}
        `}
      >
        <span
          className={`text-xs ${
            isToday
              ? 'text-cyan-600 bg-cyan-100 rounded-full w-5 h-5 flex items-center justify-center'
              : 'text-slate-700'
          }`}
        >
          {day}
        </span>
        <div className="flex gap-1">
          {pendingCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
          {completedCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
        </div>
      </div>
    );
  }

  const selectedVisits = visits.filter((v) => v.date === selectedDate);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="text-slate-500 hover:text-cyan-600">
          <Icon name="fa-chevron-left" />
        </button>
        <h2 className="text-lg font-bold text-slate-700">
          {year}年 {month + 1}月
        </h2>
        <button onClick={nextMonth} className="text-slate-500 hover:text-cyan-600">
          <Icon name="fa-chevron-right" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1 text-center text-xs text-slate-500">
        <div className="text-red-400">日</div>
        <div>月</div>
        <div>火</div>
        <div>水</div>
        <div>木</div>
        <div>金</div>
        <div className="text-blue-400">土</div>
      </div>
      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden mb-6 shadow-sm">
        {days}
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-sm p-4 overflow-y-auto">
        <h3 className="font-bold text-slate-700 mb-3 border-b pb-2 flex justify-between items-center">
          <span>{new Date(selectedDate).toLocaleDateString()} の予定</span>
          <span className="text-xs font-normal bg-slate-100 px-2 py-1 rounded text-slate-500">
            {selectedVisits.length}件
          </span>
        </h3>
        {selectedVisits.length === 0 && (
          <p className="text-center text-slate-400 py-4 text-sm">予定はありません</p>
        )}
      </div>
    </div>
  );
};
