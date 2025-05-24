#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
B站视频音频和字幕提取工具
支持下载视频、提取指定片段音频、生成/获取字幕
"""

import os
import re
import json
import requests
import subprocess
import whisper
from pathlib import Path
from datetime import datetime, timedelta
import yt_dlp
from pydub import AudioSegment
import argparse

class BilibiliAudioExtractor:
    def __init__(self, output_dir="downloads"):
        """
        初始化B站音频提取器
        
        Args:
            output_dir: 输出目录
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # 初始化Whisper模型（用于AI字幕生成）
        print("正在加载Whisper AI模型...")
        self.whisper_model = whisper.load_model("base")
        
        # B站API相关配置
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://www.bilibili.com'
        }

    def extract_bv_id(self, url):
        """从B站URL中提取BV号"""
        patterns = [
            r'BV[0-9A-Za-z]{10}',
            r'av(\d+)',
            r'/video/([^/?]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(0) if pattern.startswith('BV') else f"av{match.group(1)}"
        
        raise ValueError("无法从URL中提取视频ID")

    def get_video_info(self, video_id):
        """获取视频信息"""
        if video_id.startswith('BV'):
            api_url = f"https://api.bilibili.com/x/web-interface/view?bvid={video_id}"
        else:
            aid = video_id.replace('av', '')
            api_url = f"https://api.bilibili.com/x/web-interface/view?aid={aid}"
        
        try:
            response = requests.get(api_url, headers=self.headers)
            data = response.json()
            
            if data['code'] == 0:
                video_info = data['data']
                return {
                    'title': video_info['title'],
                    'duration': video_info['duration'],
                    'bvid': video_info['bvid'],
                    'aid': video_info['aid'],
                    'description': video_info['desc'],
                    'owner': video_info['owner']['name'],
                    'cid': video_info['cid']  # 用于获取字幕
                }
            else:
                raise Exception(f"获取视频信息失败: {data['message']}")
                
        except Exception as e:
            print(f"获取视频信息时出错: {e}")
            return None

    def get_subtitle_from_bilibili(self, video_info):
        """尝试获取B站原生字幕"""
        try:
            # 获取字幕列表
            subtitle_api = f"https://api.bilibili.com/x/player/v2?cid={video_info['cid']}&aid={video_info['aid']}"
            response = requests.get(subtitle_api, headers=self.headers)
            data = response.json()
            
            if data['code'] == 0 and 'subtitle' in data['data']:
                subtitles = data['data']['subtitle']['subtitles']
                
                if subtitles:
                    # 下载第一个可用字幕（通常是中文）
                    subtitle_url = "https:" + subtitles[0]['subtitle_url']
                    subtitle_response = requests.get(subtitle_url, headers=self.headers)
                    subtitle_data = subtitle_response.json()
                    
                    # 转换为SRT格式
                    srt_content = self.convert_to_srt(subtitle_data['body'])
                    return srt_content
                    
        except Exception as e:
            print(f"获取B站字幕失败: {e}")
        
        return None

    def convert_to_srt(self, subtitle_data):
        """将B站字幕格式转换为SRT格式"""
        srt_content = ""
        
        for i, item in enumerate(subtitle_data, 1):
            start_time = self.seconds_to_srt_time(item['from'])
            end_time = self.seconds_to_srt_time(item['to'])
            text = item['content']
            
            srt_content += f"{i}\n{start_time} --> {end_time}\n{text}\n\n"
        
        return srt_content

    def seconds_to_srt_time(self, seconds):
        """将秒数转换为SRT时间格式"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        milliseconds = int((seconds % 1) * 1000)
        
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{milliseconds:03d}"

    def download_video(self, url, quality="best"):
        """
        下载B站视频
        
        Args:
            url: B站视频URL
            quality: 视频质量 (best/worst/720p等)
        """
        video_id = self.extract_bv_id(url)
        video_info = self.get_video_info(video_id)
        
        if not video_info:
            raise Exception("无法获取视频信息")
        
        print(f"正在下载视频: {video_info['title']}")
        
        # 设置yt-dlp选项
        ydl_opts = {
            'outtmpl': str(self.output_dir / f"{video_id}_%(title)s.%(ext)s"),
            'format': quality,
            'writesubtitles': True,
            'writeautomaticsub': True,
            'subtitleslangs': ['zh-Hans', 'zh-Hant', 'zh'],
        }
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
                
            # 查找下载的文件
            video_files = list(self.output_dir.glob(f"{video_id}_*.mp4"))
            if not video_files:
                video_files = list(self.output_dir.glob(f"{video_id}_*.mkv"))
            
            if video_files:
                video_path = video_files[0]
                print(f"视频下载完成: {video_path}")
                return video_path, video_info
            else:
                raise Exception("找不到下载的视频文件")
                
        except Exception as e:
            print(f"下载失败: {e}")
            raise

    def extract_audio_segment(self, video_path, start_time, end_time, output_name=None):
        """
        从视频中提取指定时间段的音频
        
        Args:
            video_path: 视频文件路径
            start_time: 开始时间 (格式: "00:01:30" 或秒数)
            end_time: 结束时间 (格式: "00:02:30" 或秒数)
            output_name: 输出文件名
        """
        if output_name is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_name = f"audio_segment_{timestamp}.wav"
        
        audio_path = self.output_dir / output_name
        
        # 转换时间格式
        if isinstance(start_time, (int, float)):
            start_time = str(timedelta(seconds=start_time))
        if isinstance(end_time, (int, float)):
            end_time = str(timedelta(seconds=end_time))
        
        # 使用ffmpeg提取音频片段
        cmd = [
            'ffmpeg',
            '-i', str(video_path),
            '-ss', start_time,
            '-to', end_time,
            '-vn',  # 不要视频
            '-acodec', 'pcm_s16le',  # PCM格式
            '-ar', '16000',  # 16kHz采样率（适合Whisper）
            '-ac', '1',  # 单声道
            '-y',  # 覆盖输出文件
            str(audio_path)
        ]
        
        try:
            print(f"正在提取音频片段: {start_time} - {end_time}")
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            print(f"音频提取完成: {audio_path}")
            return audio_path
            
        except subprocess.CalledProcessError as e:
            print(f"音频提取失败: {e}")
            print(f"错误输出: {e.stderr}")
            raise

    def generate_subtitle_with_ai(self, audio_path, language="zh"):
        """
        使用Whisper AI生成字幕
        
        Args:
            audio_path: 音频文件路径
            language: 语言代码 (zh/en等)
        """
        print("正在使用AI生成字幕...")
        
        try:
            # 使用Whisper转录
            result = self.whisper_model.transcribe(
                str(audio_path),
                language=language,
                word_timestamps=True
            )
            
            # 生成SRT字幕
            srt_content = ""
            for i, segment in enumerate(result['segments'], 1):
                start_time = self.seconds_to_srt_time(segment['start'])
                end_time = self.seconds_to_srt_time(segment['end'])
                text = segment['text'].strip()
                
                srt_content += f"{i}\n{start_time} --> {end_time}\n{text}\n\n"
            
            # 保存字幕文件
            subtitle_path = audio_path.with_suffix('.srt')
            with open(subtitle_path, 'w', encoding='utf-8') as f:
                f.write(srt_content)
            
            print(f"AI字幕生成完成: {subtitle_path}")
            return subtitle_path, result['text']
            
        except Exception as e:
            print(f"AI字幕生成失败: {e}")
            raise

    def extract_segment_with_subtitle(self, url, start_time, end_time, use_ai_subtitle=True):
        """
        完整流程：下载视频、提取音频片段、生成字幕
        
        Args:
            url: B站视频URL
            start_time: 开始时间
            end_time: 结束时间
            use_ai_subtitle: 是否使用AI生成字幕
        """
        try:
            # 1. 下载视频
            video_path, video_info = self.download_video(url)
            
            # 2. 提取音频片段
            audio_path = self.extract_audio_segment(video_path, start_time, end_time)
            
            # 3. 获取/生成字幕
            subtitle_path = None
            subtitle_text = ""
            
            if use_ai_subtitle:
                # 使用AI生成字幕
                subtitle_path, subtitle_text = self.generate_subtitle_with_ai(audio_path)
            else:
                # 尝试获取B站原生字幕
                original_subtitle = self.get_subtitle_from_bilibili(video_info)
                if original_subtitle:
                    subtitle_path = audio_path.with_suffix('.srt')
                    with open(subtitle_path, 'w', encoding='utf-8') as f:
                        f.write(original_subtitle)
                    subtitle_text = "B站原生字幕"
                    print(f"B站字幕获取完成: {subtitle_path}")
                else:
                    print("未找到B站原生字幕，将使用AI生成...")
                    subtitle_path, subtitle_text = self.generate_subtitle_with_ai(audio_path)
            
            # 4. 生成结果报告
            result = {
                'video_info': video_info,
                'audio_path': str(audio_path),
                'subtitle_path': str(subtitle_path) if subtitle_path else None,
                'subtitle_text': subtitle_text,
                'start_time': start_time,
                'end_time': end_time,
                'duration': f"{end_time} - {start_time}"
            }
            
            # 保存结果信息
            result_path = audio_path.with_suffix('.json')
            with open(result_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            
            print(f"\n✅ 提取完成！")
            print(f"📹 视频: {video_info['title']}")
            print(f"🎵 音频: {audio_path}")
            print(f"📝 字幕: {subtitle_path}")
            print(f"📊 结果: {result_path}")
            
            return result
            
        except Exception as e:
            print(f"❌ 提取过程中出错: {e}")
            raise

def main():
    """命令行接口"""
    parser = argparse.ArgumentParser(description='B站视频音频和字幕提取工具')
    parser.add_argument('url', help='B站视频URL')
    parser.add_argument('--start', required=True, help='开始时间 (格式: 00:01:30 或秒数)')
    parser.add_argument('--end', required=True, help='结束时间 (格式: 00:02:30 或秒数)')
    parser.add_argument('--output-dir', default='downloads', help='输出目录')
    parser.add_argument('--ai-subtitle', action='store_true', help='强制使用AI生成字幕')
    parser.add_argument('--quality', default='best', help='视频质量')
    
    args = parser.parse_args()
    
    # 创建提取器
    extractor = BilibiliAudioExtractor(args.output_dir)
    
    # 执行提取
    try:
        result = extractor.extract_segment_with_subtitle(
            url=args.url,
            start_time=args.start,
            end_time=args.end,
            use_ai_subtitle=args.ai_subtitle
        )
        print("\n🎉 任务完成!")
        
    except Exception as e:
        print(f"\n💥 任务失败: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 