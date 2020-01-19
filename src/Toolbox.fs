module Toolbox

open Fable.Core
open Fable.Core.JsInterop
open Fable.Core.DynamicExtensions
open Browser.Types
open Blockly
open JupyterlabServices.__kernel_messages.KernelMessage


//TODO: ask fable about using jsOptions to define functions
//trying to define block without explicitly calling constructor as above...
// Attempt 1: use jsOptions
// the below won't compile: The address of a value returned from the expression cannot be used at this point. This is to ensure the address of the local value does not escape its scope.F# Compiler(3228)
// blockly?Blocks.["import"] <- jsOptions<Blockly.Block>(fun o -> o.init <- fun _ -> ()  ) 
// NOTE: it doesn't matter if we define an outside function and pass it in to jsOptions; jsOptions does not like function definitions like this.
// lOOKS LIKE YOU CAN ONLY USE JSOPTIONS FOR SETTING CLASS MEMBERS, NOT FOR CALLING FUNCTIONS AND MAYBE NOT FOR DEFINING THEM
//blockly?Blocks.["import"] <- jsOptions<Blockly.Block>(fun o -> o.setTooltip !^"Import a python package to access functions in that package" )  //THIS COMPLIES BUT THROWS RUNTIME ERROR "TypeError: o.setTooltip is not a function"


//scraps from attempting to use jsOptions  
  // o.init <- fun _ -> 
      // this.appendDummyInput()
      //   .appendField( !^"import"  )
      //   .appendField( !^(blockly.FieldTextInput__Class.Create("some library") :?> Blockly.Field), "libraryName"  )
      //   .appendField( !^"as") 
      //   .appendField( !^(blockly.FieldTextInput__Class.Create("variable name") :?> Blockly.Field), "libraryAlias"  ) |> ignore
      // this.setNextStatement true
      // this.setColour !^230.0
      // this.setTooltip !^"Import a python package to access functions in that package"
      // this.setHelpUrl !^"https://docs.python.org/3/reference/import.html"
  //)


/// Emit "this" typed to Block as an interop workaround
[<Emit("this")>]
let thisBlock : Blockly.Block = jsNative

/// Emit "this" untyped as an interop workaround
[<Emit("this")>]
let thisObj : obj = jsNative


/// Create a Blockly/Python import block
blockly?Blocks.["import"] <- createObj [
  "init" ==> fun () -> 
    // Browser.Dom.console.log("did import block init")
    thisBlock.appendDummyInput()
      .appendField( !^"import"  )
      .appendField( !^(blockly.FieldTextInput.Create("some library") :?> Blockly.Field), "libraryName"  )
      .appendField( !^"as")
      .appendField( !^(blockly.FieldVariable.Create("variable name") :?> Blockly.Field), "libraryAlias"  ) |> ignore
    thisBlock.setNextStatement true
    thisBlock.setColour !^230.0
    thisBlock.setTooltip !^"Import a python package to access functions in that package"
    thisBlock.setHelpUrl !^"https://docs.python.org/3/reference/import.html"
  ]
/// Generate Python import code
blockly?Python.["import"] <- fun (block : Blockly.Block) -> 
  let libraryName = block.getFieldValue("libraryName").Value |> string
  let libraryAlias = blockly?Python?variableDB_?getName( block.getFieldValue("libraryAlias").Value |> string, blockly?Variables?NAME_TYPE);
  let code =  "import " + libraryName + " as " + libraryAlias + "\n"
  code

/// A template for block creation, including the code generator.
let makeSingleArgFunctionBlock blockName (label:string) (outputType:string) (tooltip:string) (helpurl:string) (functionStr:string) =
  blockly?Blocks.[blockName] <- createObj [
    "init" ==> fun () -> 
      Browser.Dom.console.log( blockName + " init")
      thisBlock.appendValueInput("x")
        .setCheck(!^None)
        .appendField(!^label) |> ignore
      thisBlock.setInputsInline(true)
      thisBlock.setOutput(true, !^outputType)
      thisBlock.setColour(!^230.0)
      thisBlock.setTooltip !^tooltip
      thisBlock.setHelpUrl !^helpurl
    ]
  /// Generate Python template conversion code
  blockly?Python.[blockName] <- fun (block : Blockly.Block) -> 
    let x = blockly?Python?valueToCode( block, "x", blockly?Python?ORDER_ATOMIC )
    let code =  functionStr + "(" + x + ")"
    [| code; blockly?Python?ORDER_FUNCTION_CALL |]

