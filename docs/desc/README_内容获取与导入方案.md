#!/usr/bin/env python3
"""
日语学习内容爬取工具
支持多个数据源的统一爬取和处理
"""

import asyncio
import aiohttp
import aiofiles
import feedparser
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import json
import os
import re
from typing import Dict, List, Optional, Tuple
import logging
from dataclasses import dataclass
from pathlib import Path

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ContentItem:
    """内容项数据结构"""
    text: str
    audio_url: Optional[str]
    source: str
    level: str
    category: str
    metadata: Dict

class BaseScraper:
    """基础爬虫类"""
    
    def __init__(self, session: aiohttp.ClientSession = None):
        self.session = session or aiohttp.ClientSession()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    async def fetch(self, url: str) -> str:
        """异步获取网页内容"""
        try:
            async with self.session.get(url, headers=self.headers) as response:
                response.raise_for_status()
                return await response.text()
        except Exception as e:
            logger.error(f"获取 {url} 失败: {e}")
            return ""
    
    async def download_audio(self, audio_url: str, filename: str) -> bool:
        """下载音频文件"""
        try:
            async with self.session.get(audio_url, headers=self.headers) as response:
                response.raise_for_status()
                
                os.makedirs(os.path.dirname(filename), exist_ok=True)
                async with aiofiles.open(filename, 'wb') as f:
                    async for chunk in response.content.iter_chunked(8192):
                        await f.write(chunk)
                
                logger.info(f"音频下载成功: {filename}")
                return True
        except Exception as e:
            logger.error(f"音频下载失败 {audio_url}: {e}")
            return False

class NHKScraper(BaseScraper):
    """NHK Easy Japanese 爬虫"""
    
    def __init__(self, session=None):
        super().__init__(session)
        self.base_url = "https://www3.nhk.or.jp/news/easy"
        self.rss_url = f"{self.base_url}/rss/rss.xml"
    
    async def get_articles(self, limit: int = 50) -> List[ContentItem]:
        """获取NHK简单新闻文章"""
        feed = feedparser.parse(self.rss_url)
        articles = []
        
        tasks = []
        for entry in feed.entries[:limit]:
            task = self.scrape_article(entry.link)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, ContentItem):
                articles.append(result)
        
        return articles
    
    async def scrape_article(self, article_url: str) -> Optional[ContentItem]:
        """爬取单篇文章"""
        try:
            html = await self.fetch(article_url)
            if not html:
                return None
            
            soup = BeautifulSoup(html, 'html.parser')
            
            # 提取文本
            article_body = soup.find('div', {'id': 'js-article-body'})
            if not article_body:
                return None
            
            text = self.clean_text(article_body.get_text(strip=True))
            
            # 提取音频链接
            audio_url = None
            audio_link = soup.find('a', {'class': 'article-main__audio'})
            if audio_link:
                audio_url = urljoin(self.base_url, audio_link.get('href'))
            
            # 提取标题和元数据
            title = soup.find('h1', {'class': 'article-main__title'})
            title_text = title.get_text(strip=True) if title else ""
            
            return ContentItem(
                text=text,
                audio_url=audio_url,
                source="NHK Easy",
                level="beginner",
                category="news",
                metadata={
                    'title': title_text,
                    'url': article_url,
                    'word_count': len(text.split())
                }
            )
        
        except Exception as e:
            logger.error(f"爬取文章失败 {article_url}: {e}")
            return None
    
    def clean_text(self, text: str) -> str:
        """清理文本"""
        # 移除多余的空白符
        text = re.sub(r'\s+', ' ', text)
        # 移除特殊字符
        text = re.sub(r'[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEFa-zA-Z0-9\s\.,!?]', '', text)
        return text.strip()

