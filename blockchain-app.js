// Ensuring blockchain is defined in the global scope for broad accessibility
let blockchain = [{
    index: 0,
    timestamp: new Date().toISOString(),
    data: "Genesis Block",
    volume: 0,
    precedingHash: '0'.repeat(64),
    hash: "initialHashValue", // Placeholder hash for the genesis block
    nonce: 0,
    difficulty: 1 // Initial difficulty level
}];

// Check if the browser supports Web Workers
if (window.Worker) {
    // Instantiate a new worker with the minerWorker.js script
    const minerWorker = new Worker('minerWorker.js');

    // Add click event listener to the "Add New Block" button
    document.getElementById('addBlock').addEventListener('click', function() {
        // Simulate a random transaction volume
        const volume = Math.floor(Math.random() * 100) + 1;
        const newData = `Transaction Data ${blockchain.length}, Volume: ${volume} BTC`;

        // Retrieve the latest block in the chain to use its hash
        const previousBlock = blockchain[blockchain.length - 1];
        // Calculate the mining difficulty based on the new volume
        const difficulty = calculateDifficulty(volume);
        // Prepare the new block data
        const newBlockData = {
            index: previousBlock.index + 1,
            data: newData,
            precedingHash: previousBlock.hash,
            volume: volume,
            difficulty: difficulty
        };

        // Post the mining task to the worker
        minerWorker.postMessage({ difficulty: newBlockData.difficulty, blockData: newBlockData });

        // Handle the mined block returned by the worker
        minerWorker.onmessage = function(e) {
            const { nonce, hash, timestamp } = e.data;
            // Construct the new block with the received mining results
            const newBlock = {
                ...newBlockData,
                timestamp: timestamp,
                nonce: nonce,
                hash: hash,
            };

            // Add the newly mined block to the blockchain
            blockchain.push(newBlock);
            // Update the UI to reflect the addition of the new block
            updateBlockchainStatus(newBlock);
        };
    });

    // Function to dynamically update the UI with the status of the blockchain
    function updateBlockchainStatus(newBlock) {
        let blockchainStatus = document.getElementById('blockchainStatus');
        let blockElement = document.createElement('div');
        blockElement.classList.add('block');
        blockElement.innerHTML = `
            <strong>Index:</strong> ${newBlock.index}<br>
            <strong>Timestamp:</strong> ${newBlock.timestamp}<br>
            <strong>Nonce:</strong> ${newBlock.nonce}<br>
            <strong>Difficulty:</strong> ${newBlock.difficulty}<br>
            <strong>Merkle Root:</strong> ${generateHash(JSON.stringify(newBlock.data))}<br>
            <strong>Preceding Hash:</strong> ${newBlock.precedingHash}<br>
            <strong>Hash:</strong> ${newBlock.hash}<br>
            <strong>Data:</strong> ${newBlock.data}`;
        blockchainStatus.appendChild(blockElement);
    }

    // Simplified hash generation function for demonstration purposes
    function generateHash(input) {
        return [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    // Function to calculate mining difficulty based on transaction volume
    function calculateDifficulty(volume) {
        // Example adjustment: base difficulty on volume but ensure it doesn't exceed 2
        let calculatedDifficulty = Math.floor(volume / 50); // Adjust the divisor as needed for your use case
        return Math.min(calculatedDifficulty, 2); // Ensures the difficulty does not exceed 2
    }
} else {
    // Fallback log if Web Workers are not supported in the browser
    console.log('Your browser does not support Web Workers.');
}