// Conversion blocks, e.g. str()
makeSingleArgFunctionBlock 
  "boolConversion"
  "as bool"
  "Boolean"
  "Convert something to Boolean."
  "https://docs.python.org/3/library/stdtypes.html#boolean-values"
  "bool"

makeSingleArgFunctionBlock
  "strConversion"
  "as str"
  "String"
  "Convert something to String."
  "https://docs.python.org/3/library/stdtypes.html#str"
  "str"

makeSingleArgFunctionBlock
  "floatConversion"
  "as float"
  "Float"
  "Convert something to Float."
  "https://docs.python.org/3/library/functions.html#float"
  "float"

makeSingleArgFunctionBlock
  "intConversion"
  "as int"
  "Int"
  "Convert something to Int."
  "https://docs.python.org/3/library/functions.html#int"
  "int"

// Get user input, e.g. input()
makeSingleArgFunctionBlock
  "getInput"
  "input"
  "String"
  "Present the given prompt to the user and wait for their typed input response."
  "https://docs.python.org/3/library/functions.html#input"
  "input"

//TODO: 
// dynamic function calls, dropdown populated by intellisense
// CREATE OPTION FOR BOTH POSITION ONLY (PASS IN LIST OF ARGS) AND KEYWORD ARGUMENTS (PASS IN DICTIONARY)
// generalized incr
// Dictionary
// list append, list range
// dynamic tooltips on function calls populated by intellisense

/// An entry for a single name (var/function/whatever)
type IntellisenseEntry =
  {
    Name : string //from user if parent and completion if child
    Info : string //from inspection
    isFunction : bool //from inspection
  }
// An entry for a complex name, e.g. object, that has associated properties and/or methods
type IntellisenseVariable =
  {
    VariableEntry : IntellisenseEntry
    ChildEntries : IntellisenseEntry[]
  }

/// Dependency injected from JupyterLab. Needed to send intellisense requests to the kernel
let mutable (notebooks : JupyterlabNotebook.Tokens.INotebookTracker ) = null
let GetKernel() =
  if notebooks <> null then
    match notebooks.currentWidget with
    | Some(widget) -> 
      match widget.session.kernel with
      | Some(kernel) -> Some(widget,kernel)
      | None -> None
    | None -> None
  else
    None

/// Get a completion (tab+tab) using the kernel. Typically this will be following a "." but it could also be to match a known identifier against a few initial letters.
let GetKernelCompletion( queryString : string ) =
  match GetKernel() with
  | Some(_, kernel) -> 
    promise {
      let! reply = kernel.requestComplete( !!{| code = queryString; cursor_pos = queryString.Length |} )
      let content: ICompleteReply = unbox reply.content
      return content.matches.ToArray()
    }
  | None -> Promise.reject "no kernel" // () //Promise.lift( [||])

/// Get an inspection (shift+tab) using the kernel. AFAIK this only works after a complete known identifier.
let GetKernalInspection( queryString : string ) =
  match GetKernel() with 
  | Some( widget, kernel ) ->
    promise {
      let! reply = kernel.requestInspect( !!{| code = queryString; cursor_pos = queryString.Length; detail_level = 0 |} )
      //formatting the reply is involved because it has some kind of funky ascii encoding
      let content: IInspectReply = unbox reply.content
      if content.found then
        let mimeType = widget.content.rendermime.preferredMimeType( unbox content.data);
        let renderer = widget.content.rendermime.createRenderer( mimeType.Value )
        let payload : PhosphorCoreutils.ReadonlyJSONObject = !!content.data
        let model= JupyterlabRendermime.Mimemodel.Types.MimeModel.Create( !!{| data = Some(payload)  |} )
        let! _ = renderer.renderModel(model) 
        return renderer.node.innerText
      else
        return "Not defined until you execute code."
    }
  | None -> Promise.reject "no kernel"  //()

