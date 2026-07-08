<?php
include '../connect.php';

$sql = "SELECT gallery.id, gallery.event_id, gallery.image_url, events.title, events.category
        FROM gallery JOIN events ON gallery.event_id = events.id
        ORDER BY gallery.created_at DESC";
$result = $conn->query($sql);

$photos = [];
while ($row = $result->fetch_assoc()) {
    $photos[] = $row;
}

header('Content-Type: application/json');
echo json_encode($photos);
$conn->close();
?>