<?php
include '../connect.php';

$id          = $_POST['id'] ?? '';
$title       = $_POST['title'] ?? '';
$event_date  = $_POST['date'] ?? '';
$event_time  = $_POST['time'] ?? '';
$category    = $_POST['category'] ?? '';
$venue       = $_POST['venue'] ?? '';
$status      = $_POST['status'] ?? '';
$description = $_POST['description'] ?? '';

if ($id === '' || $title === '' || $event_date === '') {
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit;
}

$stmt = $conn->prepare(
    "UPDATE events SET title = ?, event_date = ?, event_time = ?, category = ?, venue = ?, status = ?, description = ?
     WHERE id = ?"
);

$stmt->bind_param(
    "sssssssi",
    $title,
    $event_date,
    $event_time,
    $category,
    $venue,
    $status,
    $description,
    $id
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Event updated"]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>