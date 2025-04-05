// Results Page Logic
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Web3
    const web3Initialized = await initWeb3();
    if (!web3Initialized) return;

    // DOM Elements
    const resultsChart = document.getElementById('resultsChart');
    const candidateResults = document.getElementById('candidateResults');
    const voteHistory = document.getElementById('voteHistory');
    const totalVotes = document.getElementById('totalVotes');
    const totalVoters = document.getElementById('totalVoters');
    const votingTurnout = document.getElementById('votingTurnout');
    const lastUpdated = document.getElementById('lastUpdated');
    const refreshResultsBtn = document.getElementById('refreshResults');

    // Chart instance
    let resultsChartInstance = null;

    // Load initial results
    await loadResults();

    // Set up refresh button
    refreshResultsBtn.addEventListener('click', loadResults);

    // Load results from the contract
    async function loadResults() {
        try {
            // Show loading state
            refreshResultsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            lastUpdated.textContent = 'Updating...';

            // Get all data from contract
            const [candidates, votersCount, votesCount] = await Promise.all([
                contract.methods.getResults().call(),
                getTotalVoters(),
                getTotalVotes()
            ]);

            // Update statistics
            updateStatistics(candidates, votersCount, votesCount);
            
            // Update chart
            updateChart(candidates);
            
            // Update candidate results
            updateCandidateResults(candidates);
            
            // Update vote history
            updateVoteHistory();

            // Update timestamp
            lastUpdated.textContent = new Date().toLocaleTimeString();
        } catch (error) {
            console.error('Error loading results:', error);
            alert('Error loading results: ' + error.message);
        } finally {
            refreshResultsBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        }
    }

    // Get total voters count
    async function getTotalVoters() {
        // In a real implementation, you would track this in your contract
        return 0; // Placeholder - implement based on your contract
    }

    // Get total votes count
    async function getTotalVotes() {
        const candidates = await contract.methods.getResults().call();
        return candidates.reduce((sum, candidate) => sum + parseInt(candidate.voteCount), 0);
    }

    // Update statistics display
    function updateStatistics(candidates, votersCount, votesCount) {
        totalVotes.textContent = votesCount;
        totalVoters.textContent = votersCount;
        votingTurnout.textContent = votersCount > 0 
            ? `${Math.round((votesCount / votersCount) * 100)}%` 
            : '0%';
    }

    // Update the results chart
    function updateChart(candidates) {
        const ctx = resultsChart.getContext('2d');
        
        // Destroy previous chart if exists
        if (resultsChartInstance) {
            resultsChartInstance.destroy();
        }

        // Sort candidates by vote count (descending)
        const sortedCandidates = [...candidates].sort((a, b) => b.voteCount - a.voteCount);

        resultsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedCandidates.map(c => c.name),
                datasets: [{
                    label: 'Votes',
                    data: sortedCandidates.map(c => c.voteCount),
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(239, 68, 68, 0.7)'
                    ],
                    borderColor: [
                        'rgba(59, 130, 246, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(139, 92, 246, 1)',
                        'rgba(239, 68, 68, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y} votes`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Update candidate results list
    function updateCandidateResults(candidates) {
        // Sort candidates by vote count (descending)
        const sortedCandidates = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
        const totalVotesCount = sortedCandidates.reduce((sum, c) => sum + parseInt(c.voteCount), 0);

        candidateResults.innerHTML = sortedCandidates.map((candidate, index) => {
            const percentage = totalVotesCount > 0 
                ? Math.round((candidate.voteCount / totalVotesCount) * 100) 
                : 0;
            
            return `
                <div class="flex items-center justify-between p-4 border-b border-gray-200">
                    <div class="flex items-center space-x-4">
                        <span class="text-gray-500 font-medium">${index + 1}</span>
                        <img src="${candidate.imageUrl}" alt="${candidate.name}" 
                            class="w-12 h-12 rounded-full object-cover">
                        <div>
                            <h3 class="font-semibold">${candidate.name}</h3>
                            <p class="text-sm text-gray-500">${candidate.voteCount} votes</p>
                        </div>
                    </div>
                    <div class="w-32 bg-gray-200 rounded-full h-2.5">
                        <div class="bg-blue-600 h-2.5 rounded-full" 
                            style="width: ${percentage}%"></div>
                    </div>
                    <span class="text-gray-700 font-medium">${percentage}%</span>
                </div>
            `;
        }).join('');
    }

    // Update vote history (simplified - would use events in real implementation)
    function updateVoteHistory() {
        voteHistory.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    <i class="fas fa-info-circle mr-2"></i> 
                    Vote history would display here from blockchain events
                </td>
            </tr>
        `;
    }
});