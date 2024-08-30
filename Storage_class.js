"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class StorageClass {
    constructor(d, url) {
        this.dirname = d;
        this.url = url;
    }
    convertToImage(base64, Buffer) {
        // Remover o prefixo da string Base64, se presente
        const base64Data = base64.replace(/^data:image\/png;base64,/, '');
        // Converter Base64 em buffer
        let bufferC = Buffer.from(base64Data, 'base64');
        return this.saveImagetoServer(bufferC);
    }
    saveImagetoServer(buffer) {
        // Caminho onde a imagem será salva
        const fileName = this.generateFileName();
        const filePath = path_1.default.join(this.dirname, 'uploads', fileName);
        // Criar o diretório 'uploads' se não existir
        if (!fs_1.default.existsSync(path_1.default.dirname(filePath))) {
            fs_1.default.mkdirSync(path_1.default.dirname(filePath));
        }
        // Salvar o buffer como um arquivo
        fs_1.default.writeFile(filePath, buffer, (err) => {
            if (err) {
                console.error('Erro ao salvar o arquivo:', err);
            }
            console.error(this.url + 'uploads/' + fileName);
        });
        return this.url + 'uploads/' + fileName;
    }
    generateFileName() {
        let fileName = String(Date.now());
        fileName += '.jpg';
        return fileName;
    }
}
module.exports = StorageClass;