/// Store results of resolved promises so that future synchronous calls can access. Keyed on variable name
let intellisenseLookup = new System.Collections.Generic.Dictionary<string,IntellisenseVariable>()
// V2 of the above with 2 stores: one that maps var names to docstrings, and one that maps docstrings to results of promise. Idea is that the docstring/result mapping is fairly static and will not change with var's type or renaming
//(NOTE: V2 MAY NOT BE FLAKEY, MAY HAVE FORGOTTEN TO CALL nltk.data.path.append("/y/nltk_data"))
// let docIntellisenseMap = new System.Collections.Generic.Dictionary<string,IntellisenseVariable>()
// let nameDocMap = new System.Collections.Generic.Dictionary<string,string>()

/// Determine if an entry is a function. We have separate blocks for properties and functions because only function blocks need parameters
let isFunction( info : string ) = info.Contains("Type: function")

/// Get an IntellisenseVariable. If the type does not descend from object, the children will be empty.
/// Sometimes we will create a variable but it will have no type until we make an assignment. 
/// We might also create a variable and then change its type.
/// So we need to check for introspections/completions repeatedly (no caching).
let GetIntellisenseVariable( parentName : string ) =
  // if not <| intellisenseLookup.ContainsKey( name ) then //No caching; see above
  // Update the intellisenseLookup asynchronously. First do an info lookup. If var is not an instance type, continue to doing tooltip lookup
  promise {
    let! parentInspection = GetKernalInspection( parentName )
    let parent = { Name=parentName;  Info=parentInspection; isFunction=isFunction(parentInspection) }
    // V2 store the name/docstring pair. This is always overwritten.
    // if not <| nameDocMap.ContainsKey( parentName ) then nameDocMap.Add(parentName,parentInspection) else nameDocMap.[parentName] <- parentInspection

    // V2 only search for completions if the docstring has not previously been stored
    // if not <| docIntellisenseMap.ContainsKey( parentInspection ) then
      // promise {  //if promise ce absent here, then preceding conditional is not transpiled   
    let! completions = GetKernelCompletion( parentName + "." ) //all completions that follow "name."
    let! inspections = 
      // if not <| parent.isInstance then //No caching; see above
      completions
      |> Array.map( fun completion ->  GetKernalInspection(parentName + "." + completion) ) //all introspections of name.completion
      |> Promise.Parallel
      // else
      //   Promise.lift [||] //No caching; see above
    let children = 
        Array.zip completions inspections 
        |> Array.map( fun (completion,inspection) -> 
          {Name=completion; Info=inspection; isFunction=isFunction(inspection) }
        ) 
    let intellisenseVariable = { VariableEntry=parent; ChildEntries=children}
    // Store so we can synchronously find results later; if we have seen this var before, overwrite.
    if intellisenseLookup.ContainsKey( parentName ) then
      intellisenseLookup.[parentName] <- intellisenseVariable
    else
      intellisenseLookup.Add( parentName, intellisenseVariable)

    // V2 - never overwritten
    // if not <| docIntellisenseMap.ContainsKey( parentInspection ) then
    // docIntellisenseMap.Add( parentInspection, intellisenseVariable)
      // } |> Promise.start
  } |> Promise.start

  // Now do the lookups here. We expect to fail on first call because the promise has not resolved. We may also lag "truth" if variable type changes.
  match intellisenseLookup.TryGetValue(parentName) with
  | true, ie -> Some(ie)
  | false,_ -> None
  //FLAKEY CACHING METHOD FOLLOWS (NOTE: MAY NOT BE FLAKEY, MAY HAVE FORGOTTEN TO CALL nltk.data.path.append("/y/nltk_data"))
  // match nameDocMap.TryGetValue(parentName) with
  // | true, doc -> 
  //   match docIntellisenseMap.TryGetValue(doc) with
  //   | true, intellisenseVariable -> Some(intellisenseVariable)
  //   | false, _ -> None
  // | false,_ -> None

//We need to get the var name in order to call the kernel to generate the list. Every time the variable changes, we should update the list
// For now, ignore performance. NOTE can we use an event to retrigger init once the promise completes?
// NOTE: this works but only on the last var created. It does not fire when the var dropdown changes
// let optionsGenerator( block : Blockly.Block ) =
//   // At this stage the VAR field is not associated with the variable name presented to the user, e.g. "x"
//   //We can get a list of variables by accessing the workspace. The last variable created is the last element in the list returned.
//   let lastVar = block.workspace.getAllVariables() |> Seq.last
let optionsGenerator( varName : string ) =
  match  varName |> GetIntellisenseVariable with
  | Some( iv ) when not(iv.VariableEntry.isFunction) && iv.ChildEntries.Length > 0  -> 
      //NOTE: for dropdowns, blockly returns the label, e.g. "VAR", not the value displayed to the user. Making them identical allows us to get the value displayed to user
      iv.ChildEntries |> Array.filter( fun ie -> not(ie.isFunction) ) |> Array.map( fun ie -> [| ie.Name; ie.Name |] )
  | _ ->  [| [| "Not defined until you execute code."; "Not defined until you execute code." |] |]

