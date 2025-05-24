# 内容创建API测试脚本
$token = "6|ceHfKNawdXs6kR00aBvjGxo6Y7wy0LkGViFa1s7Oee262950"
$headers = @{
    "Accept" = "application/json"
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}
$baseUrl = "http://localhost:8000/admin/content"

Write-Host "=== 内容创建API测试 ===" -ForegroundColor Green

# 测试创建课程
Write-Host "`n1. 测试创建课程..." -ForegroundColor Yellow
try {
    $courseData = @{
        title = "测试课程：基础对话练习"
        description = "学习基础的日常对话表达方式"
        day_number = 91
        difficulty = "beginner"
        tags = @("测试", "对话", "基础")
        is_active = $false
    } | ConvertTo-Json -Depth 3

    $course = Invoke-RestMethod -Uri "$baseUrl/courses" -Method POST -Headers $headers -Body $courseData
    Write-Host "✓ 课程创建成功" -ForegroundColor Green
    Write-Host "  - 课程ID: $($course.data.id)"
    Write-Host "  - 标题: $($course.data.title)"
    Write-Host "  - 天数: $($course.data.day_number)"
    $courseId = $course.data.id
} catch {
    Write-Host "✗ 课程创建失败: $($_.Exception.Message)" -ForegroundColor Red
    $courseId = 1  # 使用现有课程ID作为备用
}

# 测试创建学习材料
Write-Host "`n2. 测试创建学习材料..." -ForegroundColor Yellow
try {
    $materialData = @{
        course_id = $courseId
        title = "测试材料：对话音频"
        type = "audio"
        content = "这是一个测试的音频材料内容"
        duration_minutes = 15
        metadata = @{
            format = "mp3"
            quality = "high"
        }
    } | ConvertTo-Json -Depth 3

    $material = Invoke-RestMethod -Uri "$baseUrl/materials" -Method POST -Headers $headers -Body $materialData
    Write-Host "✓ 学习材料创建成功" -ForegroundColor Green
    Write-Host "  - 材料ID: $($material.data.id)"
    Write-Host "  - 标题: $($material.data.title)"
    Write-Host "  - 类型: $($material.data.type)"
} catch {
    Write-Host "✗ 学习材料创建失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试创建词汇
Write-Host "`n3. 测试创建词汇..." -ForegroundColor Yellow
try {
    $vocabData = @{
        word = "テスト"
        reading = "tesuto"
        meaning = "测试"
        part_of_speech = "名词"
        example_sentence = "これはテストです。"
        example_reading = "kore wa tesuto desu."
        example_meaning = "这是测试。"
        jlpt_level = "N5"
        tags = @("测试", "基础词汇")
    } | ConvertTo-Json -Depth 3

    $vocab = Invoke-RestMethod -Uri "$baseUrl/vocabulary" -Method POST -Headers $headers -Body $vocabData
    Write-Host "✓ 词汇创建成功" -ForegroundColor Green
    Write-Host "  - 词汇ID: $($vocab.data.id)"
    Write-Host "  - 单词: $($vocab.data.word)"
    Write-Host "  - 读音: $($vocab.data.reading)"
    Write-Host "  - 意思: $($vocab.data.meaning)"
} catch {
    Write-Host "✗ 词汇创建失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试创建练习题
Write-Host "`n4. 测试创建练习题..." -ForegroundColor Yellow
try {
    $exerciseData = @{
        course_id = $courseId
        title = "测试练习：词汇选择题"
        type = "vocabulary"
        question = "请选择正确的日语表达'你好'："
        options = @("こんにちは", "さようなら", "ありがとう", "すみません")
        correct_answer = "こんにちは"
        explanation = "'こんにちは'是日语中最常用的问候语，表示'你好'"
        points = 10
    } | ConvertTo-Json -Depth 3

    $exercise = Invoke-RestMethod -Uri "$baseUrl/exercises" -Method POST -Headers $headers -Body $exerciseData
    Write-Host "✓ 练习题创建成功" -ForegroundColor Green
    Write-Host "  - 练习题ID: $($exercise.data.id)"
    Write-Host "  - 标题: $($exercise.data.title)"
    Write-Host "  - 类型: $($exercise.data.type)"
} catch {
    Write-Host "✗ 练习题创建失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Green 