# 内容管理API测试脚本
$token = "6|ceHfKNawdXs6kR00aBvjGxo6Y7wy0LkGViFa1s7Oee262950"
$headers = @{
    "Accept" = "application/json"
    "Authorization" = "Bearer $token"
}
$baseUrl = "http://localhost:8000/admin/content"

Write-Host "=== 内容管理API测试 ===" -ForegroundColor Green

# 测试统计数据API
Write-Host "`n1. 测试统计数据API..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/stats" -Method GET -Headers $headers
    Write-Host "✓ 统计数据API正常" -ForegroundColor Green
    Write-Host "  - 总课程数: $($stats.data.stats.total_courses)"
    Write-Host "  - 已发布课程: $($stats.data.stats.published_courses)"
    Write-Host "  - 学习材料: $($stats.data.stats.total_materials)"
    Write-Host "  - 词汇数量: $($stats.data.stats.total_vocabulary)"
} catch {
    Write-Host "✗ 统计数据API失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试课程列表API
Write-Host "`n2. 测试课程列表API..." -ForegroundColor Yellow
try {
    $courses = Invoke-RestMethod -Uri "$baseUrl/courses" -Method GET -Headers $headers
    Write-Host "✓ 课程列表API正常" -ForegroundColor Green
    Write-Host "  - 课程总数: $($courses.data.Count)"
    if ($courses.data.Count -gt 0) {
        Write-Host "  - 第一个课程: $($courses.data[0].title)"
    }
} catch {
    Write-Host "✗ 课程列表API失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试学习材料API
Write-Host "`n3. 测试学习材料API..." -ForegroundColor Yellow
try {
    $materials = Invoke-RestMethod -Uri "$baseUrl/materials" -Method GET -Headers $headers
    Write-Host "✓ 学习材料API正常" -ForegroundColor Green
    Write-Host "  - 材料总数: $($materials.data.Count)"
} catch {
    Write-Host "✗ 学习材料API失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试词汇API
Write-Host "`n4. 测试词汇API..." -ForegroundColor Yellow
try {
    $vocabulary = Invoke-RestMethod -Uri "$baseUrl/vocabulary" -Method GET -Headers $headers
    Write-Host "✓ 词汇API正常" -ForegroundColor Green
    Write-Host "  - 词汇总数: $($vocabulary.data.Count)"
    if ($vocabulary.data.Count -gt 0) {
        Write-Host "  - 第一个词汇: $($vocabulary.data[0].word) ($($vocabulary.data[0].reading))"
    }
} catch {
    Write-Host "✗ 词汇API失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试练习题API
Write-Host "`n5. 测试练习题API..." -ForegroundColor Yellow
try {
    $exercises = Invoke-RestMethod -Uri "$baseUrl/exercises" -Method GET -Headers $headers
    Write-Host "✓ 练习题API正常" -ForegroundColor Green
    Write-Host "  - 练习题总数: $($exercises.data.Count)"
} catch {
    Write-Host "✗ 练习题API失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Green 