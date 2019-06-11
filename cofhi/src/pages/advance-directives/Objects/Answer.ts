export abstract class Answer {
    static currentId: number = 0;
    private _name: string;
    constructor(protected _label: string) {
        this._name = (Answer.currentId++).toString();
    }
    
    get label(): string{
        return this._label;
    }    
    
    get name(): string{
        return this._name;
    }
}