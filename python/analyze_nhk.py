#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
分析NHK Easy News页面结构
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def analyze_nhk_structure():
    """分析NHK Easy News的页面结构"""
    
    url = 'https://www3.nhk.or.jp/news/easy/'
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.5,en;q=0.3',
    })
    
    try:
        print(f"正在分析: {url}")
        response = session.get(url, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        print(f"页面标题: {soup.find('title').get_text()}")
        print("\n=== 页面结构分析 ===")
        
        # 分析所有链接
        all_links = soup.find_all('a', href=True)
        print(f"总链接数: {len(all_links)}")
        
        # 分析可能的文章链接
        article_patterns = [
            '/news/easy/k',
            '/easy/k',
            'k10',
            'article',
            'news/'
        ]
        
        found_links = {}
        
        for pattern in article_patterns:
            matching_links = []
            for link in all_links:
                href = link.get('href')
                if href and pattern in href:
                    full_url = urljoin(url, href)
                    link_text = link.get_text(strip=True)[:50]
                    matching_links.append((full_url, link_text))
            
            if matching_links:
                found_links[pattern] = matching_links[:5]  # 只显示前5个
        
        # 打印找到的链接
        for pattern, links in found_links.items():
            print(f"\n模式 '{pattern}' 找到 {len(links)} 个链接:")
            for i, (link_url, link_text) in enumerate(links, 1):
                print(f"  {i}. {link_text}")
                print(f"     {link_url}")
        
        # 如果没有找到特定模式，显示所有内部链接
        if not found_links:
            print("\n没有找到特定模式的链接，显示所有内部链接:")
            internal_links = []
            for link in all_links:
                href = link.get('href')
                if href and ('nhk.or.jp' in href or href.startswith('/')):
                    full_url = urljoin(url, href)
                    link_text = link.get_text(strip=True)[:50]
                    if link_text and len(link_text) > 3:  # 过滤掉太短的文本
                        internal_links.append((full_url, link_text))
            
            # 显示前20个内部链接
            for i, (link_url, link_text) in enumerate(internal_links[:20], 1):
                print(f"  {i}. {link_text}")
                print(f"     {link_url}")
        
        # 保存页面HTML供进一步分析
        with open('nhk_page_structure.html', 'w', encoding='utf-8') as f:
            f.write(str(soup.prettify()))
        print(f"\n页面HTML已保存到: nhk_page_structure.html")
        
    except Exception as e:
        print(f"分析失败: {e}")

if __name__ == "__main__":
    analyze_nhk_structure() 