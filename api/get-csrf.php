<?php
/**
 * GrowthDigiTech CSRF Token Endpoint
 */

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/security.php';

header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'csrf_token' => getCsrfToken()
]);
