# 备份指定表API实现完成

## 问题解决

✅ **问题已解决**：路由冲突错误 "The POST method is not supported for route admin/database/backups/tables" 已解决

## 问题原因

前端尝试发送 POST 请求到 `admin/database/backups/tables` 但后端没有对应的路由和功能。
原路由系统将此请求错误匹配到了 `DELETE /admin/database/backups/{filename}` 路由（`tables` 被当作文件名）。

## 实现的功能

### 1. 新增API端点
**路由**: `POST /admin/database/backups/tables`
**功能**: 备份指定的数据库表

### 2. 请求格式
```json
{
  "tables": ["users", "courses", "vocabulary"],
  "description": "备份用户相关表"
}
```

### 3. 响应格式
```json
{
  "code": 200,
  "message": "指定表备份创建成功",
  "data": {
    "id": 123,
    "filename": "backup_tables_users-courses-vocabulary_2024-01-20_15-30-45.sql",
    "filepath": "database_backups/backup_tables_users-courses-vocabulary_2024-01-20_15-30-45.sql",
    "description": "备份用户相关表",
    "size": 1048576,
    "size_human": "1.00 MB",
    "tables_count": 3,
    "tables": ["users", "courses", "vocabulary"],
    "database": "90nihongo",
    "created_at": "2024-01-20 15:30:45",
    "created_at_human": "刚刚"
  }
}
```

## 实现细节

### 1. 控制器方法
**文件**: `app/Http/Controllers/Admin/DatabaseBackupController.php`

```php
public function backupTables(Request $request): JsonResponse
```

**功能**:
- 验证请求参数（表名数组、描述）
- 检查表是否存在于数据库中
- 调用备份服务创建指定表的备份
- 返回备份结果

### 2. 服务方法
**文件**: `app/Services/DatabaseBackupService.php`

```php
public function backupTables(array $tables, string $description = null): array
```

**功能**:
- 生成包含表名的备份文件名
- 创建数据库备份记录
- 调用对应数据库的备份方法
- 保存备份文件
- 更新备份状态

### 3. 数据库特定实现

#### MySQL备份
```php
protected function generateMySQLTablesBackup($connection, $dbName, array $tables): string
```
使用 `mysqldump` 命令备份指定表：
```bash
mysqldump -h host -P port -u user -ppass --single-transaction --routines --triggers database table1 table2 table3
```

#### PostgreSQL备份
```php
protected function generatePostgreSQLTablesBackup($connection, $dbName, array $tables): string
```
使用 `pg_dump` 命令备份指定表：
```bash
pg_dump -h host -p port -U user -d database --no-password --verbose --clean --if-exists -t table1 -t table2 -t table3
```

## 路由配置

### 完整的数据库备份路由
```php
Route::prefix('database')->group(function () {
    Route::get('/status', [DatabaseBackupController::class, 'status']);
    Route::get('/tables', [DatabaseBackupController::class, 'tables']);
    Route::get('/backups', [DatabaseBackupController::class, 'index']);
    Route::post('/backups', [DatabaseBackupController::class, 'store']);          // 完整备份
    Route::post('/backups/tables', [DatabaseBackupController::class, 'backupTables']); // 指定表备份
    Route::get('/backups/{filename}/download', [DatabaseBackupController::class, 'download']);
    Route::delete('/backups/{filename}', [DatabaseBackupController::class, 'destroy']);
    Route::post('/restore', [DatabaseBackupController::class, 'restore']);
});
```

## 验证测试

### 1. 路由验证
```bash
php artisan route:list --path=admin/database/backups
```

应该显示：
```
POST       admin/database/backups/tables ................ Admin\DatabaseBackupController@backupTables
```

### 2. API测试
```bash
# 登录获取token
curl -X POST "http://127.0.0.1:8000/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# 备份指定表
curl -X POST "http://127.0.0.1:8000/admin/database/backups/tables" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tables":["users","courses"],"description":"测试备份"}'
```

## 安全特性

- ✅ **认证保护**: 需要管理员认证
- ✅ **参数验证**: 验证表名数组和描述
- ✅ **表存在性检查**: 验证指定的表确实存在于数据库中
- ✅ **SQL注入防护**: 使用 `escapeshellarg()` 转义表名
- ✅ **错误处理**: 完整的异常处理和日志记录

## 文件命名规则

备份文件名格式：
```
backup_tables_{table1-table2-table3}_{timestamp}.sql
```

示例：
```
backup_tables_users-courses-vocabulary_2024-01-20_15-30-45.sql
backup_tables_users-courses-materials-etc_2024-01-20_15-30-45.sql  // 超过3个表时使用etc
```

## 与现有功能集成

- ✅ **备份列表**: 指定表备份会出现在备份列表中
- ✅ **下载功能**: 可以下载指定表的备份文件
- ✅ **删除功能**: 可以删除指定表的备份文件
- ✅ **日志记录**: 所有操作都有详细的日志记录
- ✅ **清理机制**: 自动清理旧的备份文件（包括指定表备份）

## 总结

现在系统支持：
1. **完整数据库备份**: `POST /admin/database/backups`
2. **指定表备份**: `POST /admin/database/backups/tables`
3. **获取表列表**: `GET /admin/database/tables`
4. **备份管理**: 列表、下载、删除、恢复

前端可以正常使用指定表备份功能，不再出现路由错误。 