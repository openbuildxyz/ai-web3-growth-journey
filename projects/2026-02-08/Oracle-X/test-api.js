const http = require('http');

const postData = JSON.stringify({
    symbol: 'ETHUSDT',
    direction: 'LONG',
    marketData: {
        price: '3842.50',
        change24h: '2.5',
        volume: '150000',
        high24h: '3900',
        low24h: '3750',
        fearGreedIndex: 65,
        fearGreedLabel: 'Greed',
        klines: [
            {
                openTime: 1707300000000,
                open: '3800',
                high: '3850',
                low: '3780',
                close: '3842',
                volume: '1000'
            }
        ]
    }
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/analyze',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Testing /api/analyze endpoint via http module...');

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    
    console.log('--- Streaming response start ---');
    
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        process.stdout.write(chunk);
    });
    
    res.on('end', () => {
        console.log('\n--- Streaming response end ---');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

// Write data to request body
req.write(postData);
req.end();
