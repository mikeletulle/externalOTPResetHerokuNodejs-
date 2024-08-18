/*const express = require('express')
const path = require('path')

const PORT = process.env.PORT || 5001

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

  */
  const express = require('express');
  const bodyParser = require('body-parser');
  const axios = require('axios');
  
  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));
  
  // Salesforce Connected App credentials
  const clientId = '3MVG9Gm6vbdjgMWTzmptOaQNO8RDVRUyVAdt6l_cNM84yFrD88JRJfcY3B9Y.cYNyKeNxN6tm4S8poipdp3vn';
  const clientSecret = '5895406378190204BE33EAB49E924F51A8966473DFE714E343E7B641484E3425';
  const username = 'mike@aug24.sdo';
  const password = 'salesforce512';
  const authUrl = 'https://login.salesforce.com/services/oauth2/token';
  
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
          // Step 1: Authenticate and get OAuth token
          const tokenResponse = await axios.post(authUrl, null, {
              params: {
                  grant_type: 'password',
                  client_id: clientId,
                  client_secret: clientSecret,
                  username: username,
                  password: password
              }
          });
          const accessToken = tokenResponse.data.access_token;
  
          // Step 2: Create OTP Record in Salesforce
          const otpUrl = 'https://mletulle-240801-766-demo.my.salesforce.com/services/data/v56.0/sobjects/Password_Reset_Token__c';
          const token = generateToken(); // You can use a custom function to generate a GUID
          const expiration = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now
  
          const otpPayload = {
              User__c: userId,
              Token__c: token,
              Expiration_Date__c: expiration
          };
  
          const otpResponse = await axios.post(otpUrl, otpPayload, {
              headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
              }
          });
  
          // Step 3: Generate the OTP reset link
          const resetLink = `https://mletulle-240801-766-demo.my.site.com/consumer/s/resetpassword?token=${token}`;
          
          // Send the reset link via WhatsApp (this part would be integrated with your WhatsApp sending logic)
          // For now, we just return the link
          res.send(`
              <html>
                  <body>
                      <h1>OTP Link Generated Successfully!</h1>
                      <p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>
                  </body>
              </html>
          `);
  
      } catch (error) {
          console.error('Error generating OTP:', error);
          res.status(500).send('An error occurred while generating the OTP.'+ error);
      }
  });
  
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
  
/* code to change to JWT bearer token
const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');

// Load private key from PEM file
const privateKey = fs.readFileSync('path/to/private.key');

// JWT payload
const payload = {
    iss: 'your_client_id',  // Client ID (Consumer Key)
    sub: 'integration_user@yourdomain.com',  // The username of the integration user
    aud: 'https://login.salesforce.com',
    exp: Math.floor(Date.now() / 1000) + 60 * 3  // 3 minutes expiration
};

// Sign JWT with the private key
const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

// Request Access Token
axios.post('https://login.salesforce.com/services/oauth2/token', null, {
    params: {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token
    }
}).then(response => {
    console.log('Access Token:', response.data.access_token);
}).catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
});
*/
