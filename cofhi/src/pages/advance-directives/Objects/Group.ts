import { Question } from "./Question";

export class Group {
    constructor(private _groupTitle: string, private _groupDescription: string, private _questions: Array<Question>) {
    }
    get groupTitle(): string {
        return this._groupTitle;
    }
    get groupDescription(): string {
        return this._groupDescription;
    }
    get questions(): Array<Question> {
        return this._questions;
    }
}