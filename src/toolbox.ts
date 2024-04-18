import * as Blockly from 'blockly/core';
import { pythonGenerator } from 'blockly/python';
import { NotebookPanel, INotebookTracker } from "@jupyterlab/notebook";
import { Kernel, KernelMessage } from "@jupyterlab/services";
import * as rendermime from "@jupyterlab/rendermime";
import { IRenderMime, MimeModel } from "@jupyterlab/rendermime";
import { createMinusField } from "./field_minus.js";
import { createPlusField } from "./field_plus.js";
import { CustomFields as CustomFields_1 } from "./SearchDropdown.js";

export const CustomFields: any = CustomFields_1;

pythonGenerator.finish = ((code: string): string => {
  const imports: string[] = [];
  const functions: string[] = [];
  let enumerator: any = Object.keys(pythonGenerator.definitions_);
  for(let i in enumerator){
    const definitions: any = pythonGenerator.definitions_;
    const def: string = definitions[enumerator[i]];
    if (def.indexOf("import") >= 0) {
      void (imports.push(def));
    }
    if ((def.indexOf("def ") === 0) ? true : (def.indexOf("# ") === 0)) {
      void (functions.push(def));
    }
  }
  delete pythonGenerator.definitions_;
  delete pythonGenerator.functionNames_;
  pythonGenerator.nameDB_.reset();
  return ((("\n" + imports) + ("\n" + functions)) + "\n\n") + code;
});

/**
 * Encode the current Blockly workspace as an XML string
 */
export function encodeWorkspace(): string {
  const xml: Element = Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace());
  return Blockly.Xml.domToText(xml);
}

/**
 * Decode an XML string and load the represented blocks into the Blockly workspace
 */
export function decodeWorkspace(xmlText: string): void {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
  const xmlElement = xmlDoc.documentElement;
  Blockly.Xml.domToWorkspace(xmlElement, Blockly.getMainWorkspace() as Blockly.WorkspaceSvg);
}

Blockly.Blocks["comprehensionForEach_Python"]={
  init: function() {
    console.log("comprehensionForEach_Python init");
    this.appendValueInput("LIST").setCheck(null).appendField("for each item").appendField(new Blockly.FieldVariable("i") as Blockly.Field, "VAR").appendField("in list");
    this.appendValueInput("YIELD").setCheck(null).setAlign(Blockly.inputs.Align.RIGHT).appendField("yield");
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("Use this to generate a sequence of elements, also known as a comprehension. Often used for list comprehensions.");
    this.setHelpUrl("https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions");
    },
};
pythonGenerator["comprehensionForEach_Python"]=((block: Blockly.Block): string[] => {
  const var$: string = pythonGenerator.getVariableName(block.getFieldValue("VAR"))
  const list: string = pythonGenerator.valueToCode(block, "LIST", pythonGenerator.ORDER_ATOMIC);
  return [((((pythonGenerator.valueToCode(block, "YIELD", pythonGenerator.ORDER_ATOMIC)) + " for ") + var$) + " in ") + list, pythonGenerator.ORDER_ATOMIC];
});

Blockly.Blocks["withAs_Python"]={
  init: function() {
    console.log("withAs_Python init");
    this.appendValueInput("EXPRESSION").setCheck(null).appendField("with");
    this.appendDummyInput().appendField("as").appendField(new Blockly.FieldVariable("item") as Blockly.Field, "TARGET");
    this.appendStatementInput("SUITE").setCheck(null);
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    // const value_3: any = this.setInputsInline(true);
    this.setColour(230);
    this.setTooltip("Use this to open resources (usually file-type) in a way that automatically handles errors and disposes of them when done. May not be supported by all libraries.");
    this.setHelpUrl("https://docs.python.org/3/reference/compound_stmts.html#with");
  },
};
pythonGenerator["withAs_Python"]=((block: Blockly.Block): string => {
  let copyOfStruct: any = (pythonGenerator.statementToCode(block, "SUITE"));
  let expression: string = pythonGenerator.valueToCode(block, "EXPRESSION", pythonGenerator.ORDER_ATOMIC);
  let target: string = pythonGenerator.getVariableName(block.getFieldValue("TARGET"));
  let code = ("with " + expression + " as " + target + ":\n" + copyOfStruct.toString());
  return code
});

Blockly.Blocks["textFromFile_Python"]={
  init: function() {
    console.log("textFromFile_Python init");
    this.appendValueInput("FILENAME").setCheck("String").appendField("read text from file");
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("Use this to read a text file. It will output a string.");
    this.setHelpUrl("https://docs.python.org/3/tutorial/inputoutput.html");
  },
};
pythonGenerator["textFromFile_Python"]=((block: Blockly.Block): string[] => [("open(" + (pythonGenerator.valueToCode(block, "FILENAME", pythonGenerator.ORDER_ATOMIC))) + ",encoding=\'utf-8\').read()", pythonGenerator.ORDER_FUNCTION_CALL]);

Blockly.Blocks["openReadFile_Python"]={
  init: function() {
    console.log("openReadFile_Python init");
    this.appendValueInput("FILENAME").setCheck("String").appendField("open file for reading");
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("Use this to read a file. It will output a file, not a string.");
    this.setHelpUrl("https://docs.python.org/3/tutorial/inputoutput.html");
  },
};

pythonGenerator["openReadFile_Python"]=((block: Blockly.Block): string[] => [("open(" + (pythonGenerator.valueToCode(block, "FILENAME", pythonGenerator.ORDER_ATOMIC))) + ",encoding=\'utf-8\')", pythonGenerator.ORDER_FUNCTION_CALL]);

Blockly.Blocks["openWriteFile_Python"]={
  init: function() {
    console.log("openWriteFile_Python init");
    this.appendValueInput("FILENAME").setCheck("String").appendField("open file for writing");
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("Use this to write to a file. It will output a file, not a string.");
    this.setHelpUrl("https://docs.python.org/3/tutorial/inputoutput.html");
  },
};

pythonGenerator["openWriteFile_Python"]=((block: Blockly.Block): string[] => [("open(" + (pythonGenerator.valueToCode(block, "FILENAME", pythonGenerator.ORDER_ATOMIC))) + ",\'w\',encoding=\'utf-8\')", pythonGenerator.ORDER_FUNCTION_CALL]);

/**
 * A template to create arbitrary code blocks (FREESTYLE) in these dimensions: dummy/input; output/nooutput
 */
