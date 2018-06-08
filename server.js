const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');
const assert = require('assert');

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const code = fs.readFileSync('./voting.sol').toString();

const compiledCode = solc.compile(code);

const abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface);

const VotingContract = web3.eth.contract(abiDefinition);

const byteCode = compiledCode.contracts[':Voting'].bytecode;

VotingContract.new(['Thomas', 'Fabio', 'Mazzon'], {
    data: byteCode,
    from: web3.eth.accounts[0],
    gas: 4700000
}, function (err, myContract) {
    if (err) {
        console.log("ERROR: ", err);
    } else {

        // e.g. check tx hash on the first call (transaction send)
        if (!myContract.address) {
            console.log("The hash of the transaction, which deploys the contract, ", myContract.transactionHash);

        } else {
            // check address on the second call (contract deployed)

            // the contract address
            console.log(myContract.address);

            const contractInstance = VotingContract.at(myContract.address);

            console.log("TOTAL VOTES FOR Thomas, BEFORE VOTING ", contractInstance.totalVotesFor.call('Thomas'));

            contractInstance.voteForCandidate('Thomas', {from: web3.eth.accounts[0]});

            contractInstance.voteForCandidate('Thomas', {from: web3.eth.accounts[0]});

            contractInstance.voteForCandidate('Mazzon', {from: web3.eth.accounts[0]});

            const totalVotesThomas = contractInstance.totalVotesFor.call('Thomas').toLocaleString();
            const totalVotesMazzon = contractInstance.totalVotesFor.call('Mazzon').toLocaleString();

            console.log("TOTAL VOTES FOR Thomas, AFTER VOTING ", totalVotesThomas);

            // simple testing
            assert.strictEqual(totalVotesThomas, "2");
            assert.strictEqual(totalVotesMazzon, "1");

        }
    }
});
