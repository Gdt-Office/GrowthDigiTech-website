<?php
/**
 * GrowthDigiTech API Bootstrap & Environment Loader
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');

// Error reporting settings (Production mode: hide display errors, log to file)
ini_set('display_errors', '0');
ini_set('log_errors', '1');
$logDir = __DIR__ . '/../scratch';
if (!is_dir($logDir)) {
    @mkdir($logDir, 0755, true);
}
ini_set('error_log', $logDir . '/php_errors.log');

// Try loading Composer autoloader
$composerAutoload = __DIR__ . '/../vendor/autoload.php';
if (file_exists($composerAutoload)) {
    require_once $composerAutoload;
}

// Environment Parser Helper (works with or without vlucas/phpdotenv)
function getEnvVar($key, $default = '') {
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') return $_ENV[$key];
    if (getenv($key) !== false && getenv($key) !== '') return getenv($key);

    static $envVars = null;
    if ($envVars === null) {
        $envVars = [];
        $envFile = __DIR__ . '/../.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || strpos($line, '#') === 0) continue;
                if (strpos($line, '=') !== false) {
                    list($name, $value) = explode('=', $line, 2);
                    $name = trim($name);
                    $value = trim($value);
                    $value = trim($value, '"\'');
                    $envVars[$name] = $value;
                }
            }
        }
    }
    return isset($envVars[$key]) ? $envVars[$key] : $default;
}

// Load vlucas/phpdotenv if class exists
if (class_exists('Dotenv\Dotenv') && file_exists(__DIR__ . '/../.env')) {
    try {
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
        $dotenv->safeLoad();
    } catch (\Exception $e) {
        // Fallback to getEnvVar
    }
}