export function makeCodeBlock_Python(blockName: string, hasInput: boolean, hasOutput: boolean): void {
  Blockly.Blocks[blockName]={
    init: function() {
      const input: Blockly.Input = hasInput ? this.appendValueInput("INPUT").setCheck(null) : this.appendDummyInput();
      console.log(blockName + " init");
      input.appendField(new Blockly.FieldTextInput("type code here...") as Blockly.Field, "CODE");
      if (hasOutput) {
        this.setOutput(true, null);
      }
      else {
        this.setNextStatement(true);
        this.setPreviousStatement(true);
      }
      this.setColour(230);
      this.setTooltip(((("You can put any Python code in this block. Use this block if you " + (hasInput ? "do" : "don\'t")) + " need to connect an input block and ") + (hasOutput ? "do" : "don\'t")) + " need to connect an output block.");
      this.setHelpUrl("https://docs.python.org/3/");
    },
  };
  pythonGenerator[blockName]=((block: Blockly.Block): string[] | string => {
    const userCode: string = block.getFieldValue("CODE").toString();
    let code: string;
    if (hasInput) {
      const input_1: string = pythonGenerator.valueToCode(block, "INPUT", pythonGenerator.ORDER_ATOMIC);
      code = ((userCode + " ") + input_1).trim();
    }
    else {
      code = userCode.trim();
    }
    return hasOutput ? [code, pythonGenerator.ORDER_ATOMIC] : code + "\n";
  });
}

makeCodeBlock_Python("dummyOutputCodeBlock_Python", false, true);
makeCodeBlock_Python("dummyNoOutputCodeBlock_Python", false, false);
makeCodeBlock_Python("valueOutputCodeBlock_Python", true, true);
makeCodeBlock_Python("valueNoOutputCodeBlock_Python", true, false);

/**
 * A template to create arbitrary COMMENT blocks in these dimensions: dummy/input; output/nooutput
 */
export function makeCommentBlock_Python(blockName: string, hasInput: boolean, hasOutput: boolean): void {
  Blockly.Blocks[blockName]={
    init: function() {
      const input: Blockly.Input = hasInput ? this.appendValueInput("INPUT").setCheck(null) : this.appendDummyInput();
      console.log(blockName + " init");
      input.appendField("# ").appendField(new Blockly.FieldTextInput("type comment here...") as Blockly.Field, "COMMENT");
      if (hasOutput) {
        this.setOutput(true, null);
      }
      else {
        this.setNextStatement(true);
        this.setPreviousStatement(true);
      }
      this.setColour(230);
      this.setTooltip(((("You can put any text comment in this block. Use this block if you " + (hasInput ? "do" : "don\'t")) + " need to connect an input block and ") + (hasOutput ? "do" : "don\'t")) + " need to connect an output block.");
      this.setHelpUrl("https://docs.python.org/3/");
    },
  };
  pythonGenerator[blockName]=((block: Blockly.Block): string[] | string => {
    const userCode: string = block.getFieldValue("COMMENT").toString();
    let code: string;
    if (hasInput) {
      const input_1: string = pythonGenerator.valueToCode(block, "INPUT", pythonGenerator.ORDER_ATOMIC);
      code = (("# " + userCode + " ") + input_1).trim();
    }
    else {
      code = "# " + userCode.trim();
    }
    return hasOutput ? [code, pythonGenerator.ORDER_ATOMIC] : (code + "\n");
  });
}

makeCommentBlock_Python("dummyOutputCommentBlock_Python", false, true);
makeCommentBlock_Python("dummyNoOutputCommentBlock_Python", false, false);
makeCommentBlock_Python("valueOutputCommentBlock_Python", true, true);
makeCommentBlock_Python("valueNoOutputCommentBlock_Python", true, false);

/**
 * Create a Blockly/Python templated import block: TODO if we make this part of the variable menu, then users will never need to rename variable after using the block
 */
export function makeImportBlock_Python(blockName: string, labelOne: string, labelTwo: string): void {
  Blockly.Blocks[blockName]={
    init: function() {
      this.appendDummyInput().appendField(labelOne).appendField(new Blockly.FieldTextInput("some library") as Blockly.Field, "libraryName").appendField(labelTwo).appendField(new Blockly.FieldVariable("variable name") as Blockly.Field, "libraryAlias");
      this.setNextStatement(true);
      this.setPreviousStatement(true);
      this.setColour(230);
      this.setTooltip("Import a python package to access functions in that package");
      this.setHelpUrl("https://docs.python.org/3/reference/import.html");
    },
  };
  pythonGenerator[blockName]=((block: Blockly.Block): string => (((((((labelOne + " ") + block.getFieldValue("libraryName")) + " ") + labelTwo) + " ") + (pythonGenerator.getVariableName(block.getFieldValue("libraryAlias")))) + "\n"));
}

makeImportBlock_Python("importAs_Python", "import", "as");
makeImportBlock_Python("importFrom_Python", "from", "import");

Blockly.Blocks["indexer_Python"]={
  init: function() {
    this.appendValueInput("INDEX").appendField(new Blockly.FieldVariable("{dictVariable}") as Blockly.Field, "VAR").appendField("[");
    this.appendDummyInput().appendField("]");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setColour(230);
    this.setTooltip("Gets an item from the variable at a given index. Not supported for all variables.");
    this.setHelpUrl("https://docs.python.org/3/reference/datamodel.html#object.__getitem__");
  },
};

pythonGenerator["indexer_Python"]=((block: Blockly.Block): string[] => [(((pythonGenerator.getVariableName(block.getFieldValue("VAR"))) + "[") + (pythonGenerator.valueToCode(block, "INDEX", pythonGenerator.ORDER_ATOMIC))) + "]", pythonGenerator.ORDER_ATOMIC]);

/**
 * A template for variable argument function block creation (where arguments are in a list), including the code generator.
 */

