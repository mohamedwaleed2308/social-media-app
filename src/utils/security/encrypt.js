import CryptoJS from "crypto-js"

export const encryption =({plainText='',signature=process.env.encrypt_key})=>{
    const encrypt=CryptoJS.AES.encrypt(plainText,signature).toString()
    return encrypt
}
export const decryption =({cipherText='',signature=process.env.encrypt_key})=>{
    const decrypt=CryptoJS.AES.decrypt(cipherText,signature).toString(CryptoJS.enc.Utf8)
    return decrypt
}