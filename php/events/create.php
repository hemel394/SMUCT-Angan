<?php
include '../auth_guard.php';
include '../connect.php';

$title       = $_POST['title'] ?? '';
$event_date  = $_POST['date'] ?? '';
$event_time  = $_POST['time'] ?? '';
$category    = $_POST['category'] ?? '';
$venue       = $_POST['venue'] ?? '';
$description = $_POST['description'] ?? '';
$image_url   = $_POST['image_url'] ?? '';

if ($title === '' || $event_date === '' || $category === '' || $venue === '') {
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit;
}

$stmt = $conn->prepare(
    "INSERT INTO events (title, event_date, event_time, category, venue, image_url, description, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'upcoming')"
);

$stmt->bind_param(
    "sssssss",
    $title,
    $event_date,
    $event_time,
    $category,
    $venue,
    $image_url,
    $description
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Event created", "id" => $stmt->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>