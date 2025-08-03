import { Loading } from '../common/Loading';

export const VoteButton = ({ type, onClick, disabled, loading }) => {
  const buttonStyles = {
    approve: {
      base: 'bg-green-500 hover:bg-green-600 text-white',
      disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed',
      label: '✅ 赞成'
    },
    reject: {
      base: 'bg-red-500 hover:bg-red-600 text-white',
      disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed',
      label: '❌ 反对'
    }
  };

  const style = buttonStyles[type];
  const isDisabled = disabled || loading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
        isDisabled ? style.disabled : style.base
      }`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <Loading size="sm" />
          <span className="ml-2">投票中...</span>
        </div>
      ) : (
        style.label
      )}
    </button>
  );
};