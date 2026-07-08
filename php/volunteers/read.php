<?php
include '../connect.php';

$sql = "SELECT * FROM volunteers ORDER BY created_at DESC";
$result = $conn->query($sql);

$volunteers = [];
while ($row = $result->fetch_assoc()) {
    $volunteers[] = $row;
}

header('Content-Type: application/json');
echo json_encode($volunteers);

$conn->close();
?>