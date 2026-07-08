<?php
include '../connect.php';

$id = $_GET['id'] ?? '';

if ($id === '') {
    echo json_encode(["success" => false, "message" => "Missing volunteer id."]);
    exit;
}

$stmt = $conn->prepare("UPDATE volunteers SET status = 'approved' WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>