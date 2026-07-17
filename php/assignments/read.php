<?php
include '../auth_guard.php';
include '../connect.php';

$sql = "SELECT assignments.id, events.title AS event_title, volunteers.name AS volunteer_name
        FROM assignments
        JOIN events ON assignments.event_id = events.id
        JOIN volunteers ON assignments.volunteer_id = volunteers.id
        ORDER BY assignments.created_at DESC";

$result = $conn->query($sql);

$assignments = [];
while ($row = $result->fetch_assoc()) {
    $assignments[] = $row;
}

header('Content-Type: application/json');
echo json_encode($assignments);

$conn->close();
?>