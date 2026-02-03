/**
 * ClawGPT Relay Crypto
 * End-to-end encryption for relay connections using TweetNaCl
 * 
 * Uses X25519 for key exchange and XSalsa20-Poly1305 for encryption
 */

class RelayCrypto {
  constructor() {
    this.keyPair = null;
    this.sharedKey = null;
    this.peerPublicKey = null;
  }

  /**
   * Generate a new keypair for this session
   * @returns {Object} { publicKey: base64, secretKey: Uint8Array }
   */
  generateKeyPair() {
    this.keyPair = nacl.box.keyPair();
    return {
      publicKey: this.encodeBase64(this.keyPair.publicKey),
      secretKey: this.keyPair.secretKey
    };
  }

  /**
   * Get our public key as base64
   * @returns {string} base64-encoded public key
   */
  getPublicKey() {
    if (!this.keyPair) {
      this.generateKeyPair();
    }
    return this.encodeBase64(this.keyPair.publicKey);
  }

  /**
   * Set the peer's public key and derive shared secret
   * @param {string} peerPublicKeyBase64 - Peer's public key as base64
   * @returns {boolean} true if successful
   */
  setPeerPublicKey(peerPublicKeyBase64) {
    try {
      this.peerPublicKey = this.decodeBase64(peerPublicKeyBase64);
      if (this.peerPublicKey.length !== 32) {
        throw new Error('Invalid public key length');
      }
      
      if (!this.keyPair) {
        this.generateKeyPair();
      }
      
      // Derive shared key using X25519
      this.sharedKey = nacl.box.before(this.peerPublicKey, this.keyPair.secretKey);
      return true;
    } catch (e) {
      console.error('Failed to set peer public key:', e);
      return false;
    }
  }

  /**
   * Check if encryption is ready (keys exchanged)
   * @returns {boolean}
   */
  isReady() {
    return this.sharedKey !== null;
  }

  /**
   * Encrypt a message
   * @param {string|Object} message - Message to encrypt (string or object)
   * @returns {string} base64-encoded encrypted message with nonce prepended
   */
  encrypt(message) {
    if (!this.isReady()) {
      throw new Error('Encryption not ready - keys not exchanged');
    }

    // Convert message to string if it's an object
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    const messageBytes = this.encodeUTF8(messageStr);
    
    // Generate random nonce (24 bytes for XSalsa20)
    const nonce = nacl.randomBytes(24);
    
    // Encrypt using the pre-computed shared key
    const encrypted = nacl.secretbox(messageBytes, nonce, this.sharedKey);
    
    // Prepend nonce to encrypted message
    const fullMessage = new Uint8Array(nonce.length + encrypted.length);
    fullMessage.set(nonce);
    fullMessage.set(encrypted, nonce.length);
    
    return this.encodeBase64(fullMessage);
  }

  /**
   * Decrypt a message
   * @param {string} encryptedBase64 - base64-encoded encrypted message with nonce
   * @returns {string|Object|null} Decrypted message, or null if decryption failed
   */
  decrypt(encryptedBase64) {
    if (!this.isReady()) {
      throw new Error('Decryption not ready - keys not exchanged');
    }

    try {
      const fullMessage = this.decodeBase64(encryptedBase64);
      
      // Extract nonce (first 24 bytes)
      const nonce = fullMessage.slice(0, 24);
      const encrypted = fullMessage.slice(24);
      
      // Decrypt using the pre-computed shared key
      const decrypted = nacl.secretbox.open(encrypted, nonce, this.sharedKey);
      
      if (!decrypted) {
        console.error('Decryption failed - invalid ciphertext or wrong key');
        return null;
      }
      
      const messageStr = this.decodeUTF8(decrypted);
      
      // Try to parse as JSON, otherwise return string
      try {
        return JSON.parse(messageStr);
      } catch {
        return messageStr;
      }
    } catch (e) {
      console.error('Decryption error:', e);
      return null;
    }
  }

  /**
   * Generate verification emoji from shared key
   * Both sides will generate the same emoji if keys match
   * @returns {string} 4 emoji characters
   */
  getVerificationEmoji() {
    if (!this.sharedKey) {
      return '❓❓❓❓';
    }
    
    // Hash the shared key to get deterministic bytes
    const hash = nacl.hash(this.sharedKey);
    
    // Use first 4 bytes to select 4 emoji
    const emoji = [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
      '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
      '🦄', '🐝', '🦋', '🐢', '🐙', '🦀', '🐠', '🐬',
      '🌸', '🌺', '🌻', '🌹', '🌷', '🍀', '🌴', '🌵',
      '🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑',
      '🌮', '🍕', '🍔', '🌭', '🍟', '🍿', '🧁', '🍩',
      '⚽', '🏀', '🎾', '🎱', '🎯', '🎪', '🎨', '🎭',
      '🚀', '✈️', '🚁', '🚂', '🚗', '🏎️', '🛵', '🚲'
    ];
    
    return [
      emoji[hash[0] % emoji.length],
      emoji[hash[1] % emoji.length],
      emoji[hash[2] % emoji.length],
      emoji[hash[3] % emoji.length]
    ].join('');
  }

  /**
   * Create an encrypted envelope for sending through relay
   * @param {Object} payload - The actual message payload
   * @returns {Object} Envelope with encrypted payload
   */
  createEnvelope(payload) {
    return {
      type: 'encrypted',
      version: 1,
      payload: this.encrypt(payload)
    };
  }

  /**
   * Open an encrypted envelope received from relay
   * @param {Object} envelope - Envelope with encrypted payload
   * @returns {Object|null} Decrypted payload or null
   */
  openEnvelope(envelope) {
    if (envelope.type !== 'encrypted' || !envelope.payload) {
      console.error('Invalid envelope format');
      return null;
    }
    return this.decrypt(envelope.payload);
  }

  // Utility functions using nacl.util if available, or fallback implementations
  
  encodeBase64(arr) {
    if (typeof nacl.util !== 'undefined' && nacl.util.encodeBase64) {
      return nacl.util.encodeBase64(arr);
    }
    // Fallback for browser
    let str = '';
    for (let i = 0; i < arr.length; i++) {
      str += String.fromCharCode(arr[i]);
    }
    return btoa(str);
  }

  decodeBase64(str) {
    if (typeof nacl.util !== 'undefined' && nacl.util.decodeBase64) {
      return nacl.util.decodeBase64(str);
    }
    // Fallback for browser
    const decoded = atob(str);
    const arr = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      arr[i] = decoded.charCodeAt(i);
    }
    return arr;
  }

  encodeUTF8(str) {
    if (typeof nacl.util !== 'undefined' && nacl.util.decodeUTF8) {
      return nacl.util.decodeUTF8(str);
    }
    // Fallback
    const encoder = new TextEncoder();
    return encoder.encode(str);
  }

  decodeUTF8(arr) {
    if (typeof nacl.util !== 'undefined' && nacl.util.encodeUTF8) {
      return nacl.util.encodeUTF8(arr);
    }
    // Fallback
    const decoder = new TextDecoder();
    return decoder.decode(arr);
  }

  /**
   * Clear all keys from memory
   */
  destroy() {
    if (this.keyPair) {
      // Zero out secret key
      for (let i = 0; i < this.keyPair.secretKey.length; i++) {
        this.keyPair.secretKey[i] = 0;
      }
    }
    if (this.sharedKey) {
      for (let i = 0; i < this.sharedKey.length; i++) {
        this.sharedKey[i] = 0;
      }
    }
    this.keyPair = null;
    this.sharedKey = null;
    this.peerPublicKey = null;
  }
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RelayCrypto;
}
