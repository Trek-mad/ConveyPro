/**
 * Portal Access Email Template
 * Sends clients a secure link to access their matter portal
 * Phase 12.7 - Client Portal
 */

interface PortalAccessEmailProps {
  clientName: string
  matterNumber: string
  portalUrl: string
  firmName: string
  expiryDays?: number
}

export function generatePortalAccessEmail({
  clientName,
  matterNumber,
  portalUrl,
  firmName,
  expiryDays = 30,
}: PortalAccessEmailProps): { subject: string; html: string } {
  const subject = `Access Your Matter Portal - ${matterNumber}`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header with gradient -->
          <tr>
            <td style="padding: 0;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600;">
                  🔐 Your Matter Portal Access
                </h1>
                <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">
                  Track your conveyancing matter online
                </p>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333;">
                Dear ${clientName},
              </p>

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333;">
                Welcome to your secure client portal! We're pleased to provide you with convenient online access to view your matter details.
              </p>

              <!-- Matter Details Box -->
              <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #666; font-weight: 600;">
                  MATTER NUMBER
                </p>
                <p style="margin: 0; font-size: 18px; color: #333; font-weight: 700;">
                  ${matterNumber}
                </p>
              </div>

              <!-- What You Can Do Section -->
              <div style="margin: 30px 0;">
                <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #333; font-weight: 600;">
                  What You Can Do in the Portal
                </h2>
                <ul style="margin: 0; padding: 0 0 0 20px; line-height: 1.8; color: #555;">
                  <li style="margin-bottom: 10px;">📊 View your matter progress and current stage</li>
                  <li style="margin-bottom: 10px;">🏠 See property details and key dates</li>
                  <li style="margin-bottom: 10px;">📄 Access verified documents</li>
                  <li style="margin-bottom: 10px;">✅ Accept offers when ready</li>
                  <li style="margin-bottom: 10px;">💬 Send messages to your solicitor</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${portalUrl}"
                   style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                  Access Your Portal →
                </a>
              </div>

              <!-- Security Notice -->
              <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #856404; font-weight: 600;">
                  🔒 Security Information
                </h3>
                <ul style="margin: 0; padding: 0 0 0 20px; line-height: 1.6; color: #856404; font-size: 14px;">
                  <li style="margin-bottom: 8px;">This link is unique to you and should not be shared</li>
                  <li style="margin-bottom: 8px;">The link will expire in ${expiryDays} days</li>
                  <li style="margin-bottom: 8px;">All actions are logged for security</li>
                  <li style="margin-bottom: 0;">No password is required - access is via this secure link</li>
                </ul>
              </div>

              <!-- Support Info -->
              <p style="margin: 30px 0 20px 0; font-size: 16px; line-height: 1.6; color: #333;">
                If you have any questions or need assistance accessing the portal, please don't hesitate to contact us.
              </p>

              <p style="margin: 0 0 10px 0; font-size: 16px; line-height: 1.6; color: #333;">
                Best regards,<br>
                <strong>${firmName}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background: #f8f9fa; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                This email was sent by ${firmName}
              </p>
              <p style="margin: 0; font-size: 12px; color: #999;">
                If you did not expect this email or have concerns about its authenticity,<br>
                please contact your solicitor directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  return { subject, html }
}

/**
 * Generate offer ready email (notifies client that offer is pending their acceptance)
 */
export function generateOfferReadyEmail({
  clientName,
  matterNumber,
  portalUrl,
  offerAmount,
  propertyAddress,
  firmName,
}: {
  clientName: string
  matterNumber: string
  portalUrl: string
  offerAmount: number
  propertyAddress: string
  firmName: string
}): { subject: string; html: string } {
  const subject = `Offer Ready for Your Acceptance - ${matterNumber}`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header with gradient -->
          <tr>
            <td style="padding: 0;">
              <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px; text-align: center;">
                <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600;">
                  ✅ Offer Ready for Acceptance
                </h1>
                <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">
                  Action required
                </p>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333;">
                Dear ${clientName},
              </p>

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333;">
                We're pleased to inform you that we've prepared an offer for your review and acceptance.
              </p>

              <!-- Offer Details Box -->
              <div style="background: #fff7ed; border: 2px solid #f97316; padding: 25px; margin: 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #333; font-weight: 600;">
                  Offer Details
                </h3>

                <div style="margin-bottom: 15px;">
                  <p style="margin: 0 0 5px 0; font-size: 14px; color: #666; font-weight: 600;">
                    PROPERTY
                  </p>
                  <p style="margin: 0; font-size: 16px; color: #333;">
                    ${propertyAddress}
                  </p>
                </div>

                <div style="margin-bottom: 15px;">
                  <p style="margin: 0 0 5px 0; font-size: 14px; color: #666; font-weight: 600;">
                    OFFER AMOUNT
                  </p>
                  <p style="margin: 0; font-size: 24px; color: #333; font-weight: 700;">
                    £${offerAmount.toLocaleString('en-GB')}
                  </p>
                </div>

                <div>
                  <p style="margin: 0 0 5px 0; font-size: 14px; color: #666; font-weight: 600;">
                    MATTER NUMBER
                  </p>
                  <p style="margin: 0; font-size: 16px; color: #333;">
                    ${matterNumber}
                  </p>
                </div>
              </div>

              <!-- Next Steps -->
              <div style="margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333; font-weight: 600;">
                  Next Steps
                </h3>
                <ol style="margin: 0; padding: 0 0 0 20px; line-height: 1.8; color: #555;">
                  <li style="margin-bottom: 10px;">Review the offer details in your portal</li>
                  <li style="margin-bottom: 10px;">Click "Accept Offer" if you're happy to proceed</li>
                  <li style="margin-bottom: 10px;">We'll submit the offer to the selling agent</li>
                  <li style="margin-bottom: 0;">We'll keep you updated on the response</li>
                </ol>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${portalUrl}"
                   style="display: inline-block; padding: 18px 50px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);">
                  Review & Accept Offer →
                </a>
              </div>

              <!-- Urgency Note -->
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.6;">
                  <strong>⏱️ Time Sensitive:</strong> Please review and accept the offer as soon as possible to avoid delays in the purchasing process.
                </p>
              </div>

              <p style="margin: 30px 0 20px 0; font-size: 16px; line-height: 1.6; color: #333;">
                If you have any questions about the offer, please feel free to contact us.
              </p>

              <p style="margin: 0 0 10px 0; font-size: 16px; line-height: 1.6; color: #333;">
                Best regards,<br>
                <strong>${firmName}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background: #f8f9fa; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                This email was sent by ${firmName}
              </p>
              <p style="margin: 0; font-size: 12px; color: #999;">
                Matter: ${matterNumber}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  return { subject, html }
}
