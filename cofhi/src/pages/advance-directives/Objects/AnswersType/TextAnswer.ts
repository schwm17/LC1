import { Answer } from './../Answer';
export class TextAnswer extends Answer {
    private _value: string;
    constructor(protected _label: string) {
        super(_label);
    }

    get value(): string{
        return this._value;
    }
    set value(value:string){
        this._value = value;
    }
}