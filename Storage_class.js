"use strict";
class StorageClass {
    constructor(f, b, d, bu, url) {
        this.fs = f;
        this.bodyParse = f;
        this.dirname = d;
        this.buffer = bu;
        this.url = url;
    }
    convertToImage(base64, path) {
        // Remover o prefixo da string Base64, se presente
        const base64Data = base64.replace(/^data:image\/png;base64,/, '');
        // Converter Base64 em buffer
        const buffer = this.buffer.from(base64Data, 'base64');
        return this.saveImagetoServer(buffer, path);
    }
    saveImagetoServer(buffer, path) {
        // Caminho onde a imagem será salva
        const fileName = this.generateFileName();
        const filePath = path.join(this.dirname, 'uploads', fileName);
        // Criar o diretório 'uploads' se não existir
        if (!this.fs.existsSync(path.dirname(filePath))) {
            this.fs.mkdirSync(path.dirname(filePath));
        }
        // Salvar o buffer como um arquivo
        this.fs.writeFile(filePath, buffer, (err) => {
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