export function makeFunctionBlock_Python(blockName: string, label: string, outputType: string, tooltip: string, helpurl: string, functionStr: string): void {
  Blockly.Blocks[blockName]={
    init: function() {
      console.log(blockName + " init");
      this.appendValueInput("x").setCheck(null).appendField(label);
      this.setInputsInline(true);
      this.setOutput(true, outputType);
      this.setColour(230);
      this.setTooltip(tooltip);
      this.setHelpUrl(helpurl);
    },
  };
  pythonGenerator[blockName]=((block: Blockly.Block): string[] => [
    ((functionStr + "(") + pythonGenerator.valueToCode(block, "x", pythonGenerator.ORDER_MEMBER).replace("^\\[|\\]$", "")) + ")", pythonGenerator.ORDER_FUNCTION_CALL]);

}
makeFunctionBlock_Python("reversedBlock_Python", "reversed", "None", "Create a reversed iterator to reverse a list or a tuple; wrap it in a new list or tuple.", "https://docs.python.org/3/library/functions.html#reversed", "reversed");
makeFunctionBlock_Python("tupleConstructorBlock_Python", "tuple", "None", "Create a tuple from a list, e.g. [\'a\',\'b\'] becomes (\'a\',\'b\')", "https://docs.python.org/3/library/stdtypes.html#tuple", "tuple");
makeFunctionBlock_Python("dictBlock_Python", "dict", "None", "Create a dictionary from a list of tuples, e.g. [(\'a\',1),(\'b\',2)...]", "https://docs.python.org/3/tutorial/datastructures.html#dictionaries", "dict");
makeFunctionBlock_Python("listBlock_Python", "list", "None", "Create a list from an iterable, e.g. list(zip(...))", "https://docs.python.org/3/library/stdtypes.html#typesseq-list", "list");
makeFunctionBlock_Python("zipBlock_Python", "zip", "Array", "Zip together two or more lists", "https://docs.python.org/3.3/library/functions.html#zip", "zip");
makeFunctionBlock_Python("sortedBlock_Python", "as sorted", "Array", "Sort lists of stuff", "https://docs.python.org/3.3/library/functions.html#sorted", "sorted");
makeFunctionBlock_Python("setBlock_Python", "set", "Array", "Make a set with unique members of a list.", "https://docs.python.org/2/library/sets.html", "set");
makeFunctionBlock_Python("boolConversion_Python", "as bool", "Boolean", "Convert something to Boolean.", "https://docs.python.org/3/library/stdtypes.html#boolean-values", "bool");
makeFunctionBlock_Python("strConversion_Python", "as str", "String", "Convert something to String.", "https://docs.python.org/3/library/stdtypes.html#str", "str");
makeFunctionBlock_Python("floatConversion_Python", "as float", "Number", "Convert something to Float.", "https://docs.python.org/3/library/functions.html#float", "float");
makeFunctionBlock_Python("intConversion_Python", "as int", "Number", "Convert something to Int.", "https://docs.python.org/3/library/functions.html#int", "int");
makeFunctionBlock_Python("getInput_Python", "input", "String", "Present the given prompt to the user and wait for their typed input response.", "https://docs.python.org/3/library/functions.html#input", "input");

Blockly.Blocks["tupleBlock_Python"]={
  init: function() {
    this.appendValueInput("FIRST").setCheck(null).appendField("(");
    this.appendValueInput("SECOND").setCheck(null).appendField(",");
    this.appendDummyInput().appendField(")");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("Use this to create a two-element tuple");
    this.setHelpUrl("https://docs.python.org/3/tutorial/datastructures.html#tuples-and-sequences");
  },
};

pythonGenerator["tupleBlock_Python"]=((block: Blockly.Block): string[] => [((("(" + (pythonGenerator.valueToCode(block, "FIRST", pythonGenerator.ORDER_ATOMIC))) + ",") + (pythonGenerator.valueToCode(block, "SECOND", pythonGenerator.ORDER_ATOMIC))) + ")", pythonGenerator.ORDER_NONE]);

export function createDynamicArgumentMutator(this: any, mutatorName: string, startCount: number, emptyLeadSlotLabel: string, nonEmptyLeadSlotLabel: string, additionalSlotLabel: string): void {
  const mutator: any = {
    itemCount_: 0,
    mutationToDom: function(): any {
      const container: any = Blockly.utils.xml.createElement("mutation");
      container.setAttribute("items", (this).itemCount_);
      return container;
    },
    domToMutation: function(xmlElement: any): any {
      const itemsAttribute: string | null = xmlElement.getAttribute("items");
      const targetCount: number = itemsAttribute ? parseInt(itemsAttribute, 10) : 0;
      return (this).updateShape_(targetCount);
    },
    updateShape_: function(targetCount_1: number): any {
      while ((this).itemCount_ < targetCount_1) {
        (this).addPart_();
      }
      while ((this).itemCount_ > targetCount_1) {
        (this).removePart_();
      }
      return (this).updateMinus_();
    },
    plus: function(): any{
      (this).addPart_();
      return (this).updateMinus_();
    },
    minus: function(): void {
      if ((this).itemCount_ !== 0) {
        (this).removePart_();
        (this).updateMinus_();
      }
    },
    addPart_: function(): void {
      if ((this).itemCount_ === 0) {
        (this).removeInput("EMPTY");
        (this).topInput_ = (this).appendValueInput("ADD" + (this).itemCount_).appendField(createPlusField(), "PLUS").appendField(nonEmptyLeadSlotLabel).setAlign(Blockly.inputs.Align.RIGHT);
      }
      else {
        (this).appendValueInput("ADD" + (this).itemCount_).appendField(additionalSlotLabel).setAlign(Blockly.inputs.Align.RIGHT);
      }
      (this).itemCount_ = ((this).itemCount_ + 1);
    },
    removePart_: function(): void {
      (this).itemCount_ = ((this).itemCount_ - 1);
      (this).removeInput("ADD" + (this).itemCount_);
      if ((this).itemCount_ === 0) {
        (this).topInput_ = (this).appendDummyInput("EMPTY").appendField(createPlusField(), "PLUS").appendField(emptyLeadSlotLabel);
      }
    },
    updateMinus_: function(): void {
      const minusField: Blockly.Field = (this).getField("MINUS");
      if (!minusField && ((this).itemCount_ > 0)) {
        (this).topInput_.insertFieldAt(1, createMinusField(), "MINUS");
      }
      else if (minusField && ((this).itemCount_ < 1)) {
        (this).topInput_.removeField("MINUS");
      }
    },
  };
  Blockly.Extensions.registerMutator(mutatorName, mutator, function(this: any): any {
    (this).getInput("EMPTY").insertFieldAt(0, createPlusField(), "PLUS");
    return (this).updateShape_(startCount);
  });
}

export class IntellisenseEntry{
  readonly Name: string;
  readonly Info: string;
  readonly isFunction: boolean;
  readonly isClass: boolean;
  constructor(Name: string, Info: string, isFunction: boolean, isClass: boolean) {
    this.Name = Name;
    this.Info = Info;
    this.isFunction = isFunction;
    this.isClass = isClass;
  }
}

export class IntellisenseVariable{
  readonly VariableEntry: IntellisenseEntry;
  readonly ChildEntries: IntellisenseEntry[];
  constructor(VariableEntry: IntellisenseEntry, ChildEntries: IntellisenseEntry[]) {
    this.VariableEntry = VariableEntry;
    this.ChildEntries = ChildEntries;
  }
}


let notebooksInstance: INotebookTracker | null = null;
export function setNotebooksInstance(notebooks: INotebookTracker) {
  notebooksInstance = notebooks;
};
export function getNotebooksInstance(): INotebookTracker | null {
  return notebooksInstance;
};

