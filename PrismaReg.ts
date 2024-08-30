import { PrismaClient } from '@prisma/client';
class PrismaReg {
    prisma: PrismaClient;
    constructor(){
        this.prisma = new PrismaClient();
    }
    async findFirst(customerCode: any, measureDatetime: any, measureType: any){
        const verify = await this.prisma.register.findFirst({
            where: {
              customerCode: customerCode,
              measureDatetime: measureDatetime,
              measureType: measureType
            }
          });
        return verify;
    }

    async create(image: any, customerCode: any, measureDatetime: any, measureType: any, MeterValue: any){
        const reg = await this.prisma.register.create({
            data: {
              image: image,
              customerCode: customerCode,
              measureDatetime: measureDatetime,
              measureType: measureType,
              MeterValue: parseInt(MeterValue),
              confirmed: false
            }
          });
        return reg;
    }
}
export = PrismaReg