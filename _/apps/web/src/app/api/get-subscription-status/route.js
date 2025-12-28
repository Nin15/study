import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import Stripe from "stripe";

export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json({
      status: "unauthenticated",
      message: "User not logged in",
    });
  }

  try {
    const results = await sql`
      SELECT subscription_status, stripe_id, last_check_subscription_status_at, is_premium
      FROM auth_users 
      WHERE email = ${session.user.email}
    `;

    if (!results.length) {
      return Response.json({
        status: "not_found",
        message: "User not found",
      });
    }

    const {
      subscription_status,
      stripe_id,
      last_check_subscription_status_at,
      is_premium,
    } = results[0];

    // If we have a stripe ID, check with Stripe for latest status
    if (stripe_id) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: stripe_id,
          limit: 1,
          status: "all",
        });

        if (subscriptions.data.length > 0) {
          const latestStatus = subscriptions.data[0].status;
          const isActive =
            latestStatus === "active" || latestStatus === "trialing";

          // Update our database with latest status from Stripe
          await sql`
            UPDATE auth_users 
            SET subscription_status = ${latestStatus}, 
                is_premium = ${isActive},
                last_check_subscription_status_at = NOW()
            WHERE email = ${session.user.email}
          `;

          return Response.json({
            status: latestStatus,
            isPremium: isActive,
            stripeId: stripe_id,
          });
        }
      } catch (error) {
        console.error("Error fetching from Stripe:", error);
      }
    }

    // If we couldn't check with Stripe, return cached status
    return Response.json({
      status: subscription_status || "none",
      isPremium: is_premium || false,
      stripeId: stripe_id,
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return Response.json(
      { error: "Failed to check subscription" },
      { status: 500 },
    );
  }
}
