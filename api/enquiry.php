<?php
/**
 * GrowthDigiTech Backend API Endpoint
 * Handles POST requests from contact.html & free-quote.html
 * Saves data into MySQL tables `contact_enquiries` & `quote_enquiries`
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit();
}

// MySQL Database Credentials Configuration
$db_host = 'localhost';
$db_name = 'growthdigitech_db';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    // Return friendly error response if DB connection fails
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit();
}

// Parse JSON Payload
$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true);

if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
    exit();
}

// 1. Spam Prevention (Honeypot)
if (!empty($data['b_address']) || !empty($data['fax_number'])) {
    echo json_encode(['success' => true, 'message' => 'Enquiry received.']);
    exit();
}

$form_type = isset($data['form_type']) ? trim($data['form_type']) : 'quote';
$full_name = isset($data['full_name']) ? trim($data['full_name']) : '';
$company_name = isset($data['company_name']) ? trim($data['company_name']) : '';
$email = isset($data['email']) ? trim($data['email']) : '';
$phone = isset($data['phone']) ? trim($data['phone']) : '';
$city = isset($data['city']) ? trim($data['city']) : '';
$message = isset($data['message']) ? trim($data['message']) : '';
$ip_address = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';

if (empty($full_name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Full name, email, and requirements are required.']);
    exit();
}

// 2. Insert Into Corresponding Table
if ($form_type === 'contact') {
    $ref_id = $data['reference_id'] ?? ('GDT-CNT-2026-' . rand(1000, 9999));
    $stmt = $pdo->prepare("
        INSERT INTO contact_enquiries 
        (reference_id, full_name, company_name, email, phone, city, message, ip_address, user_agent, status) 
        VALUES (:ref_id, :full_name, :company_name, :email, :phone, :city, :message, :ip_address, :user_agent, 'new')
    ");
    
    $stmt->execute([
        ':ref_id' => $ref_id,
        ':full_name' => $full_name,
        ':company_name' => $company_name,
        ':email' => $email,
        ':phone' => $phone,
        ':city' => $city,
        ':message' => $message,
        ':ip_address' => $ip_address,
        ':user_agent' => $user_agent
    ]);

    echo json_encode([
        'success' => true,
        'reference_id' => $ref_id,
        'message' => 'Contact enquiry saved successfully into contact_enquiries table.'
    ]);
} else {
    // Quote Enquiry
    $ref_id = $data['reference_id'] ?? ('GDT-QTE-2026-' . rand(1000, 9999));
    $website_url = isset($data['website_url']) ? trim($data['website_url']) : '';
    $services = isset($data['services']) ? trim($data['services']) : '';
    $target_markets = isset($data['target_markets']) ? trim($data['target_markets']) : '';
    $estimated_budget = isset($data['estimated_budget']) ? trim($data['estimated_budget']) : '';
    $preferred_start_date = isset($data['preferred_start_date']) ? trim($data['preferred_start_date']) : '';
    $preferred_contact = isset($data['preferred_contact']) ? trim($data['preferred_contact']) : 'WhatsApp';
    $page_url = isset($data['page_url']) ? trim($data['page_url']) : '';

    $stmt = $pdo->prepare("
        INSERT INTO quote_enquiries 
        (reference_id, full_name, company_name, email, phone, city, website_url, services, target_markets, estimated_budget, preferred_start_date, preferred_contact, message, page_url, ip_address, user_agent, status) 
        VALUES (:ref_id, :full_name, :company_name, :email, :phone, :city, :website_url, :services, :target_markets, :estimated_budget, :preferred_start_date, :preferred_contact, :message, :page_url, :ip_address, :user_agent, 'new')
    ");

    $stmt->execute([
        ':ref_id' => $ref_id,
        ':full_name' => $full_name,
        ':company_name' => $company_name,
        ':email' => $email,
        ':phone' => $phone,
        ':city' => $city,
        ':website_url' => $website_url,
        ':services' => $services,
        ':target_markets' => $target_markets,
        ':estimated_budget' => $estimated_budget,
        ':preferred_start_date' => $preferred_start_date,
        ':preferred_contact' => $preferred_contact,
        ':message' => $message,
        ':page_url' => $page_url,
        ':ip_address' => $ip_address,
        ':user_agent' => $user_agent
    ]);

    echo json_encode([
        'success' => true,
        'reference_id' => $ref_id,
        'message' => 'Quote enquiry saved successfully into quote_enquiries table.'
    ]);
}