class JapanesePod101Scraper(BaseScraper):
    """JapanesePod101 爬虫"""
    
    def __init__(self, username: str, password: str, session=None):
        super().__init__(session)
        self.username = username
        self.password = password
        self.base_url = "https://www.japanesepod101.com"
        self.logged_in = False
    
    async def login(self) -> bool:
        """登录到JapanesePod101"""
        try:
            login_url = f"{self.base_url}/member/login"
            login_data = {
                'amember_login': self.username,
                'amember_pass': self.password
            }
            
            async with self.session.post(login_url, data=login_data, headers=self.headers) as response:
                self.logged_in = response.status == 200
                return self.logged_in
        
        except Exception as e:
            logger.error(f"登录失败: {e}")
            return False
    
    async def get_lessons(self, level: str = "beginner") -> List[ContentItem]:
        """获取课程内容"""
        if not self.logged_in:
            await self.login()
        
        lessons_url = f"{self.base_url}/lesson-library/{level}"
        html = await self.fetch(lessons_url)
        
        if not html:
            return []
        
        soup = BeautifulSoup(html, 'html.parser')
        lesson_links = soup.find_all('a', {'class': 'lesson-title'})
        
        tasks = []
        for link in lesson_links[:20]:  # 限制数量
            lesson_url = urljoin(self.base_url, link.get('href'))
            task = self.scrape_lesson(lesson_url, level)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        lessons = []
        for result in results:
            if isinstance(result, ContentItem):
                lessons.append(result)
        
        return lessons
    
    async def scrape_lesson(self, lesson_url: str, level: str) -> Optional[ContentItem]:
        """爬取单个课程"""
        try:
            html = await self.fetch(lesson_url)
            if not html:
                return None
            
            soup = BeautifulSoup(html, 'html.parser')
            
            # 提取对话文本
            dialogue_section = soup.find('div', {'id': 'dialogue'})
            if not dialogue_section:
                return None
            
            text = dialogue_section.get_text(strip=True)
            
            # 提取音频链接
            audio_url = None
            audio_element = soup.find('audio') or soup.find('source')
            if audio_element:
                audio_url = audio_element.get('src')
                if audio_url:
                    audio_url = urljoin(self.base_url, audio_url)
            
            # 提取标题
            title = soup.find('h1', {'class': 'lesson-title'})
            title_text = title.get_text(strip=True) if title else ""
            
            return ContentItem(
                text=text,
                audio_url=audio_url,
                source="JapanesePod101",
                level=level,
                category="lesson",
                metadata={
                    'title': title_text,
                    'url': lesson_url
                }
            )
        
        except Exception as e:
            logger.error(f"爬取课程失败 {lesson_url}: {e}")
            return None

