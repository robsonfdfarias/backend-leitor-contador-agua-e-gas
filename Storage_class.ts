import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
class StorageClass{
    url: string;
    dirname: any;
    constructor(d:any, url: string){
        this.dirname = d;
        this.url = url;
    }

    convertToImage(base64: string, Buffer: BufferConstructor){
        // Remover o prefixo da string Base64, se presente
        const base64Data = base64.replace(/^data:image\/png;base64,/, '');
        // Converter Base64 em buffer
        let bufferC = Buffer.from(base64Data, 'base64');
        return this.saveImagetoServer(bufferC);
    }
    saveImagetoServer(buffer: Buffer){
        // Caminho onde a imagem será salva
        const fileName = this.generateFileName();
        const filePath = path.join(this.dirname, 'uploads', fileName);
        // Criar o diretório 'uploads' se não existir
        if(!fs.existsSync(path.dirname(filePath))){
            fs.mkdirSync(path.dirname(filePath))
        }
        // Salvar o buffer como um arquivo
        fs.writeFile(filePath, buffer, (err: any) => {
            if(err){
                console.error('Erro ao salvar o arquivo:', err);
            }
            console.error(this.url+'uploads/'+fileName);
        });
        return this.url+'uploads/'+fileName;
    }
    generateFileName(){
        let fileName = String(Date.now());
        fileName+='.jpg';
        return fileName;
    }
}

export=StorageClass