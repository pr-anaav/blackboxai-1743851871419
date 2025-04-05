// Voting Page Logic
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Web3
    const web3Initialized = await initWeb3();
    if (!web3Initialized) return;

    // DOM Elements
    const candidateContainer = document.getElementById('candidateContainer');
    const voteStatus = document.getElementById('voteStatus');
    const alreadyVoted = document.getElementById('alreadyVoted');
    const notRegistered = document.getElementById('notRegistered');
    const refreshResultsBtn = document.getElementById('refreshResults');

    // Check voter registration status
    const isRegistered = await checkVoterRegistration();
    if (!isRegistered) {
        notRegistered.classList.remove('hidden');
        return;
    }

    // Load candidates
    await loadCandidates();

    // Refresh results button
    refreshResultsBtn.addEventListener('click', loadCandidates);

    // Function to check voter registration
    async function checkVoterRegistration() {
        try {
            const voter = await contract.methods.voters(account).call();
            return voter.isRegistered;
        } catch (error) {
            console.error('Error checking registration:', error);
            alert('Error checking registration status: ' + error.message);
            return false;
        }
    }

    // Load candidates from the contract
    async function loadCandidates() {
        candidateContainer.innerHTML = ''; // Clear previous candidates
        try {
            const candidates = await contract.methods.getResults().call();
            candidates.forEach((candidate, index) => {
                const candidateCard = document.createElement('div');
                candidateCard.className = 'bg-white rounded-lg shadow-md p-4 candidate-card cursor-pointer';
                candidateCard.innerHTML = `
                    <img src="${candidate.imageUrl}" alt="${candidate.name}" class="w-full h-32 object-cover rounded-md">
                    <h3 class="text-lg font-semibold mt-2">${candidate.name}</h3>
                    <p class="text-gray-600">Votes: ${candidate.voteCount}</p>
                    <button class="bg-blue-600 text-white py-2 px-4 rounded mt-4 voteBtn" data-index="${index}">
                        Vote
                    </button>
                `;
                candidateContainer.appendChild(candidateCard);
            });

            // Add event listeners to vote buttons
            const voteButtons = document.querySelectorAll('.voteBtn');
            voteButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const candidateIndex = button.getAttribute('data-index');
                    openVoteModal(candidates[candidateIndex]);
                });
            });
        } catch (error) {
            console.error('Error loading candidates:', error);
            candidateContainer.innerHTML = '<p class="text-red-500">Error loading candidates.</p>';
        }
    }

    // Open vote confirmation modal
    function openVoteModal(candidate) {
        const voteModal = document.getElementById('voteModal');
        const modalCandidateName = document.getElementById('modalCandidateName');
        const modalCandidateImage = document.getElementById('modalCandidateImage');
        modalCandidateName.textContent = candidate.name;
        modalCandidateImage.src = candidate.imageUrl;

        voteModal.classList.remove('hidden');

        // Confirm vote button
        const confirmVoteBtn = document.getElementById('confirmVote');
        confirmVoteBtn.onclick = async () => {
            await castVote(candidate);
            voteModal.classList.add('hidden');
        };

        // Close modal button
        const closeModalBtn = document.getElementById('closeModal');
        closeModalBtn.onclick = () => {
            voteModal.classList.add('hidden');
        };
    }

    // Cast vote function
    async function castVote(candidate) {
        try {
            voteStatus.classList.remove('hidden');
            voteStatus.querySelector('#statusTitle').textContent = 'Processing Your Vote';
            voteStatus.querySelector('#statusMessage').textContent = 'Please wait...';

            await contract.methods.vote(candidate.index).send({ from: account });

            voteStatus.querySelector('#statusTitle').textContent = 'Vote Successful!';
            voteStatus.querySelector('#statusMessage').textContent = 'Thank you for voting!';
            alreadyVoted.classList.remove('hidden');
        } catch (error) {
            console.error('Error casting vote:', error);
            alert('Error casting vote: ' + error.message);
        } finally {
            voteStatus.classList.add('hidden');
        }
    }
});