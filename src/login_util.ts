// import '../node_modules/dotenv/config';
import { IgApiClient } from '../node_modules/instagram-private-api/dist';
var fs = require('fs');

// #TODO I am not sure how to deal with this this.credentials, I am very sure there is a cleaner way, to set it in a config file
// #TODO I think my import fo IgApiClient is wrong
export class LoginUtil {

    private cookiePath: string
    private credentials : any
    private cookie : any

    constructor( cookiePath: string ) {

      this.credentials =  {
          // 'IG_USERNAME' : "managersrace",
          // 'IG_PASSWORD' : "VOVN7KEt"
          'IG_USERNAME' : "realflorenzerstling",
          'IG_PASSWORD' : "asdfasdf23"
      };

      this.cookiePath = cookiePath
      this.cookie = ""
    }

    public login() {
      // this.getCookie()
      this.createSession()
    }

    private saveCookieToFile() {
        const cookiePath = `${this.cookiePath}/${this.credentials.IG_USERNAME}_cookie.json`
        const jsonCookie = JSON.stringify(this.cookie)
        fs.writeFile(cookiePath, jsonCookie, function (err :any , data : any){
          console.log(err);
        });
    }

    public getCookie( ) {
      const cookiePath = `${this.cookiePath}/${this.credentials.IG_USERNAME}_cookie.json`
      var data : any
      fs.readFile(cookiePath, function(err :any , data : any){
          if (!err) {
              // console.log('received data: ' + data);
          } else {
              console.log(err);
          }
      });
      print(data)
      this.cookie = data
    }

    private checkIfCookieExists(){
      const cookiePath = `${this.cookiePath}/${this.credentials.IG_USERNAME}_cookie.json`
      try {
        if (fs.existsSync(cookiePath)) {
          return true
          //file exists
        }
      } catch(err) {
          console.error(err)
          return false
      }
    }

    public createSession( ) {
      (async () => {
        const ig = new IgApiClient();
        ig.state.generateDevice(this.credentials.IG_USERNAME);
        // ig.state.proxyUrl = this.credentials.IG_PROXY;
        // This function executes after every request
        ig.request.end$.subscribe(async () => {
        var state = {
            deviceString: ig.state.deviceString,
            deviceId: ig.state.deviceId,
              uuid: ig.state.uuid,
              phoneId: ig.state.phoneId,
              adid: ig.state.adid,
              build: ig.state.build,
            };


          if (!this.checkIfCookieExists()) {
            this.cookie = await ig.state.serializeCookieJar();
            this.saveCookieToFile()
          } else {
            this.getCookie()
            console.log(this.cookie)
            await ig.state.deserializeCookieJar(this.cookie);
            ig.state.deviceString = state.deviceString;
            ig.state.deviceId = state.deviceId;
            ig.state.uuid = state.uuid;
            ig.state.phoneId = state.phoneId;
            ig.state.adid = state.adid;
            ig.state.build = state.build;
          }
          // Here you have JSON object with cookies.
          // You could stringify it and save to any persistent storage
        });
        // This call will provoke request.$end stream
        await ig.account.login(this.credentials.IG_USERNAME, this.credentials.IG_PASSWORD);
      })();
    }


    public deleteCookie( ) {
    }

}