export function GetKernel(): [NotebookPanel, Kernel.IKernelConnection] | undefined {
  const notebook = getNotebooksInstance();
  if (notebook) {
    const matchValue: NotebookPanel | null = notebook.currentWidget;
    if (matchValue == null) {
      return void 0;
    }
  else {
    const widget: NotebookPanel = matchValue;
    const matchValue_1: Kernel.IKernelConnection | null | undefined = widget.sessionContext.session?.kernel;
    if (matchValue_1 == null) {
      return void 0;
    }
    else {
      return [widget, matchValue_1] as [NotebookPanel, Kernel.IKernelConnection];
    }
    }
  }
  else {
    return void 0;
  }
}

/**
 * Get a completion (tab+tab) using the kernel. Typically this will be following a "." but it could also be to match a known identifier against a few initial letters.
 */

export function GetKernelCompletion(queryString: string): Promise<string[]> {
  const matchValue: [NotebookPanel, Kernel.IKernelConnection] | undefined = GetKernel();
  if (matchValue == null) {
    return Promise.reject((() => {
      throw 1;
    })());
  }
  else {
    const kernel: Kernel.IKernelConnection = matchValue[1];
    return new Promise<string[]>((resolve, reject) => {
      setTimeout(() => {
        kernel.requestComplete({
          code: queryString,
          cursor_pos: queryString.length,
        }).then((_arg: KernelMessage.ICompleteReplyMsg) => {
          const content = _arg.content;
          if ('matches' in content) {
            resolve(content.matches.slice());
          }
        }).catch((_arg_1: Error) => {
          reject([queryString + " is unavailable"]);
        });
      }, 100);
    });
  }
}

// requestInspectTimeout


/**
 * Get an inspection (shift+tab) using the kernel. AFAIK this only works after a complete known identifier.
 */
export function GetKernalInspection(queryString: string): Promise<string> {
  const matchValue: [NotebookPanel, Kernel.IKernelConnection] | undefined = GetKernel();
  if (matchValue == null) {
    console.log("NOKERNEL");
    return Promise.reject((() => {
      throw 1;
    })());
  }
  else {
    const widget: NotebookPanel = matchValue[0];
    const kernel: Kernel.IKernelConnection = matchValue[1];
    return new Promise<string>((resolve, reject) => {
      kernel.requestInspect({
        code: queryString,
        cursor_pos: queryString.length,
        detail_level: 0,
      }).then((_arg: KernelMessage.IInspectReplyMsg) => {
        const content = _arg.content;
        if ("found" in content) {
          const mimeType: string | undefined = widget.content.rendermime.preferredMimeType(content.data);
          const payload = content.data;
          const model: MimeModel = new rendermime.MimeModel({
            data: payload,
          });
          if(mimeType){
            const renderer: IRenderMime.IRenderer = widget.content.rendermime.createRenderer(mimeType);
            renderer.renderModel(model).then(() => {
              resolve(renderer.node.innerText);
            }).catch((error) => {
              console.log(queryString + ":RENDER_ERROR");
              reject(error);
            });
          }
        } else {
            console.log(queryString + ":UNDEFINED");
            resolve("UNDEFINED");
          }
      }).catch((_arg_2: Error) => {
        console.log(queryString + ":UNAVAILABLE");
        reject(new Error(queryString + " is unavailable"));
      });
    });
  }
}

export const intellisenseLookup: Map<string, IntellisenseVariable> = new Map<string, IntellisenseVariable>([]);

/**
 * Determine if an entry is a function. We have separate blocks for properties and functions because only function blocks need parameters
 */
export function isFunction_Python(info: string): boolean {
  return info.includes("Signature:") && info.includes("function");
}

/**
 * Determine if an entry is a class.
 */
export function isClass_Python(info: string): boolean {
  return info.includes("signature:") && info.includes("class");
}


export function addToDict(dict: any, k: any, v: any) {
  if (dict.has(k)) {
    throw new Error("An item with the same key has already been added. Key: " + k);
  }
  dict.set(k, v);
}

/**
 * Request an IntellisenseVariable. If the type does not descend from object, the children will be empty.
 * Sometimes we will create a variable but it will have no type until we make an assignment.
 * We might also create a variable and then change its type.
 * So we need to check for introspections/completions repeatedly (no caching right now).
 */


export function RequestIntellisenseVariable_Python(block: Blockly.Block, parentName: string): void {
  GetKernalInspection(parentName).then((parentInspection: string) => {
    const parent: IntellisenseEntry = new IntellisenseEntry(parentName, parentInspection, isFunction_Python(parentInspection), isClass_Python(parentInspection));
    let shouldGetChildren: boolean;
    let outArg: IntellisenseVariable = new IntellisenseVariable(parent, []);
    
    const matchValue: [boolean, IntellisenseVariable] = [
      intellisenseLookup.has(parent.Name),
      outArg
    ];
    if (matchValue[0]) {
      const cached: IntellisenseVariable = matchValue[1];
      if (cached.VariableEntry.Info !== parent.Info || cached.ChildEntries.length === 0) {
        shouldGetChildren = true;
      } else {
        shouldGetChildren = false;
      }
    } else {
      shouldGetChildren = true;
    }
  

    if (shouldGetChildren) {
      GetKernelCompletion(parentName + ".").then((completions: string[]) => {
        const safeCompletions: string[] = completions.filter((s: string) => {
          if (parent.Info.indexOf("Signature: DataFrame") === 0) {
            return !(s.indexOf("_") === 0) && !(s.indexOf("style") === 0);
          }
          return true;
        });
        const pr: Promise<string>[] = safeCompletions.map((completion: string) => GetKernalInspection(parentName + "." + completion));
        return Promise.all(pr).then((inspections: string[]) => {
          const intellisenseVariable: IntellisenseVariable = new IntellisenseVariable(parent, safeCompletions.map((completion: string, index: number) => {
            return new IntellisenseEntry(completion, inspections[index], isFunction_Python(inspections[index]), isClass_Python(inspections[index]));
          }));
          if (intellisenseLookup.has(parentName)) {
            intellisenseLookup.set(parentName, intellisenseVariable);
          } else {
            addToDict(intellisenseLookup, parentName, intellisenseVariable);
          }
        });
      }).then(function() {
        const intellisenseUpdateEvent = new Blockly.Events.BlockChange(block, "field", "VAR", 0, 1);
        intellisenseUpdateEvent.group = "INTELLISENSE";
        // @ts-ignore
        console.log("event status is " + Blockly.Events.disabled_); //disabled_ existed in old version but not new version?
        // @ts-ignore
        Blockly.Events.disabled_ = 0;
        Blockly.Events.fire(intellisenseUpdateEvent);
      }).catch((error: Error) => {
        console.log("Intellisense event failed to fire; " + error.message);
      });
    } else {
      console.log("Not refreshing intellisense for " + parent.Name);
    }
  }).catch((error: Error) => {
    console.log("Intellisense event failed to fire; " + error.message);
  });
}



