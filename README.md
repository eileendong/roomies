# roomies

Roomies is a full-stack web app that helps roommates split expenses built w/ AWS. Users securely sign in w Amazon Cognito, upload photos of receipts, and AWS Textract automatically extracts item names and prices. Processed by AWS Lambda functions, stored in DynamoDB, and synced in real time across all users with Amplify DataStore. The frontend, built with React + TypeScript + AWS Amplify, lets roommates view and manage balances, add or edit contacts, check spending insights, and organize shared events on a calendar.
Each teammate runs locally:

Git clone repo
Git pull
“npm ci” to install all dependencies
