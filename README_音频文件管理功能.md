# 🎵 音频文件管理功能使用指南

## 📋 功能概述

音频文件管理器是90天日语学习平台的核心功能，专门用于处理日语学习中的音频内容，包括发音示例、听力材料、对话练习等。

## 🎯 主要用途

### 1. **词汇发音管理**
- 上传词汇标准发音音频
- 为每个日语词汇关联对应的读音文件
- 支持平假名、片假名、汉字发音

### 2. **听力练习材料**
- 上传听力理解练习音频
- 管理不同难度等级的听力内容
- 支持JLPT N5-N1各级别音频

### 3. **课程音频内容**
- 每日课程的配套音频讲解
- 90天学习计划的音频材料
- 课程重点内容音频回顾

### 4. **练习题音频**
- 听力题目音频
- 发音练习参考音频
- 口语对话示例

## 🚀 如何使用

### 第一步：打开音频管理器

1. 进入**内容管理页面**
2. 选择目标标签页（词汇/课程/材料/练习题）
3. 点击**"音频管理"**按钮

![音频管理按钮位置](docs/images/audio-manager-button.png)

### 第二步：上传音频文件

#### 支持的音频格式
- **.mp3** - 推荐，兼容性最好
- **.wav** - 高质量，文件较大
- **.ogg** - 开源格式
- **.m4a** - 苹果格式
- **.aac** - 高效压缩

#### 文件大小限制
- 单文件最大：**50MB**
- 推荐大小：**5-10MB**（确保良好的加载速度）

#### 上传方式
1. **拖拽上传**：直接拖拽文件到上传区域
2. **点击选择**：点击上传区域选择文件
3. **批量上传**：一次选择多个音频文件

### 第三步：智能文件关联

#### 自动匹配规则
音频管理器会根据文件名自动匹配相关内容：

```
文件命名建议：
├── 词汇音频
│   ├── こんにちは.mp3 -> 自动关联"こんにちは"词汇
│   ├── arigatou.mp3 -> 自动关联读音为"arigatou"的词汇
│   └── N5_greetings.mp3 -> 关联N5级别问候语
├── 课程音频  
│   ├── day1_intro.mp3 -> 自动关联第1天课程
│   ├── lesson2.mp3 -> 自动关联第2课内容
│   └── beginner_basic.mp3 -> 关联初级基础内容
├── 练习音频
│   ├── exercise_listening_1.mp3 -> 关联听力练习1
│   └── vocabulary_quiz.mp3 -> 关联词汇测验
```

#### 手动关联
如果自动匹配不准确，可以手动选择关联：
1. 在**"关联内容"**列选择下拉菜单
2. 从列表中选择正确的内容项目
3. 系统会记住您的选择

### 第四步：批量处理

#### 批量上传
```typescript
// 批量上传流程
1. 选择多个音频文件
2. 系统自动检测文件格式和大小
3. 智能匹配关联内容
4. 点击"批量上传"开始处理
5. 实时显示上传进度
6. 查看成功/失败统计
```

#### 文件管理
- **预览播放**：点击播放按钮试听音频
- **查看信息**：文件大小、时长、格式
- **修改关联**：重新选择关联的内容
- **删除文件**：移除不需要的音频

## 🎨 界面功能详解

### 上传统计面板
```
┌─────────────────────────────────────┐
│  📊 上传统计                        │
├─────────────────────────────────────┤
│  总文件数: 15    已上传: 12   失败: 3 │
│  ✅ 成功率: 80%   ⚡ 总时长: 45:30   │
└─────────────────────────────────────┘
```

### 文件列表详情
| 字段 | 说明 | 示例 |
|------|------|------|
| 文件名 | 音频文件原始名称 | こんにちは.mp3 |
| 大小 | 文件大小，自动格式化 | 2.5 MB |
| 时长 | 音频时长 | 1:23 |
| 状态 | 上传状态（等待/上传中/已上传/失败） | ✅ 已上传 |
| 关联内容 | 关联的学习内容 | 词汇：こんにちは |
| 操作 | 播放/删除按钮 | ▶️ 🗑️ |

### 内置音频播放器
- **自动播放**：点击播放按钮立即播放
- **播放控制**：播放/暂停切换
- **自动停止**：播放完成自动停止
- **单例播放**：同时只能播放一个音频