export function requestAndStubOptions_Python(block: Blockly.Block, varName: string): string[][] {
  if ((varName !== "") && !block.isInFlyout) {
    RequestIntellisenseVariable_Python(block, varName);
  }
  if (block.isInFlyout) {
    return [[" ", " "]];
  }
  else if ((varName !== "") && intellisenseLookup.has(varName)) {
    return [["!Waiting for kernel to respond with options.", "!Waiting for kernel to respond with options."]];
  }
  else {
    return [["!Not defined until you execute code.", "!Not defined until you execute code."]];
  }
}

export function getIntellisenseMemberOptions_Python(memberSelectionFunction: ((arg0: IntellisenseEntry) => boolean), varName: string): string[][] {
  const outArg: IntellisenseVariable | undefined = intellisenseLookup.get(varName);
  if (outArg) {
    if (!outArg.VariableEntry.isFunction && outArg.ChildEntries.length > 0) {
      return outArg.ChildEntries.filter(memberSelectionFunction).map((ie: IntellisenseEntry) => [ie.Name, ie.Name]);
    } else if (outArg.VariableEntry.Info === "UNDEFINED") {
      return [["!Not defined until you execute code.", "!Not defined until you execute code."]];
    } else {
      return [["!No properties available.", "!No properties available."]];
    }
  } else {
    return [["!Not defined until you execute code.", "!Not defined until you execute code."]];
  }
}

export function getIntellisenseVarTooltip(varName: string): string {
  const outArg: IntellisenseVariable | undefined = intellisenseLookup.get(varName);
  if (outArg) {
    return outArg.VariableEntry.Info;
  } else {
    return "!Not defined until you execute code.";
  }
}

export function tryGetValue<K, V>(map: Map<K, V>, key: K, defaultValue: V | undefined): [boolean, V | undefined] {
  return map.has(key) ? [true, map.get(key)] : [false, defaultValue];
}

export function getIntellisenseMemberTooltip(varName: string, memberName: string): string {
  const matchValue: [boolean, IntellisenseVariable | null | undefined] = tryGetValue(intellisenseLookup, varName, null);

  if (matchValue[0]) {
    const matchValueChild: IntellisenseEntry | undefined = matchValue[1]?.ChildEntries.find(c => c.Name === memberName);

    if (matchValueChild == null) {
      return "!Not defined until you execute code.";
    } else {
      return matchValueChild.Info;
    }
  } else {
    return "!Not defined until you execute code.";
  }
}

/**
 * Update all the blocks that use intellisense. Called after the kernel executes a cell so our intellisense in Blockly is updated.
 */
export function UpdateAllIntellisense_Python(): void {
  const workspace: Blockly.Workspace = Blockly.getMainWorkspace();
  
  const blocks: Blockly.Block[] = workspace.getBlocksByType("varGetProperty_Python", false);
  workspace.getBlocksByType("varDoMethod_Python", false).forEach(block => blocks.push(block));
  
  blocks.forEach((block: any) => {
    block.updateIntellisense(block, null, ((varName: string): string[][] => requestAndStubOptions_Python(block, varName)));
  });

  (workspace as Blockly.WorkspaceSvg).registerToolboxCategoryCallback(
    'VARIABLE', Blockly.Variables.flyoutCategoryBlocks);
}

/**
 * Remove a field from a block safely, even if it doesn't exist
 */
export function SafeRemoveField(block: Blockly.Block, fieldName: string, inputName: string): void {
  const matchValue: Blockly.Field | null = block.getField(fieldName);
  const matchValue_1: Blockly.Input | null = block.getInput(inputName);
  if (!matchValue) {}
  else if (!matchValue_1) {
    console.log(((("error removing (" + fieldName) + ") from block; input (") + inputName) + ") does not exist");
  }
  else {
    matchValue_1.removeField(fieldName);
  }
}

/**
* Remove an input safely, even if it doesn't exist
*/
export function SafeRemoveInput(block: Blockly.Block, inputName: string): void {
  if (!block.getInput(inputName)) {}
  else {
    block.removeInput(inputName);
  }
}

createDynamicArgumentMutator("intelliblockMutator_Python", 1, "add argument", "using", "and");

/**
 * Make a block that has an intellisense-populated member dropdown. The member type is property or method, defined by the filter function
 * Note the "blockName" given to these is hardcoded elsewhere, e.g. the toolbox and intellisense update functions
 */

