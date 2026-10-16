import { StatCardsGrid } from './StatCardsGrid.jsx';
import { CapacityProgressPanel } from './CapacityProgressPanel.jsx';
import { UpcomingSessionsList } from './UpcomingSessionsList.jsx';

/**
 * Main Dashboard Screen View
 * Fully assembled from live derived state
 */
export function DashboardView() {
  return (
    <div className="space-y-6">
      {/* 4 Top Metric Cards */}
      <StatCardsGrid />

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CapacityProgressPanel />
        <UpcomingSessionsList />
      </div>
    </div>
  );
}

export default DashboardView;
