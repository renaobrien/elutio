import { Alert } from '../../types';
import { Button } from '../ui/Button';

interface AlertCardsProps {
  alerts: Alert[];
}

export function AlertCards({ alerts }: AlertCardsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mb-6">
      {alerts.map(alert => {
        const borderColor = alert.severity === 'danger' ? 'var(--danger)' : 'var(--warning)';
        const bgVariant = alert.severity === 'danger' ? 'var(--danger-dim)' : 'var(--warning-dim)';

        return (
          <div
            key={alert.id}
            className="rounded-[8px] p-[16px] flex justify-between items-center"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderLeft: `3px solid ${borderColor}`,
            }}
          >
            <div>
              <div
                className="text-[12px] font-semibold mb-[2px]"
                style={{ color: borderColor }}
              >
                {alert.title}
              </div>
              <div
                className="text-[10px] font-mono"
                style={{ color: 'var(--text-secondary)' }}
              >
                {alert.description}
              </div>
            </div>

            <Button
              variant={alert.severity === 'danger' ? 'danger' : 'secondary'}
              className="px-3 py-1 text-[10px]"
            >
              {alert.actions[0]}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
