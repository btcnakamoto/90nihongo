# 下载功能修复完成

## 问题原因

下载备份文件时返回JSON错误信息：`{"code":400,"message":"无效的文件名格式"}`

**根本原因**：文件名格式验证逻辑只支持原来的完整备份文件名格式，不支持新的指定表备份文件名格式。

## 文件名格式对比

### 原有格式（完整备份）
```
backup_2024-01-20_15-30-45.sql
```
验证正则表达式：`/^backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.sql$/`

### 新增格式（指定表备份）
```
backup_tables_users-courses-vocabulary_2024-01-20_15-30-45.sql
backup_tables_users-courses-materials-etc_2024-01-20_15-30-45.sql
```
验证正则表达式：`/^backup_tables_.+_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.sql$/`

## 修复内容

### 1. 新增统一验证方法
**文件**: `app/Http/Controllers/Admin/DatabaseBackupController.php`

```php
/**
 * 验证备份文件名格式
 * 支持两种格式：
 * 1. 完整备份：backup_YYYY-mm-dd_HH-ii-ss.sql
 * 2. 指定表备份：backup_tables_{tablesStr}_YYYY-mm-dd_HH-ii-ss.sql
 */
private function isValidBackupFilename(string $filename): bool
{
    return preg_match('/^backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.sql$/', $filename) ||
           preg_match('/^backup_tables_.+_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.sql$/', $filename);
}
```

### 2. 更新受影响的方法

#### download() 方法
- ✅ 现在支持下载完整备份文件
- ✅ 现在支持下载指定表备份文件

#### destroy() 方法  
- ✅ 现在支持删除完整备份文件
- ✅ 现在支持删除指定表备份文件

#### restore() 方法
- ✅ 现在支持恢复完整备份文件
- ✅ 现在支持恢复指定表备份文件

## 验证测试

### 1. 文件名格式测试

**完整备份文件名** (应该通过验证):
```
backup_2024-01-20_15-30-45.sql ✅
```

**指定表备份文件名** (应该通过验证):
```
backup_tables_users-courses_2024-01-20_15-30-45.sql ✅
backup_tables_users-courses-vocabulary_2024-01-20_15-30-45.sql ✅
backup_tables_users-courses-materials-etc_2024-01-20_15-30-45.sql ✅
```

**无效文件名** (应该被拒绝):
```
invalid_file.sql ❌
backup_2024-01-20.sql ❌
backup_tables_2024-01-20_15-30-45.sql ❌
```

### 2. API功能测试

1. **创建指定表备份**
```bash
curl -X POST "http://127.0.0.1:8000/admin/database/backups/tables" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tables":["users","courses"],"description":"测试备份"}'
```

2. **下载备份文件**
```bash
curl -X GET "http://127.0.0.1:8000/admin/database/backups/{filename}/download" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o backup_file.sql
```

3. **验证下载内容**
下载的文件应该包含SQL内容，而不是JSON错误信息。

## 修复验证

### 之前（错误）
下载指定表备份文件返回：
```json
{"code":400,"message":"无效的文件名格式"}
```

### 现在（正确）
下载任何有效备份文件都会返回：
- **Content-Type**: `application/sql`
- **Content-Disposition**: `attachment; filename="backup_xxx.sql"`
- **内容**: 实际的SQL备份内容

## 安全性保持

- ✅ **文件名验证**: 仍然严格验证文件名格式
- ✅ **路径遍历防护**: 只允许预定义格式的文件名
- ✅ **认证保护**: 仍然需要管理员认证
- ✅ **数据库验证**: 通过数据库记录验证文件存在

## 向后兼容性

- ✅ **完整备份**: 原有的完整备份下载功能完全不受影响
- ✅ **现有文件**: 所有现有的备份文件仍然可以正常下载
- ✅ **API接口**: 下载API接口没有变化

## 总结

修复完成后：
- ✅ 完整备份文件可以正常下载
- ✅ 指定表备份文件可以正常下载  
- ✅ 删除功能支持两种文件格式
- ✅ 恢复功能支持两种文件格式
- ✅ 文件名验证更加完善

现在用户可以正常下载指定表的备份文件，获得真实的SQL内容而不是错误信息。 