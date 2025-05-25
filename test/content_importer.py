#!/usr/bin/env python3
"""
内容导入工具
将爬取的日语学习内容转换并导入到90天学习平台
"""

import json
import asyncio
import aiohttp
import aiofiles
import csv
from pathlib import Path
from typing import Dict, List, Optional
import logging
from dataclasses import dataclass, asdict
import re
import uuid
from datetime import datetime
import argparse

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ImportableContent:
    """可导入的内容格式"""
    title: str
    content: str
    content_type: str  # course, material, vocabulary, exercise
    level: str  # beginner, intermediate, advanced
    day_number: Optional[int] = None
    jlpt_level: Optional[str] = None
    audio_file: Optional[str] = None
    metadata: Optional[Dict] = None

class ContentTransformer:
    """内容转换器"""
    
    def __init__(self, scraped_dir: str):
        self.scraped_dir = Path(scraped_dir)
        self.summary_file = self.scraped_dir / "summary.json"
    
    async def load_scraped_content(self) -> List[Dict]:
        """加载爬取的内容"""
        if not self.summary_file.exists():
            raise FileNotFoundError(f"找不到汇总文件: {self.summary_file}")
        
        async with aiofiles.open(self.summary_file, 'r', encoding='utf-8') as f:
            content = await f.read()
            summary = json.loads(content)
        
        return summary.get('items', [])
    
    def transform_to_courses(self, items: List[Dict]) -> List[ImportableContent]:
        """将内容转换为课程格式"""
        courses = []
        day_counter = 1
        
        for item in items:
            if item['category'] in ['news', 'lesson', 'article']:
                # 过滤太短或太长的内容
                text_file = item.get('text_file')
                if not text_file or not Path(text_file).exists():
                    continue
                
                with open(text_file, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                
                word_count = len(content.split())
                if word_count < 50 or word_count > 500:  # 适合的长度范围
                    continue
                
                # 确定难度等级
                level = self._determine_level(content, item.get('source', ''))
                
                course = ImportableContent(
                    title=item.get('title', f'第{day_counter}天课程'),
                    content=content,
                    content_type='course',
                    level=level,
                    day_number=day_counter,
                    audio_file=item.get('audio_file'),
                    metadata={
                        'source': item.get('source'),
                        'original_url': item.get('url'),
                        'word_count': word_count,
                        'category': item.get('category')
                    }
                )
                courses.append(course)
                day_counter += 1
                
                if day_counter > 90:  # 限制为90天
                    break
        
        return courses
    
    def transform_to_materials(self, items: List[Dict]) -> List[ImportableContent]:
        """将内容转换为学习材料格式"""
        materials = []
        
        for item in items:
            text_file = item.get('text_file')
            if not text_file or not Path(text_file).exists():
                continue
            
            with open(text_file, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            
            # 根据内容长度和类型决定是否作为学习材料
            word_count = len(content.split())
            if word_count < 20:  # 太短不适合作为材料
                continue
            
            # 确定材料类型
            material_type = self._determine_material_type(content, item)
            
            material = ImportableContent(
                title=item.get('title', '学习材料'),
                content=content,
                content_type='material',
                level=self._determine_level(content, item.get('source', '')),
                audio_file=item.get('audio_file'),
                metadata={
                    'source': item.get('source'),
                    'material_type': material_type,
                    'duration_minutes': max(1, word_count // 100),  # 估算阅读时间
                    'original_url': item.get('url')
                }
            )
            materials.append(material)
        
        return materials
    
    def transform_to_vocabulary(self, items: List[Dict]) -> List[ImportableContent]:
        """将内容转换为词汇格式"""
        vocabulary = []
        
        for item in items:
            if item['category'] == 'pronunciation':
                # 单词发音项目
                word = item.get('title', '').strip()
                if not word or len(word) > 20:  # 过滤无效词汇
                    continue
                
                vocab = ImportableContent(
                    title=word,
                    content=word,
                    content_type='vocabulary',
                    level='vocabulary',
                    jlpt_level=self._guess_jlpt_level(word),
                    audio_file=item.get('audio_file'),
                    metadata={
                        'source': item.get('source'),
                        'reading': self._extract_reading(word),
                        'part_of_speech': self._guess_part_of_speech(word),
                        'country': item.get('country', ''),
                        'pronunciation_quality': item.get('rates', 0)
                    }
                )
                vocabulary.append(vocab)
            
            else:
                # 从文章中提取词汇
                text_file = item.get('text_file')
                if text_file and Path(text_file).exists():
                    extracted_vocab = self._extract_vocabulary_from_text(text_file, item)
                    vocabulary.extend(extracted_vocab)
        
        return vocabulary
    
    def _determine_level(self, content: str, source: str) -> str:
        """确定内容难度等级"""
        # 简单的难度判断逻辑
        if 'easy' in source.lower() or 'beginner' in source.lower():
            return 'beginner'
        
        # 基于汉字密度判断
        kanji_count = len(re.findall(r'[\u4e00-\u9faf]', content))
        total_chars = len(content)
        
        if total_chars == 0:
            return 'beginner'
        
        kanji_ratio = kanji_count / total_chars
        
        if kanji_ratio < 0.1:
            return 'beginner'
        elif kanji_ratio < 0.25:
            return 'intermediate'
        else:
            return 'advanced'
    
    def _determine_material_type(self, content: str, item: Dict) -> str:
        """确定材料类型"""
        category = item.get('category', '').lower()
        source = item.get('source', '').lower()
        
        if 'news' in category:
            return 'text'
        elif 'lesson' in category or 'dialog' in content.lower():
            return 'text'
        elif item.get('audio_file'):
            return 'audio'
        else:
            return 'text'
    
    def _guess_jlpt_level(self, word: str) -> str:
        """猜测JLPT等级"""
        # 简单的JLPT等级判断
        common_n5_words = ['こんにちは', 'ありがとう', '元気', '学校', '先生', '水', '食べる']
        
        if word in common_n5_words:
            return 'N5'
        elif len(word) <= 2:
            return 'N5'
        elif len(word) <= 4:
            return 'N4'
        else:
            return 'N3'
    
    def _extract_reading(self, word: str) -> str:
        """提取读音（简化版）"""
        # 这里可以集成更复杂的读音提取逻辑
        if re.match(r'^[ひらがな]+$', word):
            return word
        return ''  # 需要更复杂的处理
    
    def _guess_part_of_speech(self, word: str) -> str:
        """猜测词性"""
        if word.endswith('る'):
            return '动词'
        elif word.endswith('い'):
            return '形容词'
        else:
            return '名词'
    
    def _extract_vocabulary_from_text(self, text_file: str, item: Dict) -> List[ImportableContent]:
        """从文本中提取词汇"""
        vocabulary = []
        
        with open(text_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取日语词汇（简化版）
        # 这里可以使用更复杂的形态学分析
        words = re.findall(r'[\u4e00-\u9faf\u3040-\u309f\u30a0-\u30ff]+', content)
        
        unique_words = list(set(words))[:50]  # 限制数量
        
        for word in unique_words:
            if len(word) >= 2 and len(word) <= 10:  # 合理的词长
                vocab = ImportableContent(
                    title=word,
                    content=word,
                    content_type='vocabulary',
                    level='vocabulary',
                    jlpt_level=self._guess_jlpt_level(word),
                    metadata={
                        'source': item.get('source'),
                        'extracted_from': item.get('title'),
                        'reading': self._extract_reading(word),
                        'part_of_speech': self._guess_part_of_speech(word)
                    }
                )
                vocabulary.append(vocab)
        
        return vocabulary

class CSVExporter:
    """CSV导出器"""
    
    def __init__(self, output_dir: str = "import_data"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
    
    async def export_courses(self, courses: List[ImportableContent]) -> str:
        """导出课程到CSV"""
        csv_file = self.output_dir / "courses.csv"
        
        fieldnames = [
            'title', 'description', 'day_number', 'difficulty', 
            'tags', 'is_active', 'content', 'audio_file', 'source'
        ]
        
        async with aiofiles.open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            await f.write(','.join(fieldnames) + '\n')
            
            for course in courses:
                row = {
                    'title': course.title,
                    'description': course.content[:200] + '...' if len(course.content) > 200 else course.content,
                    'day_number': course.day_number or '',
                    'difficulty': course.level,
                    'tags': json.dumps(['日语学习', course.metadata.get('category', '')]),
                    'is_active': 'true',
                    'content': course.content,
                    'audio_file': course.audio_file or '',
                    'source': course.metadata.get('source', '') if course.metadata else ''
                }
                
                # 写入行
                line = ','.join([f'"{str(v).replace('"', '""')}"' for v in row.values()])
                await f.write(line + '\n')
        
        logger.info(f"课程CSV导出完成: {csv_file}")
        return str(csv_file)
    
    async def export_materials(self, materials: List[ImportableContent]) -> str:
        """导出学习材料到CSV"""
        csv_file = self.output_dir / "materials.csv"
        
        fieldnames = [
            'course_id', 'title', 'type', 'content', 'media_url', 
            'duration_minutes', 'metadata', 'audio_file'
        ]
        
        async with aiofiles.open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            await f.write(','.join(fieldnames) + '\n')
            
            for i, material in enumerate(materials, 1):
                row = {
                    'course_id': i,  # 简化关联
                    'title': material.title,
                    'type': material.metadata.get('material_type', 'text') if material.metadata else 'text',
                    'content': material.content,
                    'media_url': material.audio_file or '',
                    'duration_minutes': material.metadata.get('duration_minutes', 5) if material.metadata else 5,
                    'metadata': json.dumps(material.metadata or {}),
                    'audio_file': material.audio_file or ''
                }
                
                line = ','.join([f'"{str(v).replace('"', '""')}"' for v in row.values()])
                await f.write(line + '\n')
        
        logger.info(f"学习材料CSV导出完成: {csv_file}")
        return str(csv_file)
    
    async def export_vocabulary(self, vocabulary: List[ImportableContent]) -> str:
        """导出词汇到CSV"""
        csv_file = self.output_dir / "vocabulary.csv"
        
        fieldnames = [
            'word', 'reading', 'meaning', 'part_of_speech', 
            'example_sentence', 'jlpt_level', 'tags', 'audio_file'
        ]
        
        async with aiofiles.open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            await f.write(','.join(fieldnames) + '\n')
            
            for vocab in vocabulary:
                metadata = vocab.metadata or {}
                row = {
                    'word': vocab.title,
                    'reading': metadata.get('reading', ''),
                    'meaning': '待翻译',  # 需要后续翻译
                    'part_of_speech': metadata.get('part_of_speech', ''),
                    'example_sentence': '',  # 需要后续添加
                    'jlpt_level': vocab.jlpt_level or 'N5',
                    'tags': json.dumps(['基础词汇']),
                    'audio_file': vocab.audio_file or ''
                }
                
                line = ','.join([f'"{str(v).replace('"', '""')}"' for v in row.values()])
                await f.write(line + '\n')
        
        logger.info(f"词汇CSV导出完成: {csv_file}")
        return str(csv_file)

class DatabaseImporter:
    """数据库导入器"""
    
    def __init__(self, api_base_url: str = "http://localhost:8000/api"):
        self.api_base_url = api_base_url
    
    async def import_csv_files(self, csv_dir: str) -> Dict:
        """导入CSV文件到数据库"""
        csv_dir = Path(csv_dir)
        results = {
            'courses': 0,
            'materials': 0,
            'vocabulary': 0,
            'errors': []
        }
        
        async with aiohttp.ClientSession() as session:
            # 导入课程
            courses_csv = csv_dir / "courses.csv"
            if courses_csv.exists():
                try:
                    result = await self._import_csv_to_api(
                        session, courses_csv, 'course'
                    )
                    results['courses'] = result.get('imported', 0)
                except Exception as e:
                    results['errors'].append(f"课程导入失败: {e}")
            
            # 导入学习材料
            materials_csv = csv_dir / "materials.csv"
            if materials_csv.exists():
                try:
                    result = await self._import_csv_to_api(
                        session, materials_csv, 'material'
                    )
                    results['materials'] = result.get('imported', 0)
                except Exception as e:
                    results['errors'].append(f"学习材料导入失败: {e}")
            
            # 导入词汇
            vocabulary_csv = csv_dir / "vocabulary.csv"
            if vocabulary_csv.exists():
                try:
                    result = await self._import_csv_to_api(
                        session, vocabulary_csv, 'vocabulary'
                    )
                    results['vocabulary'] = result.get('imported', 0)
                except Exception as e:
                    results['errors'].append(f"词汇导入失败: {e}")
        
        return results
    
    async def _import_csv_to_api(self, session: aiohttp.ClientSession, 
                                csv_file: Path, content_type: str) -> Dict:
        """通过API导入CSV文件"""
        url = f"{self.api_base_url}/admin/content/batch/{content_type}"
        
        # 读取CSV文件
        with open(csv_file, 'rb') as f:
            csv_data = f.read()
        
        # 构建multipart数据
        data = aiohttp.FormData()
        data.add_field('file', csv_data, 
                      filename=csv_file.name,
                      content_type='text/csv')
        
        async with session.post(url, data=data) as response:
            if response.status == 200:
                result = await response.json()
                return result
            else:
                error_text = await response.text()
                raise Exception(f"API错误 ({response.status}): {error_text}")

class ContentImporter:
    """主导入工具"""
    
    def __init__(self, scraped_dir: str, output_dir: str = "import_data"):
        self.transformer = ContentTransformer(scraped_dir)
        self.exporter = CSVExporter(output_dir)
        self.importer = DatabaseImporter()
    
    async def run_full_import(self) -> Dict:
        """执行完整的导入流程"""
        logger.info("开始内容导入流程...")
        
        # 1. 加载爬取的内容
        logger.info("加载爬取的内容...")
        items = await self.transformer.load_scraped_content()
        logger.info(f"加载了 {len(items)} 项内容")
        
        # 2. 转换内容
        logger.info("转换内容格式...")
        courses = self.transformer.transform_to_courses(items)
        materials = self.transformer.transform_to_materials(items)
        vocabulary = self.transformer.transform_to_vocabulary(items)
        
        logger.info(f"转换完成: {len(courses)} 课程, {len(materials)} 材料, {len(vocabulary)} 词汇")
        
        # 3. 导出CSV
        logger.info("导出CSV文件...")
        csv_files = {}
        if courses:
            csv_files['courses'] = await self.exporter.export_courses(courses)
        if materials:
            csv_files['materials'] = await self.exporter.export_materials(materials)
        if vocabulary:
            csv_files['vocabulary'] = await self.exporter.export_vocabulary(vocabulary)
        
        # 4. 导入数据库
        logger.info("导入到数据库...")
        import_results = await self.importer.import_csv_files(self.exporter.output_dir)
        
        # 5. 生成报告
        report = {
            'timestamp': datetime.now().isoformat(),
            'source_items': len(items),
            'transformed': {
                'courses': len(courses),
                'materials': len(materials),
                'vocabulary': len(vocabulary)
            },
            'csv_files': csv_files,
            'import_results': import_results
        }
        
        # 保存报告
        report_file = self.exporter.output_dir / "import_report.json"
        async with aiofiles.open(report_file, 'w', encoding='utf-8') as f:
            await f.write(json.dumps(report, ensure_ascii=False, indent=2))
        
        logger.info(f"导入完成! 报告保存到: {report_file}")
        return report

async def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='日语学习内容导入工具')
    parser.add_argument('--scraped-dir', default='japanese_content', 
                       help='爬取内容目录')
    parser.add_argument('--output-dir', default='import_data', 
                       help='导出目录')
    parser.add_argument('--api-url', default='http://localhost:8000/api',
                       help='API基础URL')
    
    args = parser.parse_args()
    
    importer = ContentImporter(args.scraped_dir, args.output_dir)
    
    try:
        report = await importer.run_full_import()
        
        print(f"\n=== 导入完成 ===")
        print(f"源内容项: {report['source_items']}")
        print(f"转换课程: {report['transformed']['courses']}")
        print(f"转换材料: {report['transformed']['materials']}")
        print(f"转换词汇: {report['transformed']['vocabulary']}")
        print(f"导入结果: {report['import_results']}")
        
    except Exception as e:
        logger.error(f"导入失败: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(asyncio.run(main())) 