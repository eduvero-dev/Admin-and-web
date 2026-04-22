import Link from "next/link";
import { redirect } from "next/navigation";
import { createStripeCheckout, getSubscriptionPlans } from "@/lib/api";

function normalizePlanName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export default async function ImpactProPlanPage(props: {
  searchParams?: Promise<{ userId?: string }>;
}) {
  const data = await getSubscriptionPlans();
  const plan = data.plans.find((p) => normalizePlanName(p.plan_name) === "impact pro");
  const sp = await props.searchParams;
  const userId = sp?.userId?.trim() || "";

  async function startCheckout(formData: FormData) {
    "use server";
    const priceId = String(formData.get("priceId") || "");
    const userIdFromForm = String(formData.get("userId") || "");
    if (!priceId || !userIdFromForm) {
      redirect("/impact-pro");
    }

    const { checkout_url } = await createStripeCheckout({
      priceId,
      userId: userIdFromForm,
    });
    redirect(checkout_url);
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-[#050a0f] px-4 font-sans selection:bg-cyan-500/30">
      <div className="bg-blob -top-48 -left-48 opacity-60" />
      <div className="bg-blob -bottom-48 -right-48 opacity-40 rotate-45" />
      <div className="bg-blob top-1/4 right-0 opacity-20" />

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl z-10 py-16">
        <div className="w-full glass-card rounded-[2rem] p-10">
          <div className="flex items-start justify-between gap-6 mb-8">
            <div>
              <p className="text-cyan-400/90 text-[10px] font-bold tracking-[0.3em] uppercase mb-3">
                Subscription
              </p>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                {plan?.plan_name ?? "Impact Pro"}
              </h1>
              <p className="text-white/40 text-[12px] font-medium mt-3">
                {plan ? (
                  <>
                    <span className="text-cyan-300 font-black">{plan.price_amount}</span>{" "}
                    <span className="text-white/30">/ {plan.billing_period}</span>
                  </>
                ) : (
                  "Plan not found."
                )}
              </p>
            </div>

            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
            >
              Back
            </Link>
          </div>

          {plan ? (
            <>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">
                  What’s included
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 text-[11px] font-black">
                        ✓
                      </span>
                      <span className="text-sm text-white/70 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {!userId && (
                <div className="mt-6 bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs rounded-xl px-4 py-3 text-center">
                  Missing <span className="font-black">userId</span> in the URL. Example:{" "}
                  <span className="font-mono text-amber-100">/impact-pro?userId=...</span>
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <form action={startCheckout} className="flex-1">
                  <input type="hidden" name="priceId" value={plan.price_id} />
                  <input type="hidden" name="userId" value={userId} />
                  <button
                    type="submit"
                    disabled={!userId}
                    className="w-full text-center py-4 rounded-2xl bg-cyan-500 text-[#021a1d] font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Checkout
                  </button>
                </form>
                <a
                  href="https://www.eduvero.com/support"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 transition-all"
                >
                  Support
                </a>
              </div>
            </>
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl px-4 py-3 text-center">
              Couldn’t find the “Impact Pro” plan from the plans endpoint.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

