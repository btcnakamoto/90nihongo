
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import DayProgress from '@/components/DayProgress';
import AudioPlayer from '@/components/AudioPlayer';

const DailyLesson = () => {
  // In a real app, this would come from API/user data
  const currentDay = 5;
  const totalDays = 90;
  
  // Lesson sections and their completion status
  const [sections, setSections] = useState([
    { 
      id: 1, 
      title: '学習目標', 
      englishTitle: 'Learning Objectives',
      completed: true,
      active: false
    },
    { 
      id: 2, 
      title: '語彙紹介', 
      englishTitle: 'Vocabulary Introduction',
      completed: true,
      active: false
    },
    { 
      id: 3, 
      title: 'レストランの会話', 
      englishTitle: 'Restaurant Conversations',
      completed: false,
      active: true
    },
    { 
      id: 4, 
      title: '文法解説', 
      englishTitle: 'Grammar Explanation',
      completed: false,
      active: false
    },
    { 
      id: 5, 
      title: '会話練習', 
      englishTitle: 'Speaking Practice',
      completed: false,
      active: false
    }
  ]);

  // Sample vocabulary data
  const vocabularyItems = [
    {
      japanese: 'メニュー',
      reading: 'menyuu',
      english: 'menu'
    },
    {
      japanese: '注文',
      reading: 'chuumon',
      english: 'order (noun/verb)'
    },
    {
      japanese: '予約',
      reading: 'yoyaku',
      english: 'reservation'
    },
    {
      japanese: '会計',
      reading: 'kaikei',
      english: 'bill/check'
    },
    {
      japanese: '席',
      reading: 'seki',
      english: 'seat'
    }
  ];

  // Sample conversation data
  const conversations = [
    {
      id: 1,
      title: '入店時の会話',
      englishTitle: 'When Entering a Restaurant',
      audioSrc: '#',
      japaneseText: 'スタッフ: いらっしゃいませ。何名様ですか？\n客: 二人です。\nスタッフ: かしこまりました。こちらへどうぞ。',
      englishText: 'Staff: Welcome. How many people?\nCustomer: Two people.\nStaff: Understood. This way please.'
    },
    {
      id: 2,
      title: '注文時の会話',
      englishTitle: 'When Ordering',
      audioSrc: '#',
      japaneseText: '客: すみません。\nスタッフ: はい、ご注文はお決まりですか？\n客: ラーメンと餃子をお願いします。\nスタッフ: かしこまりました。少々お待ちください。',
      englishText: 'Customer: Excuse me.\nStaff: Yes, have you decided on your order?\nCustomer: I\'d like ramen and gyoza, please.\nStaff: Understood. Please wait a moment.'
    }
  ];

  // Current active section
  const activeSection = sections.find(section => section.active) || sections[0];
  
  // Completion percentage
  const completedSections = sections.filter(section => section.completed).length;
  const completionPercentage = (completedSections / sections.length) * 100;

  // Mark a section as active
  const setActiveSection = (id: number) => {
    setSections(sections.map(section => ({
      ...section,
      active: section.id === id
    })));
  };

  // Mark a section as completed
  const markSectionCompleted = (id: number) => {
    setSections(sections.map(section => {
      if (section.id === id) {
        return {
          ...section,
          completed: true,
          active: false
        };
      } else if (section.id === id + 1) {
        return {
          ...section,
          active: true
        };
      } else {
        return section;
      }
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section with Day Info */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center mb-2">
              <Link to="/" className="text-japan-indigo hover:text-japan-pink mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </Link>
              <h1 className="text-2xl font-display font-bold text-japan-navy">
                第５日目: レストランでの注文
              </h1>
            </div>
            <p className="text-japan-stone">Day 5: Ordering at Restaurants</p>
          </div>
          <DayProgress currentDay={currentDay} totalDays={totalDays} />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Section Navigation */}
        <div className="col-span-1">
          <div className="sticky top-4 paper-card p-4">
            <h2 className="font-display font-medium text-lg mb-3 flex items-center border-b border-gray-100 pb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              学習セクション
            </h2>
            
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-japan-stone">Progress</span>
                <span className="font-medium">{Math.round(completionPercentage)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-japan-indigo to-japan-pink"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Section list */}
            <ul className="space-y-2">
              {sections.map(section => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center p-2 rounded-lg text-left transition-colors",
                      section.active && !section.completed ? "bg-japan-cream font-medium" : "",
                      section.completed ? "bg-green-50 text-green-700" : "",
                      !section.active && !section.completed ? "hover:bg-gray-50" : ""
                    )}
                    disabled={!section.completed && !section.active}
                  >
                    <div className={cn(
                      "w-6 h-6 flex items-center justify-center rounded-full mr-2 flex-shrink-0",
                      section.completed ? "bg-green-100" : "bg-gray-100"
                    )}>
                      {section.completed ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        <span className={section.active ? "text-japan-indigo" : "text-gray-500"}>{section.id}</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="japanese-text text-sm">{section.title}</span>
                      <span className="text-xs opacity-70">{section.englishTitle}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-3 paper-card p-6">
          {/* Learning Objectives Section */}
          {activeSection.id === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-medium text-japan-navy border-b border-gray-100 pb-3">
                学習目標
                <span className="text-sm text-japan-stone ml-2">Learning Objectives</span>
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  This lesson will teach you how to navigate restaurant situations in Japanese, from entering and being seated to ordering food and paying the bill.
                </p>
                
                <div className="bg-japan-cream/30 border border-japan-cream rounded-lg p-4">
                  <h3 className="font-display font-medium text-lg mb-2 text-japan-navy">
                    今日の目標 (Today's Goals)
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-indigo mt-0.5 mr-2 flex-shrink-0">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                      <span>
                        <strong className="hiragana">レストランに関連する語彙を10個覚える</strong>
                        <br />
                        <span className="text-sm text-gray-600">Learn 10 restaurant-related vocabulary words</span>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-indigo mt-0.5 mr-2 flex-shrink-0">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                      <span>
                        <strong className="hiragana">基本的な注文フレーズを使えるようになる</strong>
                        <br />
                        <span className="text-sm text-gray-600">Be able to use basic ordering phrases</span>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-japan-indigo mt-0.5 mr-2 flex-shrink-0">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                      <span>
                        <strong className="hiragana">「〜をください」の形を理解して使う</strong>
                        <br />
                        <span className="text-sm text-gray-600">Understand and use the "~o kudasai" (please give me ~) pattern</span>
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                  <h3 className="font-display font-medium text-lg mb-2 text-japan-navy">
                    文化ポイント (Cultural Point)
                  </h3>
                  <p className="text-gray-600">
                    In Japanese restaurants, it's common to say "itadakimasu" (いただきます) before starting your meal to express gratitude for the food. After finishing, you can say "gochisousama deshita" (ごちそうさまでした) to show appreciation for the meal.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => markSectionCompleted(1)}
                  className="bg-japan-indigo hover:bg-japan-indigo/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  次へ進む (Continue)
                </button>
              </div>
            </div>
          )}
          
          {/* Vocabulary Section */}
          {activeSection.id === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-medium text-japan-navy border-b border-gray-100 pb-3">
                語彙紹介
                <span className="text-sm text-japan-stone ml-2">Vocabulary Introduction</span>
              </h2>
              
              <p className="text-gray-600">
                Below are key vocabulary words related to restaurants and ordering food. Study these words to help you navigate restaurant situations in Japanese.
              </p>
              
              {/* Vocabulary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vocabularyItems.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-display font-medium text-japan-navy">
                          {item.japanese}
                        </h3>
                        <p className="romaji">{item.reading}</p>
                      </div>
                      <button className="text-japan-indigo hover:text-japan-pink">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                          <line x1="12" y1="19" x2="12" y2="22"></line>
                        </svg>
                      </button>
                    </div>
                    <p className="text-japan-stone mt-2">{item.english}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-japan-indigo/10 border border-japan-indigo/20 rounded-lg p-4">
                <h3 className="font-display font-medium text-lg mb-2 text-japan-navy">
                  例文 (Example Sentences)
                </h3>
                <ul className="space-y-2">
                  <li>
                    <p className="japanese-text">メニューを見せてください。</p>
                    <p className="romaji">Menyuu o misete kudasai.</p>
                    <p className="text-sm text-japan-stone">Please show me the menu.</p>
                  </li>
                  <li>
                    <p className="japanese-text">注文をお願いします。</p>
                    <p className="romaji">Chuumon o onegaishimasu.</p>
                    <p className="text-sm text-japan-stone">I'd like to order, please.</p>
                  </li>
                  <li>
                    <p className="japanese-text">席を予約しました。</p>
                    <p className="romaji">Seki o yoyaku shimashita.</p>
                    <p className="text-sm text-japan-stone">I've made a reservation for a table.</p>
                  </li>
                </ul>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => markSectionCompleted(2)}
                  className="bg-japan-indigo hover:bg-japan-indigo/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  次へ進む (Continue)
                </button>
              </div>
            </div>
          )}
          
          {/* Restaurant Conversations Section */}
          {activeSection.id === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-medium text-japan-navy border-b border-gray-100 pb-3">
                レストランの会話
                <span className="text-sm text-japan-stone ml-2">Restaurant Conversations</span>
              </h2>
              
              <p className="text-gray-600 mb-4">
                Listen to these common restaurant conversations and practice understanding them. You can toggle between Japanese and English to check your comprehension.
              </p>
              
              <div className="space-y-6">
                {conversations.map((conversation, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 py-2 px-4">
                      <h3 className="font-display font-medium">
                        {conversation.title}
                        <span className="text-xs text-japan-stone ml-2">({conversation.englishTitle})</span>
                      </h3>
                    </div>
                    <div className="p-4">
                      <AudioPlayer
                        src={conversation.audioSrc}
                        showTranscript={true}
                        transcript={conversation.englishText}
                        japaneseText={conversation.japaneseText}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-japan-cream/30 border border-japan-cream rounded-lg p-4">
                <h3 className="font-display font-medium text-lg mb-2 text-japan-navy">
                  練習 (Practice)
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Try to answer these questions based on the conversations above:
                </p>
                <ol className="list-decimal list-inside space-y-3">
                  <li className="pl-2">
                    <p className="japanese-text inline">お客さんは何人ですか？</p>
                    <p className="romaji mt-1">Okyaku-san wa nannin desu ka?</p>
                    <p className="text-sm text-japan-stone mb-2">How many customers are there?</p>
                    <input 
                      type="text" 
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-japan-indigo" 
                      placeholder="Answer in Japanese..."
                    />
                  </li>
                  <li className="pl-2">
                    <p className="japanese-text inline">お客さんは何を注文しましたか？</p>
                    <p className="romaji mt-1">Okyaku-san wa nani o chuumon shimashita ka?</p>
                    <p className="text-sm text-japan-stone mb-2">What did the customer order?</p>
                    <input 
                      type="text" 
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-japan-indigo" 
                      placeholder="Answer in Japanese..."
                    />
                  </li>
                </ol>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => markSectionCompleted(3)}
                  className="bg-japan-indigo hover:bg-japan-indigo/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  次へ進む (Continue)
                </button>
              </div>
            </div>
          )}
          
          {/* Grammar Explanation Section */}
          {activeSection.id === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-medium text-japan-navy border-b border-gray-100 pb-3">
                文法解説
                <span className="text-sm text-japan-stone ml-2">Grammar Explanation</span>
              </h2>
              
              <p className="text-gray-600">
                Today we'll learn about the "〜をください" (~o kudasai) pattern which is essential for making requests politely in Japanese, such as when ordering at restaurants.
              </p>
              
              <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
                <h3 className="text-xl font-display font-medium text-japan-navy flex items-center">
                  <div className="w-7 h-7 rounded-full bg-japan-indigo text-white flex items-center justify-center mr-2 text-sm">文</div>
                  〜をください
                  <span className="text-sm text-japan-stone ml-2">(~o kudasai)</span>
                </h3>
                
                <p className="text-gray-600">
                  This pattern is used to politely request something. It's composed of:
                </p>
                
                <div className="flex items-center flex-wrap gap-2">
                  <div className="bg-japan-indigo/10 border border-japan-indigo/20 rounded px-3 py-1">
                    <span className="japanese-text">名詞</span>
                    <span className="text-xs text-japan-stone block">noun</span>
                  </div>
                  <span className="text-lg">+</span>
                  <div className="bg-japan-pink/10 border border-japan-pink/20 rounded px-3 py-1">
                    <span className="japanese-text">を</span>
                    <span className="text-xs text-japan-stone block">o (object particle)</span>
                  </div>
                  <span className="text-lg">+</span>
                  <div className="bg-japan-navy/10 border border-japan-navy/20 rounded px-3 py-1">
                    <span className="japanese-text">ください</span>
                    <span className="text-xs text-japan-stone block">kudasai (please give me)</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-japan-navy mb-2">Examples:</h4>
                  <ul className="space-y-3">
                    <li>
                      <p className="japanese-text">水をください。</p>
                      <p className="romaji">Mizu o kudasai.</p>
                      <p className="text-sm text-japan-stone">Water, please. (lit: Please give me water.)</p>
                    </li>
                    <li>
                      <p className="japanese-text">メニューをください。</p>
                      <p className="romaji">Menyuu o kudasai.</p>
                      <p className="text-sm text-japan-stone">A menu, please.</p>
                    </li>
                    <li>
                      <p className="japanese-text">ラーメンをください。</p>
                      <p className="romaji">Raamen o kudasai.</p>
                      <p className="text-sm text-japan-stone">Ramen, please.</p>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-japan-cream/30 border border-japan-cream rounded-lg p-4">
                <h3 className="font-display font-medium text-lg mb-3 text-japan-navy">
                  練習 (Practice)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Complete these sentences using the "〜をください" pattern:
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2">
                      <span className="japanese-text">コーヒー</span> → 
                    </p>
                    <input 
                      type="text" 
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-japan-indigo" 
                      placeholder="Complete the sentence..."
                    />
                  </div>
                  <div>
                    <p className="mb-2">
                      <span className="japanese-text">お会計</span> → 
                    </p>
                    <input 
                      type="text" 
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-japan-indigo" 
                      placeholder="Complete the sentence..."
                    />
                  </div>
                  <div>
                    <p className="mb-2">
                      <span className="japanese-text">天ぷら定食</span> → 
                    </p>
                    <input 
                      type="text" 
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-japan-indigo" 
                      placeholder="Complete the sentence..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => markSectionCompleted(4)}
                  className="bg-japan-indigo hover:bg-japan-indigo/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  次へ進む (Continue)
                </button>
              </div>
            </div>
          )}
          
          {/* Speaking Practice Section */}
          {activeSection.id === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-medium text-japan-navy border-b border-gray-100 pb-3">
                会話練習
                <span className="text-sm text-japan-stone ml-2">Speaking Practice</span>
              </h2>
              
              <p className="text-gray-600 mb-4">
                Now it's time to practice speaking! Read the dialogues aloud and then try the role-playing exercise.
              </p>
              
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="font-display font-medium text-lg mb-3 text-japan-navy">
                  シャドーイング (Shadowing)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Listen to the audio and repeat immediately after hearing each line, trying to match the timing, rhythm, and intonation.
                </p>
                
                <AudioPlayer
                  src="#"
                  title="Restaurant Order Dialogue"
                  showTranscript={true}
                  japaneseText="スタッフ: いらっしゃいませ。\n客: すみません、予約していました。田中と申します。\nスタッフ: かしこまりました。田中様、2名様ですね。こちらへどうぞ。\n客: ありがとうございます。\nスタッフ: メニューでございます。お飲み物はいかがですか？\n客: 水をください。\nスタッフ: かしこまりました。"
                  transcript="Staff: Welcome.\nCustomer: Excuse me, I made a reservation. My name is Tanaka.\nStaff: Certainly. Mr./Ms. Tanaka, table for 2, right? This way please.\nCustomer: Thank you.\nStaff: Here is the menu. What would you like to drink?\nCustomer: Water, please.\nStaff: Certainly."
                />
              </div>
              
              <div className="bg-japan-cream/30 border border-japan-cream rounded-lg p-4 mt-6">
                <h3 className="font-display font-medium text-lg mb-3 text-japan-navy">
                  ロールプレイング (Role-playing)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Practice ordering at a restaurant by recording yourself playing both roles. Use the vocabulary and grammar patterns you've learned.
                </p>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium mb-2">Scenario: Ordering at a restaurant</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    You are at a Japanese restaurant and want to order food. Practice asking for a menu, ordering dishes, and asking for the check.
                  </p>
                  
                  <div className="flex justify-center mt-4">
                    <button className="bg-japan-indigo hover:bg-japan-indigo/90 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                      </svg>
                      録音を開始する (Start Recording)
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-japan-indigo/10 border border-japan-indigo/20 rounded-lg p-4 mt-6">
                <h3 className="font-display font-medium text-lg mb-2 text-japan-navy flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  発音ポイント (Pronunciation Point)
                </h3>
                <p className="text-gray-600">
                  Pay attention to the rhythm of "o kudasai" (おください). It should sound like "o ku-da-sa-i" with a slight emphasis on "da". The pitch decreases from "ku" to "sa" and then rises slightly for "i".
                </p>
              </div>
              
              <div className="mt-8 flex justify-between">
                <Link
                  to="/"
                  className="bg-gray-100 hover:bg-gray-200 text-japan-navy font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  ダッシュボードへ (Back to Dashboard)
                </Link>
                <button
                  onClick={() => markSectionCompleted(5)}
                  className="bg-japan-indigo hover:bg-japan-indigo/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  レッスンを完了する (Complete Lesson)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyLesson;
