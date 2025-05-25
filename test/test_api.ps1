# 测试B站提取API连接
Write-Host "测试Laravel API连接..." -ForegroundColor Green

# 测试登录API
Write-Host "1. 测试登录API..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8080/admin/login" -Method POST -ContentType "application/json" -Body '{"account":"admin@90nihongo.com","password":"admin123"}' -ErrorAction Stop
    Write-Host "登录API状态码: $($loginResponse.StatusCode)" -ForegroundColor Green
    Write-Host "响应内容类型: $($loginResponse.Headers['Content-Type'])" -ForegroundColor Green
    
    # 尝试解析JSON响应
    $loginData = $loginResponse.Content | ConvertFrom-Json
    if ($loginData.success) {
        Write-Host "登录成功，获得token: $($loginData.token.Substring(0,20))..." -ForegroundColor Green
        $token = $loginData.token
    } else {
        Write-Host "登录失败: $($loginData.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "登录API错误: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. 测试B站视频信息API..." -ForegroundColor Yellow
try {
    $headers = @{}
    if ($token) {
        $headers["Authorization"] = "Bearer $token"
    }
    $videoInfoResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8080/admin/bilibili/video-info" -Method POST -ContentType "application/json" -Body '{"url":"https://www.bilibili.com/video/BV1234567890"}' -Headers $headers -ErrorAction Stop
    Write-Host "视频信息API状态码: $($videoInfoResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "视频信息API错误: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. 测试任务列表API..." -ForegroundColor Yellow
try {
    $headers = @{}
    if ($token) {
        $headers["Authorization"] = "Bearer $token"
    }
    $jobsResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8080/admin/bilibili/jobs" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "任务列表API状态码: $($jobsResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "任务列表API错误: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n测试完成!" -ForegroundColor Green 