<?php
include 'auth_guard.php';

// Keep the imgbb key server-side only. Never expose this in JS.
$IMGBB_API_KEY = 'c7be2ed67ea97338c083506aab888183';

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "message" => "No image received."]);
    exit;
}

$imageData = base64_encode(file_get_contents($_FILES['image']['tmp_name']));

$ch = curl_init('https://api.imgbb.com/1/upload?key=' . $IMGBB_API_KEY);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, ['image' => $imageData]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    echo json_encode(["success" => false, "message" => "Upload request failed: " . $curlError]);
    exit;
}

$data = json_decode($response, true);

if (!empty($data['success'])) {
    echo json_encode(["success" => true, "url" => $data['data']['url']]);
} else {
    echo json_encode(["success" => false, "message" => "imgbb upload failed."]);
}
