<?php
include '../auth_guard.php';
include '../connect.php';

$event_id     = $_POST['event_id'] ?? '';
$volunteer_id = $_POST['volunteer_id'] ?? '';

if ($event_id === '' || $volunteer_id === '') {
    echo json_encode(["success" => false, "message" => "Missing event or volunteer."]);
    exit;
}

$stmt = $conn->prepare(
    "INSERT INTO assignments (event_id, volunteer_id) VALUES (?, ?)"
);
$stmt->bind_param("ii", $event_id, $volunteer_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Assignment created", "id" => $stmt->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>