class ForvoAPI:
    """Forvo API 包装器"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://apifree.forvo.com"
    
    async def get_pronunciations(self, words: List[str]) -> List[ContentItem]:
        """获取单词发音"""
        items = []
        
        async with aiohttp.ClientSession() as session:
            for word in words:
                try:
                    url = f"{self.base_url}/key/{self.api_key}/format/json/action/word-pronunciations/word/{word}/language/ja"
                    
                    async with session.get(url) as response:
                        if response.status == 200:
                            data = await response.json()
                            
                            if 'items' in data and data['items']:
                                # 选择第一个发音
                                pronunciation = data['items'][0]
                                
                                item = ContentItem(
                                    text=word,
                                    audio_url=pronunciation['pathmp3'],
                                    source="Forvo",
                                    level="vocabulary",
                                    category="pronunciation",
                                    metadata={
                                        'country': pronunciation.get('country', ''),
                                        'username': pronunciation.get('username', ''),
                                        'rates': pronunciation.get('rates', 0)
                                    }
                                )
                                items.append(item)
                
                except Exception as e:
                    logger.error(f"获取 {word} 发音失败: {e}")
        
        return items

class ContentProcessor:
    """内容处理器"""
    
    def __init__(self, output_dir: str = "scraped_content"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
    
    async def process_items(self, items: List[ContentItem]) -> Dict:
        """处理内容项列表"""
        results = {
            'processed': 0,
            'audio_downloaded': 0,
            'errors': 0,
            'items': []
        }
        
        for i, item in enumerate(items):
            try:
                # 生成文件名
                safe_title = re.sub(r'[^\w\s-]', '', item.metadata.get('title', f'item_{i}'))
                safe_title = re.sub(r'[-\s]+', '-', safe_title)[:50]
                
                # 保存文本
                text_file = self.output_dir / f"{safe_title}.txt"
                async with aiofiles.open(text_file, 'w', encoding='utf-8') as f:
                    await f.write(item.text)
                
                # 下载音频
                audio_file = None
                if item.audio_url:
                    audio_ext = '.mp3'  # 默认扩展名
                    if '.' in item.audio_url:
                        audio_ext = '.' + item.audio_url.split('.')[-1]
                    
                    audio_file = self.output_dir / f"{safe_title}{audio_ext}"
                    
                    async with aiohttp.ClientSession() as session:
                        scraper = BaseScraper(session)
                        success = await scraper.download_audio(item.audio_url, str(audio_file))
                        
                        if success:
                            results['audio_downloaded'] += 1
                
                # 保存元数据
                metadata = {
                    **item.metadata,
                    'text_file': str(text_file),
                    'audio_file': str(audio_file) if audio_file else None,
                    'source': item.source,
                    'level': item.level,
                    'category': item.category
                }
                
                results['items'].append(metadata)
                results['processed'] += 1
                
                logger.info(f"处理完成: {safe_title}")
            
            except Exception as e:
                logger.error(f"处理项目失败: {e}")
                results['errors'] += 1
        
        # 保存汇总信息
        summary_file = self.output_dir / "summary.json"
        async with aiofiles.open(summary_file, 'w', encoding='utf-8') as f:
            await f.write(json.dumps(results, ensure_ascii=False, indent=2))
        
        return results

class UnifiedScraper:
    """统一爬虫管理器"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.processor = ContentProcessor(config.get('output_dir', 'scraped_content'))
    
    async def run_all_scrapers(self) -> Dict:
        """运行所有配置的爬虫"""
        all_items = []
        
        async with aiohttp.ClientSession() as session:
            # NHK爬虫
            if self.config.get('enable_nhk', True):
                logger.info("开始爬取NHK内容...")
                nhk_scraper = NHKScraper(session)
                nhk_items = await nhk_scraper.get_articles(
                    limit=self.config.get('nhk_limit', 20)
                )
                all_items.extend(nhk_items)
                logger.info(f"NHK爬取完成，获得 {len(nhk_items)} 项内容")
            
            # JapanesePod101爬虫
            if self.config.get('enable_jpod', False):
                jpod_config = self.config.get('japanesepod101', {})
                if jpod_config.get('username') and jpod_config.get('password'):
                    logger.info("开始爬取JapanesePod101内容...")
                    jpod_scraper = JapanesePod101Scraper(
                        jpod_config['username'],
                        jpod_config['password'],
                        session
                    )
                    jpod_items = await jpod_scraper.get_lessons('beginner')
                    all_items.extend(jpod_items)
                    logger.info(f"JapanesePod101爬取完成，获得 {len(jpod_items)} 项内容")
            
            # Forvo API
            if self.config.get('enable_forvo', False):
                forvo_config = self.config.get('forvo', {})
                if forvo_config.get('api_key'):
                    logger.info("开始获取Forvo发音...")
                    forvo_api = ForvoAPI(forvo_config['api_key'])
                    words = forvo_config.get('words', [])
                    forvo_items = await forvo_api.get_pronunciations(words)
                    all_items.extend(forvo_items)
                    logger.info(f"Forvo获取完成，获得 {len(forvo_items)} 项内容")
        
        # 处理所有内容
        logger.info(f"开始处理总共 {len(all_items)} 项内容...")
        results = await self.processor.process_items(all_items)
        
        logger.info(f"处理完成: {results['processed']} 项成功, {results['audio_downloaded']} 个音频下载, {results['errors']} 个错误")
        
        return results

async def main():
    """主函数"""
    # 配置
    config = {
        'output_dir': 'japanese_content',
        'enable_nhk': True,
        'nhk_limit': 30,
        'enable_jpod': False,  # 需要账号
        'japanesepod101': {
            'username': '',  # 填入你的用户名
            'password': ''   # 填入你的密码
        },
        'enable_forvo': False,  # 需要API密钥
        'forvo': {
            'api_key': '',  # 填入你的API密钥
            'words': ['こんにちは', 'ありがとう', '元気', '学校', '先生']
        }
    }
    
    scraper = UnifiedScraper(config)
    results = await scraper.run_all_scrapers()
    
    print(f"\n=== 爬取完成 ===")
    print(f"处理项目: {results['processed']}")
    print(f"下载音频: {results['audio_downloaded']}")
    print(f"错误数量: {results['errors']}")
    print(f"输出目录: {config['output_dir']}")

if __name__ == "__main__":
    asyncio.run(main()) 