const questionContainer = document.getElementById('question-container');
        const questionElement = document.getElementById('question');
        const answerButtons = document.getElementById('answer-buttons');
        const nextButton = document.getElementById('next-button');
        const player1ScoreElement = document.getElementById('player1-score');
        const player2ScoreElement = document.getElementById('player2-score');
        const turnIndicator = document.getElementById('turn-indicator');
        const finalScoreElement = document.getElementById('final-score');
        const categorySelect = document.getElementById('category-select');
        const startButton = document.getElementById('start-button');
        const restartButton = document.getElementById('restart-button');
        const endButton = document.getElementById('end-button');

        let questions = [];
        let currentQuestionIndex = 0;
        let scores = { player1: 0, player2: 0 };
        let currentPlayer = 'player1';
        let allAnswers = [];

        // Fetch categoeris API
        async function fetchCategories() {
            const response = await fetch('https://opentdb.com/api_category.php');
            const data = await response.json();
            
            populateCategorySelect(data.trivia_categories);
        }

        // category dropdown
        function populateCategorySelect(categories) {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.innerText = category.name;
                categorySelect.appendChild(option);
            });
        }

        // Fetch trivia questions from the API based on the selected category
        async function fetchQuestions(categoryId) {
            const response = await fetch(`https://opentdb.com/api.php?amount=10&category=${categoryId}&type=multiple`);
            const data = await response.json();
            // console.log(data);
            
            questions = data.results.map(question => ({
                question: question.question,
                answers: [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5),
                correctAnswer: question.correct_answer,
            }));
            startGame();
        }

        // Start game
        function startGame() {
          document.getElementById('players').style.display = 'block';
            currentQuestionIndex = 0;
            scores = { player1: 0, player2: 0 };
            allAnswers = [];
            currentPlayer = 'player1';
            nextButton.style.display = 'none';
            finalScoreElement.innerText = '';
            updateScores();
            turnIndicator.innerText = "Player 1's Turn";
            showQuestion(questions[currentQuestionIndex]);
            restartButton.style.display = 'none';
            endButton.style.display = 'block';
            turnIndicator.style.display = 'block'
        }
          
        // Update scores display
        function updateScores() {
            player1ScoreElement.innerText = scores.player1;
            player2ScoreElement.innerText = scores.player2;  
        }



        // Show current question
        function showQuestion(question) {
            questionElement.innerHTML = question.question;
            answerButtons.innerHTML = '';
            question.answers.forEach(answer => {
                const button = createAnswerButton(answer);
                answerButtons.appendChild(button);
            });
        }

        // Create answer button
        function createAnswerButton(answer) {
            const button = document.createElement('button');
            button.innerText = answer;
            button.classList.add('btn');
            button.addEventListener('click', () => selectAnswer(answer));
            return button;
        }

        // Handle answer selection
        function selectAnswer(selectedAnswer) {
            const correctAnswer = questions[currentQuestionIndex].correctAnswer;
            if (selectedAnswer === correctAnswer) {
                scores[currentPlayer]++;
                highlightCorrectAnswer(correctAnswer);
            } else {
                highlightCorrectAnswer(correctAnswer);
            }

            // Add current question and answer to allAnswers array
            allAnswers.push({
                question: questions[currentQuestionIndex].question,
                correctAnswer: correctAnswer,
                selectedAnswer: selectedAnswer
            });

            nextButton.style.display = 'block';
            disableButtons();
            updateScores();
        }

        // Highlight correct answer
        function highlightCorrectAnswer(correctAnswer) {
            Array.from(answerButtons.children).forEach(button => {
                if (button.innerText === correctAnswer) {
                    button.style.backgroundColor = 'green';
                } else {
                    button.style.backgroundColor = 'red';
                }
            });
        }

        // Disable all answer buttons
        function disableButtons() {
            Array.from(answerButtons.children).forEach(button => {
                button.disabled = true;
            });
        }

        // show next question
        nextButton.addEventListener('click', () => {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
                turnIndicator.innerText = currentPlayer === 'player1' ? "Player 1's Turn" : "Player 2's Turn";
                showQuestion(questions[currentQuestionIndex]);
            } else {
                displayScore();
            }
        });


        // Display final score
        function displayScore() {
            questionContainer.style.display = 'none';
            nextButton.style.display = 'none';
        
            // Determine the winner
            let winnerMessage = '';
            if (scores.player1 > scores.player2) {
                winnerMessage = 'Player 1 Wins!';
            } else if (scores.player2 > scores.player1) {
                winnerMessage = 'Player 2 Wins!';
            } else {
                winnerMessage = 'It\'s a Draw!';
            }

            turnIndicator.style.display = 'none'; 

            document.getElementById('players').style.display = 'none'
          
            finalScoreElement.innerHTML = `<strong>Final Score:</strong><br>Player 1: ${scores.player1}<br>Player 2: ${scores.player2}<br><strong>${winnerMessage}</strong>`;

            allAnswers.forEach(answer => {
                finalScoreElement.innerHTML += `<div class="answer-section"><span class="question-title">${answer.question}</span><br><span class="correct-answer">Correct Answer: ${answer.correctAnswer}</span><br><span class="your-answer">Your Answer: ${answer.selectedAnswer}</span></div>`;
            });

            restartButton.style.display = 'block';
            endButton.style.display = 'none';
        }


        // Restart the game
        restartButton.addEventListener('click', startGame);

        // End the game
        endButton.addEventListener('click', () => {
            location.reload();
        });

        // Start game on button click
        startButton.addEventListener('click', () => {
            const selectedCategoryId = categorySelect.value;
            fetchQuestions(selectedCategoryId);
        });

        // Fetch categories on page load
        fetchCategories();