let requestIntellisenseOptions( varName : string ) =
  match  varName |> GetIntellisenseVariable with
  | Some( iv ) when not(iv.VariableEntry.isFunction) && iv.ChildEntries.Length > 0  -> 
      //NOTE: for dropdowns, blockly returns the label, e.g. "VAR", not the value displayed to the user. Making them identical allows us to get the value displayed to user
      iv.ChildEntries |> Array.filter( fun ie -> not(ie.isFunction) ) |> Array.map( fun ie -> [| ie.Name; ie.Name |] )
  | _ ->  [| [| "Not defined until you execute code."; "Not defined until you execute code." |] |]

blockly?Blocks.["varGetProperty"] <- createObj [
    "init" ==> fun () -> 

      //If we need to pass "this" into a closure, we rename to work around shadowing
      let thisBlockClosure = thisBlock

      Browser.Dom.console.log( "varGetProperty" + " init")

      /// Get the user-facing label of the currently selected variable (None) or specific option (Some)
      let varSelectionUserName( selectedOption : string option) =
        let fieldVariable = thisBlockClosure.getField("VAR") :?> Blockly.FieldVariable
        let selectionUserName =
          match selectedOption with 
          | Some( option ) -> fieldVariable.getOptions() |> Seq.find( fun o -> o.[1] = option ) |> Seq.head
          | None -> fieldVariable.getText()
        selectionUserName

      thisBlock.appendDummyInput("INPUT")
        .appendField(!^"from") 

        //Use the validator called on variable selection to change the options property dropdown so that we get correct options when variable changes
        .appendField( !^(blockly.FieldVariable.Create("variable name", System.Func<string,obj>( fun newSelection ->
          // Within validator, "this" refers to FieldVariable not block.
          let (thisFieldVariable : Blockly.FieldVariable) = !!thisObj
          
          // update the options FieldDropdown by recreating it with the newly selected variable name
          let input = thisBlockClosure.getInput("INPUT")
          input.removeField("PROPERTY")
          input.appendField( !^(blockly.FieldDropdown.Create( newSelection |> Some |> varSelectionUserName |> optionsGenerator ) :> Blockly.Field), "PROPERTY"  ) |> ignore 

          //Since we are leveraging the validator, we return the selected value without modification
          newSelection |> unbox)
         ) :?> Blockly.Field), "VAR"  )

        .appendField( !^"get") 
        // .appendField( !^(blockly.FieldDropdown.Create( [| [| "Not defined until you execute code."; "UNDEFINED" |] |] ) :> Blockly.Field ), "PROPERTY" ) |> ignore
        // Create the options FieldDropdown using "optionsGenerator" with the selected name, currently None
        .appendField( !^(blockly.FieldDropdown.Create( None |> varSelectionUserName |> optionsGenerator ) :> Blockly.Field), "PROPERTY"  ) |> ignore 
      
      thisBlock.setOutput(true)
      thisBlock.setColour !^230.0
      thisBlock.setTooltip !^"TODO"
      thisBlock.setHelpUrl !^""

    //Listen for intellisense ready events
    "onchange" ==> fun (e:Blockly.Events.Change) ->
      if thisBlock.workspace <> null && not <| thisBlock.isInFlyout && e.``type`` = Blockly.events?BLOCK_CHANGE then //TODO fix event types

        ()
    ]



/// Generate Python bool conversion code
blockly?Python.["varGetProperty"] <- fun (block : Blockly.Block) -> 
  let varName = blockly?Python?variableDB_?getName( block.getFieldValue("VAR").Value |> string, blockly?Variables?NAME_TYPE);
  let propertyName = block.getFieldValue("PROPERTY").Value |> string
  // let x = blockly?Python?valueToCode( block, "VAR", blockly?Python?ORDER_ATOMIC )
  let code =  varName + "." + propertyName
  [| code; blockly?Python?ORDER_FUNCTION_CALL |]

