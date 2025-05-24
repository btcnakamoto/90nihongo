#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复版调试网页抓取器
"""

import json
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('fixed_debug_scraper.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class FixedDebugScraper:
    """修复版调试抓取器"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ja,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
    
    def get_nhk_article_links(self, base_url):
        """获取NHK Easy News文章链接"""
        try:
            logger.info(f"访问: {base_url}")
            response = self.session.get(base_url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            article_links = []
            
            # 查找文章链接
            for link in soup.find_all('a', href=True):
                href = link.get('href')
                if href and 'article' in href:
                    full_url = urljoin(base_url, href)
                    article_links.append(full_url)
            
            # 去重
            article_links = list(set(article_links))
            logger.info(f"找到 {len(article_links)} 个文章链接")
            
            return article_links
            
        except Exception as e:
            logger.error(f"获取文章链接失败: {e}")
            return []
    
    def scrape_article(self, url):
        """抓取单篇文章"""
        try:
            logger.info(f"抓取文章: {url}")
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 提取标题
            title = soup.find('title')
            title_text = title.get_text(strip=True) if title else ""
            
            # 尝试提取正文内容
            content = ""
            
            # 尝试多种内容选择器
            content_selectors = [
                'div[id*="article"]',
                'div[class*="article"]', 
                'div[class*="content"]',
                'div[class*="body"]',
                'main',
                'article',
                '.content',
                '#content'
            ]
            
            for selector in content_selectors:
                elements = soup.select(selector)
                if elements:
                    content = ' '.join([elem.get_text(strip=True) for elem in elements])
                    if len(content) > 100:  # 至少要有一定长度的内容
                        break
            
            # 如果还没有找到内容，提取body文本
            if len(content) < 50:
                body = soup.find('body')
                if body:
                    content = body.get_text(strip=True)
            
            # 提取图片
            images = []
            for img in soup.find_all('img'):
                src = img.get('src')
                if src and not src.startswith('data:'):
                    full_url = urljoin(url, src)
                    images.append(full_url)
            
            result = {
                'url': url,
                'title': title_text,
                'content': content,
                'content_length': len(content),
                'images': images[:3],
                'metadata': {
                    'source': 'NHK Easy News',
                    'difficulty': 'easy',
                    'language': 'japanese'
                }
            }
            
            logger.info(f"成功抓取: {title_text[:30]}... (内容: {len(content)} 字符)")
            return result
            
        except Exception as e:
            logger.error(f"抓取文章失败 {url}: {e}")
            return None
    
    def run_scraping_test(self):
        """运行抓取测试"""
        base_url = 'https://www3.nhk.or.jp/news/easy/'
        
        print("🚀 开始抓取测试...")
        
        # 获取文章链接
        article_links = self.get_nhk_article_links(base_url)
        
        if not article_links:
            print("❌ 没有找到文章链接")
            return []
        
        # 抓取前3篇文章
        results = []
        for i, url in enumerate(article_links[:3]):
            print(f"\n📰 抓取第 {i+1} 篇文章...")
            article = self.scrape_article(url)
            if article:
                results.append(article)
            time.sleep(1)  # 延迟1秒
        
        # 保存结果
        output_file = 'fixed_scraping_results.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        # 打印摘要
        print(f"\n📊 抓取结果摘要:")
        print(f"📄 总文章数: {len(results)}")
        
        for i, article in enumerate(results, 1):
            print(f"\n{i}. {article['title'][:50]}...")
            print(f"   🔗 URL: {article['url']}")
            print(f"   📝 内容长度: {article['content_length']} 字符")
            print(f"   🖼️ 图片: {len(article['images'])} 张")
            if article['content_length'] > 0:
                print(f"   📖 内容预览: {article['content'][:100]}...")
        
        print(f"\n💾 结果已保存到: {output_file}")
        return results

def main():
    scraper = FixedDebugScraper()
    results = scraper.run_scraping_test()
    
    if results:
        print(f"\n✅ 抓取成功！共获取 {len(results)} 篇文章")
    else:
        print(f"\n❌ 抓取失败，没有获取到任何内容")

if __name__ == "__main__":
    main() 