export default function LoadingWrapper({ loading, children }) {
  if (loading) {
    return (
<div className="flex justify-center items-center h-screen w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}