import {JAXDisk} from "/jaxweb/lib/JAXDisk.js"
import {Buffer} from "/@buffer";
import {Writable,Readable} from "/@stream";
import {EventEmitter} from "/@events"

class TTYStdOut extends Writable{
	constructor(tty){
		super();
		this.isTTY=true;
		this.tty=tty;
	}
	//Writable 需要实现的函数:
	_write(chunk,encoding="utf8",callback=null){
		if(Buffer.isBuffer(chunk)){
			if(this.tty) {
				this.tty.textOut(""+chunk);
			}
			
		}else if(typeof(chunk)==="string"){
			if(this.tty) {
				this.tty.textOut(chunk);
			}
		}
		if(callback) {
			callback();
			//setTimeout(() => {callback();}, 0);
		}
	}
	_writev(chunks, callback){
		chunks.forEach(chunk=>{this._write(chunk.chunk,chunk.encoding)});
		if(callback) {
			callback();
			//setTimeout(() => {callback();}, 0);
		}
	}
	//TTY需要实现的函数:
	get columns(){
		return 80;
	}
	get rows(){
		return 25;
	}
	//清除当前行
	clearLine(dir, callback){
		if(this.tty){
			this.tty.clearLine(dir);
		}
		if(callback) {
			callback();
			//setTimeout(() => {callback();}, 0);
		}
	}
	//清屏幕:
	clearScreenDown(callback){
		if(this.tty){
			this.tty.clearScreenDown();
		}
		if(callback) {
			callback();
			//setTimeout(() => {callback();}, 0);
		}
	}
	//移动光标:
	cursorTo(x, y, callback){
		if(this.tty){
			this.tty.cursorTo(x,y);
		}
		if(callback) {
			callback();
			//setTimeout(() => {callback();}, 0);
		}
	}
	//颜色深度，暂时只支持单色:
	getColorDepth(){
		return 1;
	}
	//屏幕尺寸:
	getWindowSize(){
		return [80,25];
	}
	hasColors(){
		return false;
	}
	//移动光标:
	moveCursor(dx,dy,callback){
		if(this.tty){
			this.tty.moveCursor(dx,dy);
		}
		if(callback) {
			callback();
			//setTimeout(() => {callback();}, 0);
		}
	}
	
}

class TTYStdIn extends Readable{
	constructor (options){
		super(options);
	}
	_read(size){
		//TODO: Start read：
	}
}

export default class CokeTTY extends EventEmitter
{
	constructor (div,host,inputHeader="coke"){
		super();
		this.div=div;
		this.host=host;
		
		this.lines=[];
		this.divInput=null;
		this.lastLine=null;
		this.inputHeader=inputHeader;
		this.inputPrefix="$>";
		this.segChNum=32;
		this.lineSeq=0;
		this.isInputPassword=false;
		
		this.divInput=null;
		if(div) {
			div.style.overflowY = "scroll";
			div.style.overflowX = "scroll";
		}
		
		this.stdout=new TTYStdOut(this,host);
		this.stdin=new TTYStdIn();
		this.stderr=this.stdout;
		
		this.cursorLine=null;		//Cursor line:
		this.cursorX=0;				//Cursor column:
		
		if(div) {
			this._outLine("");
		}
	}
	
	//-----------------------------------------------------------------------
	//Output a text seg, no new line, no \t
	_outSeg(text){
		let idx,lines,curText;
		lines=this.lines;
		idx=lines.length-1;
		curText=lines[idx].innerText;
		curText+=text;
		lines[idx].innerText=curText;
	}

