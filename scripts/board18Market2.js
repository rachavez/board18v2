/* 
 * The board18Market2 file contains startup functions 
 * 
 * Copyright (c) 2013 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

/* Function makeTrays() initializes all of the tray objects.
 * It calls the TokenSheet constructor for each mtok sheet.   
 * It also adds the trayNumb to each new tray object.
 * Finally it initializes BD18.curTrayNumb to 0 and 
 * BD18.trayCount to the number of tray objects.
 */
function makeTrays() {
  var sheets = BD18.bx.tray;
  var i=0;
  var images = BD18.tsImages;
  for (var ix=0;ix<sheets.length;ix++) {
    if(sheets[ix].type === 'mtok') {
      BD18.trays[i] = new TokenSheet(images[ix],sheets[ix]);
      BD18.trays[i].trayNumb = i;
      i++;
    }
  }
  BD18.curTrayNumb = 0;
  BD18.trayCount = i;
  registerTrayMenu();
}

/* This function initializes the BD18.marketTokens array.
 * It calls the MarketToken constructor for each token in 
 * BD18.gm.mktTks array and adds the new object to the
 * BD18.marketTokens array.
 */
function makeMktTokenList(){
  BD18.marketTokens = [];
  if (BD18.gm.mktTks.length === 0) return;
  var token,sn,ix,flip,stack,bx,by;
  for(var i=0;i<BD18.gm.mktTks.length;i++) {
    sn = BD18.gm.mktTks[i].sheetNumber;
    ix = BD18.gm.mktTks[i].tokenNumber;
    flip = BD18.gm.mktTks[i].flip;
//  stack = BD18.gm.mktTks[i].stack;
    stack = (typeof BD18.gm.mktTks[i].stack!=='undefined')
             ? BD18.gm.mktTks[i].stack : 0;
    bx = BD18.gm.mktTks[i].xCoord;
    by = BD18.gm.mktTks[i].yCoord;
    token = new MarketToken(sn,ix,flip,stack,bx,by);
    BD18.marketTokens.push(token);
  }
}

/*
 * Function trayCanvasApp calls the trays.place() 
 * method for the current token sheet object.  
 * This sets up the tray Canvas. 
 */

function trayCanvasApp() {
  BD18.trays[BD18.curTrayNumb].place(null);
}

/* Function mainCanvasApp calls the stockMarket.place() method.
 * This sets up the main Canvas.  
 */
function mainCanvasApp(){
  BD18.stockMarket.place();
}

/* Function toknCanvasApp places all existing tokens 
 * on the stock market using the BD18.marketTokens array.
 * 
 */
function toknCanvasApp(keepBoxSelect){
  BD18.stockMarket.clear2(keepBoxSelect);
  if (BD18.marketTokens.length === 0) {
    return;
  }
  var token;
  for(var i=0;i<BD18.marketTokens.length;i++) {
    if (!(i in BD18.marketTokens)) {
      continue;
    }
    token = BD18.marketTokens[i];
    token.place();
  }
}

/* Function CanvasApp initializes all canvases.
 * It then calls trayCanvasApp and mainCanvasApp.
 */
function canvasApp()
{
  var hh = parseInt(BD18.stockMarket.height, 10);
  var ww = parseInt(BD18.stockMarket.width, 10);
  $('#content').css('height', hh); 
  $('#content').css('width', ww);     
  $('#canvas1').prop('height', hh); 
  $('#canvas1').prop('width', ww); 
  $('#canvas2').prop('height', hh); 
  $('#canvas2').prop('width', ww); 
  BD18.canvas0 = document.getElementById('canvas0');
  if (!BD18.canvas0 || !BD18.canvas0.getContext) {
    return;
  }
  BD18.context0 = BD18.canvas0.getContext('2d');
  if (!BD18.context0) {
    return;
  }
  BD18.canvas1 = document.getElementById('canvas1');
  if (!BD18.canvas1 || !BD18.canvas1.getContext) {
    return;
  }
  BD18.context1 = BD18.canvas1.getContext('2d');
  if (!BD18.context1) {
    return;
  }
  BD18.canvas2 = document.getElementById('canvas2');
  if (!BD18.canvas2 || !BD18.canvas2.getContext) {
    return;
  }
  BD18.context2 = BD18.canvas2.getContext('2d');
  if (!BD18.context2) {
    return;
  }
  trayCanvasApp();
  mainCanvasApp();
  toknCanvasApp();
}
  
/* Startup Event Handler and Callback Functions.  */

/* This function is an event handler for the game box images.
 * It calls makeTrays, makeBdTileList, canvasApp and 
 * delayCheckForUpdate after all itemLoaded events have occured.
 */
function itemLoaded(event) {
  BD18.loadCount--;
  if (BD18.doneWithLoad === true && BD18.loadCount <= 0) {
    BD18.stockMarket = new StockMarket(BD18.mktImage,BD18.bx.market);
    makeTrays();
    makeMktTokenList();
    canvasApp();
    delayCheckForUpdate();
  }
}

/* The loadLinks function is called by loadBox and getLinks
 * functions to add game links to the "Useful Links" sub-menu
 */
function loadLinks(newLinks) {
  var linkMenu = document.getElementById('linkMenu');
  for(var i=0; i<newLinks.length; i++) {
    var link = document.createElement('li');
    link.appendChild(document.createTextNode(newLinks[i].link_name));
    link.setAttribute("onclick", 
      "$('#mainmenu').hide();window.open('"+newLinks[i].link_url+"');");
    linkMenu.insertBefore(link, linkMenu.firstChild);
  }

}

/* The loadBox function is a callback function for
 * the gameBox.php getJSON function.
 * It loads all the game and game box links.
 * It loads all the game box images. 
 */
function loadBox(box) {
  BD18.bx = null;
  BD18.bx = box;
  if (typeof(box.links) !== 'undefined' && box.links.length > 0) {
    loadLinks(box.links);
  }
  $.getJSON("php/linkGet.php", 'gameid='+BD18.gameID,function(data) {
    if (data.stat == "success" && typeof(data.links) !== 'undefined' 
        && data.links.length > 0) { loadLinks(data.links); }
  });
  var market = BD18.bx.market;
  var sheets = BD18.bx.tray;
  BD18.mktImage = new Image();
  BD18.mktImage.src = market.imgLoc;
  BD18.mktImage.onload = itemLoaded; 
  BD18.loadCount++ ;
  BD18.tsImages = [];
  var ttt = sheets.length;
  for(var i=0; i<ttt; i++) {
    BD18.tsImages[i] = new Image();
    BD18.tsImages[i].src = sheets[i].imgLoc;
    BD18.tsImages[i].onload = itemLoaded;
    BD18.loadCount++;
  }
  BD18.doneWithLoad = true;
  itemLoaded(); // Just in case onloads are very fast.
}

/* The loadSession function is a callback function for
 * the gameSession.php getJSON function. It finds and
 * loads the game box file.
 */
function loadSession(session) {
  BD18.gm = null;
  BD18.gm = session;
  if( !BD18.doneWithLoad ){
	BD18.history = [JSON.stringify(BD18.gm)];
	BD18.historyPosition = 0;
	var boxstring = 'box=';
	boxstring = boxstring + BD18.gm.boxID;
	$.getJSON("php/gameBox.php", boxstring, loadBox)
	    .error(function() { 
		    var msg = "Error loading game box file. \n";
		    msg = msg + "This is probably due to a game box format error.";
		    alert(msg); 
	    });
  } else {
	itemLoaded();
  }
}

