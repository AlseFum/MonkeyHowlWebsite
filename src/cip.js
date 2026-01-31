class EnhancedCipher {
    constructor(password) {
        this.password = password;
        this.charList = this._getUniqueChars(password);
        this.digit = this.charList.length;
        
        if (this.digit < 2) {
            throw new Error("Password must contain at least 2 unique characters");
        }
    }

    // 获取唯一字符列表
    _getUniqueChars(str) {
        let uniqueChars = [];
        for (let char of str) {
            if (!uniqueChars.includes(char)) {
                uniqueChars.push(char);
            }
        }
        return uniqueChars;
    }

    // 计算需要的位数
    _getN(m) {
        let digit = 1;
        if (typeof m !== "number" || m % 1 !== 0) {
            throw new Error("Invalid input");
        }
        while (Math.pow(m, ++digit) < 256);
        return digit;
    }

    // 向后编码（字节到数字序列）
    _backward(m) {
        const n = this._getN(m);
        return {
            buffer: [],
            n: n,
            m: m,

            recv(num) {
                if (num > 255 || num < 0) throw new Error("Input must be ≤255");
                this.buffer = [];
                let remaining = this.n;
                let value = num;

                while (remaining > 0) {
                    const byte = value % m;
                    this.buffer.unshift(byte);
                    value = Math.floor(value / m);
                    remaining--;
                }
                return this.buffer;
            }
        };
    }

    // 向前编码（数字序列到字节）
    _forward(m) {
        const n = this._getN(m);
        return {
            cur: 0,
            cache: 0,
            n: n,
            m: m,
            
            recv(newbyte) {
                this.cur += 1;
                this.cache *= m;
                this.cache += newbyte;
                
                if (this.cur >= this.n) {
                    let result = this.cache;
                    this.cache = 0;
                    this.cur = 0;
                    return result;
                } else return null;
            }
        };
    }

    // 生成随机IV
    _generateIV() {
        return Math.floor(Math.random() * 256);
    }

    // 流加密处理
    _streamEncrypt(bytes, IV) {
        let encryptedInts = new Uint8Array(bytes.length);
        
        for (let i = 0; i < bytes.length; i++) {
            if (i === 0) {
                encryptedInts[i] = bytes[i] ^ IV;
            } else {
                encryptedInts[i] = bytes[i] ^ encryptedInts[i - 1];
            }
        }
        return encryptedInts;
    }

    // 流解密处理
    _streamDecrypt(encryptedInts, IV) {
        let decryptedBytes = new Uint8Array(encryptedInts.length);
        
        for (let i = 0; i < encryptedInts.length; i++) {
            if (i === 0) {
                decryptedBytes[i] = encryptedInts[i] ^ IV;
            } else {
                decryptedBytes[i] = encryptedInts[i] ^ encryptedInts[i - 1];
            }
        }
        return decryptedBytes;
    }

    // 随机分组反转混淆
    _groupReverseConfuse(bytes) {
        if (bytes.length === 0) {
            return new Uint8Array([0]);
        }

        if (bytes.length < 2) {
            return new Uint8Array([1, bytes[0]]);
        }

        let data = Array.from(bytes);
        let groups = [];
        let remaining = data.length;

        // 生成随机分组大小序列，每组至少2个字节
        while (remaining > 0) {
            let groupSize;
            if (remaining <= 3) {
                groupSize = remaining;
            } else {
                groupSize = Math.floor(Math.random() * (remaining - 3)) + 2;
            }
            groups.push(groupSize);
            remaining -= groupSize;
        }

        // 根据分组大小切割数据
        let result = [];
        let index = 0;
        for (let size of groups) {
            let group = data.slice(index, index + size);
            let reversedGroup = group.reverse();
            result.push(size);
            result.push(...reversedGroup);
            index += size;
        }

        return new Uint8Array(result);
    }

    // 分组反转还原
    _groupReverseRecover(bytes) {
        let result = [];
        let i = 0;

        while (i < bytes.length) {
            const length = bytes[i];
            i++;

            if (i + length > bytes.length) {
                throw new Error("Invalid data: incomplete group");
            }

            const group = bytes.slice(i, i + length);
            const originalGroup = Array.from(group).reverse();
            result.push(...originalGroup);
            i += length;
        }

        return new Uint8Array(result);
    }

    // 加密主函数
    encrypt(plaintext) {
        const IV = this._generateIV();
        const textBytes = new TextEncoder().encode(plaintext);
        const streamEncrypted = this._streamEncrypt(textBytes, IV);
        const dataWithIV = new Uint8Array([IV, ...streamEncrypted]);
        const confusedData = this._groupReverseConfuse(dataWithIV);
        const backwardEncoder = this._backward(this.digit);
        let indices = [];

        for (let byte of confusedData) {
            const digitSequence = backwardEncoder.recv(byte);
            indices.push(...digitSequence);
        }

        let ciphertext = '';
        for (let index of indices) {
            ciphertext += this.charList[index];
        }

        return ciphertext;
    }

    // 解密主函数
    decrypt(ciphertext) {
        let indices = [];
        for (let char of ciphertext) {
            const index = this.charList.indexOf(char);
            if (index === -1) {
                throw new Error(`Invalid character in ciphertext: ${char}`);
            }
            indices.push(index);
        }

        const forwardDecoder = this._forward(this.digit);
        let bytes = [];
        for (let index of indices) {
            const result = forwardDecoder.recv(index);
            if (result !== null) {
                bytes.push(result);
            }
        }

        const finalResult = forwardDecoder.recv(0);
        if (finalResult !== null) bytes.push(finalResult);

        const recoveredData = this._groupReverseRecover(new Uint8Array(bytes));
        const IV = recoveredData[0];
        const encryptedData = recoveredData.slice(1);
        const decryptedBytes = this._streamDecrypt(encryptedData, IV);
        return new TextDecoder().decode(decryptedBytes);
    }

    // 静态方法（已删除groupSize参数）
    static encrypt(text, password) {
        const cipher = new EnhancedCipher(password);
        return cipher.encrypt(text);
    }

    static decrypt(ciphertext, password) {
        const cipher = new EnhancedCipher(password);
        return cipher.decrypt(ciphertext);
    }
}

export const encrypt=EnhancedCipher.encrypt;
export const decrypt=EnhancedCipher.decrypt;
// // 现在使用更简洁的API
// const password = "0123456789abcdef";
// const originalText = "Hello, 世界!";

// // 加密
// const encrypted = EnhancedCipher.encrypt(originalText, password);
// console.log("加密结果:", encrypted);

// // 解密
// const decrypted = EnhancedCipher.decrypt(encrypted, password);
// console.log("解密结果:", decrypted);
// console.log("加解密成功:", originalText === decrypted);