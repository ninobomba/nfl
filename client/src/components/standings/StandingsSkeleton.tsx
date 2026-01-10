import React from 'react';
import { Skeleton } from 'primereact/skeleton';

const StandingsSkeleton: React.FC = () => {
  return (
    <div className="max-w-[800px] mx-auto py-20 flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <Skeleton width="20%" height="2rem" />
        <Skeleton height="15rem" borderRadius="24px" />
      </div>
    </div>
  );
};

export default StandingsSkeleton;
