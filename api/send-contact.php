<?php
header('Content-Type: application/json; charset=utf-8');

$response = [
    'success' => false,
    'message' => 'An error occurred while sending your enquiry.'
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputJSON = file_get_contents('php://input');
    $data = json_decode($inputJSON, true);
    if (!$data) {
        $data = $_POST;
    }

    $name = isset($data['name']) ? trim(strip_tags($data['name'])) : '';
    $business = isset($data['business']) ? trim(strip_tags($data['business'])) : '';
    $email = isset($data['email']) ? filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL) : false;
    $phone = isset($data['phone']) ? trim(strip_tags($data['phone'])) : '';
    $location = isset($data['location']) ? trim(strip_tags($data['location'])) : '';
    $message = isset($data['message']) ? trim(strip_tags($data['message'])) : '';

    if (!$name || !$email || !$phone || !$message) {
        $response['message'] = 'Please fill in all required fields.';
        echo json_encode($response);
        exit;
    }

    $to = 'contact@growthdigitech.com';
    $subject = "New Contact Enquiry from $name ($business)";

    $emailContent = "
    <html>
    <head><title>New Contact Enquiry</title></head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;'>
            <h2 style='color: #0b4f6c;'>GrowthDigiTech - New Contact Enquiry</h2>
            <p><strong>Name:</strong> $name</p>
            <p><strong>Business:</strong> $business</p>
            <p><strong>Email:</strong> $email</p>
            <p><strong>Phone:</strong> $phone</p>
            <p><strong>Location:</strong> $location</p>
            <p><strong>Message:</strong></p>
            <p style='background: #f8fafc; padding: 12px; border-radius: 6px;'>$message</p>
        </div>
    </body>
    </html>
    ";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: GrowthDigiTech Website <noreply@growthdigitech.com>" . "\r\n";
    $headers .= "Reply-To: $email" . "\r\n";

    @mail($to, $subject, $emailContent, $headers);

    $response['success'] = true;
    $response['message'] = 'Enquiry submitted successfully.';
}

echo json_encode($response);
