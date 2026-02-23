import { useState } from 'react';
import { Github, Twitter, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate?: (screen: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const [showAuditTooltip, setShowAuditTooltip] = useState(false);

  return (
    <div
      className="flex flex-col gap-2 px-4 md:px-5 py-2 md:py-3 text-[10px] md:text-[11px] fixed bottom-0 left-0 right-0 z-40 w-full"
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        color: 'var(--text-tertiary)',
      }}
    >
      {/* Top Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-1 md:gap-2">
        <div className="flex flex-wrap items-center gap-2 md:gap-3 lg:gap-4">
          <button
            onClick={() => onNavigate?.('assets')}
            className="hover:text-[var(--text-secondary)] transition-colors whitespace-nowrap"
          >
            Supported assets
          </button>
          <span className="hidden md:inline text-[var(--text-tertiary)]">•</span>
          <button
            onClick={() => onNavigate?.('faq')}
            className="hover:text-[var(--text-secondary)] transition-colors whitespace-nowrap"
          >
            FAQ
          </button>
          <span className="hidden lg:inline text-[var(--text-tertiary)]">•</span>
          <button
            onClick={() => onNavigate?.('help')}
            className="hover:text-[var(--text-secondary)] transition-colors whitespace-nowrap"
          >
            Help
          </button>
          <span className="hidden lg:inline text-[var(--text-tertiary)]">•</span>
          <button
            onClick={() => onNavigate?.('docs')}
            className="hover:text-[var(--text-secondary)] transition-colors whitespace-nowrap"
          >
            Docs
          </button>
          <span className="hidden lg:inline text-[var(--text-tertiary)]">•</span>
          <div className="relative">
            <button
              onMouseEnter={() => setShowAuditTooltip(true)}
              onMouseLeave={() => setShowAuditTooltip(false)}
              className="italic hover:text-[var(--text-secondary)] transition-colors whitespace-nowrap"
            >
              Audits
            </button>
            {showAuditTooltip && (
              <div
                className="absolute bottom-full left-0 mb-2 p-2 rounded-[4px] text-[9px] w-32 z-10 shadow-lg text-center"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Coming soon
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <a href="#" className="hover:text-[var(--accent)] transition-colors" title="Twitter">
            <Twitter size={12} className="md:w-[14px] md:h-[14px]" />
          </a>
          <a href="#" className="hover:text-[var(--accent)] transition-colors" title="GitHub">
            <Github size={12} className="md:w-[14px] md:h-[14px]" />
          </a>
          <a href="mailto:help@elut.io" className="hover:text-[var(--accent)] transition-colors" title="Email">
            <Mail size={12} className="md:w-[14px] md:h-[14px]" />
          </a>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex flex-col md:flex-row gap-1 md:gap-2 md:items-center md:justify-end">
        <a
          href="mailto:help@elut.io"
          className="hover:text-[var(--text-secondary)] transition-colors whitespace-nowrap"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Help
        </a>
        <div className="flex flex-col md:flex-row gap-1 md:gap-2 w-full md:w-auto">
          <a
            href="mailto:help@elut.io?subject=Feature%20request"
            className="px-2 md:px-3 py-1 rounded-[6px] text-[9px] md:text-[10px] border transition-colors whitespace-nowrap text-center"
            style={{ 
              border: '1px solid var(--border)', 
              color: 'var(--text-secondary)',
            }}
          >
            Feature request
          </a>
          <a
            href="mailto:help@elut.io?subject=Token%20or%20chain%20request"
            className="px-2 md:px-3 py-1 rounded-[6px] text-[9px] md:text-[10px] border transition-colors whitespace-nowrap text-center"
            style={{ 
              border: '1px solid var(--border)', 
              color: 'var(--text-secondary)',
            }}
          >
            Request token/chain
          </a>
        </div>
      </div>
    </div>
  );
}
