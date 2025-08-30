import {
  XCircle,
  ShieldCheck,
  ShieldAlert,
  FileText,
  KeyRound,
} from "lucide-react";

export default function ClarityPopup({
  riskLevel,
  title,
  message,
  details,
  onClose,
}) {
  const isDanger = riskLevel === "danger";
  const bgColor = isDanger
    ? "bg-slate-800/80 border-red-500"
    : "bg-slate-800/80 border-green-500";
  const titleColor = isDanger ? "text-red-400" : "text-green-400";
  const Icon = isDanger ? ShieldAlert : ShieldCheck;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-md">
      {/* Main container with animation */}
      <div
        className={`relative w-full max-w-2xl rounded-2xl border ${bgColor} p-8 text-white shadow-2xl shadow-black/40 animate-fade-in-scale`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
        >
          <XCircle size={28} />
        </button>

        <div className="flex items-start gap-6">
          <Icon size={48} className={`${titleColor} mt-1 flex-shrink-0`} />
          <div className="flex-grow">
            <h2 className={`text-2xl font-bold mb-2 ${titleColor}`}>{title}</h2>
            <p className="text-md text-gray-300 mb-6">{message}</p>

            <div className="space-y-4 rounded-lg bg-black/20 p-4 border border-slate-700">
              <div className="flex items-center gap-4">
                <FileText className="text-slate-400 flex-shrink-0" size={20} />
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-200">Action</h3>
                  <p className="text-slate-400 text-sm">{details.action}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <KeyRound className="text-slate-400 flex-shrink-0" size={20} />
                <div className="flex-grow">
                  <h3 className="font-semibold text-slate-200">
                    Permissions Granted
                  </h3>
                  <p className="font-mono text-sm text-amber-400">
                    {details.permissions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-bold bg-slate-600 hover:bg-slate-700 transition-all"
          >
            {isDanger ? "Reject Transaction" : "Close"}
          </button>
          {!isDanger && (
            <button className="px-6 py-2 rounded-lg font-bold bg-green-600 hover:bg-green-700 transition-all">
              Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