export function makeMemberIntellisenseBlock_Python(blockName: string, preposition: string, verb: string, memberSelectionFunction: ((arg0: IntellisenseEntry) => boolean), hasArgs: boolean, hasDot: boolean): void {
  Blockly.Blocks[blockName]={
    varSelectionUserName(thisBlockClosure: Blockly.Block, selectedOption: string): string {
      const fieldVariable = thisBlockClosure.getField("VAR") as Blockly.FieldVariable;
      const lastVar: Blockly.VariableModel = thisBlockClosure.workspace.getAllVariables().slice(-1)[0];
      const dataString: string | null = thisBlockClosure.data;
      const data: string[] = dataString && dataString.indexOf(":") >= 0 ? dataString.split(":") : [""];
      if (selectedOption == null) {
        const matchValue: string = fieldVariable.getText();
        const matchValue_1: string = data[0];
        const matchValue_2: string = lastVar ? lastVar.name : "";
        return matchValue === "" ? (matchValue_1 === "" ? matchValue_2 : matchValue_1) : matchValue;
      } else {
        const source = fieldVariable.getOptions();
        const source2 = source.find((option: Blockly.MenuOption) => option[1] === selectedOption);
        return source2 ? (typeof source2[0] === 'string' ? source2[0] : "") : "";
      }
    },
    selectedMember: "",
    updateIntellisense(thisBlockClosure: any, selectedVarOption: string, optionsFunction: (varUserName: string) => string[][]){
      const input: Blockly.Input | null = thisBlockClosure.getInput("INPUT");
      SafeRemoveField(thisBlockClosure, "MEMBER", "INPUT");
      SafeRemoveField(thisBlockClosure, "USING", "INPUT");
      const varUserName: string = thisBlockClosure.varSelectionUserName(thisBlockClosure, selectedVarOption);
      
      const flatOptions: string[] = optionsFunction(varUserName).map(arr => arr[0]);

      const dataString: string = thisBlockClosure.data ? thisBlockClosure.data : "";
      const defaultSelection: string = dataString.indexOf(":") >= 0 ? dataString.split(":")[1] : "";
      
      if(input){
        let customfield = new CustomFields.FieldFilter(defaultSelection, flatOptions, function(this: any, newMemberSelectionIndex: any) {
          const thisSearchDropdown: typeof CustomFields_1 = this;
          const newMemberSelection: string = newMemberSelectionIndex === "" ? defaultSelection : thisSearchDropdown.WORDS[newMemberSelectionIndex];        
          thisSearchDropdown.setTooltip(getIntellisenseMemberTooltip(varUserName, newMemberSelection));          
          let matchValue;
          thisBlockClosure.selectedMember = (matchValue = [newMemberSelection.indexOf("!") === 0, this.selectedMember], matchValue[1] === "" ? newMemberSelection : matchValue[0] ? this.selectedMember : newMemberSelection);
          
          if (varUserName !== "" && thisBlockClosure.selectedMember !== "") {
            thisBlockClosure.data = varUserName + ":" + thisBlockClosure.selectedMember;
          }
          return newMemberSelection;
        })

        input.appendField(customfield, "MEMBER");
      } 
      if (thisBlockClosure.data === undefined || thisBlockClosure.data === null) {
          thisBlockClosure.data = varUserName + ":" + thisBlockClosure.selectedMember;
      }
      const memberField: Blockly.Field | null = thisBlockClosure.getField("MEMBER");
      if(memberField){
        memberField.setTooltip(getIntellisenseMemberTooltip(varUserName, memberField.getText()));
      }
    },
    init: function(): void{
      console.log(blockName + " init");
      const input_1: Blockly.Input = (this).appendDummyInput("INPUT");
 
      input_1.appendField(preposition).appendField(new Blockly.FieldVariable(
        "variable name",
        ((newSelection: string): any => {
        this.updateIntellisense(this, newSelection, ((varName: string): string[][] => requestAndStubOptions_Python(this, varName)));
        return newSelection;
        })
      ) as Blockly.Field, "VAR").appendField(verb);

      this.updateIntellisense(this, null, ((varName_1: string): string[][] => requestAndStubOptions_Python(this, varName_1)));

      this.setOutput(true);
      (this).setColour(230);
      (this).setTooltip("!Not defined until you execute code.");
      (this).setHelpUrl("");
      if (hasArgs) {
        (this).appendDummyInput("EMPTY");
        Blockly.Extensions.apply("intelliblockMutator_Python", this, true);
      }
    },
    onchange: function(e: Blockly.Events.BlockChange): void {
      if ((this.workspace && !this.isInFlyout) && (e.group === "INTELLISENSE")) {

        const data_1: string[] = this.data ? this.data.toString().split(":") : "";
        
        this.updateIntellisense(this, null, ((varName_2: string): string[][] => getIntellisenseMemberOptions_Python(memberSelectionFunction, varName_2)));
        const memberField: Blockly.Field = this.getField("MEMBER");
        if (data_1[1] !== "") {
          memberField.setValue(data_1[1]);
        }
        const varName_3: string = this.varSelectionUserName(this, null);
        this.setTooltip(getIntellisenseVarTooltip(varName_3));
      }
    },
  
  };
  pythonGenerator[blockName]=((block: any): string[] => {
    const varName: string = pythonGenerator.getVariableName(block.getFieldValue("VAR"));
    const memberName: string = block.getFieldValue("MEMBER").toString();
    let code = "";
    if (memberName.indexOf("!") === 0) {
      code = "";
    } else if (hasArgs) {
      const args: string[] = Array.from({ length: block.itemCount_ }, (_, i) => {
        return pythonGenerator.valueToCode(block, "ADD" + i.toString(), pythonGenerator.ORDER_MEMBER);
      });
      const cleanArgs: string = args.join(",");
      code = varName + (hasDot ? "." : "") + memberName + "(" + cleanArgs + ")";
    } else {
      code = varName + (hasDot ? "." : "") + memberName;
    }
    return [code, pythonGenerator.ORDER_FUNCTION_CALL];
  });
}

makeMemberIntellisenseBlock_Python("varGetProperty_Python", "from", "get", (ie: IntellisenseEntry): boolean => !ie.isFunction, false, true);
makeMemberIntellisenseBlock_Python("varDoMethod_Python", "with", "do", (ie: IntellisenseEntry): boolean => ie.isFunction, true, true);
makeMemberIntellisenseBlock_Python("varCreateObject_Python", "with", "create", (ie: IntellisenseEntry): boolean => ie.isClass, true, true);


export class FlyoutRegistryEntry{
  readonly LanguageName: string;
  readonly KernelCheckFunction: ((arg0: string) => boolean);
  readonly FlyoutFunction: ((arg0: Blockly.Workspace) => Element[]);
  constructor(LanguageName: string, KernelCheckFunction: ((arg0: string) => boolean), FlyoutFunction: ((arg0: Blockly.Workspace) => Element[])) {
    this.LanguageName = LanguageName;
    this.KernelCheckFunction = KernelCheckFunction;
    this.FlyoutFunction = FlyoutFunction;
  }
}
export const registry: FlyoutRegistryEntry[] = [];

Blockly.Variables.flyoutCategoryBlocks = ((workspace: Blockly.Workspace): Element[] => {

  if(registry){
    const matchValue: [NotebookPanel, Kernel.IKernelConnection] | undefined = GetKernel();
    if (matchValue) {
      const k: Kernel.IKernelConnection = matchValue[1];
      const entryOption = registry.find(e => e.KernelCheckFunction(k.name));
      return entryOption ? entryOption.FlyoutFunction(workspace) : [];
    }else {
      return [];
    }
  } else{
    return [];
  }
});

