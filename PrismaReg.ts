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

    async findFirstPatch(measure_uuid: any){
      const verify = await this.prisma.register.findFirst({
          where: {
            id: measure_uuid,
          }
        });
      return verify;
  }

  async update(measure_uuid: string, MeterValue: number, confirmed: boolean){
    const updateData = await this.prisma.register.update({
      where: {
        id: measure_uuid
      },
      data: {
        MeterValue: MeterValue,
        confirmed: confirmed
      }
    });
    return updateData;
  }
}
export = PrismaReg