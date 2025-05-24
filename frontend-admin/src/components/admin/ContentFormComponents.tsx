import { memo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { BookOpen, Layers, Target, Brain } from 'lucide-react';
import type { 
  CreateCourseData, 
  CreateMaterialData, 
  CreateVocabularyData, 
  CreateExerciseData,
  Course 
} from '@/services/contentService';

// 内容类型选择器组件
export const ContentTypeSelector = memo(({ 
  contentType, 
  onTypeChange 
}: { 
  contentType: 'course' | 'material' | 'vocabulary' | 'exercise';
  onTypeChange: (type: 'course' | 'material' | 'vocabulary' | 'exercise') => void;
}) => {
  return (
    <div>
      <Label>内容类型</Label>
      <div className="flex gap-2 mt-2">
        <Button 
          type="button"
          variant={contentType === 'course' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTypeChange('course')}
        >
          <BookOpen className="h-4 w-4 mr-1" />
          课程
        </Button>
        <Button 
          type="button"
          variant={contentType === 'material' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTypeChange('material')}
        >
          <Layers className="h-4 w-4 mr-1" />
          学习材料
        </Button>
        <Button 
          type="button"
          variant={contentType === 'vocabulary' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTypeChange('vocabulary')}
        >
          <Target className="h-4 w-4 mr-1" />
          词汇
        </Button>
        <Button 
          type="button"
          variant={contentType === 'exercise' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTypeChange('exercise')}
        >
          <Brain className="h-4 w-4 mr-1" />
          练习题
        </Button>
      </div>
    </div>
  );
});

// 课程创建表单组件
export const CourseForm = memo(({ 
  form, 
  onChange 
}: { 
  form: CreateCourseData;
  onChange: (field: keyof CreateCourseData, value: any) => void;
}) => {
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('title', e.target.value);
  }, [onChange]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange('description', e.target.value);
  }, [onChange]);

  const handleDayNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('day_number', parseInt(e.target.value) || 1);
  }, [onChange]);

  const handleDifficultyChange = useCallback((value: string) => {
    onChange('difficulty', value);
  }, [onChange]);

  const handleActiveChange = useCallback((checked: boolean) => {
    onChange('is_active', checked);
  }, [onChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="course-title">课程标题 *</Label>
          <Input
            id="course-title"
            value={form.title}
            onChange={handleTitleChange}
            placeholder="输入课程标题"
          />
        </div>
        <div>
          <Label htmlFor="course-day">课程天数 *</Label>
          <Input
            id="course-day"
            type="number"
            min="1"
            max="90"
            value={form.day_number}
            onChange={handleDayNumberChange}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="course-description">课程描述 *</Label>
        <Textarea
          id="course-description"
          value={form.description}
          onChange={handleDescriptionChange}
          placeholder="输入课程详细描述..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="course-difficulty">难度级别</Label>
          <Select value={form.difficulty} onValueChange={handleDifficultyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">初级</SelectItem>
              <SelectItem value="intermediate">中级</SelectItem>
              <SelectItem value="advanced">高级</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <Checkbox 
            id="course-active"
            checked={form.is_active}
            onCheckedChange={handleActiveChange}
          />
          <Label htmlFor="course-active">立即发布</Label>
        </div>
      </div>
    </div>
  );
});