## 🔧 技术特性

### 智能文件处理
```typescript
// 音频文件验证
- 格式检查：只允许音频格式
- 大小限制：防止过大文件
- 时长检测：自动获取音频时长
- 质量分析：检测音频质量
```

### 性能优化
- **分批上传**：避免服务器过载
- **进度显示**：实时上传进度
- **错误重试**：失败文件可重新上传
- **内存管理**：及时释放临时文件

### 安全保护
- **文件类型验证**：防止恶意文件上传
- **大小限制**：防止磁盘空间耗尽
- **权限检查**：只有管理员可以上传
- **病毒扫描**：集成文件安全检查

## 📚 最佳实践

### 文件命名规范
```
推荐格式：
├── 词汇类型
│   ├── [词汇]_[读音].mp3
│   ├── [JLPT等级]_[类别].mp3
│   └── [词性]_[序号].mp3
├── 课程类型
│   ├── day[天数]_[主题].mp3
│   ├── lesson[课时]_[内容].mp3  
│   └── [难度]_[主题].mp3
├── 练习类型
│   ├── [类型]_exercise_[序号].mp3
│   └── [技能]_practice_[级别].mp3
```

### 音频质量建议
- **采样率**：44.1kHz（CD质量）
- **比特率**：128-320 kbps
- **声道**：单声道（语音）或立体声（音乐）
- **格式**：MP3（兼容性最好）
- **时长**：建议单个文件不超过5分钟

### 批量处理技巧
1. **按类型分批**：同一类型的音频一起处理
2. **文件预处理**：上传前统一文件命名
3. **检查关联**：确认自动匹配的准确性
4. **验证播放**：上传后抽查音频质量

## 🔄 与其他功能的集成

### 批量导入协作
```mermaid
graph LR
    A[CSV数据导入] --> B[内容创建]
    B --> C[音频文件上传]
    C --> D[自动关联]
    D --> E[完整学习材料]
```

### 内容管理联动
- **词汇管理**：自动关联词汇发音
- **课程管理**：关联课程音频材料
- **练习管理**：关联听力练习音频
- **材料管理**：管理各类音频资源

## 🛠️ 故障排除

### 常见问题

#### Q1: 音频文件上传失败
**可能原因：**
- 文件格式不支持
- 文件大小超过限制
- 网络连接问题
- 服务器存储空间不足

**解决方法：**
1. 检查文件格式是否为支持的音频格式
2. 压缩音频文件或分段上传
3. 检查网络连接，重试上传
4. 联系管理员检查服务器空间

#### Q2: 自动关联不准确
**可能原因：**
- 文件命名不规范
- 关联数据不完整
- 匹配算法限制

**解决方法：**
1. 使用标准文件命名格式
2. 手动选择正确的关联内容
3. 更新关联数据库

#### Q3: 音频播放无声音
**可能原因：**
- 浏览器音频被静音
- 音频文件损坏
- 编码格式不兼容

**解决方法：**
1. 检查浏览器音量设置
2. 重新上传音频文件
3. 转换为标准MP3格式

### 技术支持
如遇到其他问题，请：
1. 查看浏览器控制台错误信息
2. 记录具体的操作步骤
3. 提供问题音频文件样本
4. 联系技术支持团队

## 🔮 未来增强计划

### 即将推出
- [ ] **AI音频处理**：自动降噪和音质优化
- [ ] **语音识别**：自动生成音频文字稿
- [ ] **发音评分**：AI发音准确度评估
- [ ] **音频剪辑**：在线音频编辑工具

### 长期规划
- [ ] **多语言支持**：支持其他语言音频
- [ ] **云端同步**：音频文件云端存储
- [ ] **智能推荐**：基于学习进度推荐音频
- [ ] **社区分享**：用户上传分享音频内容

---

## 📞 联系我们

如果您在使用音频文件管理功能时有任何问题或建议，请通过以下方式联系我们：

- **技术支持**：tech-support@90nihongo.com
- **功能建议**：feature-request@90nihongo.com
- **用户交流群**：QQ群 123456789

感谢您使用90天日语学习平台的音频文件管理功能！🎵✨ 