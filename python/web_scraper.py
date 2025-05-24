#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
日语学习资源网页抓取器 - 修复版
支持NHK Easy News新的网站结构
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import mysql.connector
import json
import time
import logging
import sys
import os
from typing import Dict, List, Optional
from datetime import datetime

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class JapaneseWebScraper:
    """日语学习资源网页抓取器"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.task_id = config.get('task_id')
        self.urls = config.get('urls', [])
        self.max_pages = config.get('max_pages', 10)
        self.content_type = config.get('content_type', 'course')
        self.delay_ms = config.get('delay_ms', 1000)
        self.include_images = config.get('include_images', False)
        self.include_audio = config.get('include_audio', False)
        
        # 设置请求会话
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # 数据库连接
        self.db_connection = None
        self.connect_database()
    
    def connect_database(self):
        """连接数据库"""
        try:
            # 从环境变量读取数据库配置
            self.db_connection = mysql.connector.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                database=os.getenv('DB_DATABASE', '90nihongo'),
                user=os.getenv('DB_USERNAME', 'root'),
                password=os.getenv('DB_PASSWORD', ''),
                charset='utf8mb4'
            )
            logger.info("数据库连接成功")
        except Exception as e:
            logger.error(f"数据库连接失败: {e}")
            self.db_connection = None
    
    def update_task_progress(self, items_processed: int, total_items: int, logs: List[str]):
        """更新任务进度"""
        if not self.db_connection or not self.task_id:
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
        """查找NHK Easy News文章链接 - 支持新的网站结构"""
        try:
            logger.info(f"访问NHK主页: {base_url}")
            response = self.session.get(base_url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            article_links = []
            
            # 查找article链接 - 支持新的链接格式
            for link in soup.find_all('a', href=True):
                href = link.get('href')
                # 支持新格式: ./article/disaster_xxx.html 和旧格式: /news/easy/article/
                if href and 'article' in href and (
                    href.startswith('./article/') or 
                    '/news/easy/article/' in href
                ):
                    full_url = urljoin(base_url, href)
                    article_links.append(full_url)
            
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
            if len(content) < 100:
                body = soup.find('body')
                if body:
                    content = body.get_text(strip=True)
            
            # 提取图片
            images = []
            if self.include_images:
                for img in soup.find_all('img'):
                    src = img.get('src')
                    if src and not src.startswith('data:'):
                        full_url = urljoin(url, src)
                        images.append(full_url)
            
            # 提取音频链接
            audio_urls = []
            if self.include_audio:
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
    
    def save_resource_to_database(self, content_data: Dict):
        """保存资源到数据库"""
        if not self.db_connection:
            logger.error("数据库连接不可用")
            return False
            
        try:
            cursor = self.db_connection.cursor()
            
            # 插入资源数据
            cursor.execute("""
                INSERT INTO resource_items (name, type, source, content, status, metadata, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (
                content_data['title'],
                self.content_type,
                content_data['metadata']['source'],
                content_data['content'],
                'completed',
                json.dumps(content_data['metadata'], ensure_ascii=False)
            ))
            
            self.db_connection.commit()
            cursor.close()
            
            logger.info(f"成功保存资源: {content_data['title']}")
            return True
            
        except Exception as e:
            logger.error(f"保存资源到数据库失败: {e}")
            return False
    
    def scrape_websites(self):
        """抓取网站内容"""
        logger.info("开始抓取网站内容...")
        
        all_content = []
        logs = ["开始抓取网站内容"]
        
        for url in self.urls:
            try:
                logger.info(f"处理URL: {url}")
                
                # 根据URL类型选择抓取方法
                if 'nhk.or.jp' in url and 'news/easy' in url:
                    # NHK Easy News - 查找文章链接
                    article_links = self.find_nhk_articles(url, self.max_pages)
                    
                    if not article_links:
                        logs.append(f"在 {url} 没有找到文章链接")
                        continue
                    
                    # 抓取每篇文章
                    for i, article_url in enumerate(article_links):
                        logger.info(f"抓取文章 {i+1}/{len(article_links)}: {article_url}")
                        
                        content_data = self.scrape_nhk_easy_news(article_url)
                        if content_data and len(content_data['content']) > 50:
                            all_content.append(content_data)
                            
                            # 保存到数据库
                            if self.save_resource_to_database(content_data):
                                logs.append(f"成功抓取并保存: {content_data['title']}")
                            else:
                                logs.append(f"抓取成功但保存失败: {content_data['title']}")
                        else:
                            logs.append(f"抓取失败或内容太少: {article_url}")
                        
                        # 更新进度
                        self.update_task_progress(len(all_content), len(article_links), logs)
                        
                        # 延迟
                        if self.delay_ms > 0:
                            time.sleep(self.delay_ms / 1000)
                
                else:
                    # 其他网站的通用抓取逻辑
                    logger.info(f"使用通用抓取逻辑处理: {url}")
                    # 这里可以添加其他网站的抓取逻辑
                    
            except Exception as e:
                error_msg = f"处理URL失败 {url}: {e}"
                logger.error(error_msg)
                logs.append(error_msg)
        
        # 完成抓取
        if self.db_connection and self.task_id:
            try:
                cursor = self.db_connection.cursor()
                cursor.execute("""
                    UPDATE import_tasks 
                    SET status = %s, progress = %s, items_processed = %s, logs = %s, updated_at = NOW()
                    WHERE id = %s
                """, ('completed', 100, len(all_content), json.dumps(logs, ensure_ascii=False), self.task_id))
                
                self.db_connection.commit()
                cursor.close()
                
            except Exception as e:
                logger.error(f"更新任务完成状态失败: {e}")
        
        logger.info(f"抓取完成，共获取 {len(all_content)} 个资源")
        return all_content

def main():
    """主函数"""
    if len(sys.argv) != 2:
        print("用法: python web_scraper_fixed.py <config_file>")
        sys.exit(1)
    
    config_file = sys.argv[1]
    
    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        scraper = JapaneseWebScraper(config)
        results = scraper.scrape_websites()
        
        print(f"抓取完成，共获取 {len(results)} 个资源")
        
    except Exception as e:
        logger.error(f"抓取过程出错: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 