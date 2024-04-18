// See https://github.com/fustyles/webduino/tree/master/LinkIt7697/test_myFieldFilter

/**
 * @license
 * Copyright 2021 Taiwan (ChungYi Fu)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview my Field Filter.
 * @author https://www.facebook.com/francefu/
 * @Update 12/15/2021 21:00 (Taiwan Standard Time)
 */
 

// AO: dependencies and exports for webpack
import Blockly from 'blockly'; // { Block }

export var CustomFields: any = CustomFields || {};

export class CustomFieldFilter extends Blockly.FieldTextInput {
  private INITWORDS: any[];
  private WORDS: any[];
  private imageElement_: HTMLDivElement | null = null;
  private clickWrapper_: any;
  private moveWrapper_: any;
  private downWrapper_: any;

  constructor(text: any, options: any, opt_validate: any) {
    super(text, opt_validate);
    this.INITWORDS = options;
    this.WORDS = this.INITWORDS;

    this.setSpellcheck(false);
    this.clickWrapper_ = null;
    this.moveWrapper_ = null;
    this.downWrapper_ = null;
  }

  static fromJson(options: any) {
    return new CustomFieldFilter("", options['fieldFilter'], null);
  }

  showEditor_(e?: Event) {
    // running two extensions at once can create a kind of race condition where one checks the dom to see if set up is needed 
    // and then aborts because elements are already in the dom. This causes incomplete initialization.
    // To solve for this we set the workspace, delete the dom elements in question, and then recreate them.

    // set the workspace
    const block = this.getSourceBlock();
    if (block) {
        var workspace = block.workspace as Blockly.WorkspaceSvg;
        Blockly.common.setMainWorkspace(workspace);
    }

    //if DOM elements are not properly wired to blockly, destroy them and recreate them
    if( Blockly.WidgetDiv.getDiv() == null ) {
      var bwd = document.querySelector('.blocklyWidgetDiv');
      if(bwd){
        bwd.remove();
      }
      Blockly.WidgetDiv.createDom();
    }
    if( Blockly.DropDownDiv.getContentDiv() == null ) {
      var bddd = document.querySelector('.blocklyDropDownDiv');
      if(bddd){
        bddd.remove();
      } 
      Blockly.DropDownDiv.createDom();
    }
  
    super.showEditor_(e);

    var div = Blockly.WidgetDiv.getDiv();
    if (div && !div.firstChild) {
      return;
    }

    var editor = this.dropdownCreate_();
    Blockly.DropDownDiv.getContentDiv().appendChild(editor);
  
    if(block) {
      var blockColor = block.getColour()
      Blockly.DropDownDiv.setColour(blockColor,blockColor) //"#5C68A6","#5C68A6");
    }
    
    Blockly.DropDownDiv.showPositionedByField(
      this,
      this.dropdownDispose_.bind(this)
    );

    if(this.imageElement_){
      this.clickWrapper_ = Blockly.utils.browserEvents.bind(
        this.imageElement_,
        'click',
        this,
        this.hide_
      );
    }

    if(this.imageElement_){
      this.moveWrapper_ = Blockly.utils.browserEvents.bind(
        this.imageElement_,
        'mousemove',
        this,
        this.onMouseMove
      );
    }

    if(this.imageElement_){
      this.downWrapper_ = Blockly.utils.browserEvents.bind(
        this.imageElement_,
        'mousedown',
        this,
        this.onMouseDown
      );
    }

    this.updateGraph_();
  }

  dropdownCreate_() {
    this.imageElement_ = document.createElement('div');
    this.imageElement_.id = 'fieldFilter';
    this.WORDS = this.INITWORDS;
    var optionsLength = this.WORDS.length;
    var height = 18 * optionsLength;
    this.imageElement_.style.cssText =
      'border: 1px solid #ccc;height: ' +
      height +
      'px;width: 150px;font-size: 12px;padding: 0px;font: normal 12pt sans-serif'; //font-family: sans-serif';
    this.imageElement_.innerHTML = this.WORDS.join('<br>');
    return this.imageElement_;
  }

  dropdownDispose_() {
    if (this.clickWrapper_) {
      Blockly.utils.browserEvents.unbind(this.clickWrapper_);
      this.clickWrapper_ = null;
    }
    if (this.moveWrapper_) {
      Blockly.utils.browserEvents.unbind(this.moveWrapper_);
      this.moveWrapper_ = null;
    }
    if (this.downWrapper_) {
      Blockly.utils.browserEvents.unbind(this.downWrapper_);
      this.downWrapper_ = null;
    }
    this.imageElement_ = null;
  }

  hide_() {
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
  }

  onMouseMove(e: any) {
    if(this.imageElement_){
      var bBox = this.imageElement_.getBoundingClientRect();
      var dy = e.clientY - bBox.top;
      
      var highLight = Array.from(this.WORDS);
      var note = Math.round((dy - 5) / 18) < highLight.length ? Math.round((dy - 5) / 18) : -1;
      if (note != -1)
      highLight[note] = "<font color='white'>" + highLight[note] + "</font>";
      this.imageElement_.innerHTML = highLight.join("<br>");
    }
  }

  onMouseDown(e: any) {
    if(this.imageElement_){
      var bBox = this.imageElement_.getBoundingClientRect();
      var dy = e.clientY - bBox.top;
      var highLight = Array.from(this.WORDS);
      var note = Math.round((dy - 5) / 18) < highLight.length ? Math.round((dy - 5) / 18) : -1;
      this.setEditorValue_(note);
    }
  }

  valueToNote(value: any) {
    if (this.WORDS)
      return this.WORDS[Number(value)];
    else
      return "";
  }

  noteToValue(text: any) {
    var normalizedText = text.trim();
    var i = this.WORDS.indexOf(normalizedText);
    this.WORDS = [];
    var words = this.WORDS;
    var initwords = this.INITWORDS;
    for (var j = 0; j < initwords.length; j++) {
      if (initwords[j].toUpperCase().indexOf(normalizedText.toUpperCase()) != -1 || normalizedText == "")
        words.push(initwords[j]);
    }
    if (this.WORDS.length == 0)
      words.push([""]);
    var optionsLength = this.WORDS.length;
    var height = 18 * optionsLength;
    if(this.imageElement_){
      this.imageElement_.style.cssText =
      'border: 1px solid #ccc;height: ' +
      height +
      'px;width: 150px;font-size: 12px;padding: 0px';
      this.imageElement_.innerHTML = this.WORDS.join("<br>");
    }
    return i > -1 ? 0 : -1;
  }

  getText_() {
    if (this.isBeingEdited_) {
      return super.getText_();
    }
    return this.valueToNote(this.getValue()) || null;
  }

  getEditorText_(value: any) {
    return this.valueToNote(value);
  }

  getValueFromEditorText_(text: any) {
    return this.noteToValue(text);
  }

  render_() {
    super.render_();
    this.updateGraph_();
  }

  updateGraph_() {
    if (!this.imageElement_) {
      return;
    }
  }

  doClassValidation_(opt_newValue: any) {
    if (opt_newValue === null || opt_newValue === undefined) {
      return null;
    }
    var note = this.valueToNote(opt_newValue);
    if (note) {
      return opt_newValue;
    }
    return "";
  }
}

CustomFields.FieldFilter = CustomFieldFilter;
