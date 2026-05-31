"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouplesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const couple_schema_1 = require("../../schemas/couple.schema");
const user_schema_1 = require("../../schemas/user.schema");
const couples_controller_1 = require("./couples.controller");
const couples_service_1 = require("./couples.service");
let CouplesModule = class CouplesModule {
};
exports.CouplesModule = CouplesModule;
exports.CouplesModule = CouplesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: couple_schema_1.Couple.name, schema: couple_schema_1.CoupleSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
        ],
        controllers: [couples_controller_1.CouplesController],
        providers: [couples_service_1.CouplesService],
        exports: [couples_service_1.CouplesService],
    })
], CouplesModule);
//# sourceMappingURL=couples.module.js.map