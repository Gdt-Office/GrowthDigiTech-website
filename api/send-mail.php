<?php
/**
 * GrowthDigiTech API Endpoint — Send Mail
 * Handles Contact Form & Quote Form submissions via PHPMailer SMTP.
 */

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/security.php';
require_once __DIR__ . '/mailer.php';

header('Content-Type: application/json; charset=utf-8');

$response = [
    'success' => false,
    'message' => "Unable to send your request. Please try again or contact us directly through WhatsApp."
];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    $response['message'] = "Method not allowed.";
    echo json_encode($response);
    exit;
}

// Read JSON or POST input
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);
if (!$data) {
    $data = $_POST;
}

// Honeypot Check
if (!checkHoneypot($data)) {
    // Fake success response for bots
    echo json_encode([
        'success' => true,
        'message' => 'Your request was submitted successfully.',
        'first_name' => 'Valued Client',
        'ref' => 'GDT-2026-CONFIRMED'
    ]);
    exit;
}

// Rate Limiting Check
if (!checkRateLimit()) {
    $response['message'] = "Too many requests. Please wait a few minutes or contact us directly on WhatsApp.";
    echo json_encode($response);
    exit;
}

// Determine Form Source
$formType = isset($data['form_type']) ? strtolower(trim($data['form_type'])) : 'quote';
if (isset($data['form_source']) && strpos(strtolower($data['form_source']), 'contact') !== false) {
    $formType = 'contact';
}

// Extract & Sanitize Data
$name = isset($data['name']) ? sanitizeInput($data['name']) : '';
$emailInput = isset($data['email']) ? trim($data['email']) : '';
$phoneInput = isset($data['phone']) ? trim($data['phone']) : '';
$location = isset($data['location']) ? sanitizeInput($data['location']) : 'Hosur / TN / India';
$business = isset($data['business']) ? sanitizeInput($data['business']) : (isset($data['company']) ? sanitizeInput($data['company']) : 'N/A');
$service = isset($data['service']) ? sanitizeInput($data['service']) : 'Digital Marketing & Software Solutions';
$budget = isset($data['budget']) ? sanitizeInput($data['budget']) : 'Standard Market Budget';
$estimatedDays = isset($data['estimated_days']) ? sanitizeInput($data['estimated_days']) : (isset($data['timeline']) ? sanitizeInput($data['timeline']) : 'Standard Execution');
$comments = isset($data['comments']) ? sanitizeTextarea($data['comments']) : (isset($data['message']) ? sanitizeTextarea($data['message']) : 'No additional comments.');
$subjectText = isset($data['subject']) ? sanitizeInput($data['subject']) : 'New Business Inquiry';
$pageUrl = isset($data['page_url']) ? sanitizeInput($data['page_url']) : ($_SERVER['HTTP_REFERER'] ?? 'https://www.growthdigitech.com/');

// Backend Validation
if (empty($name)) {
    $response['message'] = "Please enter your full name.";
    echo json_encode($response);
    exit;
}

$validEmail = validateEmail($emailInput);
if (!$validEmail) {
    $response['message'] = "Please enter a valid email address.";
    echo json_encode($response);
    exit;
}

$validPhone = validateIndianPhone($phoneInput);
if (!$validPhone) {
    $response['message'] = "Please enter a valid phone or WhatsApp number.";
    echo json_encode($response);
    exit;
}

// Form-specific mandatory validation
if (empty($service) || $service === '') {
    $response['message'] = "Please select at least one expected service.";
    echo json_encode($response);
    exit;
}

// Generate Reference Code & First Name
$firstName = explode(' ', trim($name))[0];
$randNum = rand(1000, 9999);
$refCode = "GDT-2026-{$randNum}";

$mailData = [
    'name' => $name,
    'email' => $validEmail,
    'phone' => $validPhone,
    'location' => $location,
    'business' => $business,
    'service' => $service,
    'budget' => $budget,
    'estimated_days' => $estimatedDays,
    'comments' => $comments,
    'subject' => $subjectText,
    'page_url' => $pageUrl,
    'ref_code' => $refCode
];

// Dispatch SMTP Email via PHPMailer
$mailSent = sendEmailSubmission($mailData, $formType);

if ($mailSent) {
    recordSubmission();
    echo json_encode([
        'success' => true,
        'message' => 'Your request was submitted successfully.',
        'first_name' => $firstName,
        'ref' => $refCode
    ]);
} else {
    // If SMTP fails, keep failure message generic for client while logging backend detail
    echo json_encode($response);
}
