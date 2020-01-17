module App

// open FSharp.Core
open Fable.Core
// open Fable.Core.JS
open Fable.Core.JsInterop
// open Fable.Promise
open Browser.Types
open Browser.Dom
open Blockly
open JupyterlabServices.__kernel_messages.KernelMessage

//tricky here: if we try to make collection of requires, F# complains they are different types unless we specify obj type
let mutable requires : obj array = [| JupyterlabApputils.ICommandPalette; JupyterlabNotebook.Tokens.Types.INotebookTracker |]

//https://stackoverflow.com/questions/47640263/how-to-extend-a-js-class-in-fable
[<Import("Widget", from="@phosphor/widgets")>]
[<AbstractClass>]
type Widget() =
  class
    // only implementing the minimal members needed
    member val node : HTMLElement = null with get, set
    /// Guess only fires once after attach to DOM. onAfterShow is called after every display (e.g., switching tabs)
    abstract onAfterAttach : unit -> unit
  end

/// Might not be strictly necessary to wrap blockly in a widget
type BlocklyWidget(notebooks:JupyterlabNotebook.Tokens.INotebookTracker) as this =
  class
    inherit Widget()
    let generator = Blockly.python //Blockly.javascript
    do
        //inject intellisense dependency into Blockly toolbox
        Toolbox.notebooks <- notebooks
        
        //div to hold blockly
        let div = document.createElement("div")
        div.setAttribute("style", "height: 480px; width: 600px;")
        div.id <- "blocklyDiv" //for debug and to refer to during injection
        this.node.appendChild(div) |> ignore

        //button to trigger code generation
        let blocksToCodeButton = document.createElement("button")
        blocksToCodeButton.innerText <- "Blocks to Code"
        blocksToCodeButton.addEventListener("click", fun _ ->
          this.RenderCode()
        )
        this.node.appendChild(blocksToCodeButton) |> ignore

        //UI to test introspection/code completion
        let displayArea = document.createElement("p")
        let button = document.createElement("button")
        button.innerText <- "Test"
        button.addEventListener("click", fun _ ->
          this.GetCompletion "test" displayArea 
          this.GetTooltip "input" displayArea
          ()
        )
        this.node.appendChild(button) |> ignore
        this.node.appendChild(displayArea) |> ignore

    
    /// Wait until widget shown to prevent injection from taking place before the DOM is ready
    /// Inject blockly into div and save blockly workspace to private member 
    override this.onAfterAttach() = 
      // console.log("after show happened")
      this.workspace <-
        blockly.inject(
            !^"blocklyDiv",
            // Tricky: creatObj cannot be used here. Must use jsOptions to create POJO
            jsOptions<Blockly.BlocklyOptions>(fun o ->
                o.toolbox <- !^Toolbox.toolbox |> Some
            )
            // THIS FAILS!
            // ~~ [
            //     "toolbox" ==> ~~ [ "toolbox" ==> toolbox2 ] //TODO: using toolbox2 same as using empty string here
            // ] :?> Object
        ) 
      console.log("blockly palette initialized")
    member this.Notebooks = notebooks
    member this.RenderCode() =        
      let code = generator.workspaceToCode( this.workspace )
      if notebooks.activeCell <> null then
        notebooks.activeCell.model.value.text <- notebooks.activeCell.model.value.text  + code //append seems better than overwrite...
        console.log("wrote to active cell:" + code)
      else
        console.log("no cell active, flushed:" + code)
    member val workspace : Blockly.Workspace = null with get, set
    member this.GetCompletion( queryString : string ) (displayArea: HTMLElement) =
      match this.Notebooks.currentWidget with
      | Some(widget) -> 
        match widget.session.kernel with
        | Some(kernel) -> 
          promise {
            let! reply = kernel.requestComplete( !!{| code = queryString; cursor_pos = queryString.Length |} )
            let content: ICompleteReply = unbox reply.content
            displayArea.innerText <- content.matches |> String.concat ","
          }
          |> Promise.start
        | None -> ()
      | None -> ()
    member this.GetTooltip( queryString : string ) (displayArea: HTMLElement) =
      match this.Notebooks.currentWidget with
      | Some(widget) -> 
        match widget.session.kernel with
        | Some(kernel) -> 
          promise {
            let! reply = kernel.requestInspect( !!{| code = queryString; cursor_pos = queryString.Length; detail_level = 0 |} )
            //formatting the reply is involved because it has some kind of funky ascii encoding
            let content: IInspectReply = unbox reply.content
            let mimeType = widget.content.rendermime.preferredMimeType( unbox content.data);
            let renderer = widget.content.rendermime.createRenderer( mimeType.Value )
            let payload : PhosphorCoreutils.ReadonlyJSONObject = !!content.data
            let model= JupyterlabRendermime.Mimemodel.Types.MimeModel.Create( !!{| data = Some(payload)  |} )
            let! _ = renderer.renderModel(model) //better way to await a unit promise?
            displayArea.innerText <- displayArea.innerText + renderer.node.innerText
          }
          |> Promise.start
        | None -> ()
      | None -> ()
  end

let extension =
    createObj [
        "id" ==> "jupyterlab_blockly_extension"
        "autoStart" ==> true
        "requires" ==> requires // 
        //------------------------------------------------------------------------------------------------------------
        //NOTE: this **must** be wrapped in a Func, otherwise the arguments are tupled and Jupyter doesn't expect that
        //------------------------------------------------------------------------------------------------------------
        "activate" ==>  System.Func<JupyterlabApplication.JupyterFrontEnd<JupyterlabApplication.LabShell>,JupyterlabApputils.ICommandPalette,JupyterlabNotebook.Tokens.INotebookTracker,unit>( fun app palette notebooks ->
            console.log("JupyterLab extension jupyterlab_blockly_extension is activated!");
      
            //Create a blockly widget and place inside main area widget
            let blocklyWidget = BlocklyWidget(notebooks)
            let widget = JupyterlabApputils.Types.MainAreaWidget.Create( createObj [ "content" ==> blocklyWidget ]) 
            widget.id <- "blockly-jupyterlab";
            widget.title.label <- "Blockly Palette";
            widget.title.closable <- true

            // Add application command
            let command = "blockly:open"
            app.commands.addCommand( command, 
                createObj [
                    "label" ==> "Blockly Jupyterlab Extension"
                    "execute" ==> fun () -> 
                        if not <| widget.isAttached then
                          match notebooks.currentWidget with
                          | Some(c) -> 
                            let options = jsOptions<JupyterlabDocregistry.Registry.DocumentRegistry.IOpenOptions>(fun o -> 
                                o.ref <- c.id |> Some
                                o.mode <- PhosphorWidgets.DockLayout.InsertMode.SplitLeft |> Some )
                            c.context.addSibling( widget, options) |> ignore
                          | None -> app.shell.add(widget, "main")
                        app.shell.activateById(widget.id)
                ] :?> PhosphorCommands.CommandRegistry.ICommandOptions
            ) |> ignore
            //Add command to palette
            palette?addItem(
                createObj[
                    "command" ==> command
                    "category" ==> "Blockly"
                ]
            )
        )
 
    ]

exportDefault extension