#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
日语学习资源网页抓取器 - 修复版
支持从NHK Easy News等网站抓取学习内容
"""

import sys
import json
import time
import requests
import mysql.connector
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from pathlib import Path
import uuid
import logging
from typing import Dict, List, Optional

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('web_scraper.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class JapaneseWebScraper:
    """日语学习网站抓取器"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.task_id = config['task_id']
        self.session = requests.Session()
        
        # 设置请求头，模拟真实浏览器
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ja,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
        
        # 数据库连接
        self.db_config = config['database_config']
        self.db_connection = None
        
        # 存储目录
        self.storage_dir = Path('storage/app/public/scraped-content')
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        
    def connect_database(self):
        """连接数据库"""
        try:
            self.db_connection = mysql.connector.connect(
                host=self.db_config['host'],
                database=self.db_config['database'],
                user=self.db_config['username'],
                password=self.db_config['password'],
                charset='utf8mb4',
                collation='utf8mb4_unicode_ci'
            )
            logger.info("数据库连接成功")
        except Exception as e:
            logger.error(f"数据库连接失败: {e}")
            raise
            
    def update_task_progress(self, items_processed: int, total_items: int, logs: List[str]):
        """更新任务进度"""
        if not self.db_connection:
            return
            
        try:
            cursor = self.db_connection.cursor()
            progress = (items_processed / total_items * 100) if total_items > 0 else 0
            
            # 更新任务状态
            cursor.execute("""
                UPDATE import_tasks 
                SET items_processed = %s, progress = %s, logs = %s, updated_at = NOW()
                WHERE id = %s
            """, (items_processed, progress, json.dumps(logs, ensure_ascii=False), self.task_id))
            
            self.db_connection.commit()
            cursor.close()
            
        except Exception as e:
            logger.error(f"更新任务进度失败: {e}")
    
    def find_nhk_articles(self, base_url: str, max_articles: int = 10) -> List[str]:
        """查找NHK Easy News文章链接"""
        try:
            logger.info(f"访问NHK主页: {base_url}")
            response = self.session.get(base_url, timeout=30)
            response.raise_for_status()
            
                        soup = BeautifulSoup(response.content, 'html.parser')            article_links = []                        # 查找article链接 - 更新为新的NHK网站结构            for link in soup.find_all('a', href=True):                href = link.get('href')                # 支持新的链接格式: ./article/disaster_xxx.html 和旧格式                if href and 'article' in href and (                    href.startswith('./article/') or                     '/news/easy/article/' in href                ):                    full_url = urljoin(base_url, href)                    article_links.append(full_url)
            
            # 去重并限制数量
            article_links = list(set(article_links))[:max_articles]
            logger.info(f"找到 {len(article_links)} 个文章链接")
            
            return article_links
            
        except Exception as e:
            logger.error(f"查找NHK文章链接失败: {e}")
            return []
    
    def scrape_nhk_easy_news(self, url: str) -> Optional[Dict]:
        """抓取NHK Easy News内容"""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 提取标题
            title = soup.find('title')
            title_text = title.get_text(strip=True) if title else "未知标题"
            
            # 提取正文内容 - 尝试多种选择器
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
            
            # 提取音频链接
            audio_urls = []
            for audio in soup.find_all(['audio', 'source']):
                src = audio.get('src')
                if src and ('.mp3' in src or '.wav' in src):
                    full_url = urljoin(url, src)
                    audio_urls.append(full_url)
            
            # 查找音频播放按钮或链接
            for link in soup.find_all('a', href=True):
                href = link.get('href')
                if href and ('.mp3' in href or '.wav' in href or 'audio' in href):
                    full_url = urljoin(url, href)
                    audio_urls.append(full_url)
            
            return {
                'url': url,
                'title': title_text,
                'content': content,
                'images': images[:5],  # 限制图片数量
                'audio': audio_urls[:3],  # 限制音频数量
                'metadata': {
                    'source': 'NHK Easy News',
                    'difficulty': 'easy',
                    'language': 'japanese'
                }
            }
            
        except Exception as e:
            logger.error(f"抓取NHK Easy News失败 {url}: {e}")
            return None
    
    def scrape_mainichi_news(self, url: str) -> Optional[Dict]:
        """抓取每日新闻内容"""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 提取标题
            title = soup.find('h1') or soup.find('title')
            title_text = title.get_text(strip=True) if title else ""
            
            # 提取正文
            content_selectors = ['.article-body', '.news-body', '.main-text', 'article', '.content']
            content = ""
            for selector in content_selectors:
                element = soup.select_one(selector)
                if element:
                    content = element.get_text(strip=True)
                    break
            
            # 提取图片
            images = []
            for img in soup.find_all('img'):
                src = img.get('src')
                if src and not src.startswith('data:'):
                    full_url = urljoin(url, src)
                    images.append(full_url)
            
            return {
                'url': url,
                'title': title_text,
                'content': content,
                'images': images[:5],
                'audio': [],
                'metadata': {
                    'source': 'Mainichi News',
                    'language': 'japanese'
                }
            }
            
        except Exception as e:
            logger.error(f"抓取每日新闻失败 {url}: {e}")
            return None
    
    def scrape_general_content(self, url: str) -> Optional[Dict]:
        """抓取通用网站内容"""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 提取标题
            title = soup.find('h1') or soup.find('title')
            title_text = title.get_text(strip=True) if title else ""
            
            # 提取正文内容
            content_selectors = ['article', '.content', '.main-content', '#content', '.post-content', '.entry-content', 'main']
            content = ""
            for selector in content_selectors:
                element = soup.select_one(selector)
                if element:
                    content = element.get_text(strip=True)
                    break
            
            # 如果没有找到结构化内容，提取body文本
            if not content:
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
            
            return {
                'url': url,
                'title': title_text,
                'content': content,
                'images': images[:5],
                'audio': audio_urls[:3],
                'metadata': {
                    'source': urlparse(url).netloc,
                    'language': 'japanese'
                }
            }
            
        except Exception as e:
            logger.error(f"抓取通用内容失败 {url}: {e}")
            return None
    
    def extract_content(self, url: str) -> Optional[Dict]:
        """根据URL类型提取内容"""
        domain = urlparse(url).netloc.lower()
        
        if 'nhk.or.jp' in domain and 'news/easy' in url:
            return self.scrape_nhk_easy_news(url)
        elif any(site in domain for site in ['mainichi.jp', 'asahi.com']):
            return self.scrape_mainichi_news(url)
        else:
            return self.scrape_general_content(url)
    
    def download_media_file(self, url: str, file_type: str) -> Optional[str]:
        """下载媒体文件"""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            # 生成文件名
            file_extension = Path(urlparse(url).path).suffix or ('.jpg' if file_type == 'image' else '.mp3')
            filename = f"{uuid.uuid4()}{file_extension}"
            file_path = self.storage_dir / file_type / filename
            
            # 创建目录
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # 保存文件
            with open(file_path, 'wb') as f:
                f.write(response.content)
            
            # 返回相对路径
            return str(file_path.relative_to(Path('storage/app/public')))
            
        except Exception as e:
            logger.error(f"下载媒体文件失败 {url}: {e}")
            return None
    
    def save_resource_to_database(self, content_data: Dict):
        """保存抓取的资源到数据库"""
        if not self.db_connection:
            return
            
        try:
            cursor = self.db_connection.cursor()
            
            # 下载媒体文件
            downloaded_images = []
            downloaded_audio = []
            
            if self.config.get('include_images', False) and content_data.get('images'):
                for img_url in content_data['images']:
                    local_path = self.download_media_file(img_url, 'images')
                    if local_path:
                        downloaded_images.append({
                            'original_url': img_url,
                            'local_path': local_path
                        })
            
            if self.config.get('include_audio', False) and content_data.get('audio'):
                for audio_url in content_data['audio']:
                    local_path = self.download_media_file(audio_url, 'audio')
                    if local_path:
                        downloaded_audio.append({
                            'original_url': audio_url,
                            'local_path': local_path
                        })
            
            # 插入资源记录
            cursor.execute("""
                INSERT INTO resource_items 
                (name, type, source, source_url, content, metadata, media_files, status, progress, import_task_id, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (
                content_data['title'] or 'Scraped Content',
                self.config.get('content_type', 'material'),
                'web-scraping',
                content_data['url'],
                content_data['content'],
                json.dumps(content_data.get('metadata', {}), ensure_ascii=False),
                json.dumps({
                    'images': downloaded_images,
                    'audio': downloaded_audio
                }, ensure_ascii=False),
                'completed',
                100,
                self.task_id
            ))
            
            self.db_connection.commit()
            cursor.close()
            
            logger.info(f"保存资源成功: {content_data['title']}")
            
        except Exception as e:
            logger.error(f"保存资源到数据库失败: {e}")
    
    def scrape_websites(self):
        """开始抓取网站"""
        try:
            self.connect_database()
            
            urls = self.config['urls']
            max_pages = self.config.get('max_pages', 10)
            delay_ms = self.config.get('delay_ms', 1000)
            
            processed_items = 0
            logs = ['开始网页抓取任务']
            
            for base_url in urls:
                logger.info(f"处理URL: {base_url}")
                
                if 'nhk.or.jp/news/easy' in base_url:
                    # 获取NHK文章链接
                    article_links = self.find_nhk_articles(base_url, max_pages)
                    
                    # 抓取每篇文章
                    for article_url in article_links:
                        if processed_items >= max_pages:
                            break
                            
                        logger.info(f"正在处理 {processed_items+1}/{max_pages}: {article_url}")
                        logs.append(f"正在处理: {article_url}")
                        
                        # 抓取内容
                        content_data = self.extract_content(article_url)
                        
                        if content_data and content_data.get('content') and len(content_data['content']) > 100:
                            # 保存到数据库
                            self.save_resource_to_database(content_data)
                            processed_items += 1
                            logs.append(f"已完成: {content_data['title'][:50]}...")
                        else:
                            logs.append(f"抓取失败或内容为空: {article_url}")
                        
                        # 更新进度
                        self.update_task_progress(processed_items, max_pages, logs)
                        
                        # 延迟
                        if delay_ms > 0:
                            time.sleep(delay_ms / 1000)
                else:
                    # 直接抓取URL
                    logger.info(f"正在处理: {base_url}")
                    logs.append(f"正在处理: {base_url}")
                    
                    content_data = self.extract_content(base_url)
                    
                    if content_data and content_data.get('content') and len(content_data['content']) > 100:
                        self.save_resource_to_database(content_data)
                        processed_items += 1
                        logs.append(f"已完成: {content_data['title'][:50]}...")
                    else:
                        logs.append(f"抓取失败或内容为空: {base_url}")
                    
                    self.update_task_progress(processed_items, max_pages, logs)
            
            # 任务完成
            logs.append(f"抓取任务完成，共处理 {processed_items} 个页面")
            self.update_task_progress(processed_items, max_pages, logs)
            
            logger.info(f"网页抓取任务完成，共处理 {processed_items} 个页面")
            
        except Exception as e:
            logger.error(f"抓取任务失败: {e}")
            if self.db_connection:
                try:
                    cursor = self.db_connection.cursor()
                    cursor.execute("""
                        UPDATE import_tasks 
                        SET status = 'failed', logs = %s, updated_at = NOW()
                        WHERE id = %s
                    """, (json.dumps(['任务失败: ' + str(e)], ensure_ascii=False), self.task_id))
                    self.db_connection.commit()
                    cursor.close()
                except:
                    pass
            raise
        finally:
            if self.db_connection:
                self.db_connection.close()

def main():
    """主函数"""
    if len(sys.argv) != 2:
        print("使用方法: python web_scraper.py <config_file>")
        sys.exit(1)
    
    config_file = sys.argv[1]
    
    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        scraper = JapaneseWebScraper(config)
        scraper.scrape_websites()
        
    except Exception as e:
        logger.error(f"抓取脚本执行失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 