#!/usr/bin/env python3
"""
90天日语学习平台 - 快速开始脚本
演示如何快速获取NHK Easy Japanese内容并导入
"""

import asyncio
import aiohttp
import feedparser
from pathlib import Path
import json
import re
from datetime import datetime
import sys

def print_banner():
    """打印启动横幅"""
    print("🎌" * 20)
    print("90天日语学习平台 - 内容获取工具")
    print("快速开始脚本 v1.0")
    print("🎌" * 20)
    print()

def check_dependencies():
    """检查依赖是否安装"""
    required_packages = ['aiohttp', 'feedparser']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ 缺少必要的依赖包:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n请运行以下命令安装依赖:")
        print("pip install aiohttp feedparser beautifulsoup4 requests aiofiles")
        return False
    
    print("✅ 所有依赖已安装")
    return True

async def get_nhk_articles(limit=5):
    """快速获取NHK Easy文章列表"""
    print(f"📰 正在获取NHK Easy文章 (限制: {limit}篇)...")
    
    rss_url = "https://www3.nhk.or.jp/news/easy/rss/rss.xml"
    
    try:
        # 获取RSS feed
        feed = feedparser.parse(rss_url)
        
        if not feed.entries:
            print("❌ 无法获取NHK RSS内容")
            return []
        
        articles = []
        for i, entry in enumerate(feed.entries[:limit]):
            article = {
                'title': entry.title,
                'url': entry.link,
                'published': entry.get('published', ''),
                'summary': entry.get('summary', '')[:100] + '...'
            }
            articles.append(article)
            print(f"   {i+1}. {article['title']}")
        
        print(f"✅ 成功获取 {len(articles)} 篇文章")
        return articles
        
    except Exception as e:
        print(f"❌ 获取NHK文章失败: {e}")
        return []

async def simulate_content_download(articles):
    """模拟下载内容(实际项目中会真实下载)"""
    print("\n🔄 模拟内容下载过程...")
    
    downloaded_content = []
    
    for i, article in enumerate(articles, 1):
        print(f"   下载中 [{i}/{len(articles)}]: {article['title'][:30]}...")
        
        # 模拟下载延迟
        await asyncio.sleep(0.5)
        
        # 模拟生成内容
        content = {
            'id': i,
            'title': article['title'],
            'content': f"这是第{i}篇文章的内容摘要。" + article['summary'],
            'url': article['url'],
            'audio_available': True,  # 模拟音频可用
            'difficulty': 'beginner' if i <= 2 else 'intermediate',
            'word_count': len(article['summary'].split()) * 10,  # 估算
            'download_time': datetime.now().isoformat()
        }
        downloaded_content.append(content)
    
    print("✅ 内容下载完成")
    return downloaded_content

def generate_csv_sample(content):
    """生成CSV示例内容"""
    print("\n📊 生成CSV导入文件...")
    
    # 课程CSV内容
    courses_csv = "title,description,day_number,difficulty,tags,is_active,content\n"
    
    for item in content:
        # 清理内容中的逗号和引号
        clean_title = item['title'].replace('"', '""').replace(',', '，')
        clean_content = item['content'].replace('"', '""').replace(',', '，')
        
        courses_csv += f'"{clean_title}","第{item["id"]}天课程内容",{item["id"]},"{item["difficulty"]}","[""日语学习"",""NHK新闻""]",true,"{clean_content}"\n'
    
    # 保存文件
    output_dir = Path("sample_import")
    output_dir.mkdir(exist_ok=True)
    
    courses_file = output_dir / "courses.csv"
    with open(courses_file, 'w', encoding='utf-8') as f:
        f.write(courses_csv)
    
    print(f"✅ CSV文件已生成: {courses_file}")
    return courses_file

def generate_report(content, csv_file):
    """生成报告"""
    print("\n📋 生成获取报告...")
    
    report = {
        'timestamp': datetime.now().isoformat(),
        'source': 'NHK Easy Japanese',
        'total_articles': len(content),
        'csv_file': str(csv_file),
        'articles': content,
        'next_steps': [
            "1. 使用网站的批量导入功能上传 " + str(csv_file),
            "2. 在音频管理中上传对应的音频文件",
            "3. 使用智能关联功能关联音频与内容",
            "4. 测试学习效果并调整内容"
        ]
    }
    
    report_file = Path("sample_import") / "report.json"
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 报告已生成: {report_file}")
    return report

def print_summary(report):
    """打印总结"""
    print("\n" + "🎉" * 20)
    print("获取完成! 总结如下:")
    print("🎉" * 20)
    print(f"📊 获取文章数: {report['total_articles']}")
    print(f"📁 CSV文件: {report['csv_file']}")
    print(f"⏰ 处理时间: {report['timestamp']}")
    print("\n📋 下一步操作:")
    for i, step in enumerate(report['next_steps'], 1):
        print(f"   {i}. {step}")
    
    print("\n💡 提示:")
    print("   - 这是演示版本，实际版本会下载完整的文本和音频")
    print("   - 可以在网站管理后台使用批量导入功能导入CSV文件")
    print("   - 建议先小规模测试，确认效果后再大规模导入")

async def main():
    """主函数"""
    print_banner()
    
    # 检查依赖
    if not check_dependencies():
        return 1
    
    try:
        # 获取文章列表
        articles = await get_nhk_articles(limit=5)
        if not articles:
            print("❌ 无法获取文章，请检查网络连接")
            return 1
        
        # 模拟下载内容
        content = await simulate_content_download(articles)
        
        # 生成CSV文件
        csv_file = generate_csv_sample(content)
        
        # 生成报告
        report = generate_report(content, csv_file)
        
        # 打印总结
        print_summary(report)
        
        print("\n🚀 快速开始演示完成!")
        print("   现在您可以使用完整版的爬虫工具获取更多内容")
        
        return 0
        
    except KeyboardInterrupt:
        print("\n\n⏸️  用户中断操作")
        return 1
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
        return 1

if __name__ == "__main__":
    if sys.platform.startswith('win'):
        # Windows下设置事件循环策略
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    
    try:
        result = asyncio.run(main())
        sys.exit(result)
    except Exception as e:
        print(f"程序执行失败: {e}")
        sys.exit(1) 