// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.9.0;

contract ProposalElection {
    address owner;

    constructor() {
     owner = msg.sender;
    }
    // Model a Proposal
    struct Proposal {
        uint id;
        string name;
        uint voteCount;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store Proposals
    // Fetch Proposals
    Proposal[] public proposals;
    // Store Candidates Count
    uint public proposalsCount;

    // voted event
    event votedEvent (
        uint indexed _proposalId
    );

    function addProposal (string memory _name) public returns(bool) {
        require(msg.sender==owner);
        proposals.push(Proposal(proposalsCount, _name, 0));
        proposalsCount ++;
        return true;
    }

    function vote (uint _proposalId) public {
        require(!voters[msg.sender]);
        voters[msg.sender] = true;

        // If 'proposal' is out of the range of the array,
        // this will throw automatically and revert all
        // changes.
        require(_proposalId >= 0 && _proposalId <= proposalsCount);
        proposals[_proposalId].voteCount ++;
    }

    function returnAllProposals() public view returns(Proposal[] memory){
        return proposals;
    }


    /**
     * @dev Computes the winning proposal taking all previous votes into account.
     * @return winningProposal_ index of winning proposal in the proposals array
     */
    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }
    /**
     * @dev Calls winningProposal() function to get the index of the winner contained in the proposals array and then
     * @return winnerName_ the name of the winner
     */
    function winnerName() public view returns (string memory winnerName_){
        winnerName_ = proposals[winningProposal()].name;
    }
}