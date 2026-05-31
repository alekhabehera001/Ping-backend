"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoriesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const memory_schema_1 = require("../../schemas/memory.schema");
const user_schema_1 = require("../../schemas/user.schema");
const s3_module_1 = require("../../services/s3.module");
const memories_controller_1 = require("./memories.controller");
const memories_service_1 = require("./memories.service");
let MemoriesModule = class MemoriesModule {
};
exports.MemoriesModule = MemoriesModule;
exports.MemoriesModule = MemoriesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: memory_schema_1.Memory.name, schema: memory_schema_1.MemorySchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            s3_module_1.S3Module,
        ],
        controllers: [memories_controller_1.MemoriesController],
        providers: [memories_service_1.MemoriesService],
        exports: [memories_service_1.MemoriesService],
    })
], MemoriesModule);
//# sourceMappingURL=memories.module.js.map