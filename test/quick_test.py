#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
快速测试NHK Easy News抓取功能
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import json
import time

def test_nhk_scraping():
    print("🔍 快速测试NHK Easy News抓取...")
    
    # 测试主页访问
    base_url = "https://www3.nhk.or.jp/news/easy/"
    
    try:
        print(f"📡 访问主页: {base_url}")
        response = requests.get(base_url, timeout=30)
        response.raise_for_status()
        print(f"✅ 主页访问成功，状态码: {response.status_code}")
        
        # 解析页面
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # 查找文章链接
        article_links = []
        for link in soup.find_all('a', href=True):
            href = link.get('href')
            if href and '/news/easy/article/' in href:
                full_url = urljoin(base_url, href)
                article_links.append(full_url)
        
        # 去重
        article_links = list(set(article_links))
        print(f"📰 找到 {len(article_links)} 个文章链接")
        
        if len(article_links) == 0:
            print("❌ 没有找到文章链接！检查网站结构...")
            # 输出页面中的所有链接进行调试
            print("🔍 页面中的所有链接:")
            all_links = soup.find_all('a', href=True)[:10]  # 只显示前10个
            for i, link in enumerate(all_links):
                href = link.get('href')
                text = link.get_text(strip=True)[:50]
                print(f"   {i+1}. {href} -> {text}")
            return False
        
        # 测试抓取第一篇文章
        test_url = article_links[0]
        print(f"📖 测试抓取文章: {test_url}")
        
        article_response = requests.get(test_url, timeout=30)
        article_response.raise_for_status()
        
        article_soup = BeautifulSoup(article_response.content, 'html.parser')
        
        # 提取标题
        title = article_soup.find('title')
        title_text = title.get_text(strip=True) if title else "未知标题"
        
        # 提取内容
        content = ""
        content_selectors = [
            'div[id*="article"]',
            'div[class*="article"]', 
            'div[class*="content"]',
            'main',
            'article',
            '.content'
        ]
        
        for selector in content_selectors:
            elements = article_soup.select(selector)
            if elements:
                content = ' '.join([elem.get_text(strip=True) for elem in elements])
                if len(content) > 100:
                    break
        
        # 如果还没有找到内容，提取body
        if len(content) < 50:
            body = article_soup.find('body')
            if body:
                content = body.get_text(strip=True)
        
        print(f"📝 文章标题: {title_text}")
        print(f"📄 内容长度: {len(content)} 字符")
        print(f"📄 内容预览: {content[:200]}...")
        
        if len(content) > 100:
            print("✅ 抓取测试成功！")
            return True
        else:
            print("❌ 抓取的内容太少，可能有问题")
            return False
            
    except Exception as e:
        print(f"❌ 抓取测试失败: {e}")
        return False

def test_database_connection():
    print("\n🔍 测试数据库连接...")
    try:
        import mysql.connector
        import os
        from dotenv import load_dotenv
        
        # 加载环境变量
        load_dotenv('backend/.env')
        
        # 数据库配置
        config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'database': os.getenv('DB_DATABASE', '90nihongo'),
            'user': os.getenv('DB_USERNAME', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'charset': 'utf8mb4'
        }
        
        print(f"📡 连接数据库: {config['host']}/{config['database']}")
        
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        # 检查任务表
        cursor.execute("SELECT COUNT(*) FROM import_tasks WHERE status = 'completed'")
        completed_tasks = cursor.fetchone()[0]
        
        # 检查资源表
        cursor.execute("SELECT COUNT(*) FROM resource_items")
        resource_count = cursor.fetchone()[0]
        
        print(f"📊 已完成任务: {completed_tasks} 个")
        print(f"📚 资源总数: {resource_count} 个")
        
        if resource_count == 0:
            print("❌ 数据库中没有资源内容！这解释了为什么任务完成但没有显示结果")
        else:
            # 显示最新资源
            cursor.execute("""
                SELECT name, LENGTH(content) as content_length, created_at 
                FROM resource_items 
                ORDER BY created_at DESC 
                LIMIT 3
            """)
            resources = cursor.fetchall()
            print("📖 最新资源:")
            for name, length, created_at in resources:
                print(f"   - {name} ({length} 字符) - {created_at}")
        
        cursor.close()
        connection.close()
        print("✅ 数据库连接测试成功")
        return True
        
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        return False

if __name__ == "__main__":
    print("🚀 开始快速诊断...")
    print("=" * 50)
    
    # 测试网站抓取
    scraping_ok = test_nhk_scraping()
    
    # 测试数据库
    db_ok = test_database_connection()
    
    print("\n" + "=" * 50)
    print("🎯 诊断结果:")
    
    if scraping_ok and db_ok:
        print("✅ 抓取功能正常，数据库连接正常")
        print("💡 问题可能在于:")
        print("   1. 队列工作进程没有运行")
        print("   2. Laravel任务调用Python脚本时出错")
        print("   3. 前端API没有正确读取数据")
    elif scraping_ok and not db_ok:
        print("⚠️  抓取功能正常但数据库有问题")
        print("💡 需要检查数据库配置和连接")
    elif not scraping_ok and db_ok:
        print("⚠️  数据库正常但抓取有问题")
        print("💡 需要检查网站结构变化或网络连接")
    else:
        print("❌ 抓取和数据库都有问题")
        print("💡 需要全面检查配置和环境") 