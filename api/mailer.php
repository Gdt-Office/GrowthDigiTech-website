<?php
/**
 * GrowthDigiTech PHPMailer Service & Responsive HTML Email Generator
 */

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/security.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

function sendEmailSubmission($formData, $formType = 'quote') {
    $smtpHost = getEnvVar('SMTP_HOST', 'smtp.gmail.com');
    $smtpPort = (int) getEnvVar('SMTP_PORT', 587);
    $smtpAuth = getEnvVar('SMTP_AUTH', 'true') === 'true' || getEnvVar('SMTP_AUTH') === true;
    $smtpEncryption = getEnvVar('SMTP_ENCRYPTION', 'tls');
    $smtpUsername = getEnvVar('SMTP_USERNAME');
    $smtpPassword = getEnvVar('SMTP_APP_PASSWORD');

    $fromAddress = getEnvVar('MAIL_FROM_ADDRESS', $smtpUsername);
    $fromName = getEnvVar('MAIL_FROM_NAME', 'GrowthDigiTech');
    $receiverAddress = getEnvVar('MAIL_RECEIVER_ADDRESS', 'growthdigitech25@gmail.com');
    $receiverName = getEnvVar('MAIL_RECEIVER_NAME', 'GrowthDigiTech Enquiries');

    $name = $formData['name'] ?? 'Valued Client';
    $email = $formData['email'] ?? '';
    $phone = $formData['phone'] ?? 'N/A';
    $location = $formData['location'] ?? 'N/A';
    $business = $formData['business'] ?? $formData['company'] ?? 'N/A';
    $service = $formData['service'] ?? 'General Digital Solutions';
    $budget = $formData['budget'] ?? 'N/A';
    $timeline = $formData['estimated_days'] ?? $formData['timeline'] ?? 'N/A';
    $comments = $formData['comments'] ?? $formData['message'] ?? 'N/A';
    $subjectText = $formData['subject'] ?? 'New Business Inquiry';
    $pageUrl = $formData['page_url'] ?? 'https://www.growthdigitech.com/';
    $sourceLabel = ($formType === 'contact') ? 'Contact Form' : 'Get a Quote Form';

    date_default_timezone_set('Asia/Kolkata');
    $dateStr = date('F j, Y \a\t g:i A \I\S\T');

    // Clean phone for WhatsApp Link
    $cleanPhoneDigits = preg_replace('/[^0-9]/', '', $phone);
    if (strlen($cleanPhoneDigits) === 10) {
        $cleanPhoneDigits = '91' . $cleanPhoneDigits;
    }
    $waLink = "https://api.whatsapp.com/send?phone={$cleanPhoneDigits}&text=" . urlencode("Hi {$name}, thank you for contacting GrowthDigiTech! We received your enquiry regarding {$service}.");

    // Email Subject
    if ($formType === 'contact') {
        $emailSubject = "New Website Enquiry – {$name} – {$service}";
        $headingTitle = "New Website Contact Enquiry";
    } else {
        $emailSubject = "New Quote Request – {$name} – {$service}";
        $headingTitle = "New Engineering Quote Request";
    }

    // Generate Responsive HTML Body
    $htmlBody = "
    <!DOCTYPE html>
    <html lang='en'>
    <head>
      <meta charset='UTF-8'>
      <meta name='viewport' content='width=device-width, initial-scale=1.0'>
      <title>{$emailSubject}</title>
    </head>
    <body style='margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;'>
      <table border='0' cellpadding='0' cellspacing='0' width='100%' style='background-color:#f1f5f9; padding:20px 0;'>
        <tr>
          <td align='center'>
            <table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width:640px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(10,17,40,0.08); border:1px solid #e2e8f0;'>
              
              <!-- Brand Header -->
              <tr>
                <td style='background:linear-gradient(135deg, #0a1128 0%, #1e293b 100%); padding:28px 32px; text-align:left; border-bottom:4px solid #06b6d4;'>
                  <table border='0' cellpadding='0' cellspacing='0' width='100%'>
                    <tr>
                      <td>
                        <h1 style='color:#ffffff; margin:0; font-size:22px; font-weight:800; letter-spacing:0.02em;'>
                          GROWTH<span style='color:#06b6d4;'>DIGITECH</span>
                        </h1>
                        <p style='color:#94a3b8; margin:4px 0 0 0; font-size:12px; text-transform:uppercase; letter-spacing:0.1em; font-weight:600;'>
                          Digital Marketing & Software Solutions • Hosur, TN, India
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Heading Banner -->
              <tr>
                <td style='background-color:#06b6d4; padding:12px 32px; color:#ffffff; font-size:14px; font-weight:700;'>
                  ⚡ {$headingTitle} • Submitted on {$dateStr}
                </td>
              </tr>

              <!-- Main Body Content -->
              <tr>
                <td style='padding:32px;'>
                  <h2 style='color:#0f172a; font-size:18px; margin-top:0; margin-bottom:20px; font-weight:700;'>Customer Inquiry Parameters</h2>
                  
                  <table border='0' cellpadding='0' cellspacing='0' width='100%' style='border-collapse:collapse;'>
                    <tr>
                      <td style='padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; width:35%; font-size:13px;'>Customer Full Name</td>
                      <td style='padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; color:#0f172a; font-size:14px; font-weight:600;'>{$name}</td>
                    </tr>
                    <tr>
                      <td style='padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;'>Email Address</td>
                      <td style='padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; font-size:14px;'>
                        <a href='mailto:{$email}' style='color:#2563eb; text-decoration:none; font-weight:600;'>{$email}</a>
                      </td>
                    </tr>
                    <tr>
                      <td style='padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;'>Phone / WhatsApp</td>
                      <td style='padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; font-size:14px;'>
                        <a href='tel:{$cleanPhoneDigits}' style='color:#0f172a; text-decoration:none; font-weight:600;'>{$phone}</a>
                      </td>
                    </tr>
                    <tr>
                      <td style='padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;'>Operating Location</td>
                      <td style='padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; color:#0f172a; font-size:14px;'>{$location}</td>
                    </tr>
                    <tr>
                      <td style='padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;'>Selected Service(s)</td>
                      <td style='padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; color:#06b6d4; font-size:14px; font-weight:700;'>{$service}</td>
                    </tr>
                    ";

    if ($formType === 'quote') {
        $htmlBody .= "
                    <tr>
                      <td style='padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;'>Estimated Budget</td>
                      <td style='padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; color:#0f172a; font-size:14px; font-weight:600;'>{$budget}</td>
                    </tr>
                    <tr>
                      <td style='padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;'>Preferred Timeframe</td>
                      <td style='padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; color:#0f172a; font-size:14px; font-weight:600;'>{$timeline}</td>
                    </tr>
        ";
    }

    if ($subjectText !== 'New Business Inquiry') {
        $htmlBody .= "
                    <tr>
                      <td style='padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;'>Enquiry Subject</td>
                      <td style='padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; color:#0f172a; font-size:14px;'>{$subjectText}</td>
                    </tr>
        ";
    }

    $htmlBody .= "
                    <tr>
                      <td style='padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;'>Form Source</td>
                      <td style='padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; color:#64748b; font-size:13px;'>{$sourceLabel}</td>
                    </tr>
                    <tr>
                      <td style='padding:10px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:700; color:#475569; font-size:13px;'>Submitted Page URL</td>
                      <td style='padding:10px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; color:#64748b; font-size:12px; word-break:break-all;'>{$pageUrl}</td>
                    </tr>
                  </table>

                  <!-- Notes / Details Box -->
                  <div style='margin-top:24px; padding:16px; background-color:#f8fafc; border-left:4px solid #06b6d4; border-radius:6px;'>
                    <div style='font-size:12px; font-weight:700; color:#475569; text-transform:uppercase; margin-bottom:6px;'>Project Scope / Requirements:</div>
                    <div style='font-size:14px; color:#1e293b; line-height:1.6; whitespace:pre-wrap;'>{$comments}</div>
                  </div>

                  <!-- Quick Action Buttons -->
                  <table border='0' cellpadding='0' cellspacing='0' width='100%' style='margin-top:28px;'>
                    <tr>
                      <td align='center'>
                        <a href='mailto:{$email}' style='display:inline-block; padding:12px 24px; background-color:#2563eb; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:700; font-size:14px; margin-right:8px; margin-bottom:8px;'>
                          ✉️ Reply to Customer
                        </a>
                        <a href='{$waLink}' target='_blank' style='display:inline-block; padding:12px 24px; background-color:#16a34a; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:700; font-size:14px; margin-bottom:8px;'>
                          💬 Contact on WhatsApp
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style='background-color:#f8fafc; padding:20px 32px; border-top:1px solid #e2e8f0; text-align:center; color:#94a3b8; font-size:12px;'>
                  GrowthDigiTech Automated System Notification • Hosur, Tamil Nadu, India<br>
                  Confidential & Protected under SLA Guidelines.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    ";

    // Plain Text AltBody
    $altBody = "GrowthDigiTech - {$headingTitle}\n";
    $altBody .= "Submitted: {$dateStr}\n\n";
    $altBody .= "Client Name: {$name}\n";
    $altBody .= "Email: {$email}\n";
    $altBody .= "Phone: {$phone}\n";
    $altBody .= "Location: {$location}\n";
    $altBody .= "Selected Service: {$service}\n";
    if ($formType === 'quote') {
        $altBody .= "Budget: {$budget}\n";
        $altBody .= "Timeline: {$timeline}\n";
    }
    $altBody .= "Form Source: {$sourceLabel}\n";
    $altBody .= "URL: {$pageUrl}\n\n";
    $altBody .= "Project Scope / Notes:\n{$comments}\n";

    // Initialize PHPMailer
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = $smtpHost;
        $mail->SMTPAuth   = $smtpAuth;
        $mail->Username   = $smtpUsername;
        $mail->Password   = $smtpPassword;
        $mail->SMTPSecure = ($smtpEncryption === 'ssl') ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $smtpPort;
        $mail->CharSet    = 'UTF-8';

        // Set Sender & Receiver
        $mail->setFrom($fromAddress, $fromName);
        $mail->addAddress($receiverAddress, $receiverName);

        // Strict requirement: Set visitor's email using addReplyTo only
        $mail->addReplyTo($email, $name);

        $mail->isHTML(true);
        $mail->Subject = $emailSubject;
        $mail->Body    = $htmlBody;
        $mail->AltBody = $altBody;

        $mail->send();

        // Optional Customer Acknowledgement Email
        $sendAck = getEnvVar('SEND_CUSTOMER_ACKNOWLEDGEMENT', 'true');
        if (($sendAck === 'true' || $sendAck === true) && !empty($email)) {
            sendCustomerAckEmail($email, $name, $service);
        }

        return true;
    } catch (\Exception $e) {
        // Securely log error without exposing credentials
        error_log("PHPMailer Exception in GrowthDigiTech sendEmailSubmission: " . $e->getMessage());
        return false;
    }
}

