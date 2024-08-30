"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const client_1 = require("@prisma/client");
class PrismaReg {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    findFirst(customerCode, measureDatetime, measureType) {
        return __awaiter(this, void 0, void 0, function* () {
            const verify = yield this.prisma.register.findFirst({
                where: {
                    customerCode: customerCode,
                    measureDatetime: measureDatetime,
                    measureType: measureType
                }
            });
            return verify;
        });
    }
    create(image, customerCode, measureDatetime, measureType, MeterValue) {
        return __awaiter(this, void 0, void 0, function* () {
            const reg = yield this.prisma.register.create({
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
        });
    }
    findFirstPatch(measure_uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const verify = yield this.prisma.register.findFirst({
                where: {
                    id: measure_uuid,
                }
            });
            return verify;
        });
    }
    update(measure_uuid, MeterValue, confirmed) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateData = yield this.prisma.register.update({
                where: {
                    id: measure_uuid
                },
                data: {
                    MeterValue: MeterValue,
                    confirmed: confirmed
                }
            });
            return updateData;
        });
    }
    getMany(customerCode, measureType) {
        return __awaiter(this, void 0, void 0, function* () {
            let find = null;
            if (measureType != null) {
                find = {
                    customerCode: customerCode,
                    measureType: measureType
                };
            }
            else {
                find = {
                    customerCode: customerCode
                };
            }
            const lista = yield this.prisma.register.findMany({
                where: find
            });
            return lista;
        });
    }
}
module.exports = PrismaReg;
