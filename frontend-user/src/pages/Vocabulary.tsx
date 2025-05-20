
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

// Word item type definition
interface WordItem {
  id: number;
  japanese: string;
  reading: string;
  english: string;
  example?: {
    japanese: string;
    english: string;
  };
  category: string;
  learned: boolean;
  mastered: boolean;
  dueForReview?: Date;
}

// Category type definition
interface Category {
  id: string;
  name: string;
  englishName: string;
  count: number;
}

const Vocabulary = () => {
  // Word list state
  const [words, setWords] = useState<WordItem[]>([
    {
      id: 1,
      japanese: '食べる',
      reading: 'taberu',
      english: 'to eat',
      example: {
        japanese: '私は寿司を食べます。',
        english: 'I eat sushi.'
      },
      category: 'food',
      learned: true,
      mastered: false,
      dueForReview: new Date()
    },
    {
      id: 2,
      japanese: '飲む',
      reading: 'nomu',
      english: 'to drink',
      example: {
        japanese: '水を飲みます。',
        english: 'I drink water.'
      },
      category: 'food',
      learned: true,
      mastered: false,
      dueForReview: new Date()
    },
    {
      id: 3,
      japanese: 'レストラン',
      reading: 'resutoran',
      english: 'restaurant',
      example: {
        japanese: 'レストランで食事をします。',
        english: 'I eat a meal at a restaurant.'
      },
      category: 'food',
      learned: true,
      mastered: false,
      dueForReview: new Date()
    },
    {
      id: 4,
      japanese: '注文',
      reading: 'chuumon',
      english: 'to order',
      example: {
        japanese: 'コーヒーを注文します。',
        english: 'I order coffee.'
      },
      category: 'food',
      learned: true,
      mastered: false,
      dueForReview: new Date()
    },
    {
      id: 5,
      japanese: '駅',
      reading: 'eki',
      english: 'station',
      example: {
        japanese: '駅まで歩きます。',
        english: 'I walk to the station.'
      },
      category: 'places',
      learned: true,
      mastered: false,
      dueForReview: new Date()
    },
    {
      id: 6,
      japanese: '電車',
      reading: 'densha',
      english: 'train',
      example: {
        japanese: '電車で行きます。',
        english: 'I go by train.'
      },
      category: 'transportation',
      learned: false,
      mastered: false,
      dueForReview: new Date(Date.now() + 86400000) // Tomorrow
    },
    {
      id: 7,
      japanese: '店',
      reading: 'mise',
      english: 'store, shop',
      example: {
        japanese: 'その店は安いです。',
        english: 'That store is cheap.'
      },
      category: 'places',
      learned: false,
      mastered: false,
      dueForReview: new Date(Date.now() + 86400000) // Tomorrow
    }
  ]);

  // Categories derived from words
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Flashcard states
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCar, setIsCardFlipped] = useState(false);
  const [filteredWords, setFilteredWords] = useState<WordItem[]>([]);
  
  // Initialize categories based on words
  useEffect(() => {
    // Extract unique categories
    const uniqueCategories = new Map<string, number>();
    
    words.forEach(word => {
      if (uniqueCategories.has(word.category)) {
        uniqueCategories.set(word.category, (uniqueCategories.get(word.category) || 0) + 1);
      } else {
        uniqueCategories.set(word.category, 1);
      }
    });
    
    // Create categories array
    const categoriesArray: Category[] = Array.from(uniqueCategories).map(([category, count]) => {
      const displayName = category.charAt(0).toUpperCase() + category.slice(1);
      return {
        id: category,
        name: displayName,
        englishName: displayName,
        count
      };
    });
    
    setCategories([
      { id: 'all', name: 'すべて', englishName: 'All', count: words.length },
      ...categoriesArray
    ]);
    
  }, [words]);

  // Filter words based on selected filters
  useEffect(() => {
    let results = [...words];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(word => word.category === selectedCategory);
    }
    
    // Filter by status
    if (filterStatus === 'learned') {
      results = results.filter(word => word.learned && !word.mastered);
    } else if (filterStatus === 'mastered') {
      results = results.filter(word => word.mastered);
    } else if (filterStatus === 'new') {
      results = results.filter(word => !word.learned);
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(word => 
        word.japanese.toLowerCase().includes(searchLower) ||
        word.reading.toLowerCase().includes(searchLower) ||
        word.english.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredWords(results);
    setCurrentCardIndex(0);
  }, [selectedCategory, filterStatus, searchTerm, words]);

  // Toggle word learned status
  const toggleLearned = (id: number) => {
    setWords(words.map(word => 
      word.id === id ? { ...word, learned: !word.learned } : word
    ));
  };

  // Toggle word mastered status
  const toggleMastered = (id: number) => {
    setWords(words.map(word => 
      word.id === id ? { ...word, mastered: !word.mastered } : word
    ));
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory('all');
    setFilterStatus('all');
    setSearchTerm('');
  };

  // Flashcard navigation
  const nextCard = () => {
    if (currentCardIndex < filteredWords.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsCardFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsCardFlipped(false);
    }
  };

  const toggleCardFlip = () => {
    setIsCardFlipped(!isCar);
  };

  const startFlashcards = () => {
    setIsFlashcardMode(true);
    setIsCardFlipped(false);
    setCurrentCardIndex(0);
  };

  const exitFlashcards = () => {
    setIsFlashcardMode(false);
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
            語彙学習
            <span className="text-xl text-japan-stone ml-2">Vocabulary Study</span>
          </h1>
        </div>
        <p className="text-japan-stone">Build your Japanese vocabulary with these words and expressions</p>
      </div>

      {isFlashcardMode ? (
        /* Flashcard mode */
        <div className="paper-card p-6">
          {/* Flashcard header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-display font-medium text-japan-navy flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="M12 8v8"></path>
                <path d="M18 12H6"></path>
              </svg>
              単語カード
              <span className="text-sm text-japan-stone ml-2">Flashcards</span>
            </h2>
            <button 
              onClick={exitFlashcards}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-japan-navy rounded-lg transition-colors"
            >
              Exit Flashcards
            </button>
          </div>

          {filteredWords.length > 0 ? (
            <div className="space-y-6">
              {/* Card progress indicator */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-japan-stone">
                  Card {currentCardIndex + 1} of {filteredWords.length}
                </span>
                <div className="w-1/2 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-japan-indigo"
                    style={{ width: `${((currentCardIndex + 1) / filteredWords.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Flashcard */}
              <div 
                className="bg-white border border-gray-200 rounded-xl h-64 relative shadow-md hover:shadow-lg transition-shadow cursor-pointer perspective-1000"
                onClick={toggleCardFlip}
              >
                <div className={`absolute inset-0 preserve-3d transition-transform duration-500 ${isCar ? 'rotate-y-180' : ''}`}>
                  {/* Front side (Japanese) */}
                  <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-6 text-center">
                    <p className="japanese-text text-4xl font-medium text-japan-navy mb-3">
                      {filteredWords[currentCardIndex].japanese}
                    </p>
                    <p className="romaji text-lg">
                      {filteredWords[currentCardIndex].reading}
                    </p>
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      Click to flip
                    </div>
                  </div>
                  
                  {/* Back side (English) */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-2xl font-medium text-japan-navy mb-3">
                      {filteredWords[currentCardIndex].english}
                    </p>
                    
                    {filteredWords[currentCardIndex].example && (
                      <div className="mt-4">
                        <p className="japanese-text text-lg mb-1">
                          {filteredWords[currentCardIndex].example.japanese}
                        </p>
                        <p className="text-sm text-japan-stone">
                          {filteredWords[currentCardIndex].example.english}
                        </p>
                      </div>
                    )}
                    
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      Click to flip
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Navigation controls */}
              <div className="flex justify-between items-center">
                <button
                  onClick={prevCard}
                  disabled={currentCardIndex === 0}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    currentCardIndex === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-japan-indigo hover:bg-japan-indigo/90 text-white transition-colors'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  Previous
                </button>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={() => toggleLearned(filteredWords[currentCardIndex].id)}
                    className={`px-3 py-1 rounded-md flex items-center ${
                      filteredWords[currentCardIndex].learned
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Learned
                  </button>
                  
                  <button 
                    onClick={() => toggleMastered(filteredWords[currentCardIndex].id)}
                    className={`px-3 py-1 rounded-md flex items-center ${
                      filteredWords[currentCardIndex].mastered
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Mastered
                  </button>
                </div>
                
                <button
                  onClick={nextCard}
                  disabled={currentCardIndex === filteredWords.length - 1}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    currentCardIndex === filteredWords.length - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-japan-indigo hover:bg-japan-indigo/90 text-white transition-colors'
                  }`}
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-japan-stone">
              No words found matching your criteria. Try adjusting your filters.
            </div>
          )}
        </div>
      ) : (
        /* Vocabulary list mode */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar: Filters */}
          <div className="lg:col-span-1">
            <div className="paper-card p-5 space-y-5 sticky top-4">
              <h2 className="text-xl font-display font-medium text-japan-navy flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                フィルター
                <span className="text-sm text-japan-stone ml-2">Filters</span>
              </h2>
              
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-japan-stone mb-1">
                  検索 (Search)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-japan-indigo"
                    placeholder="Search words..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Category filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-japan-stone mb-1">
                  カテゴリー (Category)
                </label>
                <select
                  id="category"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-japan-indigo"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.englishName}) - {category.count}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Status filter */}
              <div>
                <p className="block text-sm font-medium text-japan-stone mb-1">
                  状態 (Status)
                </p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="all"
                      checked={filterStatus === 'all'}
                      onChange={() => setFilterStatus('all')}
                      className="mr-2"
                    />
                    <span className="text-sm">All Words</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="learned"
                      checked={filterStatus === 'learned'}
                      onChange={() => setFilterStatus('learned')}
                      className="mr-2"
                    />
                    <span className="text-sm">Learned Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="mastered"
                      checked={filterStatus === 'mastered'}
                      onChange={() => setFilterStatus('mastered')}
                      className="mr-2"
                    />
                    <span className="text-sm">Mastered Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="new"
                      checked={filterStatus === 'new'}
                      onChange={() => setFilterStatus('new')}
                      className="mr-2"
                    />
                    <span className="text-sm">New Words</span>
                  </label>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-japan-navy rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  onClick={startFlashcards}
                  disabled={filteredWords.length === 0}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    filteredWords.length === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-japan-indigo hover:bg-japan-indigo/90 text-white'
                  }`}
                >
                  Start Flashcards
                </button>
              </div>
            </div>
          </div>
          
          {/* Right content: Word list */}
          <div className="lg:col-span-3">
            <div className="paper-card p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-display font-medium text-japan-navy flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  単語リスト
                  <span className="text-sm text-japan-stone ml-2">Word List</span>
                </h2>
                <span className="text-sm text-japan-stone">
                  Showing {filteredWords.length} {filteredWords.length === 1 ? 'word' : 'words'}
                </span>
              </div>
              
              {filteredWords.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredWords.map(word => (
                    <div 
                      key={word.id}
                      className={cn(
                        "border rounded-lg p-4 hover:shadow-md transition-shadow",
                        word.mastered ? "bg-blue-50 border-blue-200" :
                        word.learned ? "bg-green-50 border-green-200" :
                        "bg-white border-gray-200"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="japanese-text text-xl font-medium text-japan-navy">
                            {word.japanese}
                          </h3>
                          <p className="romaji">{word.reading}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                          {word.category.charAt(0).toUpperCase() + word.category.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{word.english}</p>
                      
                      {word.example && (
                        <div className="bg-white border border-gray-100 rounded p-2 mb-3">
                          <p className="japanese-text text-sm">{word.example.japanese}</p>
                          <p className="text-xs text-japan-stone mt-1">{word.example.english}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <button
                          onClick={() => toggleLearned(word.id)}
                          className={`px-2 py-1 rounded text-xs flex items-center ${
                            word.learned
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {word.learned ? 'Learned' : 'Mark as Learned'}
                        </button>
                        
                        <button
                          onClick={() => toggleMastered(word.id)}
                          className={`px-2 py-1 rounded text-xs flex items-center ${
                            word.mastered
                              ? 'bg-blue-500 hover:bg-blue-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {word.mastered ? 'Mastered' : 'Mark as Mastered'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-japan-stone">
                  No words found matching your criteria. Try adjusting your filters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vocabulary;
