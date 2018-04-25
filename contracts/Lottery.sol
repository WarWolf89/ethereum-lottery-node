pragma solidity ^0.4.22;

contract Lottery {

    address public manager;
    address[] players;

    constructor() public{

        // Assign the global message variable`s sender address to the contract variable 
        manager = msg.sender;
    }
 
    

    // payable means calling the function may involve sending ether along with the trans.
    function enterLottery() public payable {
        require(msg.value > 0.1 ether, "need to pay the iron price");
        players.push(msg.sender);
    }

    // Never do this outside of small test apps, 
    // this method resets storage variable values, therefore it can have infinite gas price.
    function pickWinner() public restricted{
        uint contractBalance = address(this).balance;
        uint index = random() % players.length;
        
        // This might seem counterintuitive here, but this a security measure to avoid re-entry.
        // Note that this is super-basic, you can do a reentry modifier to avoid this.
        uint entireTransfer = contractBalance;
        contractBalance = 0.0000;

        players[index].transfer(entireTransfer);
        players.length = 0;

    }

    // Helper util for creating at random by hashing a number from:
    // block difficulty, current time and the players array.
    function random() private view returns (uint) {
        return uint (keccak256(block.difficulty, now, players));
    }

    function getPlayers() public view returns (address[]){
        return players;
    }

    modifier restricted(){
        require(msg.sender == manager);
        _;
    }

}
