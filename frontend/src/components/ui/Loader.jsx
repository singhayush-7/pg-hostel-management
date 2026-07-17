const Loader = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
    xl: "w-16 h-16 border-4",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full border-primary-500 border-t-transparent animate-spin`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-screen bg-dark-900 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-secondary-500/20 border-b-secondary-500 animate-spin animation-reverse" />
      </div>
      <p className="text-slate-400 text-sm animate-pulse">Loading SmartStay...</p>
    </div>
  </div>
);

export default Loader;
