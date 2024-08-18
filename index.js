const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const instanceURL = 'https://mletulle-240801-766-demo.my.salesforce.com';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Salesforce Connected App credentials for JWT Bearer Flow
const clientId = '3MVG9Gm6vbdjgMWTzmptOaQNO8RDVRUyVAdt6l_cNM84yFrD88JRJfcY3B9Y.cYNyKeNxN6tm4S8poipdp3vn';
const integrationUser = 'mike@aug24.sdo'; // The username of the integration user
const privateKeyPath = './private.key'; // Path to the private key file in the root directory
const authUrl = 'https://login.salesforce.com/services/oauth2/token';

// Read the private key from the file system
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');  // Read the key as a string

// HTML form to input Salesforce User ID
app.get('/', (req, res) => {
    res.send(`
        <html>
            <body>
                <h1>Salesforce Password Reset Link Generator</h1>
                <form action="/generate-otp" method="post">
                    <label for="userId">Enter Salesforce User ID:</label><br>
                    <input type="text" id="userId" name="userId"><br><br>
                    <input type="submit" value="Generate OTP Link">
                </form>
            </body>
        </html>
    `);
});

// Handle form submission and generate OTP link
app.post('/generate-otp', async (req, res) => {
    const userId = req.body.userId;

    try {
        // Authenticate using JWT Bearer Flow
        const accessToken = await authenticateWithJWT();

        // Proceed with the Salesforce API call to create OTP record
        await createOtpRecord(accessToken, userId, res);

    } catch (jwtError) {
        console.error('JWT Bearer Flow failed:', jwtError.message);
        res.status(500).send('An error occurred while generating the OTP.');
    }
});

// JWT Bearer Flow Authentication
async function authenticateWithJWT() {
    const payload = {
        iss: clientId,
        sub: integrationUser,
        aud: 'https://login.salesforce.com',
        exp: Math.floor(Date.now() / 1000) + 60 * 3 // 3 minutes expiration
    };

    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });  // Sign with the private key

    const response = await axios.post(authUrl, null, {
        params: {
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: token
        }
    });

    return response.data.access_token;
}

// Create OTP Record in Salesforce
async function createOtpRecord(accessToken, userId, res) {
    const otpUrl = instanceURL + '/services/data/v56.0/sobjects/Password_Reset_Token__c';
    const token = generateToken(); // You can use a custom function to generate a GUID
    const expiration = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

    const otpPayload = {
        User__c: userId,
        Token__c: token,
        Expiration_Date__c: expiration
    };

    await axios.post(otpUrl, otpPayload, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    // Generate the OTP reset link
    const resetLink = `https://mletulle-240801-766-demo.my.site.com/consumer/s/resetpassword?token=${token}`;
    
    // Display the reset link (integrate this with your WhatsApp sending logic as needed)
    res.send(`
        <html>
            <body>
                <h1>OTP Link Generated Successfully!</h1>
                <p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>
            </body>
        </html>
    `);
}

// Custom function to generate a token (GUID-like)
function generateToken() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
