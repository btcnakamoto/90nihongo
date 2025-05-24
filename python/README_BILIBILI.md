# 🎬 B站视频音频和字幕提取工具

一个强大的Python工具，可以从B站视频中提取指定片段的音频并生成字幕。支持AI字幕生成和B站原生字幕获取。

## ✨ 功能特点

### 🎯 核心功能
- **视频下载**: 支持B站视频批量下载
- **精确片段提取**: 按时间段提取音频片段
- **AI字幕生成**: 使用OpenAI Whisper生成高质量字幕
- **原生字幕获取**: 自动获取B站视频原有字幕
- **多语言支持**: 支持中文、日语、英语等多种语言
- **批量处理**: 一次性处理多个视频片段

### 🔧 技术特点
- **智能识别**: 自动识别BV号和AV号
- **格式转换**: 支持多种时间格式输入
- **质量可选**: 可选择不同视频质量下载
- **数据库集成**: 可与SQLite等数据库集成
- **命令行支持**: 提供完整的CLI接口

## 🚀 快速开始

### 1. 安装依赖

首先需要安装FFmpeg（音频处理必需）:

**Windows:**
```bash
# 使用Chocolatey
choco install ffmpeg

# 或下载预编译版本
# https://ffmpeg.org/download.html
```

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

然后安装Python依赖：
```bash
pip install -r requirements_bilibili.txt
```

### 2. 基础使用

```python
from bilibili_audio_extractor import BilibiliAudioExtractor

# 创建提取器
extractor = BilibiliAudioExtractor(output_dir="downloads")

# 提取视频片段
result = extractor.extract_segment_with_subtitle(
    url="https://www.bilibili.com/video/BV1xx411c7mu",
    start_time="00:01:00",  # 1分钟开始
    end_time="00:02:00",    # 2分钟结束
    use_ai_subtitle=True    # 使用AI生成字幕
)

print(f"音频文件: {result['audio_path']}")
print(f"字幕文件: {result['subtitle_path']}")
```

### 3. 命令行使用

```bash
# 基础用法
python bilibili_audio_extractor.py "https://www.bilibili.com/video/BV1xx411c7mu" --start 00:01:00 --end 00:02:00

# 使用AI字幕
python bilibili_audio_extractor.py "https://www.bilibili.com/video/BV1xx411c7mu" --start 60 --end 120 --ai-subtitle

# 指定输出目录
python bilibili_audio_extractor.py "https://www.bilibili.com/video/BV1xx411c7mu" --start 00:01:00 --end 00:02:00 --output-dir my_output
```

## 📚 详细用法

### 时间格式支持

工具支持多种时间格式：

```python
# 时分秒格式
start_time = "00:01:30"  # 1分30秒
end_time = "00:02:45"    # 2分45秒

# 纯秒数格式
start_time = 90   # 90秒
end_time = 165    # 165秒

# 混合使用
extractor.extract_audio_segment(video_path, 60, "00:02:00")
```

### 字幕处理选项

```python
# 1. 使用AI生成字幕（推荐）
result = extractor.extract_segment_with_subtitle(
    url=url,
    start_time="00:01:00",
    end_time="00:02:00",
    use_ai_subtitle=True
)

# 2. 优先使用B站原生字幕
result = extractor.extract_segment_with_subtitle(
    url=url,
    start_time="00:01:00", 
    end_time="00:02:00",
    use_ai_subtitle=False  # 如果没有原生字幕，会自动使用AI
)

# 3. 多语言字幕生成
subtitle_path_ja, text_ja = extractor.generate_subtitle_with_ai(audio_path, language="ja")  # 日语
subtitle_path_en, text_en = extractor.generate_subtitle_with_ai(audio_path, language="en")  # 英语
subtitle_path_zh, text_zh = extractor.generate_subtitle_with_ai(audio_path, language="zh")  # 中文
```

### 批量处理示例

```python
# 处理多个片段
segments = [
    {"start": "00:00:30", "end": "00:01:30", "name": "开头"},
    {"start": "00:05:00", "end": "00:06:00", "name": "重点"},
    {"start": "00:10:00", "end": "00:11:00", "name": "结尾"},
]

for i, segment in enumerate(segments):
    result = extractor.extract_segment_with_subtitle(
        url=url,
        start_time=segment['start'],
        end_time=segment['end'],
        use_ai_subtitle=True
    )
    print(f"完成片段 {i+1}: {segment['name']}")
```

## 🎌 日语学习应用

### 日语视频片段提取

```python
# 专门针对日语学习视频
extractor = BilibiliAudioExtractor(output_dir="japanese_learning")

# 提取日语对话片段
result = extractor.extract_segment_with_subtitle(
    url="https://www.bilibili.com/video/BV1xx411c7mu",  # 日语学习视频
    start_time="00:02:00",
    end_time="00:03:30", 
    use_ai_subtitle=True
)

# 生成日语字幕
jp_subtitle, jp_text = extractor.generate_subtitle_with_ai(
    result['audio_path'], 
    language="ja"
)

# 生成中文翻译
zh_subtitle, zh_text = extractor.generate_subtitle_with_ai(
    result['audio_path'],
    language="zh" 
)

print("日语原文:", jp_text)
print("中文翻译:", zh_text)
```

### 生成学习卡片

```python
import json

def create_learning_card(audio_path, japanese_text, chinese_text, start_time, end_time):
    """创建日语学习卡片"""
    card = {
        "audio_file": str(audio_path),
        "japanese": japanese_text,
        "chinese": chinese_text,
        "duration": f"{start_time} - {end_time}",
        "difficulty": "N5",  # 可以根据内容判断难度
        "tags": ["对话", "日常", "基础"],
        "created_at": datetime.now().isoformat()
    }
    
    # 保存为JSON文件
    card_path = audio_path.with_suffix('.json')
    with open(card_path, 'w', encoding='utf-8') as f:
        json.dump(card, f, ensure_ascii=False, indent=2)
    
    return card
```

