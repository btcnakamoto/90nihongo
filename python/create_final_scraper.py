#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
最终版网页抓取器测试 - 模拟Laravel调用
"""

import sys
import json
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from pathlib import Path
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('final_scraper.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class FinalWebScraper:
    """最终版网页抓取器"""
    
    def __init__(self, config):
        self.config = config
        self.task_id = config.get('task_id', 1)
        self.session = requests.Session()
        
        # 设置请求头
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ja,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
        
        # 存储抓取结果
        self.scraped_items = []
        
    def find_nhk_articles(self, base_url, max_articles=10):
        """查找NHK Easy News文章链接"""
        try:
            logger.info(f"访问NHK主页: {base_url}")
            response = self.session.get(base_url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            article_links = []
            
            # 查找article链接
            for link in soup.find_all('a', href=True):
                href = link.get('href')
                if href and 'article' in href:
                    full_url = urljoin(base_url, href)
                    article_links.append(full_url)
            
            # 去重并限制数量
            article_links = list(set(article_links))[:max_articles]
            logger.info(f"找到 {len(article_links)} 个文章链接")
            
            return article_links
            
        except Exception as e:
            logger.error(f"查找文章链接失败: {e}")
            return []
    
    def scrape_single_article(self, url):
        """抓取单篇文章"""
        try:
            logger.info(f"抓取文章: {url}")
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 提取标题
            title = soup.find('title')
            title_text = title.get_text(strip=True) if title else "未知标题"
            
            # 提取内容 - 尝试多种选择器
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
                elements = soup.select(selector)
                if elements:
                    content = ' '.join([elem.get_text(strip=True) for elem in elements])
                    if len(content) > 100:
                        break
            
            # 如果还没有找到内容，提取body
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
            
            # 提取音频
            audio_urls = []
            for audio in soup.find_all(['audio', 'source']):
                src = audio.get('src')
                if src and ('.mp3' in src or '.wav' in src):
                    full_url = urljoin(url, src)
                    audio_urls.append(full_url)
            
            result = {
                'url': url,
                'title': title_text,
                'content': content,
                'content_length': len(content),
                'images': images[:3],
                'audio': audio_urls[:2],
                'metadata': {
                    'source': 'NHK Easy News',
                    'difficulty': 'easy',
                    'language': 'japanese',
                    'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S')
                }
            }
            
            # 只保存有效内容的文章
            if len(content) > 100:
                logger.info(f"成功抓取: {title_text[:30]}... (内容: {len(content)} 字符)")
                return result
            else:
                logger.warning(f"内容太短，跳过: {title_text[:30]}...")
                return None
            
        except Exception as e:
            logger.error(f"抓取文章失败 {url}: {e}")
            return None
    
    def simulate_database_save(self, article_data):
        """模拟保存到数据库"""
        # 这里模拟Laravel会做的数据库保存操作
        save_data = {
            'name': article_data['title'],
            'type': self.config.get('content_type', 'material'),
            'source': 'web-scraping',
            'source_url': article_data['url'],
            'content': article_data['content'],
            'metadata': json.dumps(article_data['metadata'], ensure_ascii=False),
            'media_files': json.dumps({
                'images': article_data['images'],
                'audio': article_data['audio']
            }, ensure_ascii=False),
            'status': 'completed',
            'progress': 100,
            'import_task_id': self.task_id
        }
        
        # 添加到结果列表
        self.scraped_items.append(save_data)
        logger.info(f"模拟保存成功: {article_data['title'][:30]}...")
    
    def run_scraping_job(self):
        """运行抓取任务"""
        try:
            urls = self.config.get('urls', [])
            max_pages = self.config.get('max_pages', 10)
            delay_ms = self.config.get('delay_ms', 1000)
            
            logger.info(f"开始抓取任务，目标URLs: {len(urls)}, 最大页面: {max_pages}")
            
            total_processed = 0
            
            for base_url in urls:
                logger.info(f"处理URL: {base_url}")
                
                if 'nhk.or.jp/news/easy' in base_url:
                    # 获取文章链接
                    article_links = self.find_nhk_articles(base_url, max_pages)
                    
                    # 抓取每篇文章
                    for article_url in article_links:
                        if total_processed >= max_pages:
                            break
                            
                        article_data = self.scrape_single_article(article_url)
                        
                        if article_data:
                            self.simulate_database_save(article_data)
                            total_processed += 1
                        
                        # 延迟
                        if delay_ms > 0:
                            time.sleep(delay_ms / 1000)
                else:
                    # 直接抓取URL
                    article_data = self.scrape_single_article(base_url)
                    if article_data:
                        self.simulate_database_save(article_data)
                        total_processed += 1
            
            # 保存结果
            output_file = 'final_scraping_results.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(self.scraped_items, f, ensure_ascii=False, indent=2)
            
            logger.info(f"抓取任务完成！共处理 {total_processed} 篇文章")
            logger.info(f"结果已保存到: {output_file}")
            
            # 打印摘要报告
            print(f"\n🎉 抓取任务完成摘要:")
            print(f"📄 成功抓取文章数: {len(self.scraped_items)}")
            print(f"📊 平均内容长度: {sum(len(item['content']) for item in self.scraped_items) // len(self.scraped_items) if self.scraped_items else 0} 字符")
            
            for i, item in enumerate(self.scraped_items, 1):
                print(f"\n{i}. {item['name'][:50]}...")
                print(f"   📝 内容长度: {len(item['content'])} 字符")
                print(f"   🔗 来源: {item['source_url']}")
            
            return len(self.scraped_items)
            
        except Exception as e:
            logger.error(f"抓取任务失败: {e}")
            return 0

def main():
    """主函数 - 可以接受配置文件参数，也可以使用默认配置"""
    
    # 默认配置
    default_config = {
        'task_id': 999,
        'urls': ['https://www3.nhk.or.jp/news/easy/'],
        'max_pages': 5,
        'content_type': 'course',
        'delay_ms': 1500,
        'include_images': False,
        'include_audio': False
    }
    
    # 如果提供了配置文件，则使用配置文件
    if len(sys.argv) > 1:
        config_file = sys.argv[1]
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
            logger.info(f"使用配置文件: {config_file}")
        except Exception as e:
            logger.error(f"读取配置文件失败: {e}")
            config = default_config
    else:
        config = default_config
        logger.info("使用默认配置")
    
    print("🚀 启动最终版网页抓取器...")
    print(f"📋 配置: {json.dumps(config, ensure_ascii=False, indent=2)}")
    
    # 运行抓取
    scraper = FinalWebScraper(config)
    result_count = scraper.run_scraping_job()
    
    if result_count > 0:
        print(f"\n✅ 任务成功完成！共抓取 {result_count} 篇文章")
        print("💡 这说明网页抓取功能完全正常，可以集成到Laravel系统中")
    else:
        print(f"\n❌ 任务失败，没有抓取到任何内容")

if __name__ == "__main__":
    main() 