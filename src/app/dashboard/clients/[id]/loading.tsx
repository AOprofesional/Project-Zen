import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ProjectLoading() {
    return (
        <DashboardLayout>
            <div className="animate-pulse space-y-8">
                {/* Header Breadcrumb Skeleton */}
                <div className="h-4 w-32 bg-white/5 rounded-md mb-4" />

                <div className="flex items-end justify-between mb-8">
                    <div className="space-y-4">
                        {/* Title Skeleton */}
                        <div className="h-10 w-64 bg-white/10 rounded-lg" />
                        {/* Status & Dates Skeleton */}
                        <div className="flex gap-4">
                            <div className="h-6 w-20 bg-white/5 rounded-full" />
                            <div className="h-6 w-32 bg-white/5 rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="h-[200px] w-full bg-white/5 rounded-2xl border border-white/10" />
                        <div className="h-[400px] w-full bg-white/5 rounded-2xl border border-white/10" />
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        <div className="h-[150px] w-full bg-white/5 rounded-2xl border border-white/10" />
                        <div className="h-[250px] w-full bg-white/5 rounded-2xl border border-white/10" />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
