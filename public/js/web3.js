// Web3 Initialization
let web3;
let contract;
let contractAddress = "0x..."; // Will be updated after deployment
let account;

// Contract ABI (simplified for initial setup)
const contractABI = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "_votingDurationHours", "type": "uint256"}
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_name", "type": "string"},
            {"internalType": "string", "name": "_imageUrl", "type": "string"}
        ],
        "name": "addCandidate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "_voter", "type": "address"}
        ],
        "name": "registerVoter",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_candidateId", "type": "uint256"}
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getResults",
        "outputs": [
            {
                "components": [
                    {"internalType": "string", "name": "name", "type": "string"},
                    {"internalType": "string", "name": "imageUrl", "type": "string"},
                    {"internalType": "uint256", "name": "voteCount", "type": "uint256"}
                ],
                "internalType": "struct VotingSystem.Candidate[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Initialize Web3
async function initWeb3() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.enable();
            updateAccount();
        } catch (error) {
            console.error("User denied account access");
        }
    } else if (window.web3) {
        web3 = new Web3(window.web3.currentProvider);
        updateAccount();
    } else {
        console.error("No Ethereum browser extension detected");
        return false;
    }

    // Set up contract instance
    contract = new web3.eth.Contract(contractABI, contractAddress);
    
    // Account change listener
    window.ethereum.on('accountsChanged', (accounts) => {
        updateAccount();
    });

    return true;
}

// Update current account
function updateAccount() {
    web3.eth.getAccounts()
        .then(accounts => {
            account = accounts[0];
            document.dispatchEvent(new CustomEvent('accountChanged', { detail: account }));
        })
        .catch(console.error);
}

// Connect Wallet Button Handler
document.addEventListener('DOMContentLoaded', () => {
    const connectButtons = document.querySelectorAll('#connectWallet');
    connectButtons.forEach(button => {
        button.addEventListener('click', async () => {
            if (window.ethereum) {
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    location.reload();
                } catch (error) {
                    console.error("User denied account access");
                }
            } else {
                alert('Please install MetaMask to use this application!');
            }
        });
    });
});

// Helper function to format addresses
function formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Helper function to format timestamp
function formatTimestamp(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
}