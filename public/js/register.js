// Registration Page Logic
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Web3
    const web3Initialized = await initWeb3();
    if (!web3Initialized) return;

    // DOM Elements
    const adminSection = document.getElementById('adminSection');
    const voterStatus = document.getElementById('voterStatus');
    const notRegistered = document.getElementById('notRegistered');
    const checkRegistrationBtn = document.getElementById('checkRegistrationBtn');
    const registerVoterBtn = document.getElementById('registerVoterBtn');
    const addCandidateBtn = document.getElementById('addCandidateBtn');
    const voterAddressInput = document.getElementById('voterAddress');
    const candidateNameInput = document.getElementById('candidateName');
    const candidateImageInput = document.getElementById('candidateImage');

    // Check if current user is admin
    const isAdmin = await checkIfAdmin();
    if (isAdmin) {
        adminSection.classList.remove('hidden');
    }

    // Check voter registration status
    checkRegistrationBtn.addEventListener('click', checkRegistrationStatus);

    // Register voter handler
    registerVoterBtn.addEventListener('click', async () => {
        const voterAddress = voterAddressInput.value.trim();
        if (!web3.utils.isAddress(voterAddress)) {
            alert('Please enter a valid Ethereum address');
            return;
        }

        try {
            registerVoterBtn.disabled = true;
            registerVoterBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';

            await contract.methods.registerVoter(voterAddress)
                .send({ from: account });

            alert('Voter registered successfully!');
            voterAddressInput.value = '';
        } catch (error) {
            console.error('Registration error:', error);
            alert('Error registering voter: ' + error.message);
        } finally {
            registerVoterBtn.disabled = false;
            registerVoterBtn.textContent = 'Register Voter';
        }
    });

    // Add candidate handler
    addCandidateBtn.addEventListener('click', async () => {
        const name = candidateNameInput.value.trim();
        const imageUrl = candidateImageInput.value.trim();

        if (!name) {
            alert('Please enter candidate name');
            return;
        }

        try {
            addCandidateBtn.disabled = true;
            addCandidateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Adding...';

            await contract.methods.addCandidate(name, imageUrl)
                .send({ from: account });

            alert('Candidate added successfully!');
            candidateNameInput.value = '';
            candidateImageInput.value = '';
        } catch (error) {
            console.error('Add candidate error:', error);
            alert('Error adding candidate: ' + error.message);
        } finally {
            addCandidateBtn.disabled = false;
            addCandidateBtn.textContent = 'Add Candidate';
        }
    });

    // Check if current account is admin
    async function checkIfAdmin() {
        try {
            const contractAdmin = await contract.methods.admin().call();
            return contractAdmin.toLowerCase() === account.toLowerCase();
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    // Check voter registration status
    async function checkRegistrationStatus() {
        try {
            checkRegistrationBtn.disabled = true;
            checkRegistrationBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Checking...';

            const voter = await contract.methods.voters(account).call();
            
            if (voter.isRegistered) {
                notRegistered.classList.add('hidden');
                voterStatus.classList.remove('hidden');
            } else {
                notRegistered.classList.remove('hidden');
                voterStatus.classList.add('hidden');
                if (isAdmin) {
                    adminSection.classList.remove('hidden');
                }
            }
        } catch (error) {
            console.error('Error checking registration:', error);
            alert('Error checking registration status: ' + error.message);
        } finally {
            checkRegistrationBtn.disabled = false;
            checkRegistrationBtn.textContent = 'Check Registration';
        }
    }

    // Check registration status on page load if wallet connected
    if (account) {
        checkRegistrationStatus();
    }

    // Listen for account changes
    document.addEventListener('accountChanged', () => {
        checkRegistrationStatus();
        checkIfAdmin().then(isAdmin => {
            if (isAdmin) {
                adminSection.classList.remove('hidden');
            } else {
                adminSection.classList.add('hidden');
            }
        });
    });
});