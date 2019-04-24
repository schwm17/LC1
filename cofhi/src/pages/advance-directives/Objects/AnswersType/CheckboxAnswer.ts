import { Answer } from './../Answer';
export class CheckboxAnswer extends Answer {
    constructor(protected _label: string) {
        super(_label);

    }
    getLabel(): string {
        return this.label;
    }
}