export function flyoutCategoryBlocks_Python(workspace: Blockly.Workspace): Element[] {
  const variableModelList: Blockly.VariableModel[] = workspace.getVariablesOfType("");
  const xmlList: Element[] = [];
  
  const button = document.createElement('button');
  button.setAttribute('text', '%{BKY_NEW_VARIABLE}');
  button.setAttribute('callbackKey', 'CREATE_VARIABLE');
  (workspace as Blockly.WorkspaceSvg).registerButtonCallback('CREATE_VARIABLE', function (button) {
    Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace());
  });
  xmlList.push(button);

  if (0 < variableModelList.length) {
    const lastVarFieldXml: Blockly.VariableModel = variableModelList[variableModelList.length - 1];
    if (Blockly.Blocks.variables_set) {
      const xml: Element = Blockly.utils.xml.createElement("block");
      xml.setAttribute("type", "variables_set");
      xml.setAttribute("gap", Blockly.Blocks.math_change ? "8" : "24");
      xml.appendChild(Blockly.Variables.generateVariableFieldDom(lastVarFieldXml));
      xmlList.push(xml);
    }
    if (Blockly.Blocks.math_change) {
     const xml_1: Element = Blockly.utils.xml.createElement("block");
      xml_1.setAttribute("type", "math_change");
      xml_1.setAttribute("gap", Blockly.Blocks.math_change ? "20" : "8");
      xml_1.appendChild(Blockly.Variables.generateVariableFieldDom(lastVarFieldXml));
      const shadowBlockDom: Element = Blockly.utils.xml.textToDom("<value name=\'DELTA\'><shadow type=\'math_number\'><field name=\'NUM\'>1</field></shadow></value>");
      xml_1.appendChild(shadowBlockDom);
      xmlList.push(xml_1);
    }
    if (Blockly.Blocks.varGetProperty_Python) {
      const xml_2: Element = Blockly.utils.xml.createElement("block");
      xml_2.setAttribute("type", "varGetProperty_Python");
      xml_2.setAttribute("gap", Blockly.Blocks.varGetPropertyPython ? "20" : "8");
      xml_2.appendChild(Blockly.Variables.generateVariableFieldDom(lastVarFieldXml));
      xmlList.push(xml_2);
    }
    if (Blockly.Blocks.varDoMethod_Python) {
      const xml_3: Element = Blockly.utils.xml.createElement("block");
      xml_3.setAttribute("type", "varDoMethod_Python");
      xml_3.setAttribute("gap", Blockly.Blocks.varDoMethodPython ? "20" : "8");
      xml_3.appendChild(Blockly.Variables.generateVariableFieldDom(lastVarFieldXml));
      xmlList.push(xml_3);
    }
    if (Blockly.Blocks.varCreateObject_Python) {
      const xml_4: Element = Blockly.utils.xml.createElement("block");
      xml_4.setAttribute("type", "varCreateObject_Python");
      xml_4.setAttribute("gap", Blockly.Blocks.varCreateObjectPython ? "20" : "8");
      xml_4.appendChild(Blockly.Variables.generateVariableFieldDom(lastVarFieldXml));
      xmlList.push(xml_4);
    }
    if (Blockly.Blocks.variables_get) {
      let i = 0;
      while (i < variableModelList.length) {
        const variableModel = variableModelList[i];
        const xml_5: Element = Blockly.utils.xml.createElement("block");
        xml_5.setAttribute("type", "variables_get");
        xml_5.setAttribute("gap", "8");
        xml_5.appendChild(Blockly.Variables.generateVariableFieldDom(variableModel));
        xmlList.push(xml_5);
        i++;
      }
    }
  }

  return xmlList; 
}

registry.push(new FlyoutRegistryEntry("Python", (name: string): boolean => (name.toLocaleLowerCase().indexOf("python") >= 0), flyoutCategoryBlocks_Python));

