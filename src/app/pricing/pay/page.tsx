import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import NavigationHeader from "@/src/components/NavigationHeader";
import QRPaymentForm from "./_components/QRPaymentForm";

async function PaymentPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const convexUser = await convex.query(api.users.getUser, {
        userId: user.id,
    });

    // Already Pro — send to pricing page
    if (convexUser?.isPro) {
        redirect("/pricing");
    }

    // Get their latest payment request status
    const paymentRequest = await convex.query(api.payments.getUserPaymentRequest, {
        userId: user.id,
    });

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            <NavigationHeader />
            <main className="relative pt-32 pb-24 px-4">
                <QRPaymentForm
                    userId={user.id}
                    userEmail={user.emailAddresses[0]?.emailAddress ?? ""}
                    existingRequest={paymentRequest}
                />
            </main>
        </div>
    );
}

export default PaymentPage;
