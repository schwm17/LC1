export class PulseValidator {
    static isValid(value): any {
        if (isNaN(value) || value === '') {
            return {
                "isNotANumber": true
            };
        }
        if (value % 1 !== 0) {
            return {
                "isAWholeNumber": true
            };
        }
        if (value < 40 && value !== '') {
            return {
                "isInferiorTo40": true
            };
        }
        if (value > 220 && value !== '') {
            return {
                "isSuperiorTo220": true
            };
        }
        return null;
    }
}