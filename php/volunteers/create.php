<?php
include '../connect.php';

$name            = $_POST['name'] ?? '';
$student_id      = $_POST['student_id'] ?? '';
$department      = $_POST['department'] ?? '';
$email           = $_POST['email'] ?? '';
$phone           = $_POST['phone'] ?? '';
$preferred_event = $_POST['preferred_event'] ?? '';
$source          = $_POST['source'] ?? 'public';

if ($name === '' || $student_id === '' || $department === '' || $email === '') {
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit;
}

$status = ($source === 'admin') ? 'approved' : 'pending';

$stmt = $conn->prepare(
    "INSERT INTO volunteers (name, student_id, department, email, phone, preferred_event, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
);
$stmt->bind_param("sssssss", $name, $student_id, $department, $email, $phone, $preferred_event, $status);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Volunteer added", "id" => $stmt->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>