## 🔗 与90日语系统集成

### 1. 数据库集成

```python
# 与90nihongo数据库集成
def save_to_materials_table(result, course_day):
    """保存到学习材料表"""
    material_data = {
        'type': 'audio',
        'title': f"Day {course_day} - 音频练习",
        'content_path': result['audio_path'],
        'subtitle_path': result['subtitle_path'],
        'source_url': result['video_info']['bvid'],
        'difficulty_level': 'beginner',
        'course_day': course_day,
        'tags': ['listening', 'pronunciation']
    }
    
    # 插入到materials表
    # INSERT INTO materials (type, title, content_path, ...) VALUES (...)
```

### 2. 自动化工作流

```python
def automated_content_creation():
    """自动化内容创建流程"""
    
    # 1. 从配置文件读取要处理的视频列表
    videos_config = load_videos_config('videos_to_process.json')
    
    # 2. 批量处理
    for video in videos_config:
        try:
            # 提取音频和字幕
            result = extractor.extract_segment_with_subtitle(
                url=video['url'],
                start_time=video['start'],
                end_time=video['end'],
                use_ai_subtitle=True
            )
            
            # 3. 保存到数据库
            save_to_database(result, video['course_day'])
            
            # 4. 生成学习卡片
            create_learning_card(result)
            
            # 5. 更新课程内容
            update_course_materials(video['course_day'], result)
            
        except Exception as e:
            log_error(f"处理视频失败: {video['url']}, 错误: {e}")
```

## 📊 输出文件说明

每次提取会生成以下文件：

```
downloads/
├── BV1xx411c7mu_视频标题.mp4          # 原始视频文件
├── audio_segment_20240120_143022.wav   # 音频片段
├── audio_segment_20240120_143022.srt   # 字幕文件
└── audio_segment_20240120_143022.json  # 结果信息
```

### 结果信息文件格式

```json
{
  "video_info": {
    "title": "日语学习视频",
    "duration": 1200,
    "bvid": "BV1xx411c7mu",
    "owner": "UP主名称"
  },
  "audio_path": "downloads/audio_segment_20240120_143022.wav",
  "subtitle_path": "downloads/audio_segment_20240120_143022.srt", 
  "subtitle_text": "こんにちは、皆さん...",
  "start_time": "00:01:00",
  "end_time": "00:02:00",
  "duration": "00:02:00 - 00:01:00"
}
```

## ⚡ 性能优化

### 1. 批量处理优化

```python
# 避免重复下载视频
video_path = None
for segment in segments:
    if video_path is None:
        video_path, video_info = extractor.download_video(url)
    
    # 直接从已下载的视频提取
    audio_path = extractor.extract_audio_segment(
        video_path, segment['start'], segment['end']
    )
```

### 2. Whisper模型优化

```python
# 使用不同大小的模型平衡速度和质量
extractor = BilibiliAudioExtractor()

# 快速模式（较低质量）
extractor.whisper_model = whisper.load_model("tiny")

# 平衡模式（推荐）
extractor.whisper_model = whisper.load_model("base")  # 默认

# 高质量模式（较慢）
extractor.whisper_model = whisper.load_model("large")
```

## 🚨 注意事项

### 法律和版权
- ⚠️ 请遵守B站使用条款和相关法律法规
- ⚠️ 仅用于个人学习和研究目的
- ⚠️ 不要用于商业用途或侵犯版权
- ⚠️ 尊重内容创作者的权益

### 技术限制
- 需要稳定的网络连接
- Whisper AI需要较大内存（建议8GB+）
- FFmpeg必须正确安装
- 某些受保护的视频可能无法下载

### 使用建议
- 优先使用B站原生字幕（质量更好）
- 合理选择Whisper模型大小
- 定期清理下载的临时文件
- 设置合理的片段长度（建议1-5分钟）

## 🛠️ 故障排除

### 常见问题

**1. FFmpeg未找到**
```bash
# 确保FFmpeg在PATH中
ffmpeg -version

# Windows用户需要添加到环境变量
```

**2. 视频下载失败**
```python
# 检查网络连接和视频可用性
video_info = extractor.get_video_info("BV1xx411c7mu")
print(video_info)
```

**3. Whisper加载失败**
```bash
# 重新安装whisper
pip uninstall openai-whisper
pip install openai-whisper
```

**4. 字幕乱码问题**
```python
# 确保使用UTF-8编码
with open(subtitle_path, 'w', encoding='utf-8') as f:
    f.write(srt_content)
```

## 📈 扩展开发

### 自定义字幕格式

```python
def export_to_ass(subtitle_data, output_path):
    """导出为ASS字幕格式"""
    # ASS格式模板
    ass_template = """[Script Info]
Title: Bilibili Extract
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    
    # 添加字幕内容
    for segment in subtitle_data:
        start = format_ass_time(segment['start'])
        end = format_ass_time(segment['end'])
        text = segment['text']
        ass_template += f"Dialogue: 0,{start},{end},Default,,0,0,0,,{text}\n"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(ass_template)
```

### 与其他AI服务集成

```python
def use_custom_ai_service(audio_path):
    """使用自定义AI服务进行转录"""
    # 可以集成百度AI、腾讯AI等服务
    # 实现自定义的音频转文字逻辑
    pass
```

## 📞 技术支持

如有问题或建议，请：
1. 查看故障排除部分
2. 检查依赖是否正确安装
3. 参考使用示例代码
4. 提交Issue描述具体问题

---

🎉 **开始使用这个强大的B站音频提取工具，为您的日语学习之旅添加丰富的听力材料！** 