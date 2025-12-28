import sql from "@/app/api/utils/sql";
import { sendEmail } from "@/app/api/utils/send-email";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const users = await sql`
      SELECT id, email FROM auth_users WHERE email = ${email}
    `;

    if (users.length === 0) {
      // Don't reveal if user exists or not for security
      // But still return success to prevent user enumeration
      return Response.json({
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link",
      });
    }

    const user = users[0];

    // Generate secure token
    const crypto = await import("crypto");
    const token = crypto.randomBytes(32).toString("hex");

    // Set expiration to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Save token to database
    try {
      await sql`
        INSERT INTO password_reset_tokens (token, user_id, expires_at)
        VALUES (${token}, ${user.id}, ${expiresAt})
      `;
    } catch (dbError) {
      console.error("Database error saving token:", dbError);
      return Response.json(
        { error: "Failed to generate reset token. Please try again." },
        { status: 500 },
      );
    }

    // Send email with reset link
    const resetUrl = `${process.env.APP_URL}/account/reset-password?token=${token}`;

    try {
      await sendEmail({
        from: "IB Study Hub <onboarding@resend.dev>",
        to: email,
        subject: "Reset Your Password - IB Study Hub",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 64px; height: 64px; border-radius: 50%; border: 4px solid #2962FF; margin: 0 auto;"></div>
            </div>
            
            <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center; margin-bottom: 16px;">
              Reset Your Password
            </h1>
            
            <p style="color: #666; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
              You requested to reset your password for your IB Study Hub account. Click the button below to reset it:
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #2962FF; color: white; text-decoration: none; padding: 12px 32px; border-radius: 9999px; font-weight: 500; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 20px; margin-bottom: 16px;">
              Or copy and paste this link into your browser:
            </p>
            
            <p style="color: #2962FF; font-size: 14px; word-break: break-all; margin-bottom: 24px;">
              ${resetUrl}
            </p>
            
            <p style="color: #999; font-size: 14px; line-height: 20px; border-top: 1px solid #eee; padding-top: 24px; margin-top: 24px;">
              This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
        `,
      });

      return Response.json({
        success: true,
        message: "Password reset email sent successfully! Check your inbox.",
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Delete the token since we couldn't send the email
      await sql`DELETE FROM password_reset_tokens WHERE token = ${token}`;

      return Response.json(
        {
          error:
            "Failed to send reset email. Please check your email address and try again.",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
