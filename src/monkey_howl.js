const getN=(m)=>{
    let digit=1;
    if(typeof m!="number" && m%0!=0){
        return Error();
    }
    while(Math.pow(m,++digit)<256);
    return digit;
}
//encrypted -> 256
const forward = (m) => 0 || {
    cur: 0, cache:0,n:getN(m),m,
    recv(newbyte) {
        this.cur += 1;
        this.cache *= m;
        this.cache += newbyte;
        if (this.cur >= this.n) {
            let result=this.cache;
            this.cache=0;
            this.cur=0;
            return result;
        }else return null;
    }
}

const backward = ( m) => 0 || {
    buffer: [],  // 存储解码后的字节序列
    n:getN(m), m,        // 参数：n为位数，m为进制

    // 接收 ≤255 的数值并返回分解后的数组
    recv(num) {
        if (num > 255 || num < 0) throw new Error("Input must be ≤255");
        this.buffer = [];
        let remaining = this.n;
        let value = num;

        while (remaining > 0) {
            const byte = value % m;
            this.buffer.unshift(byte); // 保持顺序
            value = Math.floor(value / m);
            remaining--;
        }
        return this.buffer;
    },

    // 清空缓冲区（可选）
    clear() {
        this.buffer = [];
    }
};
const txt2int=(str,r)=>{
    let d=backward(r);
    return Array.from((new TextEncoder("utf-8")).encode(str)).map(i=>d.recv(i)).flat()
}

const int2txt=(bytes,r)=>{
    let b=forward(r);
    let result=[];
    for(let i=0;i<bytes.length;i++){
        let res=b.recv(bytes[i]);
        if(res!=null){
            result.push(res);
        }
    }
    return (new TextDecoder("utf-8")).decode(new Uint8Array(result));
}
const getList=str=>{
    let sl=[];
    for(let i=0;i<str.length;i++){
        let res=sl.indexOf(str[i])
        if(res=-1){
            sl.push(str[i])
        }
    }
    return sl;
}

const formal_encrypt=(text,pwd)=>{
    let list=getList(pwd);
    let digit=list.length;
    return txt2int(text,digit).map(i=>list[i]).join("")
}
const formal_decrypt=(text,pwd)=>{
    let list=getList(pwd);
    let digit=list.length;
    let ints=text.split("").map(i=>list.indexOf(i));
    return int2txt(ints,digit)
}

// console.log(formal_encrypt("你好啊靓仔","牛子大盗韩不祝"))
// console.log("\n")
// console.log(formal_decrypt(formal_encrypt("你好啊靓仔","牛子大盗韩不祝"),"牛子大盗韩不祝"))
export default {
    encrypt:formal_encrypt,
    decrypt:formal_decrypt
}