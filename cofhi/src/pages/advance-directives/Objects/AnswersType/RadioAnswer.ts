import { Answer } from './../Answer';
export class RadioAnswer extends Answer {
    _subAnswers: Answer[] = [];
    _subSubAnswers: Answer[]= [];
    constructor(protected _label: string) {
        super(_label);
    }

    get label(): string {
        return this._label;
    }

    get subAnswers(){
        return this._subAnswers;
    }

    get subSubAnswers(){
        return this._subSubAnswers;
    }

    set subAnswers(answer:Answer[]){
        this._subAnswers = answer;
    }
    set subSubAnswers(answer:Answer[]){
        this._subSubAnswers = answer;
    }
}