// 学习材料创建表单组件
export const MaterialForm = memo(({ 
  form, 
  courses,
  uploading,
  onChange,
  onFileUpload
}: { 
  form: CreateMaterialData;
  courses: Course[];
  uploading: boolean;
  onChange: (field: keyof CreateMaterialData, value: any) => void;
  onFileUpload: (file: File) => void;
}) => {
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('title', e.target.value);
  }, [onChange]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange('content', e.target.value);
  }, [onChange]);

  const handleCourseChange = useCallback((value: string) => {
    onChange('course_id', parseInt(value));
  }, [onChange]);

  const handleTypeChange = useCallback((value: string) => {
    onChange('type', value);
  }, [onChange]);

  const handleDurationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('duration_minutes', parseInt(e.target.value) || 0);
  }, [onChange]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="material-title">材料标题 *</Label>
          <Input
            id="material-title"
            value={form.title}
            onChange={handleTitleChange}
            placeholder="输入材料标题"
          />
        </div>
        <div>
          <Label htmlFor="material-course">所属课程 *</Label>
          <Select value={form.course_id.toString()} onValueChange={handleCourseChange}>
            <SelectTrigger>
              <SelectValue placeholder="选择课程" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  第{course.day_number}天 - {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="material-type">材料类型</Label>
          <Select value={form.type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">视频</SelectItem>
              <SelectItem value="audio">音频</SelectItem>
              <SelectItem value="text">文本</SelectItem>
              <SelectItem value="quiz">测验</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="material-duration">时长(分钟)</Label>
          <Input
            id="material-duration"
            type="number"
            min="0"
            value={form.duration_minutes}
            onChange={handleDurationChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="material-content">材料内容 *</Label>
        <Textarea
          id="material-content"
          value={form.content}
          onChange={handleContentChange}
          placeholder="输入材料内容..."
          rows={4}
        />
      </div>

      {(form.type === 'video' || form.type === 'audio') && (
        <div>
          <Label htmlFor="material-file">上传文件</Label>
          <div className="mt-2">
            <Input
              id="material-file"
              type="file"
              accept={form.type === 'video' ? 'video/*' : 'audio/*'}
              onChange={handleFileChange}
              disabled={uploading}
            />
            {uploading && <p className="text-sm text-gray-500 mt-1">上传中...</p>}
            {form.media_url && (
              <p className="text-sm text-green-600 mt-1">✓ 文件已上传</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

// 词汇创建表单组件
export const VocabularyForm = memo(({ 
  form, 
  onChange 
}: { 
  form: CreateVocabularyData;
  onChange: (field: keyof CreateVocabularyData, value: any) => void;
}) => {
  const handleWordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('word', e.target.value);
  }, [onChange]);

  const handleReadingChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('reading', e.target.value);
  }, [onChange]);

  const handleMeaningChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('meaning', e.target.value);
  }, [onChange]);

  const handlePartOfSpeechChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('part_of_speech', e.target.value);
  }, [onChange]);

  const handleJlptLevelChange = useCallback((value: string) => {
    onChange('jlpt_level', value);
  }, [onChange]);

  const handleExampleSentenceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('example_sentence', e.target.value);
  }, [onChange]);

  const handleExampleReadingChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('example_reading', e.target.value);
  }, [onChange]);

  const handleExampleMeaningChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('example_meaning', e.target.value);
  }, [onChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="vocab-word">单词 *</Label>
          <Input
            id="vocab-word"
            value={form.word}
            onChange={handleWordChange}
            placeholder="例：こんにちは"
          />
        </div>
        <div>
          <Label htmlFor="vocab-reading">读音 *</Label>
          <Input
            id="vocab-reading"
            value={form.reading}
            onChange={handleReadingChange}
            placeholder="例：konnichiha"
          />
        </div>
        <div>
          <Label htmlFor="vocab-meaning">中文意思 *</Label>
          <Input
            id="vocab-meaning"
            value={form.meaning}
            onChange={handleMeaningChange}
            placeholder="例：你好"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vocab-pos">词性</Label>
          <Input
            id="vocab-pos"
            value={form.part_of_speech}
            onChange={handlePartOfSpeechChange}
            placeholder="例：感叹词"
          />
        </div>
        <div>
          <Label htmlFor="vocab-jlpt">JLPT级别</Label>
          <Select value={form.jlpt_level} onValueChange={handleJlptLevelChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="N5">N5</SelectItem>
              <SelectItem value="N4">N4</SelectItem>
              <SelectItem value="N3">N3</SelectItem>
              <SelectItem value="N2">N2</SelectItem>
              <SelectItem value="N1">N1</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="vocab-example">例句</Label>
        <Input
          id="vocab-example"
          value={form.example_sentence}
          onChange={handleExampleSentenceChange}
          placeholder="例：こんにちは、田中さん。"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vocab-example-reading">例句读音</Label>
          <Input
            id="vocab-example-reading"
            value={form.example_reading}
            onChange={handleExampleReadingChange}
            placeholder="例：konnichiha, tanaka-san."
          />
        </div>
        <div>
          <Label htmlFor="vocab-example-meaning">例句中文</Label>
          <Input
            id="vocab-example-meaning"
            value={form.example_meaning}
            onChange={handleExampleMeaningChange}
            placeholder="例：你好，田中先生。"
          />
        </div>
      </div>
    </div>
  );
});

// 练习题创建表单组件
export const ExerciseForm = memo(({ 
  form, 
  courses,
  onChange 
}: { 
  form: CreateExerciseData;
  courses: Course[];
  onChange: (field: keyof CreateExerciseData, value: any) => void;
}) => {
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('title', e.target.value);
  }, [onChange]);

  const handleCourseChange = useCallback((value: string) => {
    onChange('course_id', parseInt(value));
  }, [onChange]);

  const handleTypeChange = useCallback((value: string) => {
    onChange('type', value);
  }, [onChange]);

  const handleQuestionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange('question', e.target.value);
  }, [onChange]);

  const handleCorrectAnswerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('correct_answer', e.target.value);
  }, [onChange]);

  const handleExplanationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('explanation', e.target.value);
  }, [onChange]);

  const handlePointsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('points', parseInt(e.target.value) || 10);
  }, [onChange]);

  const handleOptionChange = useCallback((index: number, value: string) => {
    const newOptions = [...(form.options || [])];
    newOptions[index] = value;
    onChange('options', newOptions);
  }, [form.options, onChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="exercise-title">练习题标题 *</Label>
          <Input
            id="exercise-title"
            value={form.title}
            onChange={handleTitleChange}
            placeholder="输入练习题标题"
          />
        </div>
        <div>
          <Label htmlFor="exercise-course">所属课程 *</Label>
          <Select value={form.course_id.toString()} onValueChange={handleCourseChange}>
            <SelectTrigger>
              <SelectValue placeholder="选择课程" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  第{course.day_number}天 - {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="exercise-type">练习类型</Label>
          <Select value={form.type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="listening">听力</SelectItem>
              <SelectItem value="speaking">口语</SelectItem>
              <SelectItem value="grammar">语法</SelectItem>
              <SelectItem value="vocabulary">词汇</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="exercise-points">分值</Label>
          <Input
            id="exercise-points"
            type="number"
            min="1"
            value={form.points}
            onChange={handlePointsChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="exercise-question">题目内容 *</Label>
        <Textarea
          id="exercise-question"
          value={form.question}
          onChange={handleQuestionChange}
          placeholder="输入题目内容..."
          rows={3}
        />
      </div>

      <div>
        <Label>选项 (如果是选择题)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {form.options?.map((option, index) => (
            <Input
              key={index}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`选项 ${String.fromCharCode(65 + index)}`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="exercise-answer">正确答案 *</Label>
          <Input
            id="exercise-answer"
            value={form.correct_answer}
            onChange={handleCorrectAnswerChange}
            placeholder="输入正确答案"
          />
        </div>
        <div>
          <Label htmlFor="exercise-explanation">答案解释</Label>
          <Input
            id="exercise-explanation"
            value={form.explanation}
            onChange={handleExplanationChange}
            placeholder="解释为什么这是正确答案"
          />
        </div>
      </div>
    </div>
  );
}); 