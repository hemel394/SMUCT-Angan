<?php
// Blocks any request that doesn't have a valid admin session.
// Include this at the very top of every admin-only endpoint.
session_start();

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "message" => "Unauthorized. Please log in."]);
    exit;
}
