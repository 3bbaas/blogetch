import { SettingType, Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6" aria-busy="true">
      <SettingType />
      <div className="mt-4">
        <Skeleton lines={5} />
      </div>
    </div>
  );
}
