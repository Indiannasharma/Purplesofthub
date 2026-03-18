import connectDB from "@/lib/mongodb";
import Service from "@/lib/models/Service";

const categoryLabels: Record<string, string> = {
  "web-development": "Web Development",
  "mobile-apps": "Mobile Apps",
  "digital-marketing": "Digital Marketing",
  "ui-ux-design": "UI/UX Design",
  "saas-development": "SaaS Development",
  "music-promotion": "Music Promotion",
  "content-creation": "Content Creation",
  seo: "SEO",
  "social-media": "Social Media",
};

type ServiceItem = {
  _id: string;
  name?: string;
  category?: string;
  shortDesc?: string;
  features?: string[];
  priceNGN?: number;
  priceUSD?: number;
  deliveryDays?: number;
  icon?: string;
};

export default async function DashboardServicesPage() {
  await connectDB();

  const services = (await Service.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .lean()) as ServiceItem[];

  const grouped = services.reduce<Record<string, ServiceItem[]>>((acc, service) => {
    const key = service.category || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(service);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
          Services
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Browse active PurpleSoftHub services and pricing.
        </p>
      </div>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No active services yet.
        </div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {categoryLabels[category] ?? "Other"}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((service) => (
                <article
                  key={service._id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                      {service.name || "Service"}
                    </h3>
                    <span className="text-xl leading-none">{service.icon || "*"}</span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {service.shortDesc || "Custom delivery by PurpleSoftHub."}
                  </p>

                  {Array.isArray(service.features) && service.features.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      {service.features.slice(0, 4).map((feature) => (
                        <li key={feature}>- {feature}</li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                      N{Number(service.priceNGN || 0).toLocaleString("en-NG")}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      ${Number(service.priceUSD || 0).toLocaleString("en-US")}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {service.deliveryDays || 0} day delivery
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
