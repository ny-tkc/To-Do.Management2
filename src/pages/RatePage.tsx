import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@/components/Icon';
import { ProgressBar } from '@/components/ProgressBar';
import { AlertModal } from '@/components/modals/AlertModal';
import { getTodayJST, getCurrentMonthJST } from '@/utils/date';
import type { Firm, Visit, Alert } from '@/types';

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} mr-4 flex-shrink-0`}>
      <Icon name={icon} className="text-white" size={24} />
    </div>
    <div className="min-w-0">
      <p className="text-xs sm:text-sm text-slate-500 truncate">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-slate-800 truncate">{value}</p>
    </div>
  </div>
);

interface RatePageProps {
  firms: Firm[];
  visits: Visit[];
}

export const RatePage = ({ firms, visits }: RatePageProps) => {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthJST());
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Record<string, number>>({});

  useEffect(() => {
    const saved = localStorage.getItem('alert_acknowledgments');
    if (saved) setAcknowledgedAlerts(JSON.parse(saved));
  }, []);

  const { visitedCount, totalCount, unvisitedCount, completionRate, processedFirms, monthlyVisitCount, calculatedAlerts } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastVisits: Record<string, Date> = {};
    visits.forEach((v) => {
      if (v.status === 'completed') {
        const vDate = new Date(v.date);
        if (!lastVisits[v.firmId] || vDate > lastVisits[v.firmId]) {
          lastVisits[v.firmId] = vDate;
        }
      }
    });

    const currentAlerts: Alert[] = [];
    if (!currentMonth)
      return { visitedCount: 0, totalCount: firms.length, unvisitedCount: firms.length, completionRate: 0, processedFirms: [], monthlyVisitCount: 0, calculatedAlerts: [] };

    const [year, month] = currentMonth.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const monthlyCompletedVisits = visits.filter((v) => {
      const visitDate = new Date(v.date);
      return v.status === 'completed' && visitDate >= startDate && visitDate <= endDate;
    });

    const monthlyCounts: Record<string, number> = {};
    monthlyCompletedVisits.forEach((v) => {
      monthlyCounts[v.firmId] = (monthlyCounts[v.firmId] || 0) + 1;
    });

    const monthlyScheduledVisits = visits.filter((v) => {
      const visitDate = new Date(v.date);
      return v.status === 'pending' && visitDate >= startDate && visitDate <= endDate;
    });

    const visitedFirmIdsInMonth = new Set(monthlyCompletedVisits.map((v) => v.firmId));
    const scheduledFirmIdsInMonth = new Set(monthlyScheduledVisits.map((v) => v.firmId));

    const total = firms.length;
    const visited = visitedFirmIdsInMonth.size;
    const unvisited = total - visited;
    const rate = total > 0 ? Math.round((visited / total) * 100) : 0;

    const statusOrder: Record<string, number> = { unvisited: 1, scheduled: 2, visited: 3 };

    const firmsWithStatus = firms
      .map((firm) => {
        const lastVisit = lastVisits[firm.id];
        let alertLevel = 0;
        let daysSince = -1;

        if (lastVisit) {
          const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
          daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (daysSince >= 40) alertLevel = 2;
          else if (daysSince >= 30) alertLevel = 1;
        }

        if (alertLevel > 0) {
          currentAlerts.push({
            firm,
            level: alertLevel,
            daysSince,
            lastVisitDate: lastVisit ? lastVisit.toLocaleDateString() : 'なし',
          });
        }

        let status: 'unvisited' | 'scheduled' | 'visited' = 'unvisited';
        let statusLabel = '未訪問';
        if (visitedFirmIdsInMonth.has(firm.id)) {
          status = 'visited';
          statusLabel = '訪問済み';
        } else if (scheduledFirmIdsInMonth.has(firm.id)) {
          status = 'scheduled';
          statusLabel = '予定あり';
        }

        return {
          ...firm,
          status,
          statusLabel,
          monthCount: monthlyCounts[firm.id] || 0,
          alertLevel,
          daysSince,
        };
      })
      .sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || (a.code || '').localeCompare(b.code || ''));

    return {
      visitedCount: visited,
      totalCount: total,
      unvisitedCount: unvisited,
      completionRate: rate,
      processedFirms: firmsWithStatus,
      monthlyVisitCount: monthlyCompletedVisits.length,
      calculatedAlerts: currentAlerts,
    };
  }, [firms, visits, currentMonth]);

  useEffect(() => {
    const alertsToShow = calculatedAlerts.filter((a) => {
      const ackLevel = acknowledgedAlerts[a.firm.id];
      return !ackLevel || ackLevel !== a.level;
    });
    if (alertsToShow.length > 0) setIsAlertModalOpen(true);
  }, [calculatedAlerts]);

  const handleIgnoreAlert = (alert: Alert) => {
    const newAcks = { ...acknowledgedAlerts, [alert.firm.id]: alert.level };
    setAcknowledgedAlerts(newAcks);
    localStorage.setItem('alert_acknowledgments', JSON.stringify(newAcks));
  };

  const statusStyles: Record<string, { icon: string; color: string; bgColor: string }> = {
    visited: { icon: 'fa-check-circle', color: 'text-green-500', bgColor: 'bg-green-50' },
    scheduled: { icon: 'fa-calendar-alt', color: 'text-blue-500', bgColor: 'bg-blue-50' },
    unvisited: { icon: 'fa-exclamation-circle', color: 'text-slate-400', bgColor: 'bg-slate-50' },
  };

  const [year, month] = currentMonth.split('-').map(Number);
  const alertsForModal = calculatedAlerts.filter((a) => {
    const ackLevel = acknowledgedAlerts[a.firm.id];
    return !ackLevel || ackLevel !== a.level;
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-4 gap-2">
        <h2 className="text-lg font-bold text-slate-700 flex-shrink-0">{`${year}年 ${month}月`}の進捗</h2>
        <input
          type="month"
          value={currentMonth}
          onChange={(e) => setCurrentMonth(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-md text-base flex-shrink min-w-0"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard title="月間訪問回数" value={`${monthlyVisitCount} 回`} icon="fa-shoe-prints" color="bg-sky-500" />
        <StatCard title="月間訪問済み" value={`${visitedCount} 社`} icon="fa-check" color="bg-green-500" />
        <StatCard title="月間未訪問" value={`${unvisitedCount} 社`} icon="fa-person-running" color="bg-amber-500" />
        <StatCard title="月間面談率" value={`${completionRate} %`} icon="fa-bullseye" color="bg-cyan-600" />
      </div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold text-slate-600">面談率進捗 (担当: {totalCount}社)</span>
          <span className="text-sm font-bold text-slate-600">
            {completionRate}% ({visitedCount}社 訪問済)
          </span>
        </div>
        <ProgressBar value={visitedCount} max={totalCount} />
      </div>
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-700 border-b pb-2 mb-3">担当先一覧 (優先度順)</h2>
        {processedFirms.length > 0 ? (
          processedFirms.map((firm) => {
            const style = statusStyles[firm.status];
            return (
              <div key={firm.id} className={`p-3 rounded-lg shadow-sm flex items-center justify-between ${style.bgColor} relative`}>
                <div className="flex items-center overflow-hidden mr-2 flex-1">
                  <div className="relative mr-3 flex-shrink-0">
                    <Icon name={style.icon} className={style.color} size={24} />
                    {firm.alertLevel > 0 && (
                      <div
                        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${
                          firm.alertLevel === 2 ? 'bg-red-500' : 'bg-yellow-400'
                        }`}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center">
                      <span className="font-semibold text-slate-600 w-14 flex-shrink-0 text-sm">{firm.code}</span>
                      <span className="font-medium text-slate-800 truncate text-sm sm:text-base">{firm.name}</span>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-slate-500 space-x-2">
                      <span>
                        月間: <span className="font-bold">{firm.monthCount}</span>回
                      </span>
                      {firm.daysSince > 0 && (
                        <span
                          className={`${
                            firm.alertLevel === 2
                              ? 'text-red-500 font-bold'
                              : firm.alertLevel === 1
                                ? 'text-amber-600 font-bold'
                                : ''
                          }`}
                        >
                          (前回: {firm.daysSince}日前)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${style.color} bg-white border border-slate-100`}>
                  {firm.statusLabel}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-slate-500 text-center py-4">担当先が登録されていません。</p>
        )}
      </div>
      <AlertModal
        isOpen={isAlertModalOpen && alertsForModal.length > 0}
        onClose={() => setIsAlertModalOpen(false)}
        alerts={alertsForModal}
        onIgnore={handleIgnoreAlert}
      />
    </div>
  );
};
