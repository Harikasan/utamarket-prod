import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CallToAction() {
  return (
    <section className="py-20 bg-zinc-900 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Buy on UTAMarket?
        </h2>
        <p className="text-zinc-300 max-w-2xl mx-auto mb-8">
          Join thousands of UTA students who are saving money on our campus
          marketplace
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/signup">Sign Up Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
