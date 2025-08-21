const emailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Payment Request - Splitify</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    /* Reset styles for email clients */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    /* Outlook specific */
    table {
      border-collapse: collapse !important;
    }
    /* Mobile styles */
    @media only screen and (max-width: 480px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .content-padding {
        padding: 16px 12px !important;
      }
      .amount-text {
        font-size: 24px !important;
      }
      .button-padding {
        padding: 12px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #374151; background-color: #ffffff; width: 100%; min-width: 100%;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 0; width: 100%; min-width: 100%; background-color: #ffffff;">
    <tr>
      <td style="padding: 10px 0;">
        <!--[if mso]>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="480" align="left">
        <tr>
        <td>
        <![endif]-->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container" style="max-width: 480px; width: 100%; margin: 0; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; border-bottom: 1px solid #e5e7eb; text-align: center; border-radius: 8px 8px 0 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: start;">
                    <div style="font-size: 24px; font-weight: bold; color: #2563eb; font-family: Arial, Helvetica, sans-serif;">Splitify</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content-padding" style="padding: 24px 20px; background-color: #f9fafb;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                
                <!-- Greeting -->
                <tr>
                  <td style="font-size: 18px; font-weight: bold; color: #111827; padding-bottom: 16px; font-family: Arial, Helvetica, sans-serif;">
                    Hi {{receiver}},
                  </td>
                </tr>
                
                <!-- Message -->
                <tr>
                  <td style="font-size: 15px; line-height: 1.6; padding-bottom: 20px; color: #374151; font-family: Arial, Helvetica, sans-serif;">
                    {{sender}} sent you a payment request. Click below to complete your payment.
                  </td>
                </tr>
                
                <!-- Amount Section -->
                <tr>
                  <td style="padding-bottom: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px; text-align: center;">
                          <div style="font-size: 12px; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; font-family: Arial, Helvetica, sans-serif;">
                            Amount Requested
                          </div>
                          <div class="amount-text" style="font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 6px; font-family: Arial, Helvetica, sans-serif;">
                           ${'$'}{{amount}}
                          </div>
                          <div style="font-size: 13px; color: #64748b; font-family: Arial, Helvetica, sans-serif;">
                            From {{sender}}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- CTA Button -->
                <tr>
                  <td style="text-align: center; padding: 16px 0;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{url}}" style="height:48px;v-text-anchor:middle;width:120px;" arcsize="12%" stroke="f" fillcolor="#2563eb">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Pay Now</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="{{url}}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 15px; font-weight: bold; text-align: center; font-family: Arial, Helvetica, sans-serif; mso-hide: all;" class="button-padding">
                      Pay Now
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
                
                <!-- Additional Message -->
                <tr>
                  <td style="font-size: 14px; line-height: 1.6; color: #64748b; text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0; font-family: Arial, Helvetica, sans-serif;">
                    Questions? Contact {{sender}} or our support team.
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f3f4f6; padding: 16px 20px; text-align: center; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
              <div style="font-size: 12px; color: #64748b; line-height: 1.5; font-family: Arial, Helvetica, sans-serif;">
                Sent via <span style="font-weight: bold; color: #2563eb;">Splitify</span><br>
                Split expenses. Settle up easily.
              </div>
            </td>
          </tr>
          
        </table>
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;

module.exports = emailTemplate;