	//-----------------------------------------------------------------------
	//Output a seg of text, no new line, support \t .
	_outLnText(text,line=null,pos=0){
		let idx,lines,curText,lineText;
		let pts,segChNum;
		
		function renderTab(){
			let n,m,i;
			n=lineText.length+curText.length;
			m=Math.floor(n/segChNum)*segChNum+segChNum;
			n=m-n;
			for(i=0;i<n;i++){
				curText+=" ";
			}
		}
		if(!line) {
			lines = this.lines;
			idx = lines.length - 1;
			line = lines[idx];
		}
		lineText=line.innerText;
		curText="";//line.innerText;
		segChNum=this.segChNum;
		pts=text.split("\t");
		pts.forEach((sub,idx)=>{
			if(idx!==0){
				renderTab();
			}
			curText+=sub
		})
		lineText=lineText.substring(0,pos)+curText+lineText.substring(pos+curText.length);
		line.innerText=lineText;
		//记录光标位置
		this.cursorX=pos+curText.length;
		this.cursorLine=line;
	}
	
	//-----------------------------------------------------------------------
	//Output a line:
	_outLine(text,curLine=null){
		let div,style,divLines,lines;
		divLines=this.div;
		lines=this.lines;
		if(curLine){
			div=curLine.nextSibling;
		}else{
			curLine=this.cursorLine||this.lastLine;
			if(curLine){
				div=curLine.nextSibling;
			}
		}
		if(!div && divLines) {
			div = document.createElement('div');
			style = div.style;
			style.width = "auto";
			style.height = "";
			style.wordBreak = "break-word";
			style.whiteSpace = "pre";
			style.textOverflow = "";
			style.alignSelf = "";
			style.textAlign = "";
			style.fontFamily = "monospace";
			style.fontSize = "12px";
			style.color = "rgba(0,0,0,1)";
			style.paddingLeft="5px";
			div.spellcheck = false;
			div.innerText = text;
			divLines.appendChild(div);
			lines.push(div);
			div.lineSeq = this.lineSeq++;
			this.lastLine = div;
			if (lines.length > 200) {
				divLines.removeChild(lines[0]);
				lines.shift();
			}
		}
		this.cursorLine=div;
		this.cursorX=0;
		this._outLnText(text,div,0);
		return div;
	}
	
	//-----------------------------------------------------------------------
	//Output [text], if [scroll] is true, scorll view to bottom.
	textOut(text,scroll=1){
		let pts,lead,i,n;
		if(typeof(text)!=="string"){
			text=""+text;
		}
		console.log(text);
		if(this.div) {
			pts = text.split("\n");
			lead = pts[0];
			if (lead) {
				this._outLnText(lead, this.cursorLine, this.cursorX);
			}
			n = pts.length;
			if (n > 1) {
				for (i = 1; i < n; i++) {
					this._outLine(pts[i]);
				}
			}
			if (scroll) {
				//滚动element:
				this.div.scrollTop = this.div.scrollHeight;
			}
		}
		if(this.host){
			this.host.sendRemoteMsg({
				msg:"tty",
				func:"textOut",
				args:[text,scroll]
			});
		}
	}
	
	//-----------------------------------------------------------------------
	//Output a seg of HTML elemts:
	htmlOut(htmlText,scroll=1){
		let divLines,div,style;
		divLines=this.div;
		if(divLines) {
			div = document.createElement('div');
			style = div.style;
			style.width = "auto";
			style.height = "";
			style.color = "rgba(0,0,0,1)";
			style.paddingLeft="10px";
			div.spellcheck = false;
			divLines.appendChild(div);
			this.lines.push(div);
			div.lineSeq = this.lineSeq++;
			div.innerHTML=htmlText;
			this.lastLine = div;
			if (this.lines.length > 200) {
				divLines.removeChild(this.lines[0]);
				this.lines.shift();
			}
			this._outLine("",scroll);
		}else if(this.host){
			this.host.sendRemoteMsg({
				msg:"tty",
				func:"htmlOut",
				args:[htmlText,scroll]
			});
		}
	}
	
