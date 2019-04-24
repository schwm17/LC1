import { Answer } from './Answer';

export class Question {
    private _answerValue: Answer[] = [];
    private _subAnswerValue: Answer[] = [];
    private _subSubAnswerValue: Answer[] = [];
    constructor(private _label: string, private _type: "text" | "radio" | "checkbox", private _answers: Array<Answer>) {
    }
    get label(): string {
        return this._label;
    }
    get type(): "text" | "radio" | "checkbox" {
        return this._type;
    }
    get answers(): Array<Answer> {
        return this._answers;
    }

    get answerValue(): Answer[] {
        return this._answerValue;
    }
    get subAnswerValue(): Answer[] {
        return this._subAnswerValue;
    }
    get subSubAnswerValue(): Answer[] {
        return this._subSubAnswerValue;
    }
    addAnswerToAnswers(answer: Answer) {
        this._answers.push(answer);
    }
    deleteAnswers(): void {
        this._answerValue = [];
    }
    addAnswerValue(answer: Answer): void {
        this._answerValue[answer.name] = answer;
    }
    deleteAnswerValue(answer: Answer): void {
        var index = this._answerValue.indexOf(answer);
        if (index !== -1) {
            this._answerValue.splice(index, 1);
        }
    }
    addSubAnswerValue(answer: Answer): void {
        this._subAnswerValue[answer.name] = answer;
    }
    deleteSubAnswerValue(answer: Answer): void {
        var index = this._subAnswerValue.indexOf(answer);
        if (index !== -1) {
            this._subAnswerValue.splice(index, 1);
        }
    }
    addSubSubAnswerValue(answer: Answer): void {
        this._subSubAnswerValue[answer.name] = answer;
    }
    deleteSubSubAnswerValue(answer: Answer): void {
        var index = this._subSubAnswerValue.indexOf(answer);
        if (index !== -1) {
            this._subSubAnswerValue.splice(index, 1);
        }
    }

}