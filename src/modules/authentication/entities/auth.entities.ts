
export interface ILoginResponse {
    access_token : string, refresh_token:string
}

export interface ISignupWithGoogle {
    status:number
    data:ILoginResponse
}