	//-----------------------------------------------------------------------
	//Start text input :
	startInput(prefix=null,password=false,initText=""){
		let div,path;
		let passwordText="";
		
		path=JAXDisk.appPath;
		if(this.div) {
			if(prefix!==null){
				this.inputPrefix=prefix;
			}else{
				this.inputPrefix=""+this.inputHeader+" "+path+" $> ";
			}
			div = this.divInput;
			if (!div) {
				this._outLine("");
				div = this.lastLine;
				if (!div || div.innerText) {
					div = this._outLine(this.inputPrefix+initText, this.lastLine);
				} else {
					div.innerText = this.inputPrefix+initText;
				}
				this.divInput = div;
				div.curInputText = div.inputPrefix = this.inputPrefix;
				div.contentEditable = true;
				div.style.outlineStyle = "none";
				div.style.backgroundColor = "rgba(230,240,255,1)";
				if(password){
					div.addEventListener("keydown", evt=>{
						switch(evt.key){
							case "Enter":
								evt.preventDefault();
								evt.stopPropagation();
								this.endInput(passwordText);
								break;
							case "Backspace":
								passwordText=passwordText.substring(0,passwordText.length-1);
								evt.preventDefault();
								evt.stopPropagation();
								break;
						}
					}, true);
				}else {
					div.addEventListener("keydown", this.OnKeyDown.bind(this), true);
				}
				div.oninput = () => {
					let text;
					text = div.innerText;
					if(password){
						if (!text.startsWith(div.inputPrefix)) {
						} else {
							text=text.substring(div.inputPrefix.length);
							passwordText+=text;
						}
						div.innerText = div.inputPrefix;
						window.getSelection().collapse(div.firstChild, div.inputPrefix.length);
					}else {
						if (!text.startsWith(div.inputPrefix)) {
							div.innerText = div.inputPrefix;
							window.getSelection().collapse(div.firstChild, div.inputPrefix.length);
						}
					}
				};
				window.getSelection().collapse(div.firstChild, div.innerText.length);
			}
			this.div.scrollTop = this.div.scrollHeight;
			div.focus();
			window.setTimeout(() => {
				div.focus();
				div.selectionStart = div.selectionEnd = this.inputPrefix.length;
			}, 0);
		}else if(this.host){
			this.host.sendRemoteMsg({
				msg:"StartInput",
				prefix:prefix,
				initText:initText,
				password:password
			});
		}
		this.isInputPassword=password;
	}
	
	//-----------------------------------------------------------------------
	//End text input:
	endInput(text){
		let div;
		if(this.div) {
			div=this.divInput;
			if(div) {
				div.contentEditable = false;
				div.style.backgroundColor = "rgba(0,0,0,0)";
				this.divInput = null;
			}
			this._outLine("", this.lastLine);
		}
		if(!this.emit("LineInput",text)) {
			this.stdin.push(text + "\n");
		}
	}
	
	//-----------------------------------------------------------------------
	//Set the "input" text
	setInputText(text){
		let div;
		div=this.divInput;
		if(!div){
			return;
		}
		if(div.inputPrefix){
			text=div.inputPrefix+text;
		}
		div.innerText=text;
		//移动光标到最后
		window.getSelection().collapse(div.firstChild,text.length);
	}
	
	//-----------------------------------------------------------------------
	//Get current "input" text:
	getInputText(){
		let text,div;
		div=this.divInput;
		if(!div){
			return null;
		}
		text= div.innerText;
		if(div.inputPrefix && text.startsWith(div.inputPrefix)){
			text=text.substring(div.inputPrefix.length);
		}
		return text;
	}
	
	//-----------------------------------------------------------------------
	//Handle key events:
	OnKeyDown(e){
		let div;
		div=this.divInput;
		this.emit("KeyDown",e);
		//console.log(e);
		switch(e.key)
		{
			case "c":{
				if(e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey){
					this.emit("KeyInExec","BreakCmd");
				}
				break;
			}
			case "Enter":{
				let cmd;
				if(div){
					//TODO: Shift按下时，不发送消息:
					let text;
					cmd=div.innerText;
					if(div.inputPrefix && cmd.startsWith(div.inputPrefix)){
						cmd=cmd.substring(div.inputPrefix.length);
					}
					text=this.getInputText();
					this.endInput(text);
					e.preventDefault();
					e.stopPropagation();
					return;
				}
				break;
			}
			case "ArrowDown":
			case "ArrowUp":
			case "Tab":{
				if(div){
					this.emit("ToolKey",e.key);
					e.preventDefault();
					e.stopPropagation();
					return;
				}
				break;
			}
		}
	}
	
