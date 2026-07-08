<?php
include '../connect.php';

$id = intval($_GET['id']);

$stmt = $conn->prepare("DELETE FROM gallery WHERE id = ?");
$stmt->bind_param("i", $id);

$response = [];
if ($stmt->execute()) {
    $response['success'] = true;
} else {
    $response['success'] = false;
    $response['message'] = $conn->error;
}

header('Content-Type: application/json');
echo json_encode($response);
$stmt->close();
$conn->close();
?>