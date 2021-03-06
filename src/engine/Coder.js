
import Randomizer from './Randomizer';

const NUM_KEYS = 16;


const PASS_FOR_CRC = '98a76sjhdftr^5$3+';
const START_OFF_INCAPSULATE = 217;

class Coder {
  constructor() {
    // 16 keys
    this.m_keys = [];
    this.m_crc = 0;
    this.m_randomizer = new Randomizer();
    this.init();
  } // end constr
  /**
   * Initialize modified keys and seeds
   */
  init() {
    this.m_keys = new Array(NUM_KEYS);
    this.m_keys[0] =  0xd76aa478; this.m_keys[1] =  0x4787c62a;
    this.m_keys[2] =  0xa8304613; this.m_keys[3] =  0xffff5bb1;
    this.m_keys[4] =  0x8b44f7af; this.m_keys[5] =  0x698098d8;
    this.m_keys[6] =  0x6b901122; this.m_keys[7] =  0xfd987193;
    this.m_keys[8] =  0xa679438e; this.m_keys[9] =  0x49b40821;
    this.m_keys[10] =  0xd62f105d; this.m_keys[11] =  0x02441453;
    this.m_keys[12] =  0xd8a1e681; this.m_keys[13] =  0xe7d3fbc8;
    this.m_keys[14] =  0xd4ef3085; this.m_keys[15] =  0x8f0ccc92;
    this.m_randomizer.init();
  }
  // init updateable keys with password string
  /**
   * Encoder setup password
   * 
   * @param {string} strPass - input password
   */
  setPass(strPass) {
    let lenPass = strPass.length;
    let iPass = 0;
    const NUM_ROUNDS = 8;
    for (let r = 0; r < NUM_ROUNDS; r++) {
      for (let i = 0; i < NUM_KEYS; i++) {
        this.m_keys[i] = (strPass.charCodeAt(iPass) ^ this.m_keys[i]) & 0x3fffffff;
        iPass++;
        iPass = (iPass < lenPass) ? iPass : 0;
      }
    }
  } // end of setPass
  /**
   * Encoder should setup password and text to be embedded
   * 
   * @param {string} strPass 
   * @param {string} strMsg 
   */
  setMessageDecoded(strPass, strMsg) {
    this.m_crc = this.getMessageCrc(PASS_FOR_CRC, strMsg);
    // we need again modify keys
    this.init();
    this.setPass(strPass);

    const len = strMsg.length;
    this.m_code = [];
    for(let i = 0; i < len; i++) {
      this.m_code.push(strMsg.charCodeAt(i));
    }
    this.encode();
  }
  /**
   * Simplest CRC implementation for given password and text
   * 
   * @param {string} strPass 
   * @param {string} strMessage 
   */
  getMessageCrc(strPass, strMessage) {
    this.init();
    this.setPass(strPass);
    const len = strMessage.length;
    let iKey = 0;
    let crc = 0;
    for (let i = 0; i < len; i++) {
      const code = strMessage.charCodeAt(i);
      const k = this.m_keys[iKey];
      crc += (code * k) & 0x3fffffff;
      this.updateKeys();
    }
    return (crc & 0x3fffffff);
  }
  static leftRotate(x, c) {
    return (x << c) | (x >> (32 - c));
  }
  /**
   * Update encryption keys, used for ecnode and decode operations
   */
  updateKeys()
  {
    for (let i = 0; i < NUM_KEYS; i += 4) {
      let a = this.m_keys[i + 0]; let b = this.m_keys[i + 1];
      let c = this.m_keys[i + 2]; let d = this.m_keys[i + 3];

      const e = (b & c) | ((~b) & d);
      const f = (d & b) | ((~d) & c);
      const g = b ^ c ^ d;
      const h = c ^ (b | (~d));
      a = (Coder.leftRotate(e, 5) +  f * 13) & 0x3fffffff;
      b = (Coder.leftRotate(g, 11) + h * 9) & 0x3fffffff;
      c = (Coder.leftRotate(f, 4) + h * 9871) & 0x3fffffff;
      d = (Coder.leftRotate(h, 21) + e * 0x87a51) & 0x3fffffff;
      this.m_keys[i + 0] = a; this.m_keys[i + 1] = b;
      this.m_keys[i + 2] = c; this.m_keys[i + 3] = d;
    }
  }
  /**
   * Decode text, converted into array m_code
   */
  decode() {
    const numChars = this.m_code.length;
    let iChar = 0;
    let iKey = 0;
    for (; iChar < numChars; iChar++) {
      const numIn = this.m_code[iChar];
      const codeIn = (this.m_keys[iKey] & 0xff);
      const numOut = numIn ^ codeIn;
      this.m_code[iChar] = numOut;
      this.updateKeys();
      // next key
      iKey ++;
      iKey &= (NUM_KEYS - 1);
    }
  }
  /**
   * Encode text
   */
  encode(){
    this.decode();
  } // encode
  /**
   * Extract readable string from m_code
   */
  getStringFromCode() {
    let str = '';
    const len = this.m_code.length;
    for(let i = 0; i < len; i++) {
      str = str.concat(String.fromCharCode(this.m_code[i]));
    }
    return str;
  }
  /**
   * Get bit from: numBytes OR message OR crc
   * 
   * @param {number} indexBit - index of bit in sequence bytes
   */
  getBit(indexBit) {
    let indDword = Math.floor(indexBit / 32);
    const indBi = indexBit - 32 * indDword;
    const mask = 1 << indBi;
    if (indDword === 0) {
      const ret = ((this.m_code.length & mask) !== 0) ? 1 : 0;
      return ret;
    }
    indDword --;
    if (indDword < this.m_code.length) {
      const ret = ((this.m_code[indDword] & mask) !== 0) ? 1 : 0;
      return ret;
    } else {
      const ret = ((this.m_crc & mask) !== 0) ? 1 : 0;
      // console.log(`getBit. crc[${indBi}] = ${ret} `);
      return ret;
    }
  }
  /**
   * Get next offset for pixel write/read
   */
  getNextOff() {
    return (1 + (this.m_randomizer.getNextRand() & 7));
  }
  /**
   * Test write to bit array
   * 
   * @param {object} arr - array of bits
   * @param {number} numElems - num elems in array
   */
  putToBitArray(arr, numElems) {
    const numBits = (this.m_code.length + 2) * 32;
    if (numBits > numElems) {
      console.log(`too short bit array!, need ${numBits} elements`);
      return false;
    }
    for (let b = 0; b < numBits; b++) {
      const bit = this.getBit(b);
      arr[b] = bit;
    }
    return true;
  } // put  
  readDwordFromBitArray(arr, iterRead) {
    iterRead.dword = 0;
    for (let b = 0; b < 32; b++) {
      const valBit = arr[iterRead.off];
      iterRead.off++;
      iterRead.dword |= (valBit << b);
    }
    return iterRead.dword;
  }
  readCodeFromBitArray(arr, numElems, iterRead, numDwords) {
    this.m_code = new Array(numDwords);
    const numBits = numDwords * 32;
    if (numBits + 16 > numElems) {
      console.log(`too short bit array: Need more ${numBits + 16}`);
      return false;
    }
    let valDword = 0; let indBit = 0;
    let indDword = 0;
    for (let b = 0; b < numBits; b++) {
      const valBit = arr[iterRead.off]; iterRead.off++;
      const mask = (valBit << indBit);
      valDword |= mask;

      // next bit
      indBit++;
      if (indBit >= 32) {
        indBit = 0; this.m_code[indDword] = valDword;
        valDword = 0; indDword++;
      }
    } // for
    return true;
  }
  getFromBitArray(arr, numElems) {
    let iterRead = {
      off: 0,
      dword: 0,
    };
    const numDwords = this.readDwordFromBitArray(arr, iterRead);

    const ok = this.readCodeFromBitArray(arr, numElems, iterRead, numDwords);
    if (!ok) {
      return '';
    }

    const valCrc = this.readDwordFromBitArray(arr, iterRead);
    this.decode();
    const strRes = this.getStringFromCode();
    // check crc
    const crcMatch = this.getMessageCrc(PASS_FOR_CRC, strRes);

    if (valCrc !== crcMatch) {
      console.log(`bad crc. read = ${valCrc}, must be ${crcMatch}`);
      return '';
    }
    return strRes;
  }
  // *************************************************
  // Working with pixel array
  // *************************************************
  /**
   * Put m_code into pixel array, using 
   * random offset for next bit write
   * 
   * @param {object} arr - array of pixels, expect Uint8Array type or like this
   * @param {number} numElems - number of elements in pixel array
   * @return {boolean} false, if message cant be fit into array
   */
  putToArray(arr, numElems) {
    const numBits = (this.m_code.length + 2) * 32;
    if( numBits * 8 > numElems) {
      console.log(`too small array, need ${numBits}`);
      return false;
    }
    let off = START_OFF_INCAPSULATE * 4;
    for (let b = 0; b < numBits; b++) {
      const bit = this.getBit(b);
      let val = arr[off];
      val = (bit === 0) ? (val & 0xfffffffe) : (val | 1);
      arr[off] = val;
      off += this.getNextOff() * 4; // next off
      if (off >= numElems) {
        console.log(`too small array, need at least ${off} elements`);
        return false;
      }
    }
    return true;
  } // put
  readDwordFromPixelArray(arr, iterRead) {
    iterRead.dword = 0;
    for (let b = 0; b < 32; b++) {
      const valBit = ((arr[iterRead.off] & 1) === 1) ? 1 : 0;
      const mask = valBit << b;
      iterRead.dword |= mask;
      iterRead.off += this.getNextOff() * 4; // next off
    }
    return iterRead.dword;
  }
  readCodeFromPixelArray(arr, numElems, iterRead, numDwords) {
    const numBits = numDwords * 32;
    let valDword = 0; let indBit = 0;
    let indDword = 0;
    for (let b = 0; b < numBits; b++) {
      const valBit = ((arr[iterRead.off] & 1) === 1) ? 1 : 0;
      valDword |= (valBit << indBit); indBit++; // next bit
      if (indBit >= 32) {
        indBit = 0; this.m_code[indDword] = valDword;
        valDword = 0; indDword++;
      }
      iterRead.off += this.getNextOff() * 4; // next off
      if (iterRead.off > numElems) {
        console.log(`small array, need more then ${iterRead.off}`);
        return false;
      }
    } // for
    return true;
  }
  /**
   * Get message from pixel array
   * 
   * @param {object} arr - source pixel array
   * @param {number} numElems - number of elements in array
   */
  getFromArray(arr, numElems) {
    const iterRead = {
      off: START_OFF_INCAPSULATE * 4,
      dword: 0
    };
    const numDwords = this.readDwordFromPixelArray(arr, iterRead);
    const TOO_MAX = 1024 * 32;
    if ((numDwords === 0) || (numDwords > TOO_MAX) )
    {
      console.log(`too less or many dwords = ${numDwords}`);
      return '';
    }
    this.m_code = new Array(numDwords);
    const okR = this.readCodeFromPixelArray(arr, numElems, iterRead, numDwords);
    if (!okR) {
      return '';
    }
    const valCrc = this.readDwordFromPixelArray(arr, iterRead);
    // decode bytes in m_code
    this.decode();
    // convert into string
    const strRes = this.getStringFromCode();

    // check crc
    const crcMatch = this.getMessageCrc(PASS_FOR_CRC, strRes);
    if (valCrc !== crcMatch) {
      console.log(`bad crc. read = ${valCrc}, must be ${crcMatch}`);
      return '';
    }
    return strRes;
  } // getFromArray

} // end coder
export default Coder;