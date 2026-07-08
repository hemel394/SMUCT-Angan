<?php
include '../connect.php';

$id = $_GET['id'] ?? '';

if ($id === '') {
    echo json_encode(["success" => false, "message" => "Missing event id."]);
    exit;
}

$stmt = $conn->prepare("UPDATE events SET status = 'archived' WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Event archived"]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>