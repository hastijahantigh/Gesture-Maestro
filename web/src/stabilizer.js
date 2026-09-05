export class SignalStabilizer {
    constructor(alpha,deadband=0) {
        this._alpha= alpha
        this._prevVal=null
        this._deadband=deadband
        this._outputVal=null
    }

    update(rawVal) {
        if (this._prevVal===null) {
            this._prevVal=rawVal
            this._outputVal=rawVal
            return this._outputVal
        }
        
            const newVal=(this._alpha*rawVal)+ ((1-this._alpha)*this._prevVal)
            this._prevVal=newVal

            const dif=Math.abs(this._prevVal-this._outputVal)
            if(dif>=this._deadband) {
                this._outputVal=this._prevVal
               
            }
             return this._outputVal 
            
        
    }
    reset(){
        this._prevVal=null
        this._outputVal=null
    }
}
