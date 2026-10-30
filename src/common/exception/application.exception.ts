export class ApplicationException extends Error{
    constructor(override message:string , public status:number ,override cause?:unknown){
        super()
        // super(message , {cause})
        this.name = this.constructor.name   // to get the actual class that the error occured in it
        Error.captureStackTrace(this , this.constructor)
    }
}
