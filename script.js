document.addEventListener('DOMContentLoaded', () => {
    const tickerForm = document.getElementById('tickerForm');
    const tickerInput = document.getElementById('tickerInput');
    
   const passButton = document.getElementById('passButton');
passButton.addEventListener('click', () => {
    // Increment the currentMetricsIndex to move to the next metric
    currentMetricsIndex[currentStock] = (currentMetricsIndex[currentStock] + 1) % metrics.length;
    currentMetric = metrics[currentMetricsIndex[currentStock]];

    // Update the game board with the new metric
    updateGameBoard();
});

    const scoreDisplay = document.getElementById('currentScore');
    const companyNameElement = document.getElementById('companyName');
    const financialMetricElement = document.getElementById('financialMetric');
    const answerButtons = document.querySelectorAll('.answerButton');
    const metrics = [
        'RevenueTTM',
        'MarketCapitalization',
        'PERatio',
        'ReturnOnEquityTTM',
        'ProfitMargin',
        '50DayMovingAverage',
        '52WeekHigh',
        '52WeekLow',
        'AnalystTargetPrice',
        'BookValue',
        'DilutedEPSTTM',
        'DividendPerShare',
        'DividendYield',
        'EBITDA',
        'EPS',
'EVToEBITDA',
'EVToRevenue',
'ForwardPE',
'GrossProfitTTM',
'MarketCapitalization',
'OperatingMarginTTM',
'PEGRatio',
'PERatio',
'PriceToBookRatio',
'PriceToSalesRatioTTM',
'ProfitMargin',
'QuarterlyEarningsGrowthYOY',
'ReturnOnAssetsTTM',
'ReturnOnEquityTTM',
'RevenuePerShareTTM',
'SharesOutstanding',
'TrailingPE',
    ];

    let stocksData = {}; // This object will store the data fetched from the API
    let currentScore = 0;
    let currentStock = null;
    let currentMetric = null;
    let currentMetricsIndex = {}; // Tracks the index of the current metric for each ticker
    let currentAttempts = 0;
    let topScores = {}; // Object to hold top scores for each set
    const savedTopScores = localStorage.getItem('topScores');
    if (savedTopScores) {
        topScores = JSON.parse(savedTopScores);
    }
    

    // Inside your form submit event listener
tickerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const ticker = tickerInput.value.trim().toUpperCase();
    loadStock(ticker); // Load the stock data for the entered ticker

});

 
   const ALPHA_VANTAGE_API_KEY = '6QE0V2GEOGEIN5J9'; // Replace with your API key
 
    function loadStock(ticker) {
        // Check if the ticker symbol is valid
        if (!ticker || ticker.trim() === '') {
            alert('Please enter a valid ticker symbol.');
            return;
        }
    
        // Reset current score and attempts for a new stock
        if (currentStock !== ticker) {
            currentScore = 0;
            currentAttempts = 0;
        }
    
        console.log(`Loading stock: ${ticker}`);
        fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                console.log("API response for", ticker, ":", data);
    
                // Check for API limit or error message
                if (data.Note) {
                    alert('API request limit reached or an error occurred.');
                    return;
                }
    
                // Check if the stock symbol was found
                if (!data.Symbol) {
                    alert('Stock not found.');
                    return;
                }
    
                // Process the stock data
                processStockData(data);
    
                // Add the ticker link
                addTickerLink(ticker);
    
                // Update the score display
                scoreDisplay.textContent = `${ticker}: ${currentScore}`;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error fetching data:', error);
    
                // Handle errors in score display
                scoreDisplay.textContent = 'Error';
            });
    }
    
    
    function updateTopScore(ticker, score) {
        if (!topScores[ticker] || score > topScores[ticker]) {
            topScores[ticker] = score;
            localStorage.setItem('topScores', JSON.stringify(topScores));
            updateTopScoreDisplay(ticker);
        }
    }
    
    function updateTopScoreDisplay(ticker) {
        const scoreSpan = document.getElementById('topScore-' + ticker);
        if (scoreSpan) {
            scoreSpan.textContent = ' Top Score: ' + topScores[ticker];
        }
    }
    
    
    function addTickerLink(ticker) {
        const tickerLinksContainer = document.getElementById('tickerLinksContainer');
    
        const tickerContainer = document.createElement('div');
        tickerContainer.className = 'tickerContainer';
    
        const tickerLink = document.createElement('a');
        tickerLink.href = '#';
        tickerLink.textContent = ticker;
        tickerLink.onclick = function() {
            loadStock(ticker);
            return false;
        };
        tickerContainer.appendChild(tickerLink);
    
        // Create the delete button (represented as an "x")
const deleteButton = document.createElement('span');
deleteButton.textContent = ' x';
deleteButton.className = 'deleteButton'; // Assign the class name
deleteButton.onclick = function() {
    tickerLinksContainer.removeChild(tickerContainer);
    delete topScores[ticker]; // Optional: Remove from topScores if needed
    localStorage.setItem('topScores', JSON.stringify(topScores)); // Update localStorage
};
tickerContainer.appendChild(deleteButton);
    
        tickerContainer.appendChild(document.createElement('br'));
    
        const scoreSpan = document.createElement('span');
        scoreSpan.id = 'topScore-' + ticker;
        scoreSpan.textContent = ' Top Score: ' + (topScores[ticker] || 0);
        tickerContainer.appendChild(scoreSpan);
    
        tickerLinksContainer.appendChild(tickerContainer);
    }
    
    
    function processStockData(stockData) {
        currentStock = stockData.Symbol;
        
        // Initialize current metric index for the stock if not already set
        if (currentMetricsIndex[currentStock] === undefined) {
            currentMetricsIndex[currentStock] = 0;
        }
        currentMetric = metrics[currentMetricsIndex[currentStock]];
    
    
        if (!stocksData[currentStock]) {
            stocksData[currentStock] = {};
        }
    
        metrics.forEach(metric => {
            if (stockData[metric] !== undefined) {
                stocksData[currentStock][metric] = parseFloat(stockData[metric]);
            }
        });
        console.log(`Data for ${currentStock}:`, stocksData[currentStock]);

        updateGameBoard();
    }
    
    function updateGameBoard() {
        companyNameElement.textContent = currentStock;
        financialMetricElement.textContent = currentMetric;
    
        // Reset and hide answer buttons initially
        answerButtons.forEach(button => {
            button.textContent = '';
            button.style.display = 'none';  // Hide the button
        });
    
        setAnswerOptions(); // Then set the new answer options
    }
    
    function setAnswerOptions() {
        const nextButton = document.getElementById('nextButton');
    
        if (stocksData[currentStock] && stocksData[currentStock][currentMetric]) {
            const correctValue = stocksData[currentStock][currentMetric];
            let options = generateRandomOptions(correctValue, currentMetric);
            options.push(correctValue);
            options.sort(() => Math.random() - 0.5);
    
            const validOptions = options.every(option => isFinite(option));
    
            if (!validOptions) {
                answerButtons.forEach(button => { 
                    button.style.display = 'none'; // Hide answer buttons
                });
                nextButton.style.display = 'inline-block'; // Show 'Next' button
                console.log(`Invalid data for ${currentMetric} of ${currentStock}`);
            } else {
                answerButtons.forEach((button, index) => {
                    button.textContent = formatAnswer(options[index], currentMetric);
                    button.style.display = 'inline-block'; // Show answer buttons
            
                    // Attach an event listener to each answer button
                    button.onclick = () => checkAnswer(button.textContent);
                });
                nextButton.style.display = 'none'; // Hide 'Next' button
            }
        } else {
            console.log(`Data not available for ${currentMetric} on ${currentStock}`);
        }
    }
    
    function formatAnswer(value, metric) {
        switch (metric) {
            case 'MarketCapitalization':
            case 'RevenueTTM':
            case 'EBITDA':
            case 'GrossProfitTTM':
                return `$${(value / 1e9).toFixed(2)} B`; // Format in billions for these absolute value metrics
            case 'PERatio':
            case 'ReturnOnEquityTTM':
            case 'ProfitMargin':
                return value.toFixed(2); // Just a numerical value for ratios
            case 'DividendYield':
                return `${(value * 100).toFixed(2)}%`; // Convert decimal to percentage
            default:
                return value.toString(); // Default format
        }
    }
    
    
    function generateRandomOptions(correctValue, metric) {
    let options = new Set();
    let variationFactor = getVariationFactor(metric, correctValue);

    while (options.size < 2) {
        let randomValue = correctValue + (Math.random() - 0.5) * variationFactor;
        options.add(parseFloat(randomValue.toFixed(2))); // Round to two decimal places
    }

    return Array.from(options);
}

