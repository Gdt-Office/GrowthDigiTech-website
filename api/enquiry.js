const nodemailer = require('nodemailer');

// In-memory rate limiting map
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxLimit = 5;

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= maxLimit) {
    return true;
  }

  record.count += 1;
  return false;
}

function sanitize(input) {
  if (!input) return '';
  return String(input)
    .trim()
    .replace(/[\r\n]+/g, ' ')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase()) && !/[\r\n]/.test(email);
}

function validatePhone(phone) {
  const clean = String(phone).replace(/[\s\-\(\)\+]/g, '');
  return clean.length >= 7 && clean.length <= 15;
}

module.exports = async function handler(req, res) {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    if (isRateLimited(ip)) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later or contact us on WhatsApp.'
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    // Honeypot check
    if (body.website_hp || body.hp_fax || body.url_hp) {
      return res.status(200).json({
        success: true,
        message: 'Your enquiry was submitted successfully.',
        first_name: 'Valued Client'
      });
    }

    const name = sanitize(body.name || '');
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').trim();
    const business = sanitize(body.business || body.company || 'N/A');
    const location = sanitize(body.location || 'Hosur / TN / India');
    const service = sanitize(body.service || 'Digital Solutions');
    const budget = sanitize(body.budget || 'Standard Market Budget');
    const timeline = sanitize(body.estimated_days || body.timeline || 'Standard Execution');
    const subjectText = sanitize(body.subject || 'New Business Inquiry');
    const message = sanitize(body.comments || body.message || 'No additional details provided.');
    const formType = (body.form_type || 'quote').toLowerCase();
    const formSource = body.form_source || (formType === 'contact' ? 'Contact Form' : 'Get a Quote Form');
    const pageUrl = sanitize(body.page_url || req.headers.referer || 'https://www.growthdigitech.com/');

    if (!name) {
      return res.status(400).json({ success: false, message: 'Please enter your full name.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone or WhatsApp number.' });
    }

    if (!service) {
      return res.status(400).json({ success: false, message: 'Please select at least one service.' });
    }

    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_APP_PASSWORD;

    const fromAddress = process.env.MAIL_FROM_ADDRESS || smtpUsername;
    const fromName = process.env.MAIL_FROM_NAME || 'GrowthDigiTech';
    const receiverAddress = process.env.MAIL_RECEIVER_ADDRESS || 'growthdigitech25@gmail.com';
    const receiverName = process.env.MAIL_RECEIVER_NAME || 'GrowthDigiTech Enquiries';

    if (!smtpUsername || !smtpPassword) {
      console.error('Vercel Function Error: Missing SMTP credentials in Environment Variables.');
      return res.status(500).json({ success: false, message: 'Unable to send your enquiry. Please try again.' });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUsername,
        pass: smtpPassword
      }
    });

    const firstName = name.split(' ')[0];
    const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' }) + ' IST';

    let cleanPhoneDigits = phone.replace(/[^0-9]/g, '');
    if (cleanPhoneDigits.length === 10) {
      cleanPhoneDigits = '91' + cleanPhoneDigits;
    }
    const waLink = `https://api.whatsapp.com/send?phone=${cleanPhoneDigits}&text=${encodeURIComponent(`Hi ${name}, thank you for contacting GrowthDigiTech! We received your enquiry regarding ${service}.`)}`;

    const isContact = formType === 'contact';
    const emailSubject = isContact
      ? `New Website Enquiry – ${name} – ${service}`
      : `New Quote Request – ${name} – ${service}`;
    const headingTitle = isContact ? 'New Website Contact Enquiry' : 'New Engineering Quote Request';

    const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${emailSubject}</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f1f5f9; padding:20px 0;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(10,17,40,0.08); border:1px solid #e2e8f0;">
              
              <tr>
                <td style="background:linear-gradient(135deg, #0a1128 0%, #1e293b 100%); padding:28px 32px; border-bottom:4px solid #06b6d4;">
                  <h1 style="color:#ffffff; margin:0; font-size:22px; font-weight:800; letter-spacing:0.02em;">
                    GROWTH<span style="color:#06b6d4;">DIGITECH</span>
                  </h1>
                  <p style="color:#94a3b8; margin:4px 0 0 0; font-size:12px; text-transform:uppercase; letter-spacing:0.1em; font-weight:600;">
                    Digital Marketing & Software Solutions • Hosur, TN, India
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background-color:#06b6d4; padding:12px 32px; color:#ffffff; font-size:14px; font-weight:700;">
                  ⚡ ${headingTitle} • Submitted ${dateStr}
                </td>
              </tr>

              <tr>
                <td style="padding:32px;">
                  <h2 style="color:#0f172a; font-size:18px; margin-top:0; margin-bottom:20px; font-weight:700;">Customer Enquiry Details</h2>
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; width:35%; font-size:13px;">Form Type</td>
                      <td style="padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; color:#0f172a; font-size:14px; font-weight:600;">${formSource}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;">Customer Name</td>
                      <td style="padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; color:#0f172a; font-size:14px; font-weight:700;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;">Email Address</td>
                      <td style="padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; font-size:14px;">
                        <a href="mailto:${email}" style="color:#2563eb; text-decoration:none; font-weight:600;">${email}</a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;">Phone / WhatsApp</td>
                      <td style="padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; font-size:14px;">
                        <a href="tel:${cleanPhoneDigits}" style="color:#0f172a; text-decoration:none; font-weight:600;">${phone}</a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;">Business / Company</td>
                      <td style="padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; color:#0f172a; font-size:14px;">${business}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;">Operating Location</td>
                      <td style="padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; color:#0f172a; font-size:14px;">${location}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;">Selected Service(s)</td>
                      <td style="padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; color:#06b6d4; font-size:14px; font-weight:700;">${service}</td>
                    </tr>
                    ${!isContact ? `
                    <tr>
                      <td style="padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;">Estimated Budget</td>
                      <td style="padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; color:#0f172a; font-size:14px; font-weight:600;">${budget}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;">Preferred Timeline</td>
                      <td style="padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; color:#0f172a; font-size:14px; font-weight:600;">${timeline}</td>
                    </tr>
                    ` : ''}
                    ${subjectText !== 'New Business Inquiry' ? `
                    <tr>
                      <td style="padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;">Subject</td>
                      <td style="padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; color:#0f172a; font-size:14px;">${subjectText}</td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;">Submission Page URL</td>
                      <td style="padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; color:#64748b; font-size:12px; word-break:break-all;">${pageUrl}</td>
                    </tr>
                  </table>

                  <div style="margin-top:24px; padding:16px; background-color:#f8fafc; border-left:4px solid #06b6d4; border-radius:6px;">
                    <div style="font-size:12px; font-weight:700; color:#475569; text-transform:uppercase; margin-bottom:6px;">Message / Project Requirements:</div>
                    <div style="font-size:14px; color:#1e293b; line-height:1.6;">${message}</div>
                  </div>

                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:28px;">
                    <tr>
                      <td align="center">
                        <a href="mailto:${email}" style="display:inline-block; padding:12px 20px; background-color:#2563eb; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:700; font-size:13px; margin-right:6px; margin-bottom:8px;">
                          ✉️ Reply to Customer
                        </a>
                        <a href="tel:${cleanPhoneDigits}" style="display:inline-block; padding:12px 20px; background-color:#0f172a; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:700; font-size:13px; margin-right:6px; margin-bottom:8px;">
                          📞 Call Customer
                        </a>
                        <a href="${waLink}" target="_blank" style="display:inline-block; padding:12px 20px; background-color:#16a34a; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:700; font-size:13px; margin-bottom:8px;">
                          💬 Contact on WhatsApp
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <tr>
                <td style="background-color:#f8fafc; padding:20px 32px; border-top:1px solid #e2e8f0; text-align:center; color:#94a3b8; font-size:12px;">
                  GrowthDigiTech Vercel Node.js Serverless Mailer • Hosur, Tamil Nadu, India
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    const plainText = `
GrowthDigiTech - ${headingTitle}
Submitted: ${dateStr}

Form Type: ${formSource}
Customer Name: ${name}
Email: ${email}
Phone: ${phone}
Business: ${business}
Location: ${location}
Selected Service: ${service}
Budget: ${budget}
Timeline: ${timeline}
Subject: ${subjectText}
Page URL: ${pageUrl}

Message / Requirements:
${message}
    `;

    const mailOptions = {
      from: `"${fromName}" <${fromAddress}>`,
      to: `"${receiverName}" <${receiverAddress}>`,
      replyTo: `"${name}" <${email}>`,
      subject: emailSubject,
      html: htmlBody,
      text: plainText
    };

    await transporter.sendMail(mailOptions);

    if (process.env.SEND_CUSTOMER_ACKNOWLEDGEMENT === 'true') {
      try {
        await transporter.sendMail({
          from: `"${fromName}" <${fromAddress}>`,
          to: `"${name}" <${email}>`,
          subject: 'We’ve Received Your Enquiry – GrowthDigiTech',
          html: `
            <div style="font-family:Arial,sans-serif; color:#1e293b; padding:20px; max-width:580px; margin:0 auto; border:1px solid #e2e8f0; border-radius:12px;">
              <h2 style="color:#06b6d4;">GrowthDigiTech</h2>
              <p>Hi <strong>${name}</strong>,</p>
              <p>Thank you for contacting GrowthDigiTech. We have received your enquiry regarding <strong>${service}</strong>.</p>
              <p>Our engineering and digital strategy team in Hosur will review your requirements and contact you within <strong>2 hours</strong> to discuss your project.</p>
              <p style="margin-top:20px; color:#64748b; font-size:13px;">Regards,<br><strong>GrowthDigiTech Team</strong><br>Hosur, Tamil Nadu, India</p>
            </div>
          `
        });
      } catch (ackErr) {
        console.error('Visitor Ack Email Exception:', ackErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Your enquiry was submitted successfully.',
      first_name: firstName
    });

  } catch (error) {
    console.error('Vercel Nodemailer Function Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to send your enquiry. Please try again.'
    });
  }
};
