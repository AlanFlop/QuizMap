<template>
    <div class="quiz-view">
      <div class="quiz-container">
        <h1>Quiz Géographiques</h1>
        <p class="quiz-intro">
          Testez vos connaissances géographiques avec nos différents quiz thématiques.
          Chaque quiz est composé de 10 questions et vous permettra d'améliorer vos connaissances du monde.
        </p>
  
        <div v-if="!activeQuiz" class="quiz-selection">
          <div class="quiz-categories">
            <div 
              v-for="category in quizCategories" 
              :key="category.id"
              class="quiz-category-card"
              @click="selectCategory(category)"
            >
              <div class="category-icon">{{ category.icon }}</div>
              <h3>{{ category.name }}</h3>
              <p>{{ category.description }}</p>
              <span class="difficulty">
                Difficulté : 
                <span class="stars">
                  <span v-for="n in 5" :key="n" :class="{ 'filled': n <= category.difficulty }">★</span>
                </span>
              </span>
            </div>
          </div>
        </div>
  
        <div v-else-if="!quizCompleted" class="quiz-game">
          <div class="quiz-header">
            <h2>{{ activeQuiz.name }}</h2>
            <div class="quiz-progress">
              <span class="question-counter">Question {{ currentQuestionIndex + 1 }}/{{ activeQuiz.questions.length }}</span>
              <div class="progress-bar">
                <div class="progress" :style="{ width: `${quizProgress}%` }"></div>
              </div>
            </div>
          </div>
  
          <div class="quiz-question-container">
            <div class="question">
              <h3>{{ currentQuestion.question }}</h3>
            </div>
  
            <div 
              v-if="currentQuestion.type === 'multiple-choice'" 
              class="answer-options"
            >
              <button 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                class="answer-option"
                :class="{ 
                  'selected': selectedAnswer === index,
                  'correct': showAnswer && index === currentQuestion.correctAnswer,
                  'incorrect': showAnswer && selectedAnswer === index && index !== currentQuestion.correctAnswer
                }"
                :disabled="showAnswer"
                @click="selectAnswer(index)"
              >
                {{ option }}
              </button>
            </div>
  
            <div 
              v-else-if="currentQuestion.type === 'text-input'" 
              class="text-answer"
            >
              <input 
                v-model="textAnswer" 
                type="text" 
                placeholder="Votre réponse..."
                :disabled="showAnswer"
                @keyup.enter="checkTextAnswer"
              />
              <button 
                class="check-button" 
                :disabled="!textAnswer || showAnswer"
                @click="checkTextAnswer"
              >
                Vérifier
              </button>
            </div>
          </div>
  
          <div v-if="showAnswer" class="answer-feedback">
            <div 
              class="feedback-message"
              :class="{ 'correct': isAnswerCorrect, 'incorrect': !isAnswerCorrect }"
            >
              <span v-if="isAnswerCorrect">✓ Correct !</span>
              <span v-else>✗ Incorrect !</span>
            </div>
            <div class="correct-answer" v-if="!isAnswerCorrect">
              La bonne réponse était : {{ getCorrectAnswerText() }}
            </div>
            <div class="explanation" v-if="currentQuestion.explanation">
              {{ currentQuestion.explanation }}
            </div>
            <button class="next-button" @click="nextQuestion">
              {{ currentQuestionIndex === activeQuiz.questions.length - 1 ? 'Terminer le quiz' : 'Question suivante' }}
            </button>
          </div>
        </div>
  
        <div v-else class="quiz-results">
          <h2>Résultats du quiz</h2>
          <div class="score-container">
            <div class="score-circle">
              <svg viewBox="0 0 36 36" class="circular-chart">
                <path class="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path class="circle"
                  :stroke-dasharray="`${scorePercentage}, 100`"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" class="percentage">{{ scorePercentage }}%</text>
              </svg>
            </div>
            <div class="score-details">
              <p>Vous avez obtenu <strong>{{ score }}</strong> sur <strong>{{ activeQuiz.questions.length }}</strong> points.</p>
              <div class="result-message">
                {{ resultMessage }}
              </div>
            </div>
          </div>
  
          <div class="quiz-summary">
            <h3>Récapitulatif des questions</h3>
            <div class="questions-summary">
              <div 
                v-for="(question, index) in activeQuiz.questions" 
                :key="index"
                class="question-item"
                :class="{ 'correct': userAnswers[index].correct, 'incorrect': !userAnswers[index].correct }"
              >
                <div class="question-number">{{ index + 1 }}</div>
                <div class="question-content">
                  <div class="question-text">{{ question.question }}</div>
                  <div class="user-answer">
                    <strong>Votre réponse :</strong> {{ userAnswers[index].userAnswerText }}
                  </div>
                  <div class="correct-answer" v-if="!userAnswers[index].correct">
                    <strong>Réponse correcte :</strong> {{ getQuestionCorrectAnswer(question) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <div class="quiz-actions">
            <button class="retry-button" @click="retryQuiz">Réessayer ce quiz</button>
            <button class="new-quiz-button" @click="newQuiz">Choisir un autre quiz</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'QuizView',
    data() {
      return {
        quizCategories: [
          {
            id: 'capitals',
            name: 'Capitales du monde',
            icon: '🏙️',
            description: 'Testez vos connaissances sur les capitales des pays du monde.',
            difficulty: 2,
            questions: [
              {
                question: 'Quelle est la capitale de la France ?',
                type: 'multiple-choice',
                options: ['Londres', 'Paris', 'Berlin', 'Madrid'],
                correctAnswer: 1,
                explanation: 'Paris est la capitale de la France depuis le 10e siècle.'
              },
              {
                question: 'Quelle est la capitale du Japon ?',
                type: 'multiple-choice',
                options: ['Pékin', 'Séoul', 'Tokyo', 'Bangkok'],
                correctAnswer: 2,
                explanation: 'Tokyo est la capitale du Japon depuis 1868.'
              },
              {
                question: 'Quelle est la capitale de l\'Australie ?',
                type: 'multiple-choice',
                options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
                correctAnswer: 2,
                explanation: 'Canberra est la capitale de l\'Australie, non pas Sydney comme beaucoup le pensent.'
              },
              {
                question: 'Quelle est la capitale du Canada ?',
                type: 'multiple-choice',
                options: ['Toronto', 'Vancouver', 'Montréal', 'Ottawa'],
                correctAnswer: 3,
                explanation: 'Ottawa est la capitale du Canada, et non Toronto qui est la plus grande ville.'
              },
              {
                question: 'Quelle est la capitale du Brésil ?',
                type: 'multiple-choice',
                options: ['Rio de Janeiro', 'São Paulo', 'Brasilia', 'Salvador'],
                correctAnswer: 2,
                explanation: 'Brasilia est la capitale du Brésil depuis 1960.'
              },
              {
                question: 'Quelle est la capitale de l\'Égypte ?',
                type: 'multiple-choice',
                options: ['Le Caire', 'Alexandrie', 'Louxor', 'Charm el-Cheikh'],
                correctAnswer: 0,
                explanation: 'Le Caire est la capitale de l\'Égypte et la plus grande ville d\'Afrique.'
              },
              {
                question: 'Quelle est la capitale de l\'Inde ?',
                type: 'multiple-choice',
                options: ['Mumbai', 'New Delhi', 'Bangalore', 'Calcutta'],
                correctAnswer: 1,
                explanation: 'New Delhi est la capitale de l\'Inde depuis 1931.'
              },
              {
                question: 'Quelle est la capitale de l\'Argentine ?',
                type: 'multiple-choice',
                options: ['Buenos Aires', 'Santiago', 'Lima', 'Montevideo'],
                correctAnswer: 0,
                explanation: 'Buenos Aires est la capitale et la plus grande ville d\'Argentine.'
              },
              {
                question: 'Quelle est la capitale de la Russie ?',
                type: 'multiple-choice',
                options: ['Saint-Pétersbourg', 'Kiev', 'Moscou', 'Vladivostok'],
                correctAnswer: 2,
                explanation: 'Moscou est la capitale de la Russie. Saint-Pétersbourg était la capitale de l\'Empire russe de 1712 à 1918.'
              },
              {
                question: 'Quelle est la capitale de la Turquie ?',
                type: 'multiple-choice',
                options: ['Istanbul', 'Izmir', 'Antalya', 'Ankara'],
                correctAnswer: 3,
                explanation: 'Ankara est la capitale de la Turquie depuis 1923, non pas Istanbul comme beaucoup le pensent.'
              }
            ]
          },
          {
            id: 'flags',
            name: 'Drapeaux du monde',
            icon: '🎌',
            description: 'Identifiez les drapeaux des pays à travers le monde.',
            difficulty: 3,
            questions: []
          },
          {
            id: 'geography',
            name: 'Géographie physique',
            icon: '🏔️',
            description: 'Questions sur les montagnes, fleuves, déserts et autres formations géographiques.',
            difficulty: 4,
            questions: []
          },
          {
            id: 'countries',
            name: 'Pays et frontières',
            icon: '🗺️',
            description: 'Testez vos connaissances sur les pays et leurs frontières.',
            difficulty: 3,
            questions: []
          }
        ],
        activeQuiz: null,
        currentQuestionIndex: 0,
        selectedAnswer: null,
        textAnswer: '',
        showAnswer: false,
        isAnswerCorrect: false,
        quizCompleted: false,
        score: 0,
        userAnswers: []
      };
    },
    computed: {
      currentQuestion() {
        return this.activeQuiz ? this.activeQuiz.questions[this.currentQuestionIndex] : null;
      },
      quizProgress() {
        if (!this.activeQuiz) return 0;
        return (this.currentQuestionIndex / this.activeQuiz.questions.length) * 100;
      },
      scorePercentage() {
        if (!this.activeQuiz) return 0;
        return Math.round((this.score / this.activeQuiz.questions.length) * 100);
      },
      resultMessage() {
        const percentage = this.scorePercentage;
        
        if (percentage >= 90) return "Excellent ! Vous êtes un expert en géographie !";
        if (percentage >= 70) return "Très bien ! Vous avez de solides connaissances !";
        if (percentage >= 50) return "Pas mal ! Continuez à apprendre !";
        return "Continuez à pratiquer pour améliorer vos connaissances !";
      }
    },
    methods: {
      selectCategory(category) {
        this.activeQuiz = { ...category };
        this.resetQuiz();
      },
      
      resetQuiz() {
        this.currentQuestionIndex = 0;
        this.selectedAnswer = null;
        this.textAnswer = '';
        this.showAnswer = false;
        this.quizCompleted = false;
        this.score = 0;
        this.userAnswers = [];
      },
      
      selectAnswer(index) {
        this.selectedAnswer = index;
        this.checkAnswer();
      },
      
      checkTextAnswer() {
        if (!this.textAnswer.trim()) return;
        
        const userAnswer = this.textAnswer.trim().toLowerCase();
        const correctAnswer = this.currentQuestion.correctAnswer.toLowerCase();
        
        this.isAnswerCorrect = userAnswer === correctAnswer;
        
        if (this.isAnswerCorrect) {
          this.score++;
        }
        
        this.userAnswers.push({
          questionIndex: this.currentQuestionIndex,
          userAnswer: this.textAnswer,
          userAnswerText: this.textAnswer,
          correct: this.isAnswerCorrect
        });
        
        this.showAnswer = true;
      },
      
      checkAnswer() {
        const isCorrect = this.selectedAnswer === this.currentQuestion.correctAnswer;
        this.isAnswerCorrect = isCorrect;
        
        if (isCorrect) {
          this.score++;
        }
        
        this.userAnswers.push({
          questionIndex: this.currentQuestionIndex,
          userAnswer: this.selectedAnswer,
          userAnswerText: this.currentQuestion.options[this.selectedAnswer],
          correct: isCorrect
        });
        
        this.showAnswer = true;
      },
      
      nextQuestion() {
        if (this.currentQuestionIndex < this.activeQuiz.questions.length - 1) {
          this.currentQuestionIndex++;
          this.selectedAnswer = null;
          this.textAnswer = '';
          this.showAnswer = false;
        } else {
          this.completeQuiz();
        }
      },
      
      completeQuiz() {
        this.quizCompleted = true;
        
        // Enregistrer le résultat si l'utilisateur est connecté
        if (this.$store.getters.isAuthenticated) {
          this.saveQuizResult();
        }
      },
      
      async saveQuizResult() {
        try {
          await this.$axios.post('/api/user/quiz-results', {
            quizId: this.activeQuiz.id,
            score: this.score,
            total: this.activeQuiz.questions.length
          });
        } catch (error) {
          console.error('Erreur lors de l\'enregistrement du résultat:', error);
        }
      },
      
      retryQuiz() {
        this.resetQuiz();
      },
      
      newQuiz() {
        this.activeQuiz = null;
        this.resetQuiz();
      },
      
      getCorrectAnswerText() {
        if (this.currentQuestion.type === 'multiple-choice') {
          return this.currentQuestion.options[this.currentQuestion.correctAnswer];
        }
        return this.currentQuestion.correctAnswer;
      },
      
      getQuestionCorrectAnswer(question) {
        if (question.type === 'multiple-choice') {
          return question.options[question.correctAnswer];
        }
        return question.correctAnswer;
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .quiz-view {
    padding: 20px;
  }
  
  .quiz-container {
    max-width: 900px;
    margin: 0 auto;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding: 30px;
  }
  
  h1 {
    text-align: center;
    margin-top: 0;
    margin-bottom: 20px;
  }
  
  .quiz-intro {
    text-align: center;
    color: #666;
    margin-bottom: 40px;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .quiz-categories {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .quiz-category-card {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
    border: 1px solid #eee;
  }
  
  .quiz-category-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .category-icon {
    font-size: 3rem;
    margin-bottom: 15px;
  }
  
  .quiz-category-card h3 {
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  .quiz-category-card p {
    color: #666;
    margin-bottom: 15px;
    font-size: 0.9rem;
  }
  
  .difficulty {
    display: block;
    font-size: 0.9rem;
    color: #888;
  }
  
  .stars {
    color: #ddd;
  }
  
  .stars .filled {
    color: #FFC107;
  }
  
  .quiz-header {
    margin-bottom: 30px;
  }
  
  .quiz-header h2 {
    margin-top: 0;
    margin-bottom: 15px;
    text-align: center;
  }
  
  .quiz-progress {
    margin-bottom: 20px;
  }
  
  .question-counter {
    display: block;
    text-align: center;
    margin-bottom: 10px;
    color: #666;
  }
  
  .progress-bar {
    height: 8px;
    background-color: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress {
    height: 100%;
    background-color: #4CAF50;
    border-radius: 4px;
    transition: width 0.3s;
  }
  
  .quiz-question-container {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 30px;
    margin-bottom: 20px;
  }
  
  .question {
  margin-bottom: 25px;
}

.question h3 {
  margin-top: 0;
  margin-bottom: 0;
  font-size: 1.3rem;
}

.answer-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.answer-option {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 15px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 1rem;
}

.answer-option:hover:not([disabled]) {
  background-color: #f0f0f0;
}

.answer-option.selected {
  background-color: #E3F2FD;
  border-color: #2196F3;
}

.answer-option.correct {
  background-color: #E8F5E9;
  border-color: #4CAF50;
}

.answer-option.incorrect {
  background-color: #FFEBEE;
  border-color: #F44336;
}

.answer-option[disabled] {
  cursor: default;
}

.text-answer {
  display: flex;
  gap: 10px;
}

.text-answer input {
  flex: 1;
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.check-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 20px;
  cursor: pointer;
}

.check-button:disabled {
  background-color: #9E9E9E;
  cursor: not-allowed;
}

.answer-feedback {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  text-align: center;
}

.feedback-message {
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.feedback-message.correct {
  color: #4CAF50;
}

.feedback-message.incorrect {
  color: #F44336;
}

.correct-answer {
  margin-bottom: 15px;
}

.explanation {
  color: #666;
  font-style: italic;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
}

.next-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 25px;
  font-size: 1rem;
  cursor: pointer;
}

.quiz-results {
  text-align: center;
}

.quiz-results h2 {
  margin-top: 0;
  margin-bottom: 30px;
}

.score-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 30px;
}

.score-circle {
  width: 150px;
  height: 150px;
}

.circular-chart {
  display: block;
  width: 100%;
  height: 100%;
}

.circle-bg {
  fill: none;
  stroke: #eee;
  stroke-width: 3.8;
}

.circle {
  fill: none;
  stroke: #4CAF50;
  stroke-width: 2.8;
  stroke-linecap: round;
  animation: progress 1s ease-out forwards;
}

@keyframes progress {
  0% {
    stroke-dasharray: 0 100;
  }
}

.percentage {
  fill: #4CAF50;
  font-size: 0.5em;
  text-anchor: middle;
  font-weight: bold;
}

.score-details {
  text-align: left;
}

.score-details p {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.result-message {
  font-weight: bold;
  color: #4CAF50;
  font-size: 1.2rem;
}

.quiz-summary {
  margin-bottom: 40px;
}

.quiz-summary h3 {
  text-align: left;
  margin-bottom: 20px;
}

.questions-summary {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.question-item {
  display: flex;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  text-align: left;
}

.question-item.correct {
  border-left: 4px solid #4CAF50;
}

.question-item.incorrect {
  border-left: 4px solid #F44336;
}

.question-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #4CAF50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
  flex-shrink: 0;
}

.question-item.incorrect .question-number {
  background-color: #F44336;
}

.question-content {
  flex: 1;
}

.question-text {
  margin-bottom: 10px;
  font-weight: 500;
}

.user-answer, .correct-answer {
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.quiz-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.retry-button, .new-quiz-button {
  padding: 12px 25px;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button {
  background-color: white;
  color: #4CAF50;
  border: 1px solid #4CAF50;
}

.retry-button:hover {
  background-color: #f0f0f0;
}

.new-quiz-button {
  background-color: #4CAF50;
  color: white;
  border: none;
}

.new-quiz-button:hover {
  background-color: #388E3C;
}

@media (max-width: 768px) {
  .quiz-container {
    padding: 20px;
  }
  
  .answer-options {
    grid-template-columns: 1fr;
  }
  
  .score-container {
    flex-direction: column;
    gap: 20px;
  }
  
  .score-details {
    text-align: center;
  }
  
  .quiz-actions {
    flex-direction: column;
  }
}
</style>