<?php
// Set response header
header('Content-Type: application/json');

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Your email address where you want to receive emails
$to = 'bernardkingori026@gmail.com'; // Updated to user's email

// Email subject
$subject = 'New Contact Form Submission from ' . $_SERVER['HTTP_HOST'];

// Initialize response array
$response = [
    'success' => false,
    'message' => '',
    'errors' => []
];

// Check if form was submitted
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method.';
    echo json_encode($response);
    exit;
}

// Get form data and sanitize
$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING) ?? '';
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL) ?? '';
$phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING) ?? '';
$subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING) ?? '';
$message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING) ?? '';

// Validate required fields
if (empty($name)) {
    $response['errors']['name'] = 'Name is required.';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response['errors']['email'] = 'Valid email is required.';
}

if (empty($message)) {
    $response['errors']['message'] = 'Message is required.';
}

// If there are validation errors
if (!empty($response['errors'])) {
    $response['message'] = 'Please correct the errors below.';
    http_response_code(400);
    echo json_encode($response);
    exit;
}

// Build email content
$email_content = "Name: $name\n";
$email_content .= "Email: $email\n";
if (!empty($phone)) {
    $email_content .= "Phone: $phone\n";
}
if (!empty($subject)) {
    $email_content .= "Subject: $subject\n";
}
$email_content .= "\nMessage:\n$message";

// Set email headers
$headers = [
    'From: ' . $email,
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion()
];

// Send email
$mail_sent = mail($to, $subject, $email_content, implode("\r\n", $headers));

if ($mail_sent) {
    $response['success'] = true;
    $response['message'] = 'Thank you! Your message has been sent successfully.';
    http_response_code(200);
} else {
    $response['message'] = 'Sorry, there was an error sending your message. Please try again later.';
    $response['error_info'] = error_get_last();
    http_response_code(500);
}

// Return JSON response
echo json_encode($response);
?>
