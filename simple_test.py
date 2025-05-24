import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

print("开始测试NHK抓取...")

try:
    response = requests.get('https://www3.nhk.or.jp/news/easy/', timeout=30)
    print(f"状态码: {response.status_code}")
    
    soup = BeautifulSoup(response.content, 'html.parser')
    
    links = []
    for link in soup.find_all('a', href=True):
        href = link.get('href')
        if href and '/news/easy/article/' in href:
            full_url = urljoin('https://www3.nhk.or.jp/news/easy/', href)
            links.append(full_url)
    
    print(f"找到 {len(links)} 个文章链接")
    
    if len(links) > 0:
        print("前3个链接:")
        for i, link in enumerate(links[:3]):
            print(f"  {i+1}. {link}")
        
        # 测试抓取第一篇文章
        test_url = links[0]
        print(f"\n测试抓取: {test_url}")
        
        article_response = requests.get(test_url, timeout=30)
        article_soup = BeautifulSoup(article_response.content, 'html.parser')
        
        title = article_soup.find('title')
        title_text = title.get_text(strip=True) if title else "未知标题"
        
        body = article_soup.find('body')
        content = body.get_text(strip=True) if body else ""
        
        print(f"标题: {title_text}")
        print(f"内容长度: {len(content)} 字符")
        print(f"内容预览: {content[:200]}...")
        
        if len(content) > 100:
            print("✅ 抓取成功！")
        else:
            print("❌ 内容太少")
    else:
        print("❌ 没有找到文章链接")
        
except Exception as e:
    print(f"❌ 错误: {e}")

print("\n检查数据库...")
try:
    import mysql.connector
    import os
    from dotenv import load_dotenv
    
    load_dotenv('backend/.env')
    
    config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'database': os.getenv('DB_DATABASE', '90nihongo'),
        'user': os.getenv('DB_USERNAME', 'root'),
        'password': os.getenv('DB_PASSWORD', ''),
        'charset': 'utf8mb4'
    }
    
    connection = mysql.connector.connect(**config)
    cursor = connection.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM import_tasks WHERE status = 'completed'")
    completed_tasks = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM resource_items")
    resource_count = cursor.fetchone()[0]
    
    print(f"已完成任务: {completed_tasks} 个")
    print(f"资源总数: {resource_count} 个")
    
    if resource_count == 0:
        print("❌ 数据库中没有资源内容！")
    else:
        cursor.execute("SELECT name, LENGTH(content) as content_length FROM resource_items ORDER BY created_at DESC LIMIT 3")
        resources = cursor.fetchall()
        print("最新资源:")
        for name, length in resources:
            print(f"  - {name} ({length} 字符)")
    
    cursor.close()
    connection.close()
    print("✅ 数据库连接成功")
    
except Exception as e:
    print(f"❌ 数据库错误: {e}") 