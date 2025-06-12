<?php
// Enable error reporting for debugging (remove in production)
// error_reporting(E_ALL);
// ini_set('display_errors', 1);

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false, 
        'message' => 'Method not allowed',
        'errors' => ['method' => 'Only POST method is allowed']
    ]);
    exit;
}

// Verify this is not a bot submission (honeypot technique)
if (!empty($_POST['website'])) {
    // This is likely a bot - silently fail
    echo json_encode(['success' => true, 'message' => 'Thank you for your message!']);
    exit;
}

// Get and sanitize form data
$name = isset($_POST['name']) ? trim(filter_var($_POST['name'], FILTER_SANITIZE_STRING)) : '';
$email = isset($_POST['email']) ? trim(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL)) : '';
$subject = isset($_POST['subject']) ? trim(filter_var($_POST['subject'], FILTER_SANITIZE_STRING)) : '';
$message = isset($_POST['message']) ? trim(filter_var($_POST['message'], FILTER_SANITIZE_STRING)) : '';

// Validate input
$errors = [];

if (empty($name)) {
    $errors['name'] = 'Name is required';
} elseif (strlen($name) < 2) {
    $errors['name'] = 'Name must be at least 2 characters';
}

if (empty($email)) {
    $errors['email'] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email address';
}

if (empty($subject)) {
    $errors['subject'] = 'Subject is required';
}

if (empty($message)) {
    $errors['message'] = 'Message is required';
} elseif (strlen($message) < 10) {
    $errors['message'] = 'Message must be at least 10 characters';
}

// If there are validation errors, return them
if (!empty($errors)) {
    http_response_code(422);
    echo json_encode([
        'success' => false, 
        'message' => 'Please correct the errors below',
        'errors' => $errors
    ]);
    exit;
}

// Email configuration
$to = 'bernardkingori026@gmail.com';
$email_subject = "New Contact Form Submission: " . htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
$email_body = "You have received a new message from your website contact form.\n\n" .
             "Name: " . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . "\n" .
             "Email: " . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "\n\n" .
             "Message:\n" . htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

// Additional headers
$headers = [
    'From' => 'Novus Studio Contact Form <noreply@novusstudio.com>',
    'Reply-To' => $name . ' <' . $email . '>',
    'X-Mailer' => 'PHP/' . phpversion(),
    'Content-Type' => 'text/plain; charset=UTF-8',
    'MIME-Version' => '1.0'
];

// Build headers string
$headers_string = '';
foreach ($headers as $key => $value) {
    $headers_string .= "$key: $value\r\n";
}

try {
    // Send email
    $mail_sent = mail($to, $email_subject, $email_body, $headers_string);
    
    if ($mail_sent) {
        echo json_encode([
            'success' => true, 
            'message' => 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.'
        ]);
    } else {
        throw new Exception('Failed to send email. Please try again later.');
    }
} catch (Exception $e) {
    http_response_code(500);
    error_log('Contact form error: ' . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'An error occurred while sending your message. Please try again later.'
    ]);
}
?>
