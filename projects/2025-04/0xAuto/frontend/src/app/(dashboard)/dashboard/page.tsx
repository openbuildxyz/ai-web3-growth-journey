import React from 'react';

const DashboardPage = () => {
  // Mock data - replace later
  const todayCalls = 150;
  const pointsConsumed = 75;
  const topAgents = [
    { name: 'Agent Beta', calls: 50 },
    { name: 'Agent Gamma', calls: 40 },
    { name: 'Agent Alpha', calls: 35 },
    { name: 'Agent Delta', calls: 25 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Today's API Calls Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-lg">Today&apos;s API Calls</h2>
            <p className="text-4xl font-bold">{todayCalls}</p>
          </div>
        </div>

        {/* Points Consumed Today Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-lg">Points Consumed Today</h2>
            <p className="text-4xl font-bold">{pointsConsumed}</p>
          </div>
        </div>
      </div>

      {/* Top Agents Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Top Agents by Calls (Today)</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Agent Name</th>
                  <th>Calls</th>
                </tr>
              </thead>
              <tbody>
                {topAgents.map((agent, index) => (
                  <tr key={agent.name}>
                    <th>{index + 1}</th>
                    <td>{agent.name}</td>
                    <td>{agent.calls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;