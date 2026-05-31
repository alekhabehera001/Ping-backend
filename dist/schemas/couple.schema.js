"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoupleSchema = exports.Couple = exports.CoupleStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = __importStar(require("mongoose"));
var CoupleStatus;
(function (CoupleStatus) {
    CoupleStatus["PENDING"] = "pending";
    CoupleStatus["ACTIVE"] = "active";
    CoupleStatus["UNLINKED"] = "unlinked";
})(CoupleStatus || (exports.CoupleStatus = CoupleStatus = {}));
let Couple = class Couple extends mongoose_2.Document {
};
exports.Couple = Couple;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Couple.prototype, "user1", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Couple.prototype, "user2", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, uppercase: true, maxlength: 10 }),
    __metadata("design:type", String)
], Couple.prototype, "inviteCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: CoupleStatus, default: CoupleStatus.PENDING }),
    __metadata("design:type", String)
], Couple.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Couple.prototype, "anniversary", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Couple.prototype, "unlinkedAt", void 0);
exports.Couple = Couple = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Couple);
exports.CoupleSchema = mongoose_1.SchemaFactory.createForClass(Couple);
exports.CoupleSchema.index({ inviteCode: 1 }, { unique: true });
exports.CoupleSchema.index({ user1: 1 });
exports.CoupleSchema.index({ user2: 1 });
exports.CoupleSchema.index({ status: 1 });
//# sourceMappingURL=couple.schema.js.map