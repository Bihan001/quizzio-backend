"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const examController = __importStar(require("../../../controllers/examController"));
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const router = express_1.default.Router();
router.get('/testing-route', examController.testing);
router.get('/tags', examController.getTags);
router.get('/question-types', examController.getQuestionTypes);
router.get('/create-tables', examController.createTables);
router.post('/create', auth_1.default, examController.createExam);
router.get('/evaluate/force', examController.forceEvaluateExam);
router.get('/exam-registered', auth_1.default, examController.examRegisterStatus);
router.get('/solution', auth_1.default, examController.getExamSolution);
router.get('/scores', auth_1.default, examController.getExamScores);
router.patch('/:id', auth_1.default, examController.editExam);
router.post('/all', examController.getExams);
router.get('/:id', examController.getExamDetails);
router.get('/:id/start', auth_1.default, examController.startExam);
router.post('/register', auth_1.default, examController.registerInExam);
router.post('/submit', auth_1.default, examController.submitExam);
exports.default = router;
