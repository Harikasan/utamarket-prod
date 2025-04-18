import nodemailer from "nodemailer";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

// Add email sending status tracking
const emailStatus = {
  sent: 0,
  failed: 0,
  lastError: null,
};

export async function sendOrderConfirmationEmail(order, user) {
  try {
    console.log(
      `[Email] Attempting to send order confirmation email to ${user.email} for order #${order.id}`
    );

    const mailOptions = {
      from: `"UTAMarket" <${process.env.SMTP_FROM_EMAIL}>`,
      to: user.email,
      subject: "Order Confirmation - UTAMarket",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0064B1;">Thank you for your order!</h1>
          <p>Hello ${user.firstName},</p>
          <p>Your order has been confirmed and is being processed. Here are your order details:</p>
          
          <h2 style="color: #0064B1; margin-top: 20px;">Order Summary</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Item</th>
              <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Price</th>
            </tr>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                  ${item.name} (Qty: ${item.quantity})
                </td>
                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">
                  $${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            `
              )
              .join("")}
          </table>

          <div style="margin-top: 20px;">
            <p><strong>Subtotal:</strong> $${order.summary.subtotal.toFixed(
              2
            )}</p>
            <p><strong>Shipping:</strong> $${order.summary.shipping.toFixed(
              2
            )}</p>
            <p><strong>Tax:</strong> $${order.summary.tax.toFixed(2)}</p>
            ${
              order.summary.discount > 0
                ? `
              <p><strong>Discount:</strong> -$${order.summary.discount.toFixed(
                2
              )}</p>
            `
                : ""
            }
            <p><strong>Total:</strong> $${order.summary.total.toFixed(2)}</p>
          </div>

          <h2 style="color: #0064B1; margin-top: 20px;">Shipping Information</h2>
          <p>
            ${order.shippingInfo.firstName} ${order.shippingInfo.lastName}<br>
            ${order.shippingInfo.address}<br>
            ${order.shippingInfo.city}, ${order.shippingInfo.state} ${
        order.shippingInfo.zipCode
      }
          </p>

          <p style="margin-top: 20px;">
            You can track your order status by visiting your account dashboard.
          </p>

          <p style="margin-top: 20px;">
            If you have any questions, please contact our support team.
          </p>

          <p style="margin-top: 20px;">
            Best regards,<br>
            The UTAMarket Team
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    emailStatus.sent++;
    console.log(
      `[Email] Successfully sent order confirmation email to ${user.email} for order #${order.id}. Message ID: ${info.messageId}`
    );
    return { success: true, messageId: info.messageId };
  } catch (error) {
    emailStatus.failed++;
    emailStatus.lastError = error;
    console.error(
      `[Email] Failed to send order confirmation email to ${user.email} for order #${order.id}:`,
      error
    );
    throw error;
  }
}

export async function sendOrderStatusUpdateEmail(order, user, status) {
  try {
    console.log(
      `[Email] Attempting to send status update email to ${user.email} for order #${order.id} (new status: ${status})`
    );

    const mailOptions = {
      from: `"UTAMarket" <${process.env.SMTP_FROM_EMAIL}>`,
      to: user.email,
      subject: `Order Update - Order #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0064B1;">Order Status Update</h1>
          <p>Hello ${user.firstName},</p>
          <p>Your order #${order.id} status has been updated to: <strong>${status}</strong></p>
          
          <p style="margin-top: 20px;">
            You can track your order status by visiting your account dashboard.
          </p>

          <p style="margin-top: 20px;">
            If you have any questions, please contact our support team.
          </p>

          <p style="margin-top: 20px;">
            Best regards,<br>
            The UTAMarket Team
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    emailStatus.sent++;
    console.log(
      `[Email] Successfully sent status update email to ${user.email} for order #${order.id}. Message ID: ${info.messageId}`
    );
    return { success: true, messageId: info.messageId };
  } catch (error) {
    emailStatus.failed++;
    emailStatus.lastError = error;
    console.error(
      `[Email] Failed to send status update email to ${user.email} for order #${order.id}:`,
      error
    );
    throw error;
  }
}

// Export email status for monitoring
export function getEmailStatus() {
  return {
    ...emailStatus,
    successRate:
      (emailStatus.sent / (emailStatus.sent + emailStatus.failed)) * 100,
  };
}
