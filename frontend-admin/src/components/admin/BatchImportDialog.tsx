import React, { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { contentService } from '@/services/contentService';
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  Code,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  RefreshCw,
  Calendar,
  Target,
  Brain,
  Video
} from 'lucide-react';

interface BatchImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'course' | 'material' | 'vocabulary' | 'exercise';
  onImportComplete: () => void;
}

interface ImportStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  error?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    row: number;
    column: string;
    message: string;
    type: 'error' | 'warning';
  }>;
  warnings: number;
  validRows: number;
  totalRows: number;
}

const BatchImportDialog: React.FC<BatchImportDialogProps> = ({
  open,
  onOpenChange,
  contentType,
  onImportComplete
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<any>(null);
  const [detectedConfig, setDetectedConfig] = useState<any>(null);

  // 内容类型配置
  const contentConfig = useMemo(() => {
    const configs = {
      course: {
        title: '课程',
        icon: <Calendar className="h-5 w-5" />,
        color: 'blue',
        fields: ['title', 'description', 'day_number', 'difficulty', 'tags'],
        requiredFields: ['title', 'description', 'day_number', 'difficulty'],
        template: [
          { title: '第1天：基础问候', description: '学习基础的日语问候语', day_number: 1, difficulty: 'beginner', tags: '问候,基础' },
          { title: '第2天：数字表达', description: '学习日语数字1-10', day_number: 2, difficulty: 'beginner', tags: '数字,基础' }
        ]
      },
      material: {
        title: '学习材料',
        icon: <Video className="h-5 w-5" />,
        color: 'green',
        fields: ['title', 'type', 'course_day', 'content', 'media_url', 'duration_minutes'],
        requiredFields: ['title', 'type', 'course_day', 'content'],
        template: [
          { title: '问候语视频', type: 'video', course_day: 1, content: '基础问候语教学视频', media_url: '', duration_minutes: 10 },
          { title: '数字发音音频', type: 'audio', course_day: 2, content: '数字1-10发音练习', media_url: '', duration_minutes: 5 }
        ]
      },
      vocabulary: {
        title: '词汇',
        icon: <Target className="h-5 w-5" />,
        color: 'purple',
        fields: ['word', 'reading', 'meaning', 'part_of_speech', 'jlpt_level', 'example_sentence'],
        requiredFields: ['word', 'reading', 'meaning', 'part_of_speech', 'jlpt_level'],
        template: [
          { word: 'こんにちは', reading: 'konnichiwa', meaning: '你好', part_of_speech: '感叹词', jlpt_level: 'N5', example_sentence: 'こんにちは、田中さん。' },
          { word: 'ありがとう', reading: 'arigatou', meaning: '谢谢', part_of_speech: '感叹词', jlpt_level: 'N5', example_sentence: 'ありがとうございます。' }
        ]
      },
      exercise: {
        title: '练习题',
        icon: <Brain className="h-5 w-5" />,
        color: 'indigo',
        fields: ['title', 'type', 'course_day', 'question', 'options', 'correct_answer', 'explanation', 'points'],
        requiredFields: ['title', 'type', 'course_day', 'question', 'correct_answer'],
        template: [
          { title: '问候语选择题', type: 'vocabulary', course_day: 1, question: '"你好"用日语怎么说？', options: 'A.こんにちは,B.ありがとう,C.すみません,D.さようなら', correct_answer: 'A', explanation: 'こんにちは是最常用的问候语', points: 10 }
        ]
      }
    };
    return configs[contentType];
  }, [contentType]);

  // 导入步骤
  const steps: ImportStep[] = [
    { id: 'upload', title: '上传文件', description: '选择要导入的文件', completed: false },
    { id: 'validate', title: '数据验证', description: '检查数据格式和完整性', completed: false },
    { id: 'preview', title: '预览数据', description: '确认要导入的数据', completed: false },
    { id: 'import', title: '开始导入', description: '将数据导入到系统中', completed: false },
    { id: 'complete', title: '导入完成', description: '查看导入结果', completed: false }
  ];

  // 文件上传处理
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('文件选择事件触发', event);
    const file = event.target.files?.[0];
    console.log('选择的文件:', file);
    
    if (!file) {
      console.log('没有选择文件');
      return;
    }

    console.log('开始处理文件:', file.name);
    setUploadedFile(file);
    
    try {
      const text = await file.text();
      let data: any[] = [];

      console.log('文件读取成功，文件类型:', file.name);

      if (file.name.endsWith('.csv')) {
        console.log('解析CSV文件');
        // 解析CSV文件
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.trim());
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
      } else if (file.name.endsWith('.json')) {
        console.log('解析JSON文件');
        // 解析JSON文件
        data = JSON.parse(text);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        console.log('Excel文件暂不支持客户端解析');
        toast({
          title: "Excel文件暂不支持",
          description: "请将Excel文件另存为CSV格式后再上传",
          variant: "destructive",
        });
        return;
      } else {
        console.log('不支持的文件格式');
        toast({
          title: "不支持的文件格式",
          description: "请上传CSV或JSON格式的文件",
          variant: "destructive",
        });
        return;
      }

      console.log('解析得到数据条数:', data.length);
      console.log('数据样例:', data.slice(0, 2));

      setParsedData(data);
      setCurrentStep(1);
      
      // 智能检测数据类型
      const firstItem = data[0];
      let actualContentType: 'course' | 'material' | 'vocabulary' | 'exercise' | 'sentence' = contentType;
      let actualConfig = contentConfig;
      
      // 检测是否为句子格式（包含japanese和chinese字段）
      if (firstItem && firstItem.japanese && firstItem.chinese) {
        actualContentType = 'sentence';
        // 为句子类型定义配置
        actualConfig = {
          title: '句子',
          icon: contentConfig.icon,
          color: 'orange',
          fields: ['japanese', 'chinese', 'category', 'subcategory', 'difficulty', 'style', 'length', 'tags'],
          requiredFields: ['japanese', 'chinese', 'difficulty'],
          template: []
        };
        console.log('检测到句子格式，使用句子验证模式');
        
        toast({
          title: "检测到句子格式",
          description: "系统将自动使用句子导入模式进行验证",
        });
      }
      
      // 保存检测到的配置供后续步骤使用
      setDetectedConfig(actualConfig);
      
      // 内联数据验证逻辑
      const errors: ValidationResult['errors'] = [];
      let validRows = 0;
      let warnings = 0;

      data.forEach((row, index) => {
        const rowNumber = index + 2; // CSV第一行是标题，所以从第2行开始

        // 检查必填字段
        actualConfig.requiredFields.forEach(field => {
          if (!row[field] || (typeof row[field] === 'string' && row[field].trim() === '')) {
            errors.push({
              row: rowNumber,
              column: field,
              message: `${field} 字段不能为空`,
              type: 'error'
            });
          }
        });

        // 特定字段验证
        if (actualContentType === 'course') {
          if (row.day_number && (isNaN(row.day_number) || row.day_number < 1 || row.day_number > 90)) {
            errors.push({
              row: rowNumber,
              column: 'day_number',
              message: '天数必须在1-90之间',
              type: 'error'
            });
          }
          if (row.difficulty && !['beginner', 'intermediate', 'advanced'].includes(row.difficulty)) {
            errors.push({
              row: rowNumber,
              column: 'difficulty',
              message: '难度必须是 beginner、intermediate 或 advanced',
              type: 'error'
            });
          }
        } else if (actualContentType === 'vocabulary') {
          if (row.jlpt_level && !['N5', 'N4', 'N3', 'N2', 'N1'].includes(row.jlpt_level)) {
            errors.push({
              row: rowNumber,
              column: 'jlpt_level',
              message: 'JLPT等级必须是 N5、N4、N3、N2 或 N1',
              type: 'error'
            });
          }
        } else if (actualContentType === 'material') {
          if (row.type && !['video', 'audio', 'text', 'quiz'].includes(row.type)) {
            errors.push({
              row: rowNumber,
              column: 'type',
              message: '类型必须是 video、audio、text 或 quiz',
              type: 'error'
            });
          }
        } else if (actualContentType === 'exercise') {
          if (row.type && !['vocabulary', 'grammar', 'listening', 'speaking'].includes(row.type)) {
            errors.push({
              row: rowNumber,
              column: 'type',
              message: '类型必须是 vocabulary、grammar、listening 或 speaking',
              type: 'error'
            });
          }
        } else if (actualContentType === 'sentence') {
          // 句子特定验证
          if (row.difficulty && !['N5', 'N4', 'N3', 'N2', 'N1'].includes(row.difficulty)) {
            errors.push({
              row: rowNumber,
              column: 'difficulty',
              message: 'JLPT等级必须是 N5、N4、N3、N2 或 N1',
              type: 'error'
            });
          }
          
          // 检查日语文本长度
          if (row.japanese && row.japanese.length > 500) {
            errors.push({
              row: rowNumber,
              column: 'japanese',
              message: '日语文本长度不能超过500字符',
              type: 'warning'
            });
          }
          
          // 检查中文文本长度
          if (row.chinese && row.chinese.length > 500) {
            errors.push({
              row: rowNumber,
              column: 'chinese',
              message: '中文文本长度不能超过500字符',
              type: 'warning'
            });
          }
        }

        // 如果这一行没有错误，则计为有效行
        const rowErrors = errors.filter(e => e.row === rowNumber && e.type === 'error');
        if (rowErrors.length === 0) {
          validRows++;
        }

        // 计算警告数量
        const rowWarnings = errors.filter(e => e.row === rowNumber && e.type === 'warning');
        warnings += rowWarnings.length;
      });

      const result: ValidationResult = {
        isValid: errors.filter(e => e.type === 'error').length === 0,
        errors,
        warnings,
        validRows,
        totalRows: data.length
      };

      console.log('数据验证完成:', result);
      setValidationResult(result);
      
      toast({
        title: "文件上传成功",
        description: `已解析 ${data.length} 条数据`,
      });
    } catch (error) {
      console.error('文件解析错误:', error);
      toast({
        title: "文件解析失败",
        description: "请检查文件格式是否正确",
        variant: "destructive",
      });
    }
  }, [toast, contentConfig, contentType]);

  // 智能检测导入类型
  const detectImportType = useCallback((data: any[]): 'course' | 'material' | 'vocabulary' | 'exercise' | 'sentence' => {
    if (!data || data.length === 0) return contentType as 'course' | 'material' | 'vocabulary' | 'exercise' | 'sentence';
    
    const firstItem = data[0];
    
    // 检测是否为句子格式（包含japanese和chinese字段）
    if (firstItem.japanese && firstItem.chinese) {
      return 'sentence';
    }
    
    // 默认返回原始类型
    return contentType as 'course' | 'material' | 'vocabulary' | 'exercise' | 'sentence';
  }, [contentType]);

  // 开始导入
  const handleImport = useCallback(async () => {
    if (!parsedData.length || !validationResult?.isValid) return;

    setImporting(true);
    setCurrentStep(3);
    setImportProgress(0);

    try {
      // 检查认证状态
      const token = localStorage.getItem('admin_token');
      console.log('认证Token状态:', token ? '存在' : '不存在');
      
      // 智能检测实际的导入类型
      const actualImportType = detectImportType(parsedData);
      console.log('检测到的导入类型:', actualImportType);
      console.log('要导入的数据样例:', parsedData.slice(0, 2));
      
      if (actualImportType === 'sentence' && contentType === 'material') {
        toast({
          title: "检测到句子格式",
          description: "系统将自动使用句子导入模式，同时创建分类和标签关联",
        });
      }

      const batchSize = 10; // 每批处理10条数据
      const batches = [];
      
      for (let i = 0; i < parsedData.length; i += batchSize) {
        batches.push(parsedData.slice(i, i + batchSize));
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const progress = ((i + 1) / batches.length) * 100;
        setImportProgress(progress);

        try {
          console.log(`正在处理批次 ${i + 1}/${batches.length}:`, batch);
          
          // 使用智能检测的导入类型
          const result = await contentService.batchCreate(actualImportType, batch);
          console.log(`批次 ${i + 1} 响应:`, result);
          
          if (result.success) {
            successCount += batch.length;
            console.log(`批次 ${i + 1} 成功`);
          } else {
            errorCount += batch.length;
            const errorMsg = `批次 ${i + 1}: ${result.message || '导入失败'}`;
            errors.push(errorMsg);
            console.error(errorMsg, result);
          }
        } catch (error: any) {
          errorCount += batch.length;
          const errorMsg = `批次 ${i + 1}: ${error.response?.data?.message || error.message || '导入失败'}`;
          errors.push(errorMsg);
          console.error(`批次 ${i + 1} 错误:`, error);
          console.error('错误响应数据:', error.response?.data);
        }

        // 添加延迟避免服务器过载
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setImportResult({
        successCount,
        errorCount,
        totalCount: parsedData.length,
        errors
      });

      setCurrentStep(4);
      
      if (successCount > 0) {
        onImportComplete();
        toast({
          title: "导入完成",
          description: `成功导入 ${successCount} 条数据${actualImportType === 'sentence' ? '，已自动创建分类和标签关联' : ''}`,
        });
      } else if (errors.length > 0) {
        console.error('所有批次都失败了:', errors);
        toast({
          title: "导入失败",
          description: "所有数据都导入失败，请检查数据格式和网络连接",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('导入过程中发生错误:', error);
      toast({
        title: "导入失败",
        description: error.message || "导入过程中发生错误",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  }, [parsedData, validationResult, detectImportType, contentType, onImportComplete, toast]);

  // 下载模板
  const downloadTemplate = useCallback(() => {
    const headers = contentConfig.fields;
    const csvContent = [
      headers.join(','),
      ...contentConfig.template.map(row => 
        headers.map(field => row[field] || '').join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${contentConfig.title}_导入模板.csv`;
    link.click();
  }, [contentConfig]);

  // 重置状态
  const resetDialog = useCallback(() => {
    setCurrentStep(0);
    setUploadedFile(null);
    setParsedData([]);
    setValidationResult(null);
    setImporting(false);
    setImportProgress(0);
    setImportResult(null);
    setDetectedConfig(null);
  }, []);

  const handleClose = useCallback(() => {
    resetDialog();
    onOpenChange(false);
  }, [resetDialog, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {contentConfig.icon}
            批量导入{contentConfig.title}
          </DialogTitle>
          <DialogDescription>
            支持CSV、Excel和JSON格式文件，可批量导入大量{contentConfig.title}数据
          </DialogDescription>
        </DialogHeader>

        {/* 进度指示器 */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                index <= currentStep 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-500'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Tabs value={`step-${currentStep}`}>
          {/* 步骤0: 文件上传 */}
          <TabsContent value="step-0" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  上传文件
                </CardTitle>
                <CardDescription>
                  请选择包含{contentConfig.title}数据的文件进行上传
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 支持的格式 */}
                <div className="flex gap-2 mb-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileSpreadsheet className="h-3 w-3" />
                    CSV
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Excel
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Code className="h-3 w-3" />
                    JSON
                  </Badge>
                </div>

                {/* 文件上传区域 */}
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">拖拽文件到此处</p>
                  <p className="text-sm text-gray-500 mb-4">或者点击选择文件</p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button 
                    variant="outline" 
                    className="pointer-events-none"
                    type="button"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    选择文件
                  </Button>
                </div>

                {/* 调试信息区域 */}
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                  <h4 className="font-medium mb-2">调试信息:</h4>
                  <p>对话框打开: {open ? '是' : '否'}</p>
                  <p>当前内容类型: {contentType}</p>
                  <p>当前步骤: {currentStep}</p>
                  <p>已上传文件: {uploadedFile ? uploadedFile.name : '无'}</p>
                  <p>解析数据条数: {parsedData.length}</p>
                  <p>认证Token: {localStorage.getItem('admin_token') ? '存在' : '缺失 ⚠️'}</p>
                  <p>后端地址: {window.location.origin.replace('8081', '8000')}</p>
                  <div className="mt-2 space-x-2">
                    <button 
                      type="button"
                      onClick={() => console.log('测试按钮点击正常')}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
                    >
                      测试点击
                    </button>
                    <button 
                      type="button"
                      onClick={async () => {
                        try {
                          const response = await fetch(window.location.origin.replace('8081', '8000') + '/api/admin/content/batch/sentence', {
                            method: 'GET',
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                              'Content-Type': 'application/json'
                            }
                          });
                          console.log('API连接测试:', response.status, await response.text());
                        } catch (e) {
                          console.log('API连接失败:', e);
                        }
                      }}
                      className="px-3 py-1 bg-green-500 text-white rounded text-xs"
                    >
                      测试API
                    </button>
                    <button 
                      type="button"
                      onClick={async () => {
                        try {
                          // 尝试登录获取token
                          const response = await fetch(window.location.origin.replace('8081', '8000') + '/api/admin/login', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                              account: 'admin@90nihongo.com',
                              password: 'admin123'
                            })
                          });
                          const data = await response.json();
                          if (data.success) {
                            localStorage.setItem('admin_token', data.token);
                            localStorage.setItem('admin_info', JSON.stringify(data.admin));
                            console.log('✅ 自动登录成功:', data);
                            toast({
                              title: "自动登录成功",
                              description: "已获取管理员token，可以进行导入操作了",
                            });
                            // 触发重新渲染
                            window.location.reload();
                          } else {
                            console.log('❌ 自动登录失败:', data);
                            toast({
                              title: "自动登录失败",
                              description: data.message || "请手动登录管理员账户",
                              variant: "destructive",
                            });
                          }
                        } catch (e) {
                          console.log('❌ 自动登录错误:', e);
                          toast({
                            title: "连接失败",
                            description: "无法连接到后端服务器，请确保后端服务正在运行",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="px-3 py-1 bg-yellow-500 text-white rounded text-xs"
                    >
                      自动登录
                    </button>
                  </div>
                </div>

                {/* 模板下载 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">需要导入模板？</h4>
                      <p className="text-sm text-blue-700">
                        下载标准模板，了解正确的数据格式和必填字段
                      </p>
                    </div>
                    <Button variant="outline" onClick={downloadTemplate}>
                      <Download className="h-4 w-4 mr-2" />
                      下载模板
                    </Button>
                  </div>
                </div>

                {/* 字段说明 */}
                <div className="space-y-2">
                  <h4 className="font-medium">字段说明：</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {contentConfig.fields.map(field => (
                      <div key={field} className="flex items-center gap-2">
                        <Badge variant={contentConfig.requiredFields.includes(field) ? "destructive" : "secondary"}>
                          {contentConfig.requiredFields.includes(field) ? '必填' : '可选'}
                        </Badge>
                        <span>{field}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 步骤1-2: 数据验证和预览 */}
          <TabsContent value="step-1" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  数据验证
                </CardTitle>
              </CardHeader>
              <CardContent>
                {validationResult && (
                  <div className="space-y-4">
                    {/* 验证结果概览 */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{validationResult.totalRows}</p>
                        <p className="text-sm text-gray-600">总记录数</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{validationResult.validRows}</p>
                        <p className="text-sm text-green-600">有效记录</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">
                          {validationResult.errors.filter(e => e.type === 'error').length}
                        </p>
                        <p className="text-sm text-red-600">错误</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{validationResult.warnings}</p>
                        <p className="text-sm text-yellow-600">警告</p>
                      </div>
                    </div>

                    {/* 错误列表 */}
                    {validationResult.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">验证结果：</h4>
                        <div className="max-h-60 overflow-y-auto space-y-1">
                          {validationResult.errors.slice(0, 20).map((error, index) => (
                            <Alert key={index} variant={error.type === 'error' ? 'destructive' : 'default'}>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                第{error.row}行，{error.column}列：{error.message}
                              </AlertDescription>
                            </Alert>
                          ))}
                          {validationResult.errors.length > 20 && (
                            <p className="text-sm text-gray-500 text-center">
                              还有 {validationResult.errors.length - 20} 个错误...
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setCurrentStep(0)}>
                        重新上传
                      </Button>
                      <Button 
                        onClick={() => setCurrentStep(2)}
                        disabled={!validationResult.isValid}
                      >
                        继续预览
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 步骤2: 数据预览 */}
          <TabsContent value="step-2" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  数据预览
                </CardTitle>
                <CardDescription>
                  确认要导入的数据，仅显示前10条记录
                </CardDescription>
              </CardHeader>
              <CardContent>
                {parsedData.length > 0 && (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {(detectedConfig || contentConfig).fields.map(field => (
                              <TableHead key={field}>
                                {field}
                                {(detectedConfig || contentConfig).requiredFields.includes(field) && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedData.slice(0, 10).map((row, index) => (
                            <TableRow key={index}>
                              {(detectedConfig || contentConfig).fields.map(field => (
                                <TableCell key={field}>
                                  {Array.isArray(row[field]) ? JSON.stringify(row[field]) : (row[field] || '-')}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {parsedData.length > 10 && (
                      <p className="text-sm text-gray-500 text-center">
                        还有 {parsedData.length - 10} 条数据未显示...
                      </p>
                    )}

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setCurrentStep(1)}>
                        返回验证
                      </Button>
                      <Button onClick={handleImport}>
                        开始导入
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 步骤3: 导入进行中 */}
          <TabsContent value="step-3" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  正在导入...
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Progress value={importProgress} className="w-full mb-4" />
                  <p className="text-lg font-medium">导入进度: {Math.round(importProgress)}%</p>
                  <p className="text-sm text-gray-500">请稍候，正在处理您的数据...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 步骤4: 导入完成 */}
          <TabsContent value="step-4" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  导入完成
                </CardTitle>
              </CardHeader>
              <CardContent>
                {importResult && (
                  <div className="space-y-4">
                    {/* 导入结果统计 */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{importResult.totalCount}</p>
                        <p className="text-sm text-blue-600">总计</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{importResult.successCount}</p>
                        <p className="text-sm text-green-600">成功</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{importResult.errorCount}</p>
                        <p className="text-sm text-red-600">失败</p>
                      </div>
                    </div>

                    {/* 错误信息 */}
                    {importResult.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-red-600">导入错误：</h4>
                        <div className="space-y-1">
                          {importResult.errors.map((error: string, index: number) => (
                            <Alert key={index} variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>{error}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={resetDialog}>
                        重新导入
                      </Button>
                      <Button onClick={handleClose}>
                        完成
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BatchImportDialog; 