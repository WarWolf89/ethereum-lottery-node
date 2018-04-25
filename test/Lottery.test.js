const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const { interface, bytecode } = require('../compile')
const provider = ganache.provider();
const web3 = new Web3(provider);

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
    lottery.setProvider(provider);
});

describe('Lottery contract', () => {
    it('Deploys a contract.', () => {
        assert.ok(lottery.options.address);
    });

    it('Allows one address to enter the contract.', async () => {
        await lottery.methods.enterLottery().send({
            from: accounts[0],
            value: web3.utils.toWei('0.2', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });

    it('Requires a minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('Only manager can call pickWinner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('Sends money to the winner and resets the players array', async () => {
        await lottery.methods.enterLottery().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({ from: accounts[0] });
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;

        assert(difference > web3.utils.toWei('1.99', 'ether'));
    });
});