export interface LogEntry {
    username: string;
    json: string;
  }
  
  export interface BlocklyLogEntry {
    schema: string;
    name: string;
    object: any;
  }
  
  export interface JupyterLogEntry {
    schema: string;
    name: string;
    payload?: string | null;
  }
  
  export function createBlocklyLogEntry(name: string, object: any): BlocklyLogEntry {
    return {
      schema: "ble082720",
      name: name,
      object: object
    };
  }
  
  export function createJupyterLogEntry(name: string, payload: string | null): JupyterLogEntry {
    return {
      schema: "jle082720",
      name: name,
      payload: payload
    };
  }
  
  export let logUrl: string | undefined = undefined;
  export let idOption: string | undefined = undefined;
  
  export function filterJson<T>(o: any): T {
    if (o?.object?.element?.toString().indexOf("drag") === 0) {
      o.object.newValue = undefined;
      o.object.oldValue = undefined;
    }
    throw 1;
  }
  
  
  export function LogToServer(logObject: any): void {
    
  
  }