	//-----------------------------------------------------------------------
	//Clear screen
	clear(){
		if(this.div) {
			this.div.innerHTML = "";
			this.lines.splice(0);
			this.lastLine = null;
			this.divInput = null;
			this._outLine("");
		}else if(this.host){
			this.host.sendRemoteMsg({
				msg:"tty",
				func:"clear",
				args:[]
			});
		}
	}
	
	//-----------------------------------------------------------------------
	//Clear a line by dir
	clearLine(dir){
		let line,curText;
		if(this.div) {
			line = this.cursorLine;
			if (!line) {
				return;
			}
			switch (dir) {
				case -1:
					curText = line.innerText;
					curText = curText.substring(this.cursorX);
					line.innerText = curText;
					this.cursorX = 0;
					break;
				case 1:
					curText = line.innerText;
					curText = curText.substring(0, this.cursorX);
					line.innerText = curText;
					break;
				default:
				case 0:
					line.innerText = "";
					break;
			}
		}else if(this.host){
			this.host.sendRemoteMsg({
				msg:"tty",
				func:"clearLine",
				args:[dir]
			});
		}
	}
	
	//-----------------------------------------------------------------------
	//Clear all text below cursor
	clearScreenDown(){
		let line,lines,idx,i,n,divLines;
		if(this.div) {
			line = this.cursorLine;
			lines = this.lines;
			divLines = this.div;
			if (!line) {
				this.clear();
				return;
			}
			idx = lines.indexOf(line);
			if (idx >= 0) {
				n = lines.length;
				for (i = idx + 1; i < n; i++) {
					divLines.removeChild(lines[i]);
				}
				lines.splice(idx + 1);
			}
			this.clearLine(1);
		}else if(this.host){
			//TODO: Code this:
		}
	}
	
	//-----------------------------------------------------------------------
	//Set cursor pos
	setCursorPos(x,y){
		let line;
		if(this.div) {
			if (y >= 0) {
				let lines, baseLine;
				lines = this.lines;
				line = lines[y] || this.lastLine;
			} else {
				line = this.cursorLine;
			}
			this.cursorLine = line;
			x = x < 0 ? 0 : x;
			x = x > line.innerText.length ? line.innerText.length : x;
			this.cursorX = x;
		}else if(this.host){
			//TODO: Code this:
		}
	}
	
	//-----------------------------------------------------------------------
	//Move cursor pos by delta size:
	moveCursor(dx,dy){
		let x,y;
		if(this.div) {
			if (this.cursorLine) {
				y = this.lines.indexOf(this.cursorLine);
				y += dy;
			}
			x = this.cursorX + dx;
			setCursorPos(x, y);
		}else if(this.host){
			//TODO: Code this:
		}
	}
	
	//-----------------------------------------------------------------------
	//Helper function to read quession answer from tty.
	readLine(caption,text=""){
		return new Promise((doneFunc,errFunc)=>{
			this.once("LineInput",(text)=>{
				doneFunc(text);
			});
			this.startInput(caption,0,text);
		})
	}
	
	//-----------------------------------------------------------------------
	//Helper function to read password from tty:
	readPassword(caption){
		return new Promise((doneFunc,errFunc)=>{
			this.once("LineInput",(text)=>{
				doneFunc(text);
			});
			this.startInput(caption,true);
		})
	}
	
	//-----------------------------------------------------------------------
	//get tab char-size:
	getTabSize(size){
		return this.segChNum;
	}

	//-----------------------------------------------------------------------
	//set tab char-size:
	setTabSize(size){
		this.segChNum=size;
		if(!this.div){
			this.host.sendHostMsg({
				msg:"tty",
				func:"setTabSize",
				args:[size]
			});
		}
	}
}

