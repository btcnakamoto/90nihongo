import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

print("🔍 分析NHK Easy News网站结构...")

try:
    response = requests.get('https://www3.nhk.or.jp/news/easy/', timeout=30)
    print(f"状态码: {response.status_code}")
    
    soup = BeautifulSoup(response.content, 'html.parser')
    
    print("\n📋 页面中的所有链接类型:")
    all_links = soup.find_all('a', href=True)
    link_patterns = {}
    
    for link in all_links:
        href = link.get('href')
        if href:
            # 分析链接模式
            if '/news/easy/' in href:
                pattern = href.split('/news/easy/')[-1].split('/')[0] if '/' in href.split('/news/easy/')[-1] else href.split('/news/easy/')[-1]
                if pattern not in link_patterns:
                    link_patterns[pattern] = []
                link_patterns[pattern].append(href)
    
    print("发现的链接模式:")
    for pattern, links in link_patterns.items():
        print(f"  {pattern}: {len(links)} 个链接")
        if len(links) <= 3:
            for link in links:
                print(f"    - {link}")
        else:
            for link in links[:3]:
                print(f"    - {link}")
            print(f"    ... 还有 {len(links)-3} 个")
    
    print("\n🔍 查找可能的文章链接:")
    
    # 尝试不同的文章链接模式
    patterns_to_check = [
        '/news/easy/article/',
        '/news/easy/k10',
        '/easy/',
        'article',
        'k10'
    ]
    
    for pattern in patterns_to_check:
        matching_links = []
        for link in all_links:
            href = link.get('href')
            if href and pattern in href:
                full_url = urljoin('https://www3.nhk.or.jp/news/easy/', href)
                matching_links.append(full_url)
        
        if matching_links:
            print(f"\n模式 '{pattern}' 找到 {len(matching_links)} 个链接:")
            for i, link in enumerate(matching_links[:5]):
                print(f"  {i+1}. {link}")
            if len(matching_links) > 5:
                print(f"  ... 还有 {len(matching_links)-5} 个")
    
    print("\n📄 页面标题和主要内容:")
    title = soup.find('title')
    if title:
        print(f"页面标题: {title.get_text(strip=True)}")
    
    # 查找主要内容区域
    main_content = soup.find('main') or soup.find('div', class_='main') or soup.find('div', id='main')
    if main_content:
        print(f"主要内容区域长度: {len(main_content.get_text(strip=True))} 字符")
        
        # 在主要内容中查找链接
        main_links = main_content.find_all('a', href=True)
        print(f"主要内容中的链接数量: {len(main_links)}")
        
        article_links_in_main = []
        for link in main_links:
            href = link.get('href')
            text = link.get_text(strip=True)
            if href and ('article' in href or 'k10' in href or len(text) > 10):
                article_links_in_main.append((href, text[:50]))
        
        if article_links_in_main:
            print("主要内容中可能的文章链接:")
            for href, text in article_links_in_main[:10]:
                print(f"  - {href} -> {text}")
    
    print("\n🏷️  查找具有特定class或id的元素:")
    
    # 查找可能包含文章列表的元素
    potential_containers = [
        soup.find_all('div', class_=lambda x: x and ('article' in x.lower() or 'news' in x.lower() or 'list' in x.lower())),
        soup.find_all('ul', class_=lambda x: x and ('article' in x.lower() or 'news' in x.lower() or 'list' in x.lower())),
        soup.find_all('section', class_=lambda x: x and ('article' in x.lower() or 'news' in x.lower() or 'list' in x.lower()))
    ]
    
    for container_type, containers in zip(['div', 'ul', 'section'], potential_containers):
        if containers:
            print(f"\n{container_type} 容器:")
            for container in containers[:3]:
                class_name = container.get('class', [])
                id_name = container.get('id', '')
                links_in_container = container.find_all('a', href=True)
                print(f"  class='{class_name}' id='{id_name}' - {len(links_in_container)} 个链接")
                
                for link in links_in_container[:3]:
                    href = link.get('href')
                    text = link.get_text(strip=True)[:30]
                    print(f"    - {href} -> {text}")

except Exception as e:
    print(f"❌ 错误: {e}")
    import traceback
    traceback.print_exc() 