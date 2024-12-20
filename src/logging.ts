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
  
  
  export function LogToServer(logObject: any): void {
    if(logUrl) {
      let id =  window.location.href;
      if( idOption ) { id = idOption; }
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