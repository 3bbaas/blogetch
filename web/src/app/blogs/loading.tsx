import { SettingType, Skeleton } from '@/components/ui/Skeleton';

export default function BlogsLoading() {
  return (
    <div aria-busy="true">
      <SettingType />
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="rounded-[2px] border border-rule p-4">
            <Skeleton lines={4} />
          </div>
        ))}
      </div>
    </div>
  );
}
