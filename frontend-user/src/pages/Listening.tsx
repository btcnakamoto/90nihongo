
import { useState } from 'react';
import { Link } from 'react-router-dom';
import AudioPlayer from '@/components/AudioPlayer';

const Listening = () => {
  // Sample listening exercises
  const [exercises, setExercises] = useState([
    {
      id: 1,
      title: 'レストランでの注文',
      englishTitle: 'Ordering at a Restaurant',
      description: 'Practice understanding basic restaurant conversations.',
      difficulty: 'Beginner',
      completed: false,
      audioSrc: '#'
    },
    {
      id: 2,
      title: '道の聞き方',
      englishTitle: 'Asking for Directions',
      description: 'Learn how to ask for and understand directions.',
      difficulty: 'Beginner',
      completed: false,
      audioSrc: '#'
    },
    {
      id: 3,
      title: '買い物での会話',
      englishTitle: 'Shopping Conversations',
      description: 'Practice conversations while shopping.',
      difficulty: 'Intermediate',
      completed: false,
      audioSrc: '#'
    }
  ]);

  // Active exercise state
  const [activeExercise, setActiveExercise] = useState<number | null>(null);

  // Mock transcription exercises
  const dictationExercises = [
    {
      id: 1,
      audio: '#',
      text: 'こんにちは、お元気ですか？',
      hint: 'Hello, how are you?'
    },
    {
      id: 2,
      audio: '#',
      text: 'すみません、トイレはどこですか？',
      hint: 'Excuse me, where is the bathroom?'
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
    // In a real app, this would compare with correct answer and give feedback
    console.log('Checking dictation...');
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
            聴解練習
            <span className="text-xl text-japan-stone ml-2">Listening Practice</span>
          </h1>
        </div>
        <p className="text-japan-stone">Improve your listening skills with these exercises</p>
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
              聴解エクササイズ
              <span className="text-sm text-japan-stone ml-2">Exercises</span>
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
                        <p className="text-xs text-japan-stone">{exercise.englishTitle}</p>
                      </div>
                      <span className={`
                        text-xs font-medium px-2 py-1 rounded-full
                        ${exercise.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' : ''}
                        ${exercise.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${exercise.difficulty === 'Advanced' ? 'bg-red-100 text-red-800' : ''}
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
                  <span className="text-sm text-japan-stone ml-2">
                    ({exercises.find(e => e.id === activeExercise)?.englishTitle})
                  </span>
                </h2>
                <p className="text-japan-stone mt-2">
                  {exercises.find(e => e.id === activeExercise)?.description}
                </p>
              </div>

              {/* Audio player */}
              <div>
                <h3 className="font-display font-medium mb-2">
                  会話を聞く (Listen to the conversation)
                </h3>
                <AudioPlayer
                  src="#"
                  showTranscript={true}
                  japaneseText="スタッフ: いらっしゃいませ。何名様ですか？\n客: 二人です。\nスタッフ: かしこまりました。こちらへどうぞ。\n客: すみません。メニューをください。\nスタッフ: はい、少々お待ちください。"
                  transcript="Staff: Welcome. How many people?\nCustomer: Two people.\nStaff: Understood. This way please.\nCustomer: Excuse me. May I have a menu?\nStaff: Yes, please wait a moment."
                />
              </div>

              {/* Comprehension questions */}
              <div className="bg-japan-cream/30 border border-japan-cream rounded-lg p-4">
                <h3 className="font-display font-medium text-lg mb-3 text-japan-navy">
                  内容理解 (Comprehension Questions)
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2">1. How many people are in the customer's group?</p>
                    <div className="space-x-2">
                      <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-japan-indigo hover:text-white transition-colors">One</button>
                      <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-japan-indigo hover:text-white transition-colors">Two</button>
                      <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-japan-indigo hover:text-white transition-colors">Three</button>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2">2. What does the customer ask for?</p>
                    <div className="space-x-2">
                      <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-japan-indigo hover:text-white transition-colors">Water</button>
                      <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-japan-indigo hover:text-white transition-colors">Menu</button>
                      <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-japan-indigo hover:text-white transition-colors">Check</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dictation exercise */}
              <div className="bg-japan-indigo/10 border border-japan-indigo/20 rounded-lg p-4">
                <h3 className="font-display font-medium text-lg mb-3 text-japan-navy">
                  書き取り練習 (Dictation Practice)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Listen to the audio and write what you hear in Japanese. Click the hint button if you need help.
                </p>

                <AudioPlayer src="#" className="mb-4" />

                <div className="space-y-3">
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-japan-indigo"
                    rows={4}
                    placeholder="Type what you hear..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                  ></textarea>

                  <div className="flex justify-between">
                    <button
                      className="bg-gray-100 hover:bg-gray-200 text-japan-navy px-3 py-1 rounded-md transition-colors"
                      onClick={() => setShowHint(!showHint)}
                    >
                      {showHint ? 'Hide Hint' : 'Show Hint'}
                    </button>
                    <button
                      className="bg-japan-indigo hover:bg-japan-indigo/90 text-white px-3 py-1 rounded-md transition-colors"
                      onClick={checkDictation}
                    >
                      Check Answer
                    </button>
                  </div>

                  {showHint && (
                    <div className="bg-white border border-gray-200 rounded-md p-3 mt-2">
                      <p className="text-sm text-japan-stone">
                        Hint: The conversation is about ordering food at a restaurant.
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
                  完了 (Complete)
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
                聴解練習にようこそ！
              </h2>
              <p className="text-japan-stone mb-6">Welcome to Listening Practice!</p>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Improve your Japanese listening skills with our targeted exercises. Select an exercise from the list to begin.
              </p>
              <div className="bg-japan-cream/30 border border-japan-cream rounded-lg p-4 w-full max-w-md">
                <h3 className="font-display font-medium text-lg mb-2 text-japan-navy">
                  練習のヒント (Practice Tips)
                </h3>
                <ul className="text-left space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-indigo mr-2 mt-1 flex-shrink-0">
                      <path d="m12 15 2 2 4-4"></path>
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                    Listen to the audio multiple times before checking the transcript.
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-indigo mr-2 mt-1 flex-shrink-0">
                      <path d="m12 15 2 2 4-4"></path>
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                    Try the dictation exercise to improve your listening accuracy.
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-indigo mr-2 mt-1 flex-shrink-0">
                      <path d="m12 15 2 2 4-4"></path>
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                    Focus on understanding the general meaning before details.
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
