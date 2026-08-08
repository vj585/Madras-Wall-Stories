export default function Loading() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-7xl animate-pulse">
        {/* Banner Skeleton */}
        <div className="w-full h-48 md:h-64 bg-gray-100 rounded-3xl mb-12"></div>
        
        {/* Title Skeleton */}
        <div className="w-1/3 h-8 bg-gray-100 rounded-full mb-8"></div>
        
        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="w-full aspect-[3/4] bg-gray-100 rounded-2xl"></div>
              <div className="w-2/3 h-4 bg-gray-100 rounded-full"></div>
              <div className="w-1/3 h-4 bg-gray-100 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

