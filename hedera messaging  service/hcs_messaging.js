/*
 * Hedera HCS Messaging Service
 *
 * This script demonstrates how to:
 * 1. Create a new HCS Topic.
 * 2. Send messages to that topic (with optional encryption).
 * 3. Subscribe to the topic and retrieve messages (with optional filtering).
 */

// Import necessary modules
import {
    Client,
    PrivateKey,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
    TopicMessageQuery,
  } from '@hashgraph/sdk';
  import dotenv from 'dotenv';
  import crypto from 'crypto';
  
  // --- Configuration ---
  // Load environment variables from .env file
  dotenv.config();
  
  // (Bonus 1) Set to true to encrypt/decrypt messages
  const USE_ENCRYPTION = false;
  
  // (Bonus 2) Set to a keyword (e.g., "Hedera") to filter messages
  // Leave as empty string "" to receive all messages
  const FILTER_KEYWORD = '';
  
  // The list of messages you want to send
  const MESSAGES_TO_SEND = [
    'Hello, Hedera!',
    'Learning HCS',
    'Message 3',
  ];
  // --- End Configuration ---
  
  // --- Encryption Helper Functions (Bonus 1) ---
  const ALGORITHM = 'aes-256-gcm';
  const IV_LENGTH = 16;
  const AUTH_TAG_LENGTH = 16;
  const KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
  
  // Encrypts text
  function encrypt(text) {
    if (KEY.length !== 32) {
      console.error('Invalid ENCRYPTION_KEY. Must be a 64-char hex string (32 bytes).');
      return text; // Return plaintext if key is invalid
    }
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    // Return IV + AuthTag + EncryptedData
    return iv.toString('hex') + authTag.toString('hex') + encrypted;
  }
  
  // Decrypts text
  function decrypt(encryptedText) {
    if (KEY.length !== 32) {
      console.error('Invalid ENCRYPTION_KEY. Cannot decrypt.');
      return encryptedText; // Return encrypted text if key is invalid
    }
    try {
      const data = Buffer.from(encryptedText, 'hex');
      const iv = data.subarray(0, IV_LENGTH);
      const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
      const encrypted = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
      
      const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      return '[Decryption Failed: Invalid Key or Data]';
    }
  }
  // --- End Encryption Helpers ---
  
  
  /**
   * Helper function to format Hedera timestamps
   * @param {import('@hashgraph/sdk').Timestamp} timestamp
   * @returns {string} Formatted date/time string
   */
  function formatTimestamp(timestamp) {
    // Convert Hedera Timestamp to JavaScript Date
    const date = timestamp.toDate();
    // Format to 'YYYY-MM-DD HH:MM:SS'
    return date.toISOString().replace('T', ' ').substring(0, 19);
  }
  
  /**
   * Main function to run the HCS demo
   */
  async function main() {
    console.log('--- Simple Hedera Messaging Service ---');
  
    // 1. Get Hedera Testnet credentials from .env file
    const accountId = process.env.HEDERA_ACCOUNT_ID;
    const privateKey = process.env.HEDERA_PRIVATE_KEY;
  
    if (!accountId || !privateKey) {
      console.error('HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set in .env file');
      return;
    }
  
    // 2. Create a client for the Hedera Testnet
    const client = Client.forTestnet().setOperator(accountId, privateKey);
  
    let topicId;
    try {
      // --- Step 1: Create a new HCS Topic ---
      console.log('\nCreating a new HCS topic...');
      const tx = new TopicCreateTransaction();
      const txResponse = await tx.execute(client);
      const receipt = await txResponse.getReceipt(client);
      
      topicId = receipt.topicId;
      console.log(`Topic Created: ${topicId.toString()}`);
  
      // --- Step 2: Subscribe to the Topic ---
      // (We do this *before* sending messages to ensure we catch them)
      
      // Give the topic 10 seconds to propagate to mirror nodes
      console.log('Waiting 10s for topic to propagate to mirror nodes...');
      await new Promise((resolve) => setTimeout(resolve, 10000));
  
      let receiveCount = 0;
      console.log('\nSubscribing to topic... (Listening for messages)');
      console.log('--- Messages Received: ---');
  
      new TopicMessageQuery()
        .setTopicId(topicId)
        .setStartTime(0) // Start from the beginning of the topic's life
        .subscribe(client,
          (message) => {
            // This is the "callback" that runs for each message
            let messageContent = Buffer.from(message.contents).toString('utf-8');
            const timestamp = formatTimestamp(message.consensusTimestamp);
  
            // (Bonus 1) Decrypt if needed
            if (USE_ENCRYPTION) {
              messageContent = decrypt(messageContent);
            }
  
            // (Bonus 2) Filter if needed
            if (FILTER_KEYWORD && !messageContent.includes(FILTER_KEYWORD)) {
              // Skips this message if it doesn't match the filter
              return;
            }
            
            receiveCount++;
            console.log(`${receiveCount}. "${messageContent}" at ${timestamp}`);
            
            // Stop the script after receiving all expected messages
            if (receiveCount === MESSAGES_TO_SEND.length) {
              console.log('\nReceived all messages. Closing connection.');
              client.close();
              process.exit(0);
            }
          },
          (error) => {
            console.error('Error subscribing to topic:', error);
            client.close();
            process.exit(1);
          }
        );
  
      // --- Step 3: Send Messages to the Topic ---
      // (Wait a moment *after* subscribing to ensure listener is ready)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('\n--- Messages Sent: ---');
  
      for (let i = 0; i < MESSAGES_TO_SEND.length; i++) {
        let messageToSend = MESSAGES_TO_SEND[i];
        const localTime = formatTimestamp(new Date()); // Use local time for "sent" log
  
        // (Bonus 1) Encrypt if needed
        if (USE_ENCRYPTION) {
          messageToSend = encrypt(messageToSend);
        }
        
        // Submit the message
        await new TopicMessageSubmitTransaction({
          topicId: topicId,
          message: messageToSend,
        }).execute(client);
  
        // Log the *original* (plaintext) message for the "Sent" output
        console.log(`${i + 1}. "${MESSAGES_TO_SEND[i]}" at ${localTime}`);
        
        // Wait 1 second between messages
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      console.log('\nAll messages sent. Waiting for subscriber to receive them...');
  
    } catch (err) {
      console.error('An error occurred:', err);
    }
    
    // Note: We don't call client.close() here because the subscriber
    // is still running. The subscriber will close the client on exit.
  }
  
  // Run the main function
  main();
  
  