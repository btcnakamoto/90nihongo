#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
B站视频信息获取脚本
仅获取视频基本信息，不进行下载
"""

import sys
import json
import requests
import re
from urllib.parse import urlparse

def extract_bv_id(url):
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

def get_video_info(url):
    """获取视频信息"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
    }
    
    try:
        video_id = extract_bv_id(url)
        
        if video_id.startswith('BV'):
            api_url = f"https://api.bilibili.com/x/web-interface/view?bvid={video_id}"
        else:
            aid = video_id.replace('av', '')
            api_url = f"https://api.bilibili.com/x/web-interface/view?aid={aid}"
        
        response = requests.get(api_url, headers=headers, timeout=10)
        data = response.json()
        
        if data['code'] == 0:
            video_info = data['data']
            return {
                'success': True,
                'title': video_info['title'],
                'duration': video_info['duration'],
                'bvid': video_info['bvid'],
                'aid': video_info['aid'],
                'description': video_info['desc'][:200] + '...' if len(video_info['desc']) > 200 else video_info['desc'],
                'owner': video_info['owner']['name'],
                'cid': video_info['cid'],
                'pic': video_info['pic'],
                'pubdate': video_info['pubdate'],
                'view': video_info['stat']['view'],
                'danmaku': video_info['stat']['danmaku'],
                'reply': video_info['stat']['reply'],
                'favorite': video_info['stat']['favorite'],
                'coin': video_info['stat']['coin'],
                'share': video_info['stat']['share'],
                'like': video_info['stat']['like']
            }
        else:
            return {
                'success': False,
                'error': f"获取视频信息失败: {data['message']}"
            }
            
    except requests.RequestException as e:
        return {
            'success': False,
            'error': f"网络请求失败: {str(e)}"
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"获取视频信息时出错: {str(e)}"
        }

def main():
    if len(sys.argv) != 2:
        print(json.dumps({
            'success': False,
            'error': '请提供视频URL参数'
        }, ensure_ascii=False))
        sys.exit(1)
    
    url = sys.argv[1]
    
    try:
        result = get_video_info(url)
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main() 