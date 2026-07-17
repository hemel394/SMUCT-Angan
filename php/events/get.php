<?php
include '../auth_guard.php';
include '../connect.php';

$id = $_GET['id'] ?? '';

if ($id === '') {
    echo json_encode(["success" => false, "message" => "Missing event id."]);
    exit;
}

$stmt = $conn->prepare("SELECT * FROM events WHERE id = ?");

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Prepare failed: " . $conn->error]);
    exit;
}

$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$event = $result->fetch_assoc();

if (!$event) {
    echo json_encode(["success" => false, "message" => "No event found with id " . $id]);
    exit;
}

header('Content-Type: application/json');
echo json_encode($event);

$stmt->close();
$conn->close();
?>