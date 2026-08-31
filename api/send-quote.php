<?php
header('Content-Type: application/json; charset=utf-8');

// Response structure
$response = [
    'success' => false,
    'message' => 'An error occurred while submitting your quote request.'
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtain raw JSON payload or POST array
    $inputJSON = file_get_contents('php://input');
    $data = json_decode($inputJSON, true);
    if (!$data) {
        $data = $_POST;
    }

    $name = isset($data['name']) ? trim(strip_tags($data['name'])) : '';
    $email = isset($data['email']) ? filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL) : false;
    $phone = isset($data['phone']) ? trim(strip_tags($data['phone'])) : '';
    $businessName = isset($data['businessName']) ? trim(strip_tags($data['businessName'])) : 'N/A';
    $industry = isset($data['industry']) ? trim(strip_tags($data['industry'])) : 'N/A';
    $location = isset($data['location']) ? trim(strip_tags($data['location'])) : 'N/A';
    $situation = isset($data['situation']) ? trim(strip_tags($data['situation'])) : 'N/A';
    $timeline = isset($data['timeline']) ? trim(strip_tags($data['timeline'])) : 'N/A';
    $budget = isset($data['budget']) ? trim(strip_tags($data['budget'])) : 'N/A';
    $message = isset($data['message']) ? trim(strip_tags($data['message'])) : 'N/A';
    $needs = isset($data['needs']) && is_array($data['needs']) ? implode(', ', $data['needs']) : 'N/A';
    $goals = isset($data['goals']) && is_array($data['goals']) ? implode(', ', $data['goals']) : 'N/A';

    if (!$name || !$email || !$phone) {
        $response['message'] = 'Please complete all required contact fields (Name, Email, Phone).';
        echo json_encode($response);
        exit;
    }

    $refCode = 'GDT-' . date('Y') . '-' . rand(1000, 9999);
    $to = 'contact@growthdigitech.com';
    $subject = "New Free Quote Request [$refCode] from $businessName";

    $emailContent = "
    <html>
    <head><title>New Free Quote Inquiry</title></head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;'>
            <h2 style='color: #0b4f6c;'>GrowthDigiTech - New Scoping Inquiry</h2>
            <p><strong>Reference Code:</strong> $refCode</p>
            <hr style='border: none; border-top: 1px solid #e2e8f0;'>
            
            <h3>Client Contact Details</h3>
            <p><strong>Name:</strong> $name</p>
            <p><strong>Email:</strong> $email</p>
            <p><strong>Phone / WhatsApp:</strong> $phone</p>
            
            <h3>Business Context</h3>
            <p><strong>Business Name:</strong> $businessName</p>
            <p><strong>Industry:</strong> $industry</p>
            <p><strong>Location:</strong> $location</p>
            <p><strong>Bottlenecks:</strong> $situation</p>
            
            <h3>Project Requirements</h3>
            <p><strong>Capabilities Needed:</strong> $needs</p>
            <p><strong>Target Goals:</strong> $goals</p>
            <p><strong>Timeline:</strong> $timeline</p>
            <p><strong>Budget Range:</strong> $budget</p>
            <p><strong>Scope / Notes:</strong> $message</p>
        </div>
    </body>
    </html>
    ";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: GrowthDigiTech Website <noreply@growthdigitech.com>" . "\r\n";
    $headers .= "Reply-To: $email" . "\r\n";

    // Attempt mail send (using PHP mailer / standard mail)
    @mail($to, $subject, $emailContent, $headers);

    $response['success'] = true;
    $response['message'] = 'Quote inquiry received successfully.';
    $response['ref'] = $refCode;
}

echo json_encode($response);