// Override the dynamic 'Variables' toolbox category initialized in blockly_compressed.js
// The basic idea here is that as we add vars, we extend the list of vars in the dropdowns in this category
blockly?Variables?flyoutCategoryBlocks <- fun (workspace : Blockly.Workspace) ->
  let variableModelList = workspace.getVariablesOfType("")
  let xmlList = ResizeArray<Element>()
  //Only create variable blocks if a variable has been defined
  if 0 < variableModelList.Count then
    let lastVarFieldXml = variableModelList.[variableModelList.Count - 1]
    if blockly?Blocks?variables_set then
      //variable set block
      let xml = Blockly.Utils.xml.createElement("block") 
      xml.setAttribute("type", "variables_set")
      xml.setAttribute("gap", if blockly?Blocks?math_change then "8" else "24")
      xml.appendChild( Blockly.variables.generateVariableFieldDom(lastVarFieldXml)) |> ignore
      xmlList.Add(xml)
    //variable incr block : TODO REPLACE WITH GENERALIZED INCR
    if blockly?Blocks?math_change then
      let xml = Blockly.Utils.xml.createElement("block") 
      xml.setAttribute("type", "math_change")
      xml.setAttribute("gap", if blockly?Blocks?math_change then "20" else "8")
      xml.appendChild( Blockly.variables.generateVariableFieldDom(lastVarFieldXml)) |> ignore
      let shadowBlockDom = Blockly.xml.textToDom("<value name='DELTA'><shadow type='math_number'><field name='NUM'>1</field></shadow></value>")
      xml.appendChild(shadowBlockDom) |> ignore
      xmlList.Add(xml)
    //variable property block - TODO
    if blockly?Blocks?varGetProperty then
      let xml = Blockly.Utils.xml.createElement("block") 
      xml.setAttribute("type", "varGetProperty")
      xml.setAttribute("gap", if blockly?Blocks?varGetProperty then "20" else "8")
      xml.appendChild( Blockly.variables.generateVariableFieldDom(lastVarFieldXml)) |> ignore
      xmlList.Add(xml)
    //variable get block, one per variable: TODO - WHY DO WE NEED ONE PER VAR? LESS CLUTTER TO HAVE ONE WITH DROPDOWN
    if blockly?Blocks?variables_get then
      //for some reason the original "directly translated" code is passing the workspace into sort instead of the variables
      // variableModelList?sort( Blockly.variableModel.compareByName ) 
      let sortedVars = variableModelList |> Seq.sortBy( fun v -> v.name)
      for variable in sortedVars do
        let xml = Blockly.Utils.xml.createElement("block") 
        xml.setAttribute("type", "variables_get")
        xml.setAttribute("gap", "8")
        xml.appendChild( Blockly.variables.generateVariableFieldDom(variable)) |> ignore
        xmlList.Add(xml)
  xmlList


