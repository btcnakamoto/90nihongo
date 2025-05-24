#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试网页抓取功能
"""

import json
import tempfile
from web_scraper import JapaneseWebScraper

def test_scraper():
    """测试抓取器功能"""
    
    # 模拟配置
    config = {
        'task_id': 1,
        'urls': [
            'https://www3.nhk.or.jp/news/easy/',
            # 可以添加更多测试URL
        ],
        'max_pages': 2,
        'content_type': 'course',
        'delay_ms': 1000,
        'include_images': False,  # 测试时不下载图片
        'include_audio': False,   # 测试时不下载音频
        'database_config': {
            'host': 'localhost',
            'database': 'test_db',
            'username': 'test_user',
            'password': 'test_pass'
        }
    }
    
    print("🚀 开始测试网页抓取功能...")
    
    try:
        # 创建抓取器实例
        scraper = JapaneseWebScraper(config)
        
        # 测试单个URL内容提取
        test_url = 'https://www3.nhk.or.jp/news/easy/'
        print(f"📰 测试URL: {test_url}")
        
        content = scraper.extract_content(test_url)
        
        if content:
            print("✅ 内容提取成功!")
            print(f"📝 标题: {content['title'][:50]}...")
            print(f"📄 内容长度: {len(content['content'])} 字符")
            print(f"🖼️ 图片数量: {len(content['images'])}")
            print(f"🔊 音频数量: {len(content['audio'])}")
            print(f"📊 元数据: {content['metadata']}")
            
            # 保存测试结果
            with open('test_result.json', 'w', encoding='utf-8') as f:
                json.dump(content, f, ensure_ascii=False, indent=2)
            print("📁 测试结果已保存到 test_result.json")
            
        else:
            print("❌ 内容提取失败")
            
    except Exception as e:
        print(f"❌ 测试失败: {e}")

if __name__ == "__main__":
    test_scraper() 