// Separate Customer Acknowledgement Email Function
function sendCustomerAckEmail($customerEmail, $customerName, $serviceName) {
    try {
        $smtpHost = getEnvVar('SMTP_HOST', 'smtp.gmail.com');
        $smtpPort = (int) getEnvVar('SMTP_PORT', 587);
        $smtpAuth = getEnvVar('SMTP_AUTH', 'true') === 'true' || getEnvVar('SMTP_AUTH') === true;
        $smtpEncryption = getEnvVar('SMTP_ENCRYPTION', 'tls');
        $smtpUsername = getEnvVar('SMTP_USERNAME');
        $smtpPassword = getEnvVar('SMTP_APP_PASSWORD');
        $fromAddress = getEnvVar('MAIL_FROM_ADDRESS', $smtpUsername);
        $fromName = getEnvVar('MAIL_FROM_NAME', 'GrowthDigiTech');

        $ackMail = new PHPMailer(true);
        $ackMail->isSMTP();
        $ackMail->Host       = $smtpHost;
        $ackMail->SMTPAuth   = $smtpAuth;
        $ackMail->Username   = $smtpUsername;
        $ackMail->Password   = $smtpPassword;
        $ackMail->SMTPSecure = ($smtpEncryption === 'ssl') ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
        $ackMail->Port       = $smtpPort;
        $ackMail->CharSet    = 'UTF-8';

        $ackMail->setFrom($fromAddress, $fromName);
        $ackMail->addAddress($customerEmail, $customerName);

        $ackMail->isHTML(true);
        $ackMail->Subject = "We’ve Received Your Enquiry – GrowthDigiTech";

        $ackBody = "
        <!DOCTYPE html>
        <html>
        <head><meta charset='UTF-8'></head>
        <body style='font-family: Arial, sans-serif; line-height:1.6; color:#1e293b; background:#f8fafc; padding:20px;'>
          <div style='max-width:580px; margin:0 auto; background:#ffffff; padding:28px; border-radius:12px; border:1px solid #e2e8f0;'>
            <h2 style='color:#06b6d4; margin-top:0;'>GrowthDigiTech</h2>
            <p>Hi <strong>{$customerName}</strong>,</p>
            <p>Thank you for contacting GrowthDigiTech. We have received your enquiry regarding <strong>{$serviceName}</strong>.</p>
            <p>Our engineering and digital strategy team in Hosur is reviewing your requirements and will contact you within <strong>2 hours</strong> to discuss the best solution for your business.</p>
            <hr style='border:none; border-top:1px solid #e2e8f0; margin:20px 0;'>
            <p style='color:#64748b; font-size:0.9rem; margin-bottom:0;'>Regards,<br><strong>GrowthDigiTech Team</strong><br>Hosur, Tamil Nadu, India</p>
          </div>
        </body>
        </html>
        ";

        $ackMail->Body = $ackBody;
        $ackMail->AltBody = "Hi {$customerName},\n\nThank you for contacting GrowthDigiTech. We have received your enquiry regarding {$serviceName}.\n\nOur team will review the information you provided and contact you within 2 hours to discuss your requirements.\n\nRegards,\nGrowthDigiTech";

        $ackMail->send();
    } catch (\Exception $e) {
        error_log("PHPMailer Ack Exception: " . $e->getMessage());
    }
}
