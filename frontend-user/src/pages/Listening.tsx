import { useState } from 'react';
import { Link } from 'react-router-dom';
import AudioPlayer from '@/components/AudioPlayer';

const Listening = () => {
  // Sample listening exercises
  const [exercises, setExercises] = useState([
    {
      id: 1,
      title: '餐厅点餐',
      englishTitle: '',
      description: '练习听懂餐厅场景下的基础对话。',
      difficulty: '初级',
      completed: false,
      audioSrc: '#'
    },
    {
      id: 2,
      title: '问路表达',
      englishTitle: '',
      description: '学习如何问路和理解方向相关表达。',
      difficulty: '初级',
      completed: false,
      audioSrc: '#'
    },
    {
      id: 3,
      title: '购物会话',
      englishTitle: '',
      description: '练习购物场景下的常用会话。',
      difficulty: '中级',
      completed: false,
      audioSrc: '#'
    }
  ]);

  // Active exercise state
  const [activeExercise, setActiveExercise] = useState<number | null>(null);
  // Shadowing mode state
  const [isShadowingMode, setIsShadowingMode] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [repeatInterval, setRepeatInterval] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  // Mock transcription exercises
  const dictationExercises = [
    {
      id: 1,
      audio: '#',
      text: 'こんにちは、お元気ですか？',
      hint: '你好，最近好吗？'
    },
    {
      id: 2,
      audio: '#',
      text: 'すみません、トイレはどこですか？',
      hint: '对不起，洗手间在哪里？'
    }
  ];

  // Dictation state
  const [userInput, setUserInput] = useState('');
  const [activeDictation, setActiveDictation] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const handleExerciseClick = (id: number) => {
    setActiveExercise(id === activeExercise ? null : id);
  };

  const handleExerciseComplete = (id: number) => {
    setExercises(exercises.map(exercise => 
      exercise.id === id ? { ...exercise, completed: true } : exercise
    ));
  };

  const checkDictation = () => {
    console.log('检查答案...');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Link to="/" className="text-japan-indigo hover:text-japan-pink mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </Link>
          <h1 className="text-3xl font-display font-bold text-japan-navy">
            听力练习
          </h1>
        </div>
        <p className="text-japan-stone">通过这些练习提升你的日语听力能力</p>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Exercise list */}
        <div className="col-span-1">
          <div className="paper-card p-5 sticky top-4">
            <h2 className="text-xl font-display font-medium text-japan-navy mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              听力题目
            </h2>

            <div className="space-y-3">
              {exercises.map(exercise => (
                <div 
                  key={exercise.id}
                  className={`
                    border rounded-lg overflow-hidden transition-colors cursor-pointer
                    ${exercise.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-japan-pink/30'}
                    ${activeExercise === exercise.id ? 'ring-2 ring-japan-indigo ring-opacity-50' : ''}
                  `}
                  onClick={() => handleExerciseClick(exercise.id)}
                >
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-display font-medium">
                          {exercise.title}
                        </h3>
                      </div>
                      <span className={`
                        text-xs font-medium px-2 py-1 rounded-full
                        ${exercise.difficulty === '初级' ? 'bg-green-100 text-green-800' : ''}
                        ${exercise.difficulty === '中级' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${exercise.difficulty === '高级' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {exercise.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Active exercise or intro */}
        <div className="col-span-2">
          {activeExercise ? (
            <div className="space-y-6 paper-card p-5">
              {/* Active exercise header */}
              <div>
                <h2 className="text-2xl font-display font-medium text-japan-navy border-b border-gray-100 pb-3">
                  {exercises.find(e => e.id === activeExercise)?.title}
                </h2>
                <p className="text-japan-stone mt-2">
                  {exercises.find(e => e.id === activeExercise)?.description}
                </p>
              </div>

              {/* Audio player */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-display font-medium">
                    {isShadowingMode ? "Shadowing练习" : "听对话音频"}
                  </h3>
                  <button 
                    onClick={() => setIsShadowingMode(!isShadowingMode)}
                    className="text-sm text-japan-indigo hover:text-japan-pink"
                  >
                    切换到{isShadowingMode ? "普通听力" : "Shadowing"}模式
                  </button>
                </div>
                
                {isShadowingMode && (
                  <div className="mb-4 space-y-3 bg-japan-cream/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">播放速度：{playbackSpeed}x</span>
                      <div className="space-x-2">
                        <button 
                          onClick={() => setPlaybackSpeed(Math.max(0.5, playbackSpeed - 0.1))}
                          className="px-2 py-1 text-sm border rounded hover:bg-japan-indigo hover:text-white"
                        >
                          减慢
                        </button>
                        <button 
                          onClick={() => setPlaybackSpeed(1)}
                          className="px-2 py-1 text-sm border rounded hover:bg-japan-indigo hover:text-white"
                        >
                          重置
                        </button>
                        <button 
                          onClick={() => setPlaybackSpeed(Math.min(2, playbackSpeed + 0.1))}
                          className="px-2 py-1 text-sm border rounded hover:bg-japan-indigo hover:text-white"
                        >
                          加快
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">重复间隔：{repeatInterval}秒</span>
                      <div className="space-x-2">
                        <button 
                          onClick={() => setRepeatInterval(Math.max(0, repeatInterval - 1))}
                          className="px-2 py-1 text-sm border rounded hover:bg-japan-indigo hover:text-white"
                        >
                          减少
                        </button>
                        <button 
                          onClick={() => setRepeatInterval(0)}
                          className="px-2 py-1 text-sm border rounded hover:bg-japan-indigo hover:text-white"
                        >
                          关闭
                        </button>
                        <button 
                          onClick={() => setRepeatInterval(repeatInterval + 1)}
                          className="px-2 py-1 text-sm border rounded hover:bg-japan-indigo hover:text-white"
                        >
                          增加
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">录音对比：</span>
                      <button 
                        onClick={() => setIsRecording(!isRecording)}
                        className={`px-3 py-1 rounded flex items-center ${
                          isRecording 
                            ? 'bg-red-500 text-white' 
                            : 'border border-gray-300 hover:bg-japan-indigo hover:text-white'
                        }`}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="mr-1"
                        >
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                          <line x1="12" y1="19" x2="12" y2="22"></line>
                        </svg>
                        {isRecording ? '停止录音' : '开始录音'}
                      </button>
                    </div>
                  </div>
                )}

                <AudioPlayer
                  src="#"
                  showTranscript={true}
                  japaneseText="スタッフ: いらっしゃいませ。何名様ですか？\n客: 二人です。\nスタッフ: かしこまりました。こちらへどうぞ。\n客: すみません。メニューをください。\nスタッフ: はい、少々お待ちください。"
                  transcript="服务员：欢迎光临。请问几位？\n客人：两位。\n服务员：好的，这边请。\n客人：对不起，请给我菜单。\n服务员：好的，请稍等。"
                  shadowingMode={isShadowingMode}
                  playbackSpeed={playbackSpeed}
                  repeatInterval={repeatInterval}
                  isRecording={isRecording}
                  onRecordingComplete={(blob) => {
                    // 处理录音完成后的音频数据
                    console.log('录音完成', blob);
                  }}
                />
              </div>

              {/* Comprehension questions */}
              <div className="bg-japan-cream/30 border border-japan-cream rounded-lg p-4">
                <h3 className="font-display font-medium text-lg mb-3 text-japan-navy">
                  听力理解问题
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2">1. 顾客一行有几个人？</p>
                    <div className="space-x-2">
                      <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-japan-indigo hover:text-white transition-colors">一位</button>
                      <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-japan-indigo hover:text-white transition-colors">两位</button>
                      <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-japan-indigo hover:text-white transition-colors">三位</button>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2">2. 顾客向服务员要了什么？</p>
                    <div className="space-x-2">
                      <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-japan-indigo hover:text-white transition-colors">水</button>
                      <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-japan-indigo hover:text-white transition-colors">菜单</button>
                      <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-japan-indigo hover:text-white transition-colors">账单</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dictation exercise */}
              <div className="bg-japan-indigo/10 border border-japan-indigo/20 rounded-lg p-4">
                <h3 className="font-display font-medium text-lg mb-3 text-japan-navy">
                  听写练习
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  听音频内容并用日语写下你听到的内容。如果需要帮助可以点击提示按钮。
                </p>

                <AudioPlayer src="#" className="mb-4" />

                <div className="space-y-3">
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-japan-indigo"
                    rows={4}
                    placeholder="请输入听到的内容..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                  ></textarea>

                  <div className="flex justify-between">
                    <button
                      className="text-xs text-japan-indigo hover:underline"
                      onClick={() => setShowHint(!showHint)}
                    >
                      {showHint ? '隐藏提示' : '显示提示'}
                    </button>
                    <button
                      className="px-4 py-2 bg-japan-indigo text-white rounded-lg mt-2"
                      onClick={checkDictation}
                    >
                      检查答案
                    </button>
                  </div>

                  {showHint && (
                    <div className="bg-white border border-gray-200 rounded-md p-3 mt-2">
                      <p className="text-sm text-japan-stone">
                        提示：这段对话是关于在餐厅点餐的场景。
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Complete button */}
              <div className="mt-6 flex justify-end">
                <button
                  className="bg-japan-indigo hover:bg-japan-indigo/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  onClick={() => handleExerciseComplete(activeExercise)}
                >
                  完成练习
                </button>
              </div>
            </div>
          ) : (
            <div className="paper-card p-8 flex flex-col items-center justify-center text-center">
              <div className="bg-japan-indigo/10 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-indigo">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-display font-medium text-japan-navy mb-2">
                开始你的听力训练吧！
              </h2>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                通过有针对性的练习提升你的日语听力能力。请选择左侧的题目开始练习。
              </p>
              <div className="bg-japan-cream/30 border border-japan-cream rounded-lg p-4 w-full max-w-md">
                <h3 className="font-display font-medium text-lg mb-2 text-japan-navy">
                  练习提示
                </h3>
                <ul className="text-left space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-indigo mr-2 mt-1 flex-shrink-0">
                      <path d="m12 15 2 2 4-4"></path>
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                    多听几遍音频再查看文本内容。
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-indigo mr-2 mt-1 flex-shrink-0">
                      <path d="m12 15 2 2 4-4"></path>
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                    通过听写练习提升听辨能力。
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-indigo mr-2 mt-1 flex-shrink-0">
                      <path d="m12 15 2 2 4-4"></path>
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                    先理解大意，再关注细节。
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Listening;
