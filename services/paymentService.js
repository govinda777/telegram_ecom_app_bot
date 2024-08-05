const axios = require('axios');
const crypto = require('crypto');

exports.createPayment = async (amount, description) => {
    const payload = {
        cmd: 'create_transaction',
        key: process.env.COINPAYMENTS_API_KEY,
        amount: amount,
        currency1: 'USD',
        currency2: 'BTC',  // Pode ser outra criptomoeda suportada pela CoinPayments
        buyer_email: 'buyer@example.com',
        item_name: description,
        format: 'json'
    };

    const headers = {
        'Content-Type': 'application/json',
        'HMAC': createHMAC(payload),
    };

    const response = await axios.post('https://www.coinpayments.net/api.php', payload, { headers });
    return response.data.result.checkout_url;
};

const createHMAC = (payload) => {
    const hmac = crypto.createHmac('sha512', process.env.COINPAYMENTS_API_SECRET);
    hmac.update(Buffer.from(new URLSearchParams(payload).toString()));
    return hmac.digest('hex');
};
