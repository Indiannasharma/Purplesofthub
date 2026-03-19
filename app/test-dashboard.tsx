import ComponentCard from "@/src/components/common/ComponentCard";
import PageBreadcrumb from "@/src/components/common/PageBreadCrumb";

export default function TestDashboard() {
  return (
    <div className="space-y-6 p-6">
      <PageBreadcrumb pageTitle="Test Dashboard" />
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ComponentCard title="Test Metric 1">
          <div className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            123
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            This is a test component to verify TailAdmin styling is working.
          </p>
        </ComponentCard>
        
        <ComponentCard title="Test Metric 2">
          <div className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            456
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            If you see this with proper styling, the transformation is working!
          </p>
        </ComponentCard>
        
        <ComponentCard title="Test Metric 3">
          <div className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            789
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Check the borders, shadows, and dark mode support.
          </p>
        </ComponentCard>
        
        <ComponentCard title="Test Metric 4">
          <div className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            100%
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Success rate of TailAdmin transformation.
          </p>
        </ComponentCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ComponentCard title="Test Content">
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              This is a test to verify that the ComponentCard component is working properly
              with TailAdmin styling. You should see:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>Proper rounded corners and borders</li>
              <li>Subtle shadows and hover effects</li>
              <li>Dark mode support</li>
              <li>Consistent spacing and typography</li>
            </ul>
          </div>
        </ComponentCard>
        
        <ComponentCard title="Instructions">
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              To test the dashboard transformation:
            </p>
            <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>Visit /admin to see the admin dashboard</li>
              <li>Visit /dashboard to see the client dashboard</li>
              <li>Check that all cards have proper styling</li>
              <li>Test dark mode toggle</li>
              <li>Verify sidebar navigation works</li>
            </ol>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}