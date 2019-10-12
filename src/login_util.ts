export class LoginUtil {

    constructor( private dbService: DBService ) {}

    public setCookiePath( cookiePath ) {
        if ( cookiePath ) {
            this.cookiePath = cookiePath;
        }
    }
    
    public createCookie( ) {
    }

    public getCookie( ) {
    }

    public deleteCookie( ) {

}
