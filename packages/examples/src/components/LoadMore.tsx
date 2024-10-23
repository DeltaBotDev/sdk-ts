import { Button, Spinner } from '@nextui-org/react';
import { useState } from 'react';

interface LoadMoreProps {
  loading?: boolean;
  hasMore?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function LoadMore({ loading, hasMore, className, onClick }: LoadMoreProps) {
  const [disable, setDisable] = useState(false);

  function handleClick() {
    if (loading || disable || !hasMore) return;
    setDisable(true);
    onClick?.();
    setTimeout(() => {
      setDisable(false);
    }, 1000);
  }

  return (
    <div className={`w-full flex justify-center sticky left-0 ${className}`}>
      {loading ? (
        <div className="h-10">
          <Spinner />
        </div>
      ) : hasMore ? (
        <Button size="sm" onClick={handleClick} isLoading={loading} disabled={!hasMore || disable}>
          Load more
        </Button>
      ) : (
        <span className="text-gray-400">No more data</span>
      )}
    </div>
  );
}