function getVariationFactor(metric, correctValue) {
    // Adjust the variation based on the metric
    switch (metric) {
        case 'MarketCapitalization':
            return correctValue * 0.4; // Example: 40% variation for Market Capitalization
        case 'RevenueTTM':
            return correctValue * 0.15; // Example: 15% variation for Revenue
        case 'EBITDA':
            return correctValue * 1.0; // Example: 100%? variation for EBITDA
        case 'PERatio':
            return 30; // Fixed variation of 30 for PE Ratio
        case 'ReturnOnEquityTTM':
            return 3; // Fixed variation of 3 for Return on Equity
        case 'ProfitMargin':
            return 1; // Fixed variation of 1 for Profit Margin
        default:
            return correctValue * 0.2; // Default variation for other metrics
    }
}

function loadNextMetric() {
    currentMetricsIndex[currentStock] = (currentMetricsIndex[currentStock] + 1) % metrics.length;
    currentMetric = metrics[currentMetricsIndex[currentStock]];

    // Reset attempts for the new metric
    currentAttempts = 0;

    // Update the game board to reflect the new metric
    updateGameBoard();
}


function checkAnswer(selectedValue) {
    if (stocksData[currentStock] && stocksData[currentStock][currentMetric]) {
        let correctValue = stocksData[currentStock][currentMetric];

        if (!isFinite(correctValue) || selectedValue === 'No data') {
            // Treat any selection as correct when there's no valid data
            currentScore += 2; // Award full points
            alert('Correct!');
        } else {
            // Adjust the comparison logic based on the metric type
            let selectedNumber;
            if (currentMetric === 'MarketCapitalization' || currentMetric === 'RevenueTTM' || currentMetric === 'EBITDA') {
                correctValue = correctValue / 1e9; // Convert to billions
                selectedNumber = parseFloat(selectedValue.slice(1, -2)); // Extract the number
            } else {
                selectedNumber = parseFloat(selectedValue);
            }

            // Scoring based on attempts
            if (selectedNumber.toFixed(2) === correctValue.toFixed(2)) {
                // Correct answer
                if (currentAttempts === 0) {
                    currentScore += 2; // 2 points for first attempt
                } else if (currentAttempts === 1) {
                    currentScore += 1; // 1 point for second attempt
                }
                // After updating the current score
                updateTopScore(currentStock, currentScore);
                alert('Correct!');
            } else {
                // Incorrect answer
                currentAttempts++;
                if (currentAttempts < 3) {
                    alert('Incorrect! Try again.');
                } else {
                    alert('Incorrect!');
                    // Load the next metric even if the answer is incorrect after max attempts
                    loadNextMetric();
                    return; // Return early to prevent updating the game board twice
                }
            }
        }

        // Load the next metric for the same stock
        loadNextMetric();
    } else {
        console.log(`Data not available for ${currentMetric} on ${currentStock}`);
    }

    // Update the game board for the next metric
    scoreDisplay.textContent = `${currentStock}: ${currentMetric} - Score: ${currentScore}`;
    updateGameBoard();
}
    
});
