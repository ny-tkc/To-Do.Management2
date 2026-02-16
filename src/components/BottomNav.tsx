import { Icon } from '@/components/Icon';

interface NavItemProps {
  page: string;
  activePage: string;
  setActivePage: (page: string) => void;
  icon: string;
  label: string;
}

const NavItem = ({ page, activePage, setActivePage, icon, label }: NavItemProps) => {
  const isActive = activePage === page;
  return (
    <button
      onClick={() => setActivePage(page)}
      className={`flex-1 flex flex-col items-center justify-center pt-2 pb-1 transition-colors duration-200 min-w-0 ${
        isActive ? 'text-cyan-600' : 'text-slate-500 hover:text-cyan-500'
      }`}
    >
      <Icon name={icon} className={`mb-0.5 ${isActive ? 'text-cyan-600' : ''}`} size={24} />
      <span className="text-[10px] leading-tight font-medium">{label}</span>
    </button>
  );
};

interface BottomNavProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export const BottomNav = ({ activePage, setActivePage }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex justify-around items-end z-50 pb-safe h-[calc(3.5rem+env(safe-area-inset-bottom))] box-content">
      <NavItem page="today" activePage={activePage} setActivePage={setActivePage} icon="fa-list-check" label="本日" />
      <NavItem page="calendar" activePage={activePage} setActivePage={setActivePage} icon="fa-calendar-days" label="カレンダー" />
      <NavItem page="tasks" activePage={activePage} setActivePage={setActivePage} icon="fa-tasks" label="タスク" />
      <NavItem page="rate" activePage={activePage} setActivePage={setActivePage} icon="fa-chart-pie" label="面談率" />
      <NavItem page="history" activePage={activePage} setActivePage={setActivePage} icon="fa-history" label="履歴" />
    </nav>
  );
};
