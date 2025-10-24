import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner
          size="lg"
          text="Loading transactions..."
          variant="inline"
        />
      </div>
    </div>
  )
}