/// A static toolbox copied from one of Google's online demos at https://blockly-demo.appspot.com/static/demos/index.html
/// Curiously category names like "%{BKY_CATLOGIC}" not resolved by Blockly, even though the colors are, so names 
/// are replaced with English strings below
let toolbox =
    """<xml xmlns="https://developers.google.com/blockly/xml" id="toolbox" style="display: none">
    <category name="IMPORT" colour="255">
      <block type="import"></block>
    </category>
    <category name="LOGIC" colour="%{BKY_LOGIC_HUE}">
      <block type="controls_if"></block>
      <block type="logic_compare"></block>
      <block type="logic_operation"></block>
      <block type="logic_negate"></block>
      <block type="logic_boolean"></block>
      <block type="logic_null"></block>
      <block type="logic_ternary"></block>
    </category>
    <category name="LOOPS" colour="%{BKY_LOOPS_HUE}">
      <block type="controls_repeat_ext">
        <value name="TIMES">
          <shadow type="math_number">
            <field name="NUM">10</field>
          </shadow>
        </value>
      </block>
      <block type="controls_whileUntil"></block>
      <block type="controls_for">
        <value name="FROM">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="TO">
          <shadow type="math_number">
            <field name="NUM">10</field>
          </shadow>
        </value>
        <value name="BY">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
      </block>
      <block type="controls_forEach"></block>
      <block type="controls_flow_statements"></block>
    </category>
    <category name="MATH" colour="%{BKY_MATH_HUE}">
      <block type="math_number">
        <field name="NUM">123</field>
      </block>
      <block type="math_arithmetic">
        <value name="A">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="B">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
      </block>
      <block type="math_single">
        <value name="NUM">
          <shadow type="math_number">
            <field name="NUM">9</field>
          </shadow>
        </value>
      </block>
      <block type="math_trig">
        <value name="NUM">
          <shadow type="math_number">
            <field name="NUM">45</field>
          </shadow>
        </value>
      </block>
      <block type="math_constant"></block>
      <block type="math_number_property">
        <value name="NUMBER_TO_CHECK">
          <shadow type="math_number">
            <field name="NUM">0</field>
          </shadow>
        </value>
      </block>
      <block type="math_round">
        <value name="NUM">
          <shadow type="math_number">
            <field name="NUM">3.1</field>
          </shadow>
        </value>
      </block>
      <block type="math_on_list"></block>
      <block type="math_modulo">
        <value name="DIVIDEND">
          <shadow type="math_number">
            <field name="NUM">64</field>
          </shadow>
        </value>
        <value name="DIVISOR">
          <shadow type="math_number">
            <field name="NUM">10</field>
          </shadow>
        </value>
      </block>
      <block type="math_constrain">
        <value name="VALUE">
          <shadow type="math_number">
            <field name="NUM">50</field>
          </shadow>
        </value>
        <value name="LOW">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="HIGH">
          <shadow type="math_number">
            <field name="NUM">100</field>
          </shadow>
        </value>
      </block>
      <block type="math_random_int">
        <value name="FROM">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="TO">
          <shadow type="math_number">
            <field name="NUM">100</field>
          </shadow>
        </value>
      </block>
      <block type="math_random_float"></block>
      <block type="math_atan2">
        <value name="X">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="Y">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
      </block>
    </category>
    <category name="TEXT" colour="%{BKY_TEXTS_HUE}">
      <block type="text"></block>
      <block type="text_join"></block>
      <block type="text_append">
        <value name="TEXT">
          <shadow type="text"></shadow>
        </value>
      </block>
      <block type="text_length">
        <value name="VALUE">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_isEmpty">
        <value name="VALUE">
          <shadow type="text">
            <field name="TEXT"></field>
          </shadow>
        </value>
      </block>
      <block type="text_indexOf">
        <value name="VALUE">
          <block type="variables_get">
            <field name="VAR">{textVariable}</field>
          </block>
        </value>
        <value name="FIND">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_charAt">
        <value name="VALUE">
          <block type="variables_get">
            <field name="VAR">{textVariable}</field>
          </block>
        </value>
      </block>
      <block type="text_getSubstring">
        <value name="STRING">
          <block type="variables_get">
            <field name="VAR">{textVariable}</field>
          </block>
        </value>
      </block>
      <block type="text_changeCase">
        <value name="TEXT">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_trim">
        <value name="TEXT">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_print">
        <value name="TEXT">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_prompt_ext">
        <value name="TEXT">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="getInput">
        <value name="x">
          <shadow type="text">
            <field name="TEXT">The prompt shown to the user</field>
          </shadow>
        </value>
      </block>
    </category>
    <category name="LISTS" colour="%{BKY_LISTS_HUE}">
      <block type="lists_create_with">
        <mutation items="0"></mutation>
      </block>
      <block type="lists_create_with"></block>
      <block type="lists_repeat">
        <value name="NUM">
          <shadow type="math_number">
            <field name="NUM">5</field>
          </shadow>
        </value>
      </block>
      <block type="lists_length"></block>
      <block type="lists_isEmpty"></block>
      <block type="lists_indexOf">
        <value name="VALUE">
          <block type="variables_get">
            <field name="VAR">{listVariable}</field>
          </block>
        </value>
      </block>
      <block type="lists_getIndex">
        <value name="VALUE">
          <block type="variables_get">
            <field name="VAR">{listVariable}</field>
          </block>
        </value>
      </block>
      <block type="lists_setIndex">
        <value name="LIST">
          <block type="variables_get">
            <field name="VAR">{listVariable}</field>
          </block>
        </value>
      </block>
      <block type="lists_getSublist">
        <value name="LIST">
          <block type="variables_get">
            <field name="VAR">{listVariable}</field>
          </block>
        </value>
      </block>
      <block type="lists_split">
        <value name="DELIM">
          <shadow type="text">
            <field name="TEXT">,</field>
          </shadow>
        </value>
      </block>
      <block type="lists_sort"></block>
    </category>
    <category name="COLOUR" colour="%{BKY_COLOUR_HUE}">
      <block type="colour_picker"></block>
      <block type="colour_random"></block>
      <block type="colour_rgb">
        <value name="RED">
          <shadow type="math_number">
            <field name="NUM">100</field>
          </shadow>
        </value>
        <value name="GREEN">
          <shadow type="math_number">
            <field name="NUM">50</field>
          </shadow>
        </value>
        <value name="BLUE">
          <shadow type="math_number">
            <field name="NUM">0</field>
          </shadow>
        </value>
      </block>
      <block type="colour_blend">
        <value name="COLOUR1">
          <shadow type="colour_picker">
            <field name="COLOUR">#ff0000</field>
          </shadow>
        </value>
        <value name="COLOUR2">
          <shadow type="colour_picker">
            <field name="COLOUR">#3333ff</field>
          </shadow>
        </value>
        <value name="RATIO">
          <shadow type="math_number">
            <field name="NUM">0.5</field>
          </shadow>
        </value>
      </block>Conversion
    </category>
    <category name="CONVERSION" colour="120">
      <block type="boolConversion">
      </block>
      <block type="intConversion">
      </block>
      <block type="floatConversion">
      </block>
      <block type="strConversion">
      </block>
    </category>
    <sep></sep>
    <category name="VARIABLES" colour="%{BKY_VARIABLES_HUE}" custom="VARIABLE"></category>
    <category name="FUNCTIONS" colour="%{BKY_PROCEDURES_HUE}" custom="PROCEDURE"></category>
  </xml>"""


  // <!-- From BlockPY 
  //           </category>
  //       <category name="Dictionaries" colour="${BlockMirrorTextToBlocks.COLOR.DICTIONARY}">
  //           <block type="ast_Dict">
  //               <mutation items="3"></mutation>
  //               <value name="ADD0"><block type="ast_DictItem" deletable="false" movable="false">
  //                 <value name="KEY">
  //                   <shadow type="text">
  //                     <field name="TEXT">key1</field>
  //                   </shadow>
  //                 </value>
  //               </block></value>
  //               <value name="ADD1"><block type="ast_DictItem" deletable="false" movable="false">
  //                 <value name="KEY">
  //                   <shadow type="text">
  //                     <field name="TEXT">key2</field>
  //                   </shadow>
  //                 </value>
  //               </block></value>
  //               <value name="ADD2"><block type="ast_DictItem" deletable="false" movable="false">
  //                   <!-- <value name="KEY"><block type="ast_Str"><field name="TEXT">3rd key</field></block></value> -->
  //                 <value name="KEY">
  //                   <shadow type="text">
  //                     <field name="TEXT">key3</field>
  //                   </shadow>
  //                 </value>
  //               </block></value>
  //           </block>
  //           <block type="ast_Subscript">
  //               <mutation><arg name="I"></arg></mutation>
  //               <value name="INDEX0"><block type="ast_Str"><field name="TEXT">key</field></block></value>
  //           </block>
  //       </category>
  //    End from BlockPY -->


  //          <!-- From BlockPY 
  //     <block xmlns="http://www.w3.org/1999/xhtml" type="ast_Call" line_number="null" inline="true">
  //       <mutation arguments="1" returns="false" parameters="true" method="true" name=".append" message="append" premessage="to list" colour="30" module="">
  //         <arg name="UNKNOWN_ARG:0"></arg>
  //       </mutation>
  //     </block>
  //     <block xmlns="http://www.w3.org/1999/xhtml" type="ast_Call" line_number="null" inline="true">
  //       <mutation arguments="1" returns="true" parameters="true" method="false" name="range" message="range" premessage="" colour="15" module="">
  //         <arg name="UNKNOWN_ARG:0"></arg>
  //       </mutation>
  //       <value name="NUM">
  //         <shadow type="math_number">
  //           <field name="NUM">0</field>
  //         </shadow>
  //       </value>
  //       </block>
  //     End from BlockPY -->