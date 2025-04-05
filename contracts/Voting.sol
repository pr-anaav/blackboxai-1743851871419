// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    address public admin;
    uint public votingStartTime;
    uint public votingEndTime;

    struct Candidate {
        string name;
        string imageUrl;
        uint voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
    }

    Candidate[] public candidates;
    mapping(address => Voter) public voters;

    event VoterRegistered(address voter);
    event CandidateAdded(uint candidateId, string name);
    event VoteCast(address voter, uint candidateId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier votingPeriod() {
        require(block.timestamp >= votingStartTime && block.timestamp <= votingEndTime, "Voting is not active");
        _;
    }

    constructor(uint _votingDurationHours) {
        admin = msg.sender;
        votingStartTime = block.timestamp;
        votingEndTime = block.timestamp + (_votingDurationHours * 1 hours);
    }

    function registerVoter(address _voter) public onlyAdmin {
        require(!voters[_voter].isRegistered, "Voter already registered");
        voters[_voter] = Voter(true, false);
        emit VoterRegistered(_voter);
    }

    function addCandidate(string memory _name, string memory _imageUrl) public onlyAdmin {
        candidates.push(Candidate({
            name: _name,
            imageUrl: _imageUrl,
            voteCount: 0
        }));
        emit CandidateAdded(candidates.length - 1, _name);
    }

    function vote(uint _candidateId) public votingPeriod {
        require(voters[msg.sender].isRegistered, "Voter not registered");
        require(!voters[msg.sender].hasVoted, "Already voted");
        require(_candidateId < candidates.length, "Invalid candidate");

        voters[msg.sender].hasVoted = true;
        candidates[_candidateId].voteCount++;
        emit VoteCast(msg.sender, _candidateId);
    }

    function getResults() public view returns (Candidate[] memory) {
        return candidates;
    }

    function extendVoting(uint _additionalHours) public onlyAdmin {
        votingEndTime += (_additionalHours * 1 hours);
    }
}