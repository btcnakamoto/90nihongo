
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

const Speaking = () => {
  // Sample conversation scenarios
  const scenarios = [
    {
      id: 1,
      title: 'レストランでの注文',
      englishTitle: 'Ordering at a Restaurant',
      difficulty: 'Beginner',
      completed: false,
      dialogues: [
        {
          role: 'staff',
          japanese: 'いらっしゃいませ。ご注文はお決まりですか？',
          english: 'Welcome. Have you decided on your order?'
        },
        {
          role: 'user',
          japanese: '',
          english: "Your response: 'Yes, I'd like to order ramen, please.'"
        },
        {
          role: 'staff',
          japanese: 'かしこまりました。ラーメンですね。お飲み物はいかがですか？',
          english: 'Certainly. Ramen it is. Would you like something to drink?'
        },
        {
          role: 'user',
          japanese: '',
          english: "Your response: 'Water, please.'"
        },
        {
          role: 'staff',
          japanese: 'かしこまりました。少々お待ちください。',
          english: 'Understood. Please wait a moment.'
        }
      ]
    },
    {
      id: 2,
      title: '道案内',
      englishTitle: 'Asking for Directions',
      difficulty: 'Beginner',
      completed: false,
      dialogues: [
        {
          role: 'user',
          japanese: '',
          english: "Your response: 'Excuse me, where is the station?'"
        },
        {
          role: 'person',
          japanese: '駅ですか？この道をまっすぐ行って、2つ目の信号を右に曲がってください。',
          english: 'The station? Go straight down this road and turn right at the second traffic light.'
        },
        {
          role: 'user',
          japanese: '',
          english: "Your response: 'How far is it?'"
        },
        {
          role: 'person',
          japanese: '歩いて約10分です。',
          english: "It's about 10 minutes by foot."
        },
        {
          role: 'user',
          japanese: '',
          english: "Your response: 'Thank you very much.'"
        }
      ]
    }
  ];

  // Phrases for quick practice
  const phrasesToPractice = [
    {
      japanese: 'すみません、これをお願いします。',
      english: 'Excuse me, I would like this please.',
      category: 'Ordering'
    },
    {
      japanese: 'お会計をお願いします。',
      english: 'May I have the bill, please?',
      category: 'Payment'
    },
    {
      japanese: 'これはいくらですか？',
      english: 'How much is this?',
      category: 'Shopping'
    },
    {
      japanese: '予約したいんですが。',
      english: 'I would like to make a reservation.',
      category: 'Reservation'
    }
  ];

  // State variables
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState(false);
  
  // Media recorder reference
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Start a new scenario
  const startScenario = (scenarioId: number) => {
    setActiveScenario(scenarioId);
    setCurrentDialogueIndex(0);
    setShowHint(false);
    setRecordings({});
  };

  // Handle recording start/stop
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        audioChunksRef.current = [];
        
        mediaRecorder.addEventListener('dataavailable', (event) => {
          audioChunksRef.current.push(event.data);
        });
        
        mediaRecorder.addEventListener('stop', () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Store recording
          const dialogueKey = `${activeScenario}-${currentDialogueIndex}`;
          setRecordings(prev => ({
            ...prev,
            [dialogueKey]: audioUrl
          }));
          
          setIsRecording(false);
        });
        
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Could not access microphone. Please check permissions.");
      }
    }
  };

  // Move to next dialogue
  const nextDialogue = () => {
    if (!activeScenario) return;
    
    const scenario = scenarios.find(s => s.id === activeScenario);
    if (!scenario) return;
    
    if (currentDialogueIndex < scenario.dialogues.length - 1) {
      setCurrentDialogueIndex(prev => prev + 1);
    } else {
      // Scenario complete
      const updatedScenarios = scenarios.map(s => 
        s.id === activeScenario ? { ...s, completed: true } : s
      );
      // In a real app, you would update the server with this progress
      console.log("Scenario completed:", updatedScenarios);
      setActiveScenario(null);
    }
  };

  // Get current scenario and dialogue
  const currentScenario = activeScenario ? scenarios.find(s => s.id === activeScenario) : null;
  const currentDialogue = currentScenario?.dialogues[currentDialogueIndex] || null;

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
            会話練習
            <span className="text-xl text-japan-stone ml-2">Speaking Practice</span>
          </h1>
        </div>
        <p className="text-japan-stone">Improve your speaking skills with these interactive exercises</p>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Scenarios and Phrases */}
        <div className="col-span-1 space-y-6">
          {/* Scenarios */}
          <div className="paper-card p-5">
            <h2 className="text-xl font-display font-medium text-japan-navy mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              会話シナリオ
              <span className="text-sm text-japan-stone ml-2">Conversation Scenarios</span>
            </h2>

            <div className="space-y-3">
              {scenarios.map(scenario => (
                <div 
                  key={scenario.id}
                  className={`
                    border rounded-lg overflow-hidden transition-colors cursor-pointer
                    ${scenario.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-japan-pink/30'}
                    ${activeScenario === scenario.id ? 'ring-2 ring-japan-indigo ring-opacity-50' : ''}
                  `}
                  onClick={() => startScenario(scenario.id)}
                >
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-display font-medium">
                          {scenario.title}
                        </h3>
                        <p className="text-xs text-japan-stone">{scenario.englishTitle}</p>
                      </div>
                      <span className={`
                        text-xs font-medium px-2 py-1 rounded-full
                        ${scenario.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' : ''}
                        ${scenario.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${scenario.difficulty === 'Advanced' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {scenario.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phrases */}
          <div className="paper-card p-5">
            <h2 className="text-xl font-display font-medium text-japan-navy mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              よく使うフレーズ
              <span className="text-sm text-japan-stone ml-2">Useful Phrases</span>
            </h2>

            <div className="space-y-3">
              {phrasesToPractice.map((phrase, index) => (
                <div 
                  key={index}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="japanese-text font-medium">{phrase.japanese}</p>
                    <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {phrase.category}
                    </span>
                  </div>
                  <p className="text-sm text-japan-stone">{phrase.english}</p>
                  <button className="mt-2 text-xs text-japan-indigo hover:text-japan-pink flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="22"></line>
                    </svg>
                    Practice Pronunciation
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Active scenario or intro */}
        <div className="col-span-2">
          {activeScenario && currentScenario && currentDialogue ? (
            <div className="paper-card p-5 space-y-6">
              {/* Scenario header */}
              <div>
                <h2 className="text-2xl font-display font-medium text-japan-navy border-b border-gray-100 pb-3">
                  {currentScenario.title}
                  <span className="text-sm text-japan-stone ml-2">
                    ({currentScenario.englishTitle})
                  </span>
                </h2>
                <p className="text-japan-stone mt-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <path d="M12 11h4"></path>
                    <path d="M12 16h4"></path>
                    <path d="M8 11h.01"></path>
                    <path d="M8 16h.01"></path>
                  </svg>
                  Dialogue {currentDialogueIndex + 1} of {currentScenario.dialogues.length}
                </p>
              </div>

              {/* Conversation area */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
                {/* Display past dialogues (read-only) */}
                {currentScenario.dialogues.slice(0, currentDialogueIndex).map((dialogue, idx) => (
                  <div key={idx} className={cn(
                    "flex",
                    dialogue.role === 'user' ? "justify-end" : "justify-start"
                  )}>
                    <div className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      dialogue.role === 'user' 
                        ? "bg-japan-indigo text-white rounded-br-none"
                        : "bg-white border border-gray-200 rounded-bl-none"
                    )}>
                      <p className="japanese-text font-medium">{dialogue.japanese || '...'}</p>
                      <p className="text-xs mt-1 opacity-80">{dialogue.english}</p>
                    </div>
                  </div>
                ))}

                {/* Current dialogue */}
                <div className={cn(
                  "flex",
                  currentDialogue.role === 'user' ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    currentDialogue.role === 'user'
                      ? "bg-japan-indigo text-white rounded-br-none"
                      : "bg-white border border-gray-200 rounded-bl-none"
                  )}>
                    {currentDialogue.role === 'user' ? (
                      <>
                        <p className="text-xs mb-2 opacity-80">{currentDialogue.english}</p>
                        
                        {/* Recording controls for user response */}
                        <div className="mt-3 flex items-center justify-center space-x-2">
                          <button
                            onClick={toggleRecording}
                            className={cn(
                              "px-3 py-1 rounded-full flex items-center",
                              isRecording
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-white hover:bg-gray-100 text-japan-navy border border-gray-300"
                            )}
                          >
                            {isRecording ? (
                              <>
                                <span className="w-2 h-2 bg-red-200 rounded-full animate-pulse mr-2"></span>
                                Stop Recording
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                  <line x1="12" y1="19" x2="12" y2="22"></line>
                                </svg>
                                Record Response
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => setShowHint(!showHint)}
                            className="px-3 py-1 bg-japan-cream hover:bg-japan-cream/80 text-japan-navy rounded-full border border-gray-300 text-sm"
                          >
                            {showHint ? 'Hide Hint' : 'Show Hint'}
                          </button>
                        </div>
                        
                        {/* Audio playback if recorded */}
                        {recordings[`${activeScenario}-${currentDialogueIndex}`] && (
                          <div className="mt-3">
                            <audio 
                              src={recordings[`${activeScenario}-${currentDialogueIndex}`]} 
                              controls 
                              className="w-full h-10" 
                            />
                          </div>
                        )}
                        
                        {/* Hint */}
                        {showHint && (
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-100 rounded text-sm">
                            <p className="japanese-text">
                              {currentDialogue.role === 'user' && (
                                currentDialogueIndex === 0 ? 'はい、ラーメンをお願いします。' :
                                currentDialogueIndex === 2 ? '水をください。' : ''
                              )}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="japanese-text font-medium">{currentDialogue.japanese}</p>
                        <p className="text-xs mt-1 text-gray-600">{currentDialogue.english}</p>
                        
                        {/* Audio playback for AI/system responses (mock) */}
                        <button className="mt-2 text-xs text-japan-indigo hover:text-japan-pink flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                          </svg>
                          Play Audio
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between pt-3">
                <button
                  onClick={() => setActiveScenario(null)}
                  className="px-4 py-2 border border-gray-300 bg-white text-japan-navy rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Exit Scenario
                </button>
                
                <button
                  onClick={nextDialogue}
                  className="px-4 py-2 bg-japan-indigo hover:bg-japan-indigo/90 text-white rounded-lg transition-colors"
                  disabled={currentDialogue.role === 'user' && !recordings[`${activeScenario}-${currentDialogueIndex}`]}
                >
                  {currentDialogueIndex === currentScenario.dialogues.length - 1
                    ? 'Complete Scenario'
                    : 'Continue'
                  }
                </button>
              </div>
            </div>
          ) : (
            <div className="paper-card p-8 flex flex-col items-center justify-center text-center">
              <div className="bg-japan-pink/10 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-pink">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </div>
              <h2 className="text-2xl font-display font-medium text-japan-navy mb-2">
                会話練習にようこそ！
              </h2>
              <p className="text-japan-stone mb-6">Welcome to Speaking Practice!</p>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Improve your Japanese speaking skills with our interactive dialogue scenarios. Select a scenario from the list to begin.
              </p>
              <div className="bg-japan-cream/30 border border-japan-cream rounded-lg p-4 w-full max-w-md">
                <h3 className="font-display font-medium text-lg mb-2 text-japan-navy">
                  発音のヒント (Pronunciation Tips)
                </h3>
                <ul className="text-left space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-pink mr-2 mt-1 flex-shrink-0">
                      <path d="m12 15 2 2 4-4"></path>
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                    Pay attention to the pitch accent in Japanese words.
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-pink mr-2 mt-1 flex-shrink-0">
                      <path d="m12 15 2 2 4-4"></path>
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                    Record yourself and compare with the model pronunciation.
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-pink mr-2 mt-1 flex-shrink-0">
                      <path d="m12 15 2 2 4-4"></path>
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                    Practice daily, even just for a few minutes, to improve fluency.
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

export default Speaking;
