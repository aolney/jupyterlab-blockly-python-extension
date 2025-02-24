import * as crypto from 'crypto';

export interface LogEntry {
    username: string;
    json: string;
  }
  
  export interface BlocklyLogEntry050824 {
    schema: string;
    name: string;
    object: any;
  }
  
  export interface JupyterLogEntry050824 {
    schema: string;
    name: string;
    // payload?: string | null;
    payload: object;
  }

/**
 * Hash a string
 * @param inputString 
 * @returns string
 */
export function createSHA256Hash(inputString: string) : string {
    const hash = crypto.createHash('sha256');
    hash.update(inputString);
    return hash.digest('hex');
}
  
  export function createBlocklyLogEntry(name: string, object: any): BlocklyLogEntry050824 {
    return {
      schema: "ble050824",
      name: name,
      object: object
    };
  }
  
  export function createJupyterLogEntry(name: string, payload: object): JupyterLogEntry050824 {
    return {
      schema: "jle050824",
      name: name,
      payload: payload
    };
  }
  
  let logUrl: string | undefined = undefined;
  export function set_log_url( url: string) {
    logUrl = url;
  }
  let idOption: string | undefined = undefined;
  let hashedIdOption: string | undefined = undefined;
  export function set_id( id: string) {
    idOption = id;
  }
  
  export function filterJson(o: any): string {
    if (o?.object?.element?.toString().indexOf("drag") === 0) {
      o.object.newValue = undefined;
      o.object.oldValue = undefined;
    }
    return o; //JSON.stringify(o);
  }
  
  /**
   * Logs to endpoint if logUrl is set
   * 2025: temporary autologging set for study
   * @param logObject 
   */
  export function LogToServer(logObject: any): void {
    //autologging for olney.ai domains; don't log here ;)
    if( window.location.href.includes("olney.ai") ) {
      //only autolog here if no logUrl specified
      logUrl = logUrl ?? 'https://logging2.olney.ai/datawhys/log';
    }

    //normal logging, only log if logUrl is set
    if(logUrl) {
      let id =  window.location.href;
      // if an id has been manually specified for logging, log it
      if( idOption ) { id = idOption; }
      // otherwise use a cached hash of the default id for anonymity
      else { 
        // use the cache
        if( hashedIdOption ) { id = hashedIdOption; }
        // set the cache
        else {
          hashedIdOption = createSHA256Hash(id);
          id = hashedIdOption;
        }
      }
      window.fetch(logUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username:id,
          //base64 encode the payload because it can have all kinds of craziness inside it
          json:btoa(JSON.stringify(filterJson(logObject)))
          
        })
      }).then(response => {
        if (!response.ok) {
          console.log(response.statusText);
        }
      })
    }
  }