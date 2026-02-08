export default function SimpleLoadingBar() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-64 space-y-3">
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-loading-bar"></div>
        </div>
      </div>
    </div>
  );
}
