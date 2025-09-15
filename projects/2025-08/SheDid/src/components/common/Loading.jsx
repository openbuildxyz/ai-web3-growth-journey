export const Loading = ({ size = 'md', text = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div className="h-full w-full border-4 border-gray-200 border-t-blue-500 rounded-full"></div>
      </div>
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
};