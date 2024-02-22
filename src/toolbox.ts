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
  Blockly.Xml.clearWorkspaceAndLoadFromXml(xmlElement, Blockly.getMainWorkspace() as Blockly.WorkspaceSvg);
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
          const input: Blockly.Input = hasInput ? (this).appendValueInput("INPUT").setCheck(null) : (this).appendDummyInput();
          console.log(blockName + " init");
          input.appendField(new Blockly.FieldTextInput("type code here...") as Blockly.Field, "CODE");
          if (hasOutput) {
              (this).setOutput(true, null);
          }
          else {
              (this).setNextStatement(true);
              (this).setPreviousStatement(true);
          }
          (this).setColour(230);
          (this).setTooltip(((("You can put any Python code in this block. Use this block if you " + (hasInput ? "do" : "don\'t")) + " need to connect an input block and ") + (hasOutput ? "do" : "don\'t")) + " need to connect an output block.");
          (this).setHelpUrl("https://docs.python.org/3/");
      },
  };
  pythonGenerator[blockName]=((block: Blockly.Block): string[] => {
      const userCode: string = block.getFieldValue("CODE").toString();
      let code: string;
      if (hasInput) {
          const input_1: string = pythonGenerator.valueToCode(block, "INPUT", pythonGenerator.ORDER_ATOMIC);
          code = ((userCode + " ") + input_1).trim();
      }
      else {
          code = userCode.trim();
      }
      return hasOutput ? [code, pythonGenerator.ORDER_ATOMIC] : [(code + "\n")];
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
  pythonGenerator[blockName]=((block: Blockly.Block): string[] => {
      const userCode: string = block.getFieldValue("COMMENT").toString();
      let code: string;
      if (hasInput) {
          const input_1: string = pythonGenerator.valueToCode(block, "INPUT", pythonGenerator.ORDER_ATOMIC);
          code = ((userCode + " ") + input_1).trim();
      }
      else {
          code = userCode.trim();
      }
      return hasOutput ? [code, pythonGenerator.ORDER_ATOMIC] : [(("# " + code) + "\n")];
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

interface ExtendedBlock extends Blockly.Block {
  itemCount_: number;
  selectedMember: String;
  varSelectionUserName(thisBlockClosure: Blockly.Block, selectedOption: string): string;
  updateIntellisense(thisBlockClosure: ExtendedBlock, selectedVarOption: string, optionsFunction: (varUserName: string) => string[][]): void;
}

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
      shouldGetChildren = cached.VariableEntry.Info !== parent.Info || cached.ChildEntries.length === 0;
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
        Blockly.Events.enable;
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
    'VARIABLE', flyoutCategoryBlocks_Python);
}


/**
 * Remove a field from a block safely, even if it doesn't exist
 */
export function SafeRemoveField(block: Blockly.Block, fieldName: string, inputName: string): void {
  const matchValue: Blockly.Field | null = block.getField(fieldName);
  const matchValue_1: Blockly.Input | null = block.getInput(inputName);
  if (!matchValue) {
  }
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
  if (!block.getInput(inputName)) {
  }
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
    updateIntellisense: function(thisBlockClosure: any, selectedVarOption: string, optionsFunction: (varUserName: string) => string[][]): void {
      const input: Blockly.Input | null = thisBlockClosure.getInput("INPUT");
      SafeRemoveField(thisBlockClosure, "MEMBER", "INPUT");
      SafeRemoveField(thisBlockClosure, "USING", "INPUT");
      const varUserName: string = thisBlockClosure.varSelectionUserName(thisBlockClosure, selectedVarOption);
      
      const flatOptions: string[] = optionsFunction(varUserName).map(arr => arr[0]);

      let defaultSelection: string = '';
      const dataString: string = thisBlockClosure.data ? thisBlockClosure.data : '';
      defaultSelection = dataString.includes(":") ? dataString.split(":")[1] : '';

      if(input){
        let customfield = new CustomFields.FieldFilter(defaultSelection, flatOptions, function(this: any, newMemberSelectionIndex: any) {
          const thisSearchDropdown: typeof CustomFields_1 = this;
          const newMemberSelection: string = newMemberSelectionIndex === "" ? defaultSelection : thisSearchDropdown.WORDS[newMemberSelectionIndex];
          
          thisSearchDropdown.setTooltip(getIntellisenseMemberTooltip(varUserName, newMemberSelection));
          thisBlockClosure.selectedMember = (newMemberSelection.indexOf("!") === 0) ? thisBlockClosure.selectedMember : newMemberSelection;
          if (varUserName !== "") {
            thisBlockClosure.data = `${varUserName}:${thisBlockClosure.selectedMember}`;
          }
          return newMemberSelection;
        })

        input.appendField(customfield, "MEMBER");
      }
        
      if (thisBlockClosure.data === undefined || thisBlockClosure.data === null) {
          thisBlockClosure.data = `${varUserName}:${thisBlockClosure.selectedMember}`;
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
        const memberField_1: Blockly.Field = this.getField("MEMBER");
        if (data_1[1] !== "") {
          memberField_1.setValue(data_1[1]);
        }
        const varName_3: string = this.varSelectionUserName(this, null);
        this.setTooltip(getIntellisenseVarTooltip(varName_3));
      }
    },
  
  };
  pythonGenerator[blockName]=((block: ExtendedBlock): string[] => {
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


export function flyoutCategoryBlocks_Python(workspace: Blockly.Workspace): Element[] {
  const variableModelList: Blockly.VariableModel[] = workspace.getVariablesOfType("");
  const xmlList: Element[] = [];
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

export const toolbox = {
  "kind": "categoryToolbox",
  "contents": [
    {
      "kind": "category",
      "name": "IMPORT",
      "colour": "255",
      "contents": [
        { "kind": "block", "type": "importAs_Python" },
        { "kind": "block", "type": "importFrom_Python" }
      ]
    },
    {
      "kind": "category",
      "name": "FREESTYLE",
      "colour": "290",
      "contents": [
        { "kind": "block", "type": "dummyOutputCodeBlock_Python" },
        { "kind": "block", "type": "dummyNoOutputCodeBlock_Python" },
        { "kind": "block", "type": "valueOutputCodeBlock_Python" },
        { "kind": "block", "type": "valueNoOutputCodeBlock_Python" }
      ]
    },
    {
      "kind": "category",
      "name": "COMMENT",
      "colour": "%{BKY_COLOUR_HUE}",
      "contents": [
        { "kind": "block", "type": "dummyOutputCommentBlock_Python" },
        { "kind": "block", "type": "dummyNoOutputCommentBlock_Python" },
        { "kind": "block", "type": "valueOutputCommentBlock_Python" },
        { "kind": "block", "type": "valueNoOutputCommentBlock_Python" }
      ]
    },
    {
      "kind": "category",
      "name": "LOGIC",
      "colour": "%{BKY_LOGIC_HUE}",
      "contents": [
        { "kind": "block", "type": "controls_if" },
        { "kind": "block", "type": "logic_compare" },
        { "kind": "block", "type": "logic_operation" },
        { "kind": "block", "type": "logic_negate" },
        { "kind": "block", "type": "logic_boolean" },
        { "kind": "block", "type": "logic_null" },
        { "kind": "block", "type": "logic_ternary" }
      ]
    },
    {
      "kind": "category",
      "name": "LOOPS",
      "colour": "%{BKY_LOOPS_HUE}",
      "contents": [
        {
          "kind": "block",
          "type": "controls_repeat_ext",
          "values": {
            "TIMES": {
              "kind": "block",
              "type": "math_number",
              "fields": {
                "NUM": 10
              }
            }
          }
        },
        { "kind": "block", "type": "controls_whileUntil" },
        {
          "kind": "block",
          "type": "controls_for",
          "values": {
            "FROM": {
              "kind": "block",
              "type": "math_number",
              "fields": {
                "NUM": 1
              }
            },
            "TO": {
              "kind": "block",
              "type": "math_number",
              "fields": {
                "NUM": 10
              }
            },
            "BY": {
              "kind": "block",
              "type": "math_number",
              "fields": {
                "NUM": 1
              }
            }
          }
        },
        { "kind": "block", "type": "comprehensionForEach_Python" },
        { "kind": "block", "type": "controls_forEach" },
        { "kind": "block", "type": "controls_flow_statements" }
      ]
    },
    {
      "kind": "category",
      "name": "MATH",
      "colour": "%{BKY_MATH_HUE}",
      "contents": [
        { "kind": "block", "type": "math_number", "fields": { "NUM": 123 } },
        {
          "kind": "block",
          "type": "math_arithmetic",
          "values": {
            "A": { "kind": "block", "type": "math_number", "fields": { "NUM": 1 } },
            "B": { "kind": "block", "type": "math_number", "fields": { "NUM": 1 } }
          }
        },
        { "kind": "block", "type": "math_single", "values": { "NUM": { "kind": "block", "type": "math_number", "fields": { "NUM": 9 } } } },
        { "kind": "block", "type": "math_trig", "values": { "NUM": { "kind": "block", "type": "math_number", "fields": { "NUM": 45 } } } },
        { "kind": "block", "type": "math_constant" },
        { "kind": "block", "type": "math_number_property", "values": { "NUMBER_TO_CHECK": { "kind": "block", "type": "math_number", "fields": { "NUM": 0 } } } },
        { "kind": "block", "type": "math_round", "values": { "NUM": { "kind": "block", "type": "math_number", "fields": { "NUM": 3.1 } } } },
        { "kind": "block", "type": "math_on_list" },
        {
          "kind": "block",
          "type": "math_modulo",
          "values": {
            "DIVIDEND": { "kind": "block", "type": "math_number", "fields": { "NUM": 64 } },
            "DIVISOR": { "kind": "block", "type": "math_number", "fields": { "NUM": 10 } }
          }
        },
        {
          "kind": "block",
          "type": "math_constrain",
          "values": {
            "VALUE": { "kind": "block", "type": "math_number", "fields": { "NUM": 50 } },
            "LOW": { "kind": "block", "type": "math_number", "fields": { "NUM": 1 } },
            "HIGH": { "kind": "block", "type": "math_number", "fields": { "NUM": 100 } }
          }
        },
        {
          "kind": "block",
          "type": "math_random_int",
          "values": {
            "FROM": { "kind": "block", "type": "math_number", "fields": { "NUM": 1 } },
            "TO": { "kind": "block", "type": "math_number", "fields": { "NUM": 100 } }
          }
        },
        { "kind": "block", "type": "math_random_float" },
        {
          "kind": "block",
          "type": "math_atan2",
          "values": {
            "X": { "kind": "block", "type": "math_number", "fields": { "NUM": 1 } },
            "Y": { "kind": "block", "type": "math_number", "fields": { "NUM": 1 } }
          }
        }
      ]
    },
    {
      "kind": "category",
      "name": "TEXT",
      "colour": "%{BKY_TEXTS_HUE}",
      "contents": [
        { "kind": "block", "type": "text" },
        { "kind": "block", "type": "text_join" },
        {
          "kind": "block",
          "type": "text_append",
          "values": {
            "TEXT": { "kind": "shadow", "type": "text" }
          }
        },
        {
          "kind": "block",
          "type": "text_length",
          "values": {
            "VALUE": { "kind": "shadow", "type": "text", "fields": { "TEXT": "abc" } }
          }
        },
        {
          "kind": "block",
          "type": "text_isEmpty",
          "values": {
            "VALUE": { "kind": "shadow", "type": "text", "fields": { "TEXT": "" } }
          }
        },
        {
          "kind": "block",
          "type": "text_indexOf",
          "values": {
            "VALUE": {
              "kind": "block",
              "type": "variables_get",
              "fields": { "VAR": "{textVariable}" }
            },
            "FIND": { "kind": "shadow", "type": "text", "fields": { "TEXT": "abc" } }
          }
        },
        {
          "kind": "block",
          "type": "text_charAt",
          "values": {
            "VALUE": {
              "kind": "block",
              "type": "variables_get",
              "fields": { "VAR": "{textVariable}" }
            }
          }
        },
        {
          "kind": "block",
          "type": "text_getSubstring",
          "values": {
            "STRING": {
              "kind": "block",
              "type": "variables_get",
              "fields": { "VAR": "{textVariable}" }
            }
          }
        },
        {
          "kind": "block",
          "type": "text_changeCase",
          "values": {
            "TEXT": { "kind": "shadow", "type": "text", "fields": { "TEXT": "abc" } }
          }
        },
        {
          "kind": "block",
          "type": "text_trim",
          "values": {
            "TEXT": { "kind": "shadow", "type": "text", "fields": { "TEXT": "abc" } }
          }
        },
        {
          "kind": "block",
          "type": "text_print",
          "values": {
            "TEXT": { "kind": "shadow", "type": "text", "fields": { "TEXT": "abc" } }
          }
        },
        {
          "kind": "block",
          "type": "text_prompt_ext",
          "values": {
            "TEXT": { "kind": "shadow", "type": "text", "fields": { "TEXT": "abc" } }
          }
        }
      ]
    },
    {
      "kind": "category",
      "name": "LISTS",
      "colour": "%{BKY_LISTS_HUE}",
      "contents": [
        {
          "kind": "block",
          "type": "lists_create_with",
          "mutations": { "items": 0 }
        },
        { "kind": "block", "type": "lists_create_with" },
        {
          "kind": "block",
          "type": "lists_repeat",
          "values": {
            "NUM": { "kind": "shadow", "type": "math_number", "fields": { "NUM": 5 } }
          }
        },
        { "kind": "block", "type": "lists_length" },
        { "kind": "block", "type": "lists_isEmpty" },
        {
          "kind": "block",
          "type": "lists_indexOf",
          "values": {
            "VALUE": {
              "kind": "block",
              "type": "variables_get",
              "fields": { "VAR": "{listVariable}" }
            }
          }
        },
        {
          "kind": "block",
          "type": "lists_getIndex",
          "values": {
            "VALUE": {
              "kind": "block",
              "type": "variables_get",
              "fields": { "VAR": "{listVariable}" }
            }
          }
        },
        {
          "kind": "block",
          "type": "lists_setIndex",
          "values": {
            "LIST": {
              "kind": "block",
              "type": "variables_get",
              "fields": { "VAR": "{listVariable}" }
            }
          }
        },
        {
          "kind": "block",
          "type": "lists_getSublist",
          "values": {
            "LIST": {
              "kind": "block",
              "type": "variables_get",
              "fields": { "VAR": "{listVariable}" }
            }
          }
        },
        { "kind": "block", "type": "indexer_Python" },
        {
          "kind": "block",
          "type": "lists_split",
          "values": {
            "DELIM": { "kind": "shadow", "type": "text", "fields": { "TEXT": "," } }
          }
        },
        { "kind": "block", "type": "lists_sort" },
        { "kind": "block", "type": "setBlock_Python" },
        { "kind": "block", "type": "sortedBlock_Python" },
        { "kind": "block", "type": "zipBlock_Python" },
        { "kind": "block", "type": "dictBlock_Python" },
        { "kind": "block", "type": "listBlock_Python" },
        { "kind": "block", "type": "tupleBlock_Python" },
        { "kind": "block", "type": "tupleConstructorBlock_Python" },
        { "kind": "block", "type": "reversedBlock_Python" }
      ]
    },
    {
      "kind": "category",
      "name": "COLOUR",
      "colour": "%{BKY_COLOUR_HUE}",
      "contents": [
        { "kind": "block", "type": "colour_picker" },
        { "kind": "block", "type": "colour_random" },
        {
          "kind": "block",
          "type": "colour_rgb",
          "values": {
            "RED": { "kind": "block", "type": "math_number", "fields": { "NUM": 100 } },
            "GREEN": { "kind": "block", "type": "math_number", "fields": { "NUM": 50 } },
            "BLUE": { "kind": "block", "type": "math_number", "fields": { "NUM": 0 } }
          }
        },
        {
          "kind": "block",
          "type": "colour_blend",
          "values": {
            "COLOUR1": { "kind": "block", "type": "colour_picker", "fields": { "COLOUR": "#ff0000" } },
            "COLOUR2": { "kind": "block", "type": "colour_picker", "fields": { "COLOUR": "#3333ff" } },
            "RATIO": { "kind": "block", "type": "math_number", "fields": { "NUM": 0.5 } }
          }
        }
      ]
    },
    {
      "kind": "category",
      "name": "CONVERSION",
      "colour": 120,
      "contents": [
        { "kind": "block", "type": "boolConversion_Python" },
        { "kind": "block", "type": "intConversion_Python" },
        { "kind": "block", "type": "floatConversion_Python" },
        { "kind": "block", "type": "strConversion_Python" }
      ]
    },
    {
      "kind": "category",
      "name": "I/O",
      "colour": 190,
      "contents": [
        { "kind": "block", "type": "withAs_Python" },
        {
          "kind": "block",
          "type": "textFromFile_Python",
          "values": {
            "FILENAME": { "kind": "shadow", "type": "text", "fields": { "TEXT": "name of file" } }
          }
        },
        {
          "kind": "block",
          "type": "openReadFile_Python",
          "values": {
            "FILENAME": { "kind": "shadow", "type": "text", "fields": { "TEXT": "name of file" } }
          }
        },
        {
          "kind": "block",
          "type": "openWriteFile_Python",
          "values": {
            "FILENAME": { "kind": "shadow", "type": "text", "fields": { "TEXT": "name of file" } }
          }
        }
      ]
    },
    {
      "kind": "sep"
    },
    {
      "kind": "category",
      "name": "VARIABLES",
      "colour": "%{BKY_VARIABLES_HUE}",
      "custom": "VARIABLE"
    },
    {
      "kind": "category",
      "name": "FUNCTIONS",
      "colour": "%{BKY_PROCEDURES_HUE}",
      "custom": "PROCEDURE"
    }
  ]
};