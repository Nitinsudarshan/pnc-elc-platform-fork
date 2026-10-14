'use client';

import React, { useEffect, useState } from 'react';
import { Laptop, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TONES, type Tone } from '@/lib/ui/tone';
import type {
  AssetAllocationStage,
  ExternalAssetAllocationStatus,
} from '@/lib/integrations/assets';

const STAGE_META: Record<AssetAllocationStage, { label: string; tone: Tone; hint: string }> = {
  not_requested: {
    label: 'Not Requested',
    tone: 'pending',
    hint: 'No hardware request has been raised in the Asset Management System yet.',
  },
  requested: {
    label: 'Request Raised',
    tone: 'info',
    hint: 'A hardware request is open and awaiting approval on the asset platform.',
  },
  approved: {
    label: 'Approved',
    tone: 'info',
    hint: 'The request is approved and queued for allocation.',
  },
  in_procurement: {
    label: 'In Procurement',
    tone: 'warning',
    hint: 'The asset platform is sourcing the device for this joiner.',
  },
  allocated: {
    label: 'Allocated',
    tone: 'success',
    hint: 'A device is allocated and awaiting physical handover.',
  },
  handed_over: {
    label: 'Handed Over',
    tone: 'success',
    hint: 'The device has been handed over to the employee.',
  },
};

function formatDate(value?: string) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export interface AssetAllocationCardProps {
  /** Employee code the external asset system knows this joiner by. */
  employeeReference?: string | null;
  /** `compact` renders a single status line for use inside an existing card. */
  variant?: 'full' | 'compact';
  className?: string;
}

/**
 * Read-only view of a joiner's hardware allocation.
 *
 * Hardware is requested and allocated entirely in the external Asset
 * Management System — ELC holds no laptop records of its own and offers no way
 * to edit them here. This component exists so P&C can see the status without
 * leaving onboarding.
 */
export function AssetAllocationCard({
  employeeReference,
  variant = 'full',
  className = '',
}: AssetAllocationCardProps) {
  const [status, setStatus] = useState<ExternalAssetAllocationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeReference) {
      setStatus(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/integrations/assets/allocation?employee_reference=${encodeURIComponent(employeeReference)}`
        );
        const json = await res.json();
        if (cancelled) return;
        if (json.success) setStatus(json.data);
        else setError(json.error || 'Asset system unavailable');
      } catch {
        if (!cancelled) setError('Could not reach the Asset Management System');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [employeeReference]);

  // Without an employee code the external system has nothing to look up.
  if (!employeeReference) {
    return (
      <div className={`text-[11px] text-muted-foreground ${className}`}>
        Hardware status appears once an Employee ID is assigned.
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-[11px] text-muted-foreground ${className}`}>
        <RefreshCw className="h-3 w-3 animate-spin" />
        <span>Reading Asset Management System...</span>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className={`flex items-start gap-2 text-[11px] ${TONES.warning.text} ${className}`}>
        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-px" />
        <span>{error || 'Asset status unavailable.'}</span>
      </div>
    );
  }

  const meta = STAGE_META[status.stage];

  if (variant === 'compact') {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${TONES[meta.tone].soft}`}>
            {meta.label}
          </Badge>
          {status.request_reference && (
            <span className="text-[10px] font-mono text-muted-foreground">
              {status.request_reference}
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {status.assets.length > 0
            ? status.assets.map((a) => a.asset_name).join(', ')
            : meta.hint}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border ${TONES.accent.border} ${TONES.accent.surface} p-3.5 space-y-3 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className={`p-2 rounded-lg ${TONES.accent.chip}`}>
            <Laptop className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-foreground flex items-center gap-2 flex-wrap">
              <span>External Asset Management API</span>
              <Badge variant="outline" className={`text-[10px] ${TONES.accent.soft}`}>
                Source of Truth
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Laptops and hardware are requested and allocated on the asset platform. ELC displays
              that status read-only and holds no device records of its own.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className={`text-[10px] ${TONES[meta.tone].soft}`}>
            {meta.label}
          </Badge>
          {status.external_url && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-7 text-[11px] rounded-lg gap-1 font-semibold"
            >
              <a href={status.external_url} target="_blank" rel="noopener noreferrer">
                <span>Open Request</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] border-t border-border/60 pt-3">
        <div>
          <span className="text-muted-foreground block">Request Ref</span>
          <span className="font-mono font-semibold text-foreground">
            {status.request_reference || '—'}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block">Requested</span>
          <span className="font-semibold text-foreground">
            {formatDate(status.requested_at) || '—'}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block">Expected Handover</span>
          <span className="font-semibold text-foreground">
            {formatDate(status.expected_handover_date) || '—'}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block">Devices Allocated</span>
          <span className="font-semibold text-foreground">{status.assets.length}</span>
        </div>
      </div>

      {status.assets.length > 0 ? (
        <div className="space-y-1.5 border-t border-border/60 pt-3">
          {status.assets.map((asset) => (
            <div
              key={asset.asset_id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border/80 bg-card p-2.5"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{asset.asset_name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {asset.specifications || 'No specification recorded'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-mono text-foreground">{asset.asset_tag}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{asset.serial_number}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground border-t border-border/60 pt-3">
          {meta.hint}
        </p>
      )}
    </div>
  );
}

export default AssetAllocationCard;
