import { LayoutDashboard, Droplet, History, HelpCircle, ExternalLink, FileText } from 'lucide-react';

interface SidebarProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export function Sidebar({ activeScreen, onNavigate }: SidebarProps) {
  const items = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'pool', label: 'Earnings', icon: Droplet },
    { id: 'history', label: 'History', icon: History },
  ];

  const bottomItems = [
    { id: 'faq', label: 'FAQ', icon: FileText },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'docs', label: 'Docs', icon: ExternalLink },
  ];

  return (
    <div
      className="w-40 flex flex-col py-4"
      style={{
        borderRight: '1px solid var(--border)',
        background: 'var(--surface)',
      }}
    >
      <div className="flex-1">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full px-4 py-2 text-[13px] flex items-center gap-2 transition-all duration-150"
              style={{
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              <Icon size={14} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
        {bottomItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full px-4 py-[6px] text-[12px] flex items-center gap-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <Icon size={12} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
