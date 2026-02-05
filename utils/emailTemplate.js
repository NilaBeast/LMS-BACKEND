exports.emailLayout = (title, content) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>

  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:20px 0;">

          <table width="600" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,0.05);">

            <!-- HEADER -->
            <tr>
              <td style="background:#1e293b;color:#ffffff;padding:20px;text-align:center;">
                <h1 style="margin:0;font-size:22px;">TechZuno</h1>
                <p style="margin:5px 0 0;font-size:13px;opacity:.9;">
                  Learn. Grow. Succeed.
                </p>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:30px;color:#333;font-size:14px;line-height:1.6;">
                ${content}
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#777;">
                <p style="margin:0;">
                  © ${new Date().getFullYear()} TechZuno. All rights reserved.
                </p>

                <p style="margin:6px 0 0;">
                  Need help? Contact us at
                  <a href="mailto:support@techzuno.com" style="color:#2563eb;">
                    support@techzuno.com
                  </a>
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};
