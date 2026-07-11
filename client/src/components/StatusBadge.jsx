import { Badge } from './ui/badge';
import { ASSET_STATUS, ISSUE_STATUS, PRIORITY } from '../lib/constants';

const ASSET_STATUS_VARIANT = {
  [ASSET_STATUS.OPERATIONAL]: 'success',
  [ASSET_STATUS.ISSUE_REPORTED]: 'warning',
  [ASSET_STATUS.UNDER_INSPECTION]: 'warning',
  [ASSET_STATUS.UNDER_MAINTENANCE]: 'warning',
  [ASSET_STATUS.OUT_OF_SERVICE]: 'destructive',
  [ASSET_STATUS.RETIRED]: 'secondary',
};

const ISSUE_STATUS_VARIANT = {
  [ISSUE_STATUS.REPORTED]: 'warning',
  [ISSUE_STATUS.ASSIGNED]: 'default',
  [ISSUE_STATUS.INSPECTION_STARTED]: 'default',
  [ISSUE_STATUS.MAINTENANCE_IN_PROGRESS]: 'default',
  [ISSUE_STATUS.WAITING_FOR_PARTS]: 'warning',
  [ISSUE_STATUS.RESOLVED]: 'success',
  [ISSUE_STATUS.CLOSED]: 'secondary',
  [ISSUE_STATUS.REOPENED]: 'destructive',
};

const PRIORITY_VARIANT = {
  [PRIORITY.LOW]: 'secondary',
  [PRIORITY.MEDIUM]: 'default',
  [PRIORITY.HIGH]: 'warning',
  [PRIORITY.CRITICAL]: 'destructive',
};

export function AssetStatusBadge({ status }) {
  return <Badge variant={ASSET_STATUS_VARIANT[status] || 'outline'}>{status}</Badge>;
}

export function IssueStatusBadge({ status }) {
  return <Badge variant={ISSUE_STATUS_VARIANT[status] || 'outline'}>{status}</Badge>;
}

// Critical issues must be "visually distinguishable" per the brief - a
// pulsing destructive badge rather than just another color in the list.
export function PriorityBadge({ priority }) {
  const isCritical = priority === PRIORITY.CRITICAL;
  return (
    <Badge variant={PRIORITY_VARIANT[priority] || 'outline'} className={isCritical ? 'animate-pulse' : ''}>
      {isCritical ? '⚠ ' : ''}
      {priority}
    </Badge>
  );
}
