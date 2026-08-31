<?php
/**
 * GrowthDigiTech Security & Validation Module
 */

require_once __DIR__ . '/bootstrap.php';

// Generate or retrieve CSRF token
function getCsrfToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// Verify CSRF token
function verifyCsrfToken($token) {
    if (empty($_SESSION['csrf_token']) || empty($token)) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

// Check Honeypot field
function checkHoneypot($data) {
    // If website_hp or hp_fax is filled, it's a bot
    if (!empty($data['website_hp']) || !empty($data['hp_fax']) || !empty($data['url_hp'])) {
        return false;
    }
    return true;
}

// Rate Limiting (Max 5 submissions per IP per 60 minutes)
function checkRateLimit($ip = null) {
    if (!$ip) {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }
    $time = time();
    $window = 3600; // 1 hour
    $limit = 5;

    if (!isset($_SESSION['submission_history'])) {
        $_SESSION['submission_history'] = [];
    }

    // Clean old entries
    $_SESSION['submission_history'] = array_filter($_SESSION['submission_history'], function($timestamp) use ($time, $window) {
        return ($time - $timestamp) < $window;
    });

    if (count($_SESSION['submission_history']) >= $limit) {
        return false;
    }

    return true;
}

function recordSubmission() {
    if (!isset($_SESSION['submission_history'])) {
        $_SESSION['submission_history'] = [];
    }
    $_SESSION['submission_history'][] = time();
}

// Data Sanitization
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    $data = trim($data);
    $data = strip_tags($data);
    // Prevent Email Header Injection
    $data = preg_replace('/[\r\n]+/', ' ', $data);
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
}

// Sanitize multi-line message / textarea safely
function sanitizeTextarea($data) {
    $data = trim($data);
    $data = strip_tags($data);
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
}

// Email Validation
function validateEmail($email) {
    $email = trim($email);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    // Prevent header injection in email address
    if (preg_match("/[\r\n]/", $email)) {
        return false;
    }
    return $email;
}

// Indian Phone Number Validation
function validateIndianPhone($phone) {
    $cleanPhone = preg_replace('/[\s\-\(\)\+]/', '', $phone);
    if (strpos($cleanPhone, '91') === 0 && strlen($cleanPhone) === 12) {
        $cleanPhone = substr($cleanPhone, 2);
    }
    if (preg_match('/^[6-9]\d{9}$/', $cleanPhone)) {
        return '+91 ' . substr($cleanPhone, 0, 5) . ' ' . substr($cleanPhone, 5);
    }
    // General fallback for international numbers (min 7 digits)
    if (preg_match('/^\+?[0-9]{7,15}$/', preg_replace('/\s+/', '', $phone))) {
        return trim($phone);
    }
    return false;
}
