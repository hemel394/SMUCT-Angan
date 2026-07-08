<?php
include '../connect.php';

$event_id = $_POST['event_id'] ?? '';
$urls_raw = $_POST['urls'] ?? '';

if ($event_id === '' || $urls_raw === '') {
    echo json_encode(["success" => false, "message" => "Missing event or photos."]);
    exit;
}

$urls = json_decode($urls_raw, true);

if (!is_array($urls) || count($urls) === 0) {
    echo json_encode(["success" => false, "message" => "Invalid photo list."]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO gallery (event_id, image_url) VALUES (?, ?)");

foreach ($urls as $url) {
    $stmt->bind_param("is", $event_id, $url);
    $stmt->execute();
}

echo json_encode(["success" => true, "message" => count($urls) . " photos uploaded"]);

$stmt->close();
$conn->close();
?>