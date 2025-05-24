# Content Creation API Test Script
$token = "6|ceHfKNawdXs6kR00aBvjGxo6Y7wy0LkGViFa1s7Oee262950"
$headers = @{
    "Accept" = "application/json"
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}
$baseUrl = "http://localhost:8000/admin/content"

Write-Host "=== Content Creation API Test ===" -ForegroundColor Green

# Test creating course
Write-Host "`n1. Testing course creation..." -ForegroundColor Yellow
try {
    $courseData = @{
        title = "Test Course: Basic Conversation"
        description = "Learn basic daily conversation expressions"
        day_number = 91
        difficulty = "beginner"
        tags = @("test", "conversation", "basic")
        is_active = $false
    } | ConvertTo-Json -Depth 3

    $course = Invoke-RestMethod -Uri "$baseUrl/courses" -Method POST -Headers $headers -Body $courseData
    Write-Host "Course created successfully" -ForegroundColor Green
    Write-Host "  - Course ID: $($course.data.id)"
    Write-Host "  - Title: $($course.data.title)"
    Write-Host "  - Day: $($course.data.day_number)"
    $courseId = $course.data.id
} catch {
    Write-Host "Course creation failed: $($_.Exception.Message)" -ForegroundColor Red
    $courseId = 1
}

# Test creating vocabulary
Write-Host "`n2. Testing vocabulary creation..." -ForegroundColor Yellow
try {
    $vocabData = @{
        word = "テスト"
        reading = "tesuto"
        meaning = "test"
        part_of_speech = "noun"
        example_sentence = "これはテストです。"
        example_reading = "kore wa tesuto desu."
        example_meaning = "This is a test."
        jlpt_level = "N5"
        tags = @("test", "basic")
    } | ConvertTo-Json -Depth 3

    $vocab = Invoke-RestMethod -Uri "$baseUrl/vocabulary" -Method POST -Headers $headers -Body $vocabData
    Write-Host "Vocabulary created successfully" -ForegroundColor Green
    Write-Host "  - Word: $($vocab.data.word)"
    Write-Host "  - Reading: $($vocab.data.reading)"
} catch {
    Write-Host "Vocabulary creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green 