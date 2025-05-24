#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
B站视频音频和字幕提取工具使用示例
"""

from bilibili_audio_extractor import BilibiliAudioExtractor

def example_1_basic_usage():
    """基础使用示例"""
    print("=== 基础使用示例 ===")
    
    # 创建提取器
    extractor = BilibiliAudioExtractor(output_dir="output/basic")
    
    # B站视频URL
    url = "https://www.bilibili.com/video/BV1xx411c7mu"
    
    # 提取1分钟到2分钟的音频和字幕
    result = extractor.extract_segment_with_subtitle(
        url=url,
        start_time="00:01:00",  # 1分钟开始
        end_time="00:02:00",    # 2分钟结束
        use_ai_subtitle=True    # 使用AI生成字幕
    )
    
    print("提取结果:", result)

def example_2_multiple_segments():
    """批量提取多个片段"""
    print("=== 批量提取示例 ===")
    
    extractor = BilibiliAudioExtractor(output_dir="output/batch")
    
    # 要提取的片段列表
    segments = [
        {"start": "00:00:30", "end": "00:01:30", "name": "开头部分"},
        {"start": "00:05:00", "end": "00:06:00", "name": "中间部分"},
        {"start": "00:10:00", "end": "00:11:00", "name": "结尾部分"},
    ]
    
    url = "https://www.bilibili.com/video/BV1xx411c7mu"
    
    results = []
    for i, segment in enumerate(segments):
        print(f"\n正在处理第{i+1}个片段: {segment['name']}")
        
        # 自定义输出文件名
        output_name = f"segment_{i+1}_{segment['name']}.wav"
        
        try:
            # 先下载视频（只需要下载一次）
            if i == 0:
                video_path, video_info = extractor.download_video(url)
            
            # 提取音频片段
            audio_path = extractor.extract_audio_segment(
                video_path=video_path,
                start_time=segment['start'],
                end_time=segment['end'],
                output_name=output_name
            )
            
            # 生成字幕
            subtitle_path, subtitle_text = extractor.generate_subtitle_with_ai(audio_path)
            
            results.append({
                'segment_name': segment['name'],
                'audio_path': str(audio_path),
                'subtitle_path': str(subtitle_path),
                'subtitle_text': subtitle_text
            })
            
        except Exception as e:
            print(f"处理片段 {segment['name']} 时出错: {e}")
    
    print(f"\n批量处理完成，成功提取 {len(results)} 个片段")
    return results

def example_3_japanese_content():
    """日语内容处理示例"""
    print("=== 日语内容处理示例 ===")
    
    extractor = BilibiliAudioExtractor(output_dir="output/japanese")
    
    # 日语学习视频URL示例
    url = "https://www.bilibili.com/video/BV1xx411c7mu"
    
    try:
        # 下载视频
        video_path, video_info = extractor.download_video(url)
        
        # 提取音频片段
        audio_path = extractor.extract_audio_segment(
            video_path=video_path,
            start_time=60,    # 使用秒数格式
            end_time=120,     # 60秒到120秒
            output_name="japanese_lesson.wav"
        )
        
        # 使用日语语言模式生成字幕
        subtitle_path, subtitle_text = extractor.generate_subtitle_with_ai(
            audio_path=audio_path,
            language="ja"  # 指定日语
        )
        
        print(f"日语字幕内容预览: {subtitle_text[:200]}...")
        
        # 同时生成中文字幕（翻译）
        subtitle_path_zh, subtitle_text_zh = extractor.generate_subtitle_with_ai(
            audio_path=audio_path,
            language="zh"  # 中文翻译
        )
        
        # 重命名中文字幕文件
        zh_subtitle_path = audio_path.with_name(audio_path.stem + "_zh.srt")
        subtitle_path_zh.rename(zh_subtitle_path)
        
        print(f"中文翻译预览: {subtitle_text_zh[:200]}...")
        
        return {
            'audio_path': str(audio_path),
            'japanese_subtitle': str(subtitle_path),
            'chinese_subtitle': str(zh_subtitle_path),
            'japanese_text': subtitle_text,
            'chinese_text': subtitle_text_zh
        }
        
    except Exception as e:
        print(f"处理日语内容时出错: {e}")
        return None

def example_4_with_original_subtitle():
    """使用B站原生字幕示例"""
    print("=== 使用B站原生字幕示例 ===")
    
    extractor = BilibiliAudioExtractor(output_dir="output/original")
    
    url = "https://www.bilibili.com/video/BV1xx411c7mu"
    
    try:
        # 优先使用B站原生字幕
        result = extractor.extract_segment_with_subtitle(
            url=url,
            start_time="00:02:00",
            end_time="00:03:00",
            use_ai_subtitle=False  # 优先使用原生字幕
        )
        
        print("提取结果:", result)
        return result
        
    except Exception as e:
        print(f"使用原生字幕时出错: {e}")
        return None

def example_5_integration_with_database():
    """与数据库集成示例"""
    print("=== 与数据库集成示例 ===")
    
    import json
    import sqlite3
    from datetime import datetime
    
    # 创建简单的SQLite数据库来存储提取结果
    conn = sqlite3.connect('bilibili_extracts.db')
    cursor = conn.cursor()
    
    # 创建表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS video_extracts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_url TEXT,
            video_title TEXT,
            start_time TEXT,
            end_time TEXT,
            audio_path TEXT,
            subtitle_path TEXT,
            subtitle_text TEXT,
            created_at TIMESTAMP,
            tags TEXT
        )
    ''')
    
    extractor = BilibiliAudioExtractor(output_dir="output/database")
    
    # 要处理的视频信息
    videos_to_process = [
        {
            "url": "https://www.bilibili.com/video/BV1xx411c7mu",
            "segments": [
                {"start": "00:01:00", "end": "00:02:00", "tags": ["intro", "greeting"]},
                {"start": "00:05:00", "end": "00:06:00", "tags": ["main_content", "explanation"]},
            ]
        }
    ]
    
    for video_info in videos_to_process:
        url = video_info["url"]
        
        try:
            # 下载视频信息
            video_path, video_meta = extractor.download_video(url)
            
            for segment in video_info["segments"]:
                print(f"处理片段: {segment['start']} - {segment['end']}")
                
                # 提取音频和字幕
                result = extractor.extract_segment_with_subtitle(
                    url=url,
                    start_time=segment['start'],
                    end_time=segment['end'],
                    use_ai_subtitle=True
                )
                
                # 保存到数据库
                cursor.execute('''
                    INSERT INTO video_extracts 
                    (video_url, video_title, start_time, end_time, audio_path, 
                     subtitle_path, subtitle_text, created_at, tags)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    url,
                    result['video_info']['title'],
                    segment['start'],
                    segment['end'],
                    result['audio_path'],
                    result['subtitle_path'],
                    result['subtitle_text'],
                    datetime.now(),
                    json.dumps(segment['tags'])
                ))
                
                conn.commit()
                print(f"已保存到数据库: {result['audio_path']}")
                
        except Exception as e:
            print(f"处理视频 {url} 时出错: {e}")
    
    # 查询数据库
    cursor.execute('SELECT COUNT(*) FROM video_extracts')
    count = cursor.fetchone()[0]
    print(f"\n数据库中共有 {count} 条提取记录")
    
    # 显示最近的记录
    cursor.execute('''
        SELECT video_title, start_time, end_time, audio_path, created_at 
        FROM video_extracts 
        ORDER BY created_at DESC 
        LIMIT 5
    ''')
    
    print("\n最近的提取记录:")
    for row in cursor.fetchall():
        print(f"  {row[0]} ({row[1]}-{row[2]}) -> {row[3]}")
    
    conn.close()

def main():
    """运行所有示例"""
    print("🎬 B站视频音频和字幕提取工具示例\n")
    
    try:
        # 运行各种示例
        example_1_basic_usage()
        print("\n" + "="*50 + "\n")
        
        example_2_multiple_segments()
        print("\n" + "="*50 + "\n")
        
        example_3_japanese_content()
        print("\n" + "="*50 + "\n")
        
        example_4_with_original_subtitle()
        print("\n" + "="*50 + "\n")
        
        example_5_integration_with_database()
        
        print("\n🎉 所有示例运行完成！")
        
    except Exception as e:
        print(f"❌ 运行示例时出错: {e}")

if __name__ == "__main__":
    main() 