export const toolbox = "<xml xmlns=\"https://developers.google.com/blockly/xml\" id=\"toolbox\" style=\"display: none\">\n    <category name=\"IMPORT\" colour=\"255\">\n      <block type=\"importAs_Python\"></block>\n      <block type=\"importFrom_Python\"></block>\n    </category>\n    <category name=\"FREESTYLE\" colour=\"290\">\n      <block type=\"dummyOutputCodeBlock_Python\"></block>\n      <block type=\"dummyNoOutputCodeBlock_Python\"></block>\n      <block type=\"valueOutputCodeBlock_Python\"></block>\n      <block type=\"valueNoOutputCodeBlock_Python\"></block>\n    </category>\n    <category name=\"COMMENT\" colour=\"%{BKY_COLOUR_HUE}\">\n      <block type=\"dummyOutputCommentBlock_Python\"></block>\n      <block type=\"dummyNoOutputCommentBlock_Python\"></block>\n      <block type=\"valueOutputCommentBlock_Python\"></block>\n      <block type=\"valueNoOutputCommentBlock_Python\"></block>\n    </category>\n    <category name=\"LOGIC\" colour=\"%{BKY_LOGIC_HUE}\">\n      <block type=\"controls_if\"></block>\n      <block type=\"logic_compare\"></block>\n      <block type=\"logic_operation\"></block>\n      <block type=\"logic_negate\"></block>\n      <block type=\"logic_boolean\"></block>\n      <block type=\"logic_null\"></block>\n      <block type=\"logic_ternary\"></block>\n    </category>\n    <category name=\"LOOPS\" colour=\"%{BKY_LOOPS_HUE}\">\n      <block type=\"controls_repeat_ext\">\n        <value name=\"TIMES\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">10</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"controls_whileUntil\"></block>\n      <block type=\"controls_for\">\n        <value name=\"FROM\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">1</field>\n          </shadow>\n        </value>\n        <value name=\"TO\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">10</field>\n          </shadow>\n        </value>\n        <value name=\"BY\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">1</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"comprehensionForEach_Python\"></block>\n      <block type=\"controls_forEach\"></block>\n      <block type=\"controls_flow_statements\"></block>\n    </category>\n    <category name=\"MATH\" colour=\"%{BKY_MATH_HUE}\">\n      <block type=\"math_number\">\n        <field name=\"NUM\">123</field>\n      </block>\n      <block type=\"math_arithmetic\">\n        <value name=\"A\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">1</field>\n          </shadow>\n        </value>\n        <value name=\"B\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">1</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"math_single\">\n        <value name=\"NUM\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">9</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"math_trig\">\n        <value name=\"NUM\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">45</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"math_constant\"></block>\n      <block type=\"math_number_property\">\n        <value name=\"NUMBER_TO_CHECK\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">0</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"math_round\">\n        <value name=\"NUM\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">3.1</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"math_on_list\"></block>\n      <block type=\"math_modulo\">\n        <value name=\"DIVIDEND\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">64</field>\n          </shadow>\n        </value>\n        <value name=\"DIVISOR\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">10</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"math_constrain\">\n        <value name=\"VALUE\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">50</field>\n          </shadow>\n        </value>\n        <value name=\"LOW\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">1</field>\n          </shadow>\n        </value>\n        <value name=\"HIGH\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">100</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"math_random_int\">\n        <value name=\"FROM\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">1</field>\n          </shadow>\n        </value>\n        <value name=\"TO\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">100</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"math_random_float\"></block>\n      <block type=\"math_atan2\">\n        <value name=\"X\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">1</field>\n          </shadow>\n        </value>\n        <value name=\"Y\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">1</field>\n          </shadow>\n        </value>\n      </block>\n    </category>\n    <category name=\"TEXT\" colour=\"%{BKY_TEXTS_HUE}\">\n      <block type=\"text\"></block>\n      <block type=\"text_join\"></block>\n      <block type=\"text_append\">\n        <value name=\"TEXT\">\n          <shadow type=\"text\"></shadow>\n        </value>\n      </block>\n      <block type=\"text_length\">\n        <value name=\"VALUE\">\n          <shadow type=\"text\">\n            <field name=\"TEXT\">abc</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"text_isEmpty\">\n        <value name=\"VALUE\">\n          <shadow type=\"text\">\n            <field name=\"TEXT\"></field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"text_indexOf\">\n        <value name=\"VALUE\">\n          <block type=\"variables_get\">\n            <field name=\"VAR\">{textVariable}</field>\n          </block>\n        </value>\n        <value name=\"FIND\">\n          <shadow type=\"text\">\n            <field name=\"TEXT\">abc</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"text_charAt\">\n        <value name=\"VALUE\">\n          <block type=\"variables_get\">\n            <field name=\"VAR\">{textVariable}</field>\n          </block>\n        </value>\n      </block>\n      <block type=\"text_getSubstring\">\n        <value name=\"STRING\">\n          <block type=\"variables_get\">\n            <field name=\"VAR\">{textVariable}</field>\n          </block>\n        </value>\n      </block>\n      <block type=\"text_changeCase\">\n        <value name=\"TEXT\">\n          <shadow type=\"text\">\n            <field name=\"TEXT\">abc</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"text_trim\">\n        <value name=\"TEXT\">\n          <shadow type=\"text\">\n            <field name=\"TEXT\">abc</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"text_print\">\n        <value name=\"TEXT\">\n          <shadow type=\"text\">\n            <field name=\"TEXT\">abc</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"text_prompt_ext\">\n        <value name=\"TEXT\">\n          <shadow type=\"text\">\n            <field name=\"TEXT\">abc</field>\n          </shadow>\n        </value>\n      </block>\n      <!-- <block type=\"getInput\">\n        <value name=\"x\">\n          <shadow type=\"text\">\n            <field name=\"TEXT\">The prompt shown to the user</field>\n          </shadow>\n        </value>\n      </block> -->\n    </category>\n    <category name=\"LISTS\" colour=\"%{BKY_LISTS_HUE}\">\n      <block type=\"lists_create_with\">\n        <mutation items=\"0\"></mutation>\n      </block>\n      <block type=\"lists_create_with\"></block>\n      <block type=\"lists_repeat\">\n        <value name=\"NUM\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">5</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"lists_length\"></block>\n      <block type=\"lists_isEmpty\"></block>\n      <block type=\"lists_indexOf\">\n        <value name=\"VALUE\">\n          <block type=\"variables_get\">\n            <field name=\"VAR\">{listVariable}</field>\n          </block>\n        </value>\n      </block>\n      <block type=\"lists_getIndex\">\n        <value name=\"VALUE\">\n          <block type=\"variables_get\">\n            <field name=\"VAR\">{listVariable}</field>\n          </block>\n        </value>\n      </block>\n      <block type=\"lists_setIndex\">\n        <value name=\"LIST\">\n          <block type=\"variables_get\">\n            <field name=\"VAR\">{listVariable}</field>\n          </block>\n        </value>\n      </block>\n      <block type=\"lists_getSublist\">\n        <value name=\"LIST\">\n          <block type=\"variables_get\">\n            <field name=\"VAR\">{listVariable}</field>\n          </block>\n        </value>\n      </block>\n      <block type=\"indexer_Python\"></block>\n      <block type=\"lists_split\">\n        <value name=\"DELIM\">\n          <shadow type=\"text\">\n            <field name=\"TEXT\">,</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"lists_sort\"></block>\n      <block type=\"setBlock_Python\"></block>\n      <block type=\"sortedBlock_Python\"></block>\n      <block type=\"zipBlock_Python\"></block>\n      <block type=\"dictBlock_Python\"></block>\n      <block type=\"listBlock_Python\"></block>\n      <block type=\"tupleBlock_Python\"></block>\n      <block type=\"tupleConstructorBlock_Python\"></block>\n      <block type=\"reversedBlock_Python\"></block>\n    </category>\n    <category name=\"COLOUR\" colour=\"%{BKY_COLOUR_HUE}\">\n      <block type=\"colour_picker\"></block>\n      <block type=\"colour_random\"></block>\n      <block type=\"colour_rgb\">\n        <value name=\"RED\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">100</field>\n          </shadow>\n        </value>\n        <value name=\"GREEN\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">50</field>\n          </shadow>\n        </value>\n        <value name=\"BLUE\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">0</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"colour_blend\">\n        <value name=\"COLOUR1\">\n          <shadow type=\"colour_picker\">\n            <field name=\"COLOUR\">#ff0000</field>\n          </shadow>\n        </value>\n        <value name=\"COLOUR2\">\n          <shadow type=\"colour_picker\">\n            <field name=\"COLOUR\">#3333ff</field>\n          </shadow>\n        </value>\n        <value name=\"RATIO\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">0.5</field>\n          </shadow>\n        </value>\n      </block>Conversion\n    </category>\n    <category name=\"CONVERSION\" colour=\"120\">\n      <block type=\"boolConversion_Python\">\n      </block>\n      <block type=\"intConversion_Python\">\n      </block>\n      <block type=\"floatConversion_Python\">\n      </block>\n      <block type=\"strConversion_Python\">\n      </block>\n    </category>\n    <category name=\"I/O\" colour=\"190\">\n      <block type=\"withAs_Python\">\n      </block>\n      <block type=\"textFromFile_Python\">\n        <value name=\"FILENAME\">\n          <shadow type=\"text\">\n            <field name=\"TEXT\">name of file</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"openReadFile_Python\">\n              <value name=\"FILENAME\">\n          <shadow type=\"text\">\n            <field name=\"TEXT\">name of file</field>\n          </shadow>\n        </value>\n      </block>\n      <block type=\"openWriteFile_Python\">\n              <value name=\"FILENAME\">\n          <shadow type=\"text\">\n            <field name=\"TEXT\">name of file</field>\n          </shadow>\n        </value>\n      </block>\n    </category>\n    <sep></sep>\n    <category name=\"VARIABLES\" colour=\"%{BKY_VARIABLES_HUE}\" custom=\"VARIABLE\"></category>\n    <category name=\"FUNCTIONS\" colour=\"%{BKY_PROCEDURES_HUE}\" custom=\"PROCEDURE\"></category>\n  </xml>";