import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import Stripe from "stripe";

export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await auth();

  if (!session?.user?.email || !session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { redirectURL } = await request.json();

    const email = session.user.email;
    const userId = session.user.id;

    // Get current user's stripe_id
    const [user] = await sql`
      SELECT stripe_id FROM auth_users 
      WHERE id = ${userId}
    `;

    let stripeCustomerId = user?.stripe_id;

    if (!stripeCustomerId) {
      // Create new customer in Stripe
      const customer = await stripe.customers.create({ email });
      stripeCustomerId = customer.id;

      // Update user with stripe_id
      await sql`
        UPDATE auth_users 
        SET stripe_id = ${stripeCustomerId}
        WHERE id = ${userId}
      `;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "IB Study Hub Premium",
              description:
                "Unlock custom themes, accent colors, layouts, and more",
            },
            recurring: { interval: "month" },
            unit_amount: 499, // $4.99
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${redirectURL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: redirectURL,
    });

    return Response.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return Response.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
