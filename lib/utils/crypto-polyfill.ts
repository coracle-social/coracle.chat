// crypto-polyfill.ts
import { gcm } from '@noble/ciphers/aes'
import { ed25519 } from '@noble/curves/ed25519'
import { p256 } from '@noble/curves/nist'
import { hmac } from '@noble/hashes/hmac'
import { sha256, sha384, sha512 } from '@noble/hashes/sha2'
import { randomBytes } from '@noble/hashes/utils'

// React Native compatible global check
if (typeof global !== 'undefined' && !global.crypto) {
  global.crypto = {} as any
} else if (typeof window !== 'undefined' && !window.crypto) {
  window.crypto = {} as any
}

// Polyfill crypto.getRandomValues
if (!crypto.getRandomValues) {
  ;(crypto as any).getRandomValues = function(array: ArrayBufferView | null): ArrayBufferView {
    if (!array) throw new Error('Array cannot be null')
    const bytes = randomBytes((array as any).length)
    ;(array as any).set(bytes)
    return array
  }
}

// Polyfill crypto.subtle
if (!crypto.subtle) {
  ;(crypto as any).subtle = {
    async digest(algorithm: any, data: any) {
      const hashFn = algorithm.name === 'SHA-256' ? sha256 :
                     algorithm.name === 'SHA-384' ? sha384 :
                     algorithm.name === 'SHA-512' ? sha512 : null

      if (!hashFn) throw new Error(`Unsupported hash: ${algorithm.name}`)
      return hashFn(data)
    },

    async sign(algorithm: any, key: any, data: any) {
      if (algorithm.name === 'HMAC') {
        const hashFn = algorithm.hash.name === 'SHA-256' ? sha256 :
                       algorithm.hash.name === 'SHA-384' ? sha384 :
                       algorithm.hash.name === 'SHA-512' ? sha512 : null

        if (!hashFn) throw new Error(`Unsupported hash: ${algorithm.hash.name}`)
        return hmac(hashFn, key.keyData, data)
      }

      if (algorithm.name === 'ECDSA') {
        if (algorithm.hash.name === 'SHA-256') {
          return p256.sign(data, key.keyData, { prehash: true }).toCompactRawBytes()
        }
        throw new Error(`Unsupported hash for ECDSA: ${algorithm.hash.name}`)
      }

      throw new Error(`Unsupported algorithm: ${algorithm.name}`)
    },

    async verify(algorithm: any, key: any, signature: any, data: any) {
      if (algorithm.name === 'HMAC') {
        const expected = await this.sign(algorithm, key, data)
        return expected.length === signature.length &&
               expected.every((byte: any, i: any) => byte === signature[i])
      }

      if (algorithm.name === 'ECDSA') {
        if (algorithm.hash.name === 'SHA-256') {
          return p256.verify(signature, data, key.keyData, { prehash: true })
        }
        throw new Error(`Unsupported hash for ECDSA: ${algorithm.hash.name}`)
      }

      throw new Error(`Unsupported algorithm: ${algorithm.name}`)
    },

    async importKey(format: any, keyData: any, algorithm: any, extractable: any, keyUsages: any) {
      // Return a simple key object that works with our polyfills
      return {
        format,
        keyData: new Uint8Array(keyData),
        algorithm,
        extractable,
        keyUsages
      }
    },

    async generateKey(algorithm: any, extractable: any, keyUsages: any) {
      if (algorithm.name === 'ECDSA' && algorithm.namedCurve === 'P-256') {
        const privateKey = p256.utils.randomPrivateKey()
        const publicKey = p256.getPublicKey(privateKey)

        return {
          privateKey: { keyData: privateKey, algorithm, extractable, keyUsages },
          publicKey: { keyData: publicKey, algorithm, extractable, keyUsages }
        }
      }

      if (algorithm.name === 'Ed25519') {
        const privateKey = ed25519.utils.randomPrivateKey()
        const publicKey = ed25519.getPublicKey(privateKey)

        return {
          privateKey: { keyData: privateKey, algorithm, extractable, keyUsages },
          publicKey: { keyData: publicKey, algorithm, extractable, keyUsages }
        }
      }

      throw new Error(`Unsupported key generation: ${algorithm.name}`)
    },

    async encrypt(algorithm: any, key: any, data: any) {
      if (algorithm.name === 'AES-GCM') {
        const cipher = gcm(key.keyData, algorithm.iv, algorithm.additionalData || new Uint8Array())
        return cipher.encrypt(data)
      }
      throw new Error(`Unsupported algorithm: ${algorithm.name}`)
    },

    async decrypt(algorithm: any, key: any, data: any) {
      if (algorithm.name === 'AES-GCM') {
        const cipher = gcm(key.keyData, algorithm.iv, algorithm.additionalData || new Uint8Array())
        return cipher.decrypt(data)
      }
      throw new Error(`Unsupported algorithm: ${algorithm.name}`)
    }
  }
}

export default crypto
