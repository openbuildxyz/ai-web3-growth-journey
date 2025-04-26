import React from 'react';

const SubscriptionPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>

      <section className="mb-8 p-6 card bg-base-100 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        {/* Placeholder for current plan details */}
        <p>You are currently on the Free plan.</p>
        <button className="btn btn-primary mt-4 max-w-xs">Upgrade Plan</button>
         {/* TODO: Implement upgrade flow */}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
              <h3 className="card-title">Free</h3>
              <p className="text-3xl font-bold">$0<span className="text-lg font-normal">/month</span></p>
              <ul className="list-disc list-inside space-y-1 text-sm mt-4 mb-6">
                <li>30 Points Daily</li>
                <li>Scheduled Triggers Only</li>
                <li>Swap Fee: 1%</li>
              </ul>
              <div className="card-actions justify-end">
                <button className="btn btn-disabled">Current Plan</button>
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="card bg-base-100 shadow-xl border border-primary">
            <div className="card-body">
              <h3 className="card-title">Pro</h3>
              <p className="text-3xl font-bold">$20<span className="text-lg font-normal">/month</span></p>
              <ul className="list-disc list-inside space-y-1 text-sm mt-4 mb-6">
                <li>150 Points Daily</li>
                <li>More Trigger Support</li>
                <li>Swap Fee: 0.8%</li>
              </ul>
              <div className="card-actions justify-end">
                <button className="btn btn-primary">Choose Pro</button>
                 {/* TODO: Implement plan selection */}
              </div>
            </div>
          </div>

          {/* Elite Plan */}
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
              <h3 className="card-title">Elite</h3>
              <p className="text-3xl font-bold">$50<span className="text-lg font-normal">/month</span></p>
              <ul className="list-disc list-inside space-y-1 text-sm mt-4 mb-6">
                <li>500 Points Daily</li>
                <li>All Trigger Support</li>
                <li>Swap Fee: 0.5%</li>
              </ul>
              <div className="card-actions justify-end">
                <button className="btn btn-primary">Choose Elite</button>
                 {/* TODO: Implement plan selection */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionPage;