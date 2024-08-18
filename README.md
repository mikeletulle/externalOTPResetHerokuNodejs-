# externalOTPResetHerokuNodejs
# External OTP Reset Node.js Heroku Application

This repository contains the Node.js side of an end-to-end solution designed to facilitate a password reset process via an external One-Time Password (OTP) using Server Side Javascript. This solution is part of an integration between Salesforce and an external Node.js application hosted on Heroku, leveraging Salesforce's JWT Bearer Flow for secure communication.

This repository is part of a two-repository solution. The Salesforce-side code can be found in the externalOTPResetSFDC repository at https://github.com/mikeletulle/externalOTPResetSFDC

## Overview

This Node.js application serves as a middleware between Salesforce and Heroku, handling the generation and verification of OTP links. The JWT Bearer Flow is used to authenticate with Salesforce via a connected app, enabling secure API interactions.

The Node.js app authenticate's with Salesforce's connect application, generates a random token, creates a custom object called a Password Reset Token with that token value related to whatever user has the user ID you supply (18 char object id), and then generates a one time password link containing that token. 
In reality the link would be emailed to that user's email address or sent via something like WhatsApp to them.  

## Setup Instructions

### 1. Create a Self-Signed Certificate

To set up the JWT Bearer Flow, a self-signed certificate is required:

1. Navigate to your project directory.
2. Run the following command to generate a private key and a self-signed certificate:
   
   openssl req -new -x509 -key private.key -out certificate.crt -days 365

Place the generated private.key file in the root of your project directory.

2. Create a Heroku Project
Install the Heroku CLI and log in to your Heroku account.
Create a new Heroku application based on this repository. This repository is basically a clone of the sample Heroku NodeJS app with changes only to the index.js file. ( https://github.com/heroku/node-js-getting-started ) 


heroku create <your-app-name>
Deploy your application:
bash

git push heroku main

3. Set Up the Salesforce Connected App

In Salesforce, navigate to Setup > App Manager > New Connected App.
Configure the connected app with the following settings:
API (Enable OAuth Settings):
Enable OAuth Settings.
Set the callback URL to https://your-heroku-app.herokuapp.com/callback.
Add Full Access and Perform requests on your behalf at any time to OAuth Scopes.

JWT Settings:
Upload the certificate.crt file created earlier.
Set the audience to https://login.salesforce.com for production or https://test.salesforce.com for sandbox.
Save the connected app and note the Consumer Key and Consumer Secret.

Follow the other setup steps listed in the related repoisitory for the Salesforce side such as setting up the custom object and Experience cloud site. ( https://github.com/mikeletulle/externalOTPResetSFDC ) 

4.  Deploy and Test
Deploy the application to Heroku and test the end-to-end flow by initiating a password reset through Salesforce.





 
