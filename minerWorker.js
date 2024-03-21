self.addEventListener('message', function(e) {
    console.log('Worker received message:', e.data); // Debugging: Log received data
    const { difficulty, blockData } = e.data;
    let nonce = 0;
    let hash;
    let timestamp; // Declare timestamp outside the loop to ensure it's in scope for the postMessage call

    do {
        nonce++;
        timestamp = new Date().toISOString(); // Update timestamp on each attempt for uniqueness
        hash = generateHash(blockData.index + blockData.precedingHash + timestamp + JSON.stringify(blockData.data) + nonce);
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

    console.log('Worker posting message back:', { nonce, hash, timestamp }); // Debugging: Log message being posted back
    self.postMessage({ nonce, hash, timestamp });
});

function generateHash(input) {
    // Generates a pseudo-random hash for demonstration purposes.
    return [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

self.addEventListener('error', function(error) {
    // Error handling: Log any errors encountered by the worker
    console.error(`Error in worker: ${error.message}`, error);
});
