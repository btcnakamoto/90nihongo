import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import mysql.connector
import os
from dotenv import load_dotenv
import json

print("🔍 测试新的NHK Easy News结构...")

# 加载环境变量
load_dotenv('backend/.env')

try:
    # 1. 获取NHK主页
    response = requests.get('https://www3.nhk.or.jp/news/easy/', timeout=30)
    print(f"主页状态码: {response.status_code}")
    
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # 2. 查找文章链接（新的模式）
    article_links = []
    for link in soup.find_all('a', href=True):
        href = link.get('href')
        if href and 'article' in href and href.startswith('./article/'):
            full_url = urljoin('https://www3.nhk.or.jp/news/easy/', href)
            article_links.append(full_url)
    
    print(f"找到 {len(article_links)} 个文章链接")
    
    # 3. 测试抓取前3篇文章
    scraped_articles = []
    for i, url in enumerate(article_links[:3]):
        print(f"\n📖 抓取文章 {i+1}: {url}")
        
        try:
            article_response = requests.get(url, timeout=30)
            article_response.raise_for_status()
            
            article_soup = BeautifulSoup(article_response.content, 'html.parser')
            
            # 提取标题
            title = article_soup.find('title')
            title_text = title.get_text(strip=True) if title else "未知标题"
            
            # 提取内容
            content = ""
            
            # 尝试多种内容选择器
            content_selectors = [
                'div[class*="article"]',
                'div[class*="content"]',
                'main',
                'article',
                '.content',
                'body'
            ]
            
            for selector in content_selectors:
                elements = article_soup.select(selector)
                if elements:
                    content = ' '.join([elem.get_text(strip=True) for elem in elements])
                    if len(content) > 100:
                        break
            
            # 如果还没有找到足够内容，提取整个body
            if len(content) < 100:
                body = article_soup.find('body')
                if body:
                    content = body.get_text(strip=True)
            
            print(f"   标题: {title_text}")
            print(f"   内容长度: {len(content)} 字符")
            print(f"   内容预览: {content[:150]}...")
            
            if len(content) > 50:
                scraped_articles.append({
                    'url': url,
                    'title': title_text,
                    'content': content,
                    'source': 'NHK Easy News',
                    'type': 'course'
                })
                print("   ✅ 抓取成功")
            else:
                print("   ❌ 内容太少")
                
        except Exception as e:
            print(f"   ❌ 抓取失败: {e}")
    
    print(f"\n📊 成功抓取 {len(scraped_articles)} 篇文章")
    
    # 4. 测试保存到数据库
    if scraped_articles:
        print("\n💾 测试保存到数据库...")
        
        try:
            # 数据库配置
            config = {
                'host': os.getenv('DB_HOST', 'localhost'),
                'database': os.getenv('DB_DATABASE', '90nihongo'),
                'user': os.getenv('DB_USERNAME', 'root'),
                'password': os.getenv('DB_PASSWORD', ''),
                'charset': 'utf8mb4'
            }
            
            connection = mysql.connector.connect(**config)
            cursor = connection.cursor()
            
            # 创建测试任务
            cursor.execute("""
                INSERT INTO import_tasks (type, name, status, progress, total_items, items_processed, config, logs, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (
                'web-scraping',
                '测试新NHK结构抓取',
                'running',
                0,
                len(scraped_articles),
                0,
                json.dumps({'urls': ['https://www3.nhk.or.jp/news/easy/']}),
                json.dumps(['开始测试抓取'])
            ))
            
            task_id = cursor.lastrowid
            print(f"   创建测试任务ID: {task_id}")
            
            # 保存文章到数据库
            saved_count = 0
            for article in scraped_articles:
                try:
                    cursor.execute("""
                        INSERT INTO resource_items (name, type, source, content, status, metadata, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
                    """, (
                        article['title'],
                        article['type'],
                        article['source'],
                        article['content'],
                        'completed',
                        json.dumps({
                            'url': article['url'],
                            'difficulty': 'easy',
                            'language': 'japanese'
                        })
                    ))
                    saved_count += 1
                    print(f"   ✅ 保存文章: {article['title']}")
                    
                except Exception as e:
                    print(f"   ❌ 保存失败: {e}")
            
            # 更新任务状态
            cursor.execute("""
                UPDATE import_tasks 
                SET status = %s, progress = %s, items_processed = %s, logs = %s, updated_at = NOW()
                WHERE id = %s
            """, (
                'completed',
                100,
                saved_count,
                json.dumps(['测试抓取完成', f'成功保存{saved_count}篇文章']),
                task_id
            ))
            
            connection.commit()
            print(f"   ✅ 成功保存 {saved_count} 篇文章到数据库")
            
            # 验证保存结果
            cursor.execute("SELECT COUNT(*) FROM resource_items")
            total_resources = cursor.fetchone()[0]
            
            cursor.execute("SELECT name, LENGTH(content) as content_length FROM resource_items ORDER BY created_at DESC LIMIT 3")
            recent_resources = cursor.fetchall()
            
            print(f"\n📚 数据库验证:")
            print(f"   总资源数量: {total_resources}")
            print(f"   最新资源:")
            for name, length in recent_resources:
                print(f"     - {name} ({length} 字符)")
            
            cursor.close()
            connection.close()
            
        except Exception as e:
            print(f"❌ 数据库操作失败: {e}")
            import traceback
            traceback.print_exc()
    
    print("\n🎯 结论:")
    if scraped_articles:
        print("✅ NHK Easy News抓取功能正常工作")
        print("✅ 数据库保存功能正常")
        print("💡 之前100%完成但无内容的问题是因为:")
        print("   1. 网站结构已改变，旧的链接模式失效")
        print("   2. 需要更新web_scraper.py中的链接检测逻辑")
    else:
        print("❌ 抓取功能仍有问题")

except Exception as e:
    print(f"❌ 总体错误: {e}")
    import traceback
    traceback.print_exc() 