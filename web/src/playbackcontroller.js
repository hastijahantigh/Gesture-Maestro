export class PBC{
    constructor() {
        this._tmpMult=1.0
        this._expression=90

    }


    reset(){
        this._tmpMult=1.0
        this._expression=0.9
    }

    setTempMult(value) {
        this._tmpMult=Math.max(0.5 , Math.min(2.0,value))
    }
    getTempMult(value){
        return this._tmpMult
    }
    setExp(value) {
        this._expression=Math.max(0,Math.min(127,Math.round(value)))
    }
    getExp(value) {
        return this._expression
    }


}


