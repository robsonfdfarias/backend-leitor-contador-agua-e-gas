class StorageClass{
    fs: any;
    url: string;
    bodyParse: any;
    dirname: any;
    buffer: any;
    constructor(f:any, b:any, d:any, bu:any, url: string){
        this.fs = f;
        this.bodyParse = f;
        this.dirname = d;
        this.buffer = bu;
        this.url = url;
    }

    convertToImage(base64: string, path: any){
        // Remover o prefixo da string Base64, se presente
        const base64Data = base64.replace(/^data:image\/png;base64,/, '');
        // Converter Base64 em buffer
        const buffer = this.buffer.from(base64Data, 'base64');
        return this.saveImagetoServer(buffer, path);
    }
    saveImagetoServer(buffer:any, path: any){
        // Caminho onde a imagem será salva
        const fileName = this.generateFileName();
        const filePath = path.join(this.dirname, 'uploads', fileName);
        // Criar o diretório 'uploads' se não existir
        if(!this.fs.existsSync(path.dirname(filePath))){
            this.fs.mkdirSync(path.dirname(filePath))
        }
        // Salvar o buffer como um arquivo
        this.fs.writeFile(filePath, buffer, (err: any) => {
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