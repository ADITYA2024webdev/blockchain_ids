Hedera Consensus Service (HCS) - Simple Messaging

This project is a simple Node.js application demonstrating how to use the Hedera Consensus Service (HCS) to create a topic, send messages, and subscribe to those messages.

It includes bonus functionality for message encryption and filtering.

Problem Statement

Learn how to use the Hedera Consensus Service (HCS) to send and retrieve messages on the Hedera network.

Features

Create Topic: Dynamically creates a new HCS topic.

Submit Messages: Sends a series of user-defined messages to the topic.

Subscribe to Topic: Subscribes to the topic and listens for new messages in real-time.

Accurate Timestamps: Logs the consensus timestamp for each received message, which is the official, fair, and immutable timestamp from the Hedera network.

Bonus 1: Encryption: (Optional) Uses AES-256-GCM to encrypt messages before sending and decrypts them upon retrieval.

Bonus 2: Filtering: (Optional) Allows the subscriber to only log messages that contain a specific keyword.

Prerequisites

Node.js (v18 or later recommended)

A Hedera Testnet Account. You can get one for free from the Hedera Developer Portal.

Setup & Installation

Clone the Repository:

git clone <your-repo-url>
cd <your-repo-directory>


Install Dependencies:

npm install


Create Your Environment File:

Copy the example file:

cp .env.example .env


Open the new .env file in a text editor.

Get your Account ID and Private Key from the Hedera Portal and paste them into this file.

(For Bonus 1) If you want to use encryption, make sure ENCRYPTION_KEY is set to a 64-character hex string (32 bytes). An example is provided.

How to Run

Execute the main script from your terminal:

npm start


Or (if not using the start script):

node hcs_messaging.js


Example Output

When you run the script, you will see an output similar to this. (Note: Timestamps will, of course, be different, and your Topic ID will be new.)

--- Simple Hedera Messaging Service ---

Creating a new HCS topic...
Topic Created: 0.0.4512345

Waiting 10s for topic to propagate to mirror nodes...

Subscribing to topic... (Listening for messages)
--- Messages Received: ---

--- Messages Sent: ---
1. "Hello, Hedera!" at 2025-10-26 14:30:01
2. "Learning HCS" at 2025-10-26 14:30:02
3. "Message 3" at 2025-10-26 14:30:03

All messages sent. Waiting for subscriber to receive them...
1. "Hello, Hedera!" at 2025-10-26 14:30:01
2. "Learning HCS" at 2025-10-26 14:30:02
3. "Message 3" at 2025-10-26 14:30:03
Received all messages. Closing connection.


How to Enable Bonus Features

To try the bonus challenges, open hcs_messaging.js and change the configuration constants at the top of the file:

For Encryption (Bonus 1):

Set USE_ENCRYPTION = true;

Make sure ENCRYPTION_KEY is set in your .env file.

For Filtering (Bonus 2):

Set FILTER_KEYWORD = 'Hedera';

The output will now only show messages containing the word "Hedera".