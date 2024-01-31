// Create the application helper and add its render target to the page
let app = new PIXI.Application({ resizeTo: window });
      document.body.appendChild(app.view);

class Cell extends PIXI.Container {
  constructor(color, x, y, locked, graphics){
    super();
    this.color = color;
    this.currentX = x;
    this.trueX = x;
    this.currentY = y;
    this.trueY = y;
    this.locked = locked;
    this.selected = false;
    this.graphics = graphics;
    this.anim = 0;
  }
}

//i wish i were programmery enough to make this more extensible
class Interpolation{
  constructor(start, stop, length, ref){
    this.start = start;
    this.stop = stop;
    this.length = length;
    this.startTime = elapsed;
    this.stopTime = elapsed + length;
    this.ref = ref;
  }
  get(time){
    let timeSinceStart = time - this.startTime;
    let proportion = 1 - (Math.cos(3.142 * timeSinceStart / this.length) + 1) / 2;
    
    if (time > this.stopTime){
      for (let i in xInterp){
        if (xInterp[i] === this){
          xInterp[i] = null;
        }
      }
      for (let i in yInterp){
        if (yInterp[i] === this){
          yInterp[i] = null;
        }
      }
      for (let i in scInterp){
        if (scInterp[i] === this){
          scInterp[i] = null;
        }
      }
      return this.stop;
    } else {
      return this.start + ((this.stop - this.start) * proportion);
    }
  }
}

function rgbLerpThroughOklab(rgbStart, rgbEnd, steps, step){
  return getRGBlerpRangeInOklabSpace(rgbStart, rgbEnd, steps)[step];
}

// we'll be referring to screen dimensions a lot, todo add resize listener
let x = app.screen.width;
let y = app.screen.height;

let cells = [];
let cellsX = 6;
let cellsY = 7;
let cellWidth = (x - x / 5) / cellsX;
let cellHeight = (y - y / 5) / cellsY;
let colorsLeft = getRGBlerpRangeInOklabSpace('FBCEE9', 'ED40B8', cellsY);
let colorsRight = getRGBlerpRangeInOklabSpace('A4A2F8', '3A4199', cellsY);
let cellSelected = null;
let xInterp = [];
let yInterp = [];
let scInterp = [];
let moves = 0;
let epsilon = 1;

function setDisplay(){
  x = app.screen.width;
  y = app.screen.height;
  
  if (Math.min(x, y) == x){
    cellWidth = x - x / 5;
    cellHeight = 16 / 9 * cellWidth;
    cellWidth /= cellsX;
    cellHeight /= cellsY;
    
 
  } else {
    cellHeight = y - y / 5;
    cellWidth = 9 / 16 * cellHeight;
    cellWidth /= cellsX;
    cellHeight /= cellsY;
    
  }
  container.x = x / 2 - (cellWidth * cellsX / 2);
  container.y = y / 2 - (cellHeight * cellsY / 2);
    
  topContainer.x = container.x;
  topContainer.y = container.y;
  menuWidth = x / 2;
  buttonHeight = y / 10;
  menu.x = - menuWidth;
  menuPane.clear();
  menuPane.beginFill('#888');
  menuPane.drawRect(0,0,menuWidth,y);
  menuButton.clear();
  menuButton.beginFill('#888');
  menuButton.drawRect(menuWidth * 1.04, x * 0.02, buttonHeight, buttonHeight);
  menuNewGame.clear();
  menuNewGame.beginFill('#444');
  menuNewGame.drawRect(0, 0, menuWidth, buttonHeight - epsilon);
  textNg.x = menuWidth / 2;
  textNg.y = buttonHeight / 2;
  textNg.pivot.set(textNg.width / 2, textNg.height / 2);
  menuWidthPlus.clear();
  menuWidthPlus.beginFill('#666');
  menuWidthPlus.x = menuWidth * 2 / 3;
  menuWidthPlus.y = buttonHeight;
  menuWidthPlus.drawRect(0, 0, menuWidth / 3, buttonHeight - epsilon);
  
  textWidthPlus.x = menuWidth  / 6;
  textWidthPlus.y = buttonHeight / 2;
  textWidthPlus.pivot.set(textWidthPlus.width / 2, textWidthPlus.height / 2);
  menuWidthMinus.clear();
  menuWidthMinus.beginFill('#666');
  menuWidthMinus.y = buttonHeight;
  menuWidthMinus.drawRect(0, 0, menuWidth / 3, buttonHeight - epsilon);
  
  textWidthMinus.x = menuWidth  / 6;
  textWidthMinus.y = buttonHeight / 2;
  textWidthMinus.pivot.set(textWidthMinus.width / 2, textWidthMinus.height / 2);
  
  menuHeightPlus.clear();
  menuHeightPlus.beginFill('#666');
  menuHeightPlus.x = menuWidth * 2 / 3;
  menuHeightPlus.y = buttonHeight * 2;
  menuHeightPlus.drawRect(0, 0, menuWidth / 3, buttonHeight - epsilon);
  textHeightPlus.x = menuWidth / 6;
  textHeightPlus.y = buttonHeight / 2;
  textHeightPlus.pivot.set(textHeightPlus.width / 2, textHeightPlus.height / 2);
  menuHeightMinus.clear();
  menuHeightMinus.beginFill('#666');
  menuHeightMinus.y = buttonHeight * 2;
  menuHeightMinus.drawRect(0, 0, menuWidth / 3, buttonHeight - epsilon);
  textHeightMinus.x = menuWidth / 6;
  textHeightMinus.y = buttonHeight / 2;
  textHeightMinus.pivot.set(textHeightMinus.width / 2, textHeightMinus.height / 2);
  
  textSize.x = menuWidth / 2;
  textSize.y = buttonHeight * 2;
  textSize.pivot.set(textSize.width / 2, textSize.height / 2);
}

let winText = new PIXI.Text(`completed in ${moves} moves`, {
     fontFamily: 'Arial',
     fontSize: 24,
     fill: 0xffddee,
     align: 'center',
 });
winText.pivot.set(winText.width / 2, winText.height / 2);
winText.x = x / 2;
winText.y = y / 15;
winText.visible = false;
app.stage.addChild(winText);

// Add two containers to center things on the page, so one set will always be on top
const container = new PIXI.Container();
container.x = x / 10;
container.y = y / 10 + y / 20;
app.stage.addChild(container);

const topContainer = new PIXI.Container();
topContainer.x = x / 10;
topContainer.y = y / 10 + y / 20;
app.stage.addChild(topContainer);


function menuSwip(){
  if (menuActive){
    xInterp.push(new Interpolation(0, - menuWidth, 20, menu));
    menuActive = false;
  } else {
    xInterp.push(new Interpolation(- menuWidth, 0, 20, menu));
    menuActive = true;
  }
}


//all this is menu shit lol
const menu = new PIXI.Container();
menuWidth = x / 2;
menuActive = false;
app.stage.addChild(menu);
menuPane = new PIXI.Graphics();
menu.addChild(menuPane);
menuButton = new PIXI.Graphics();
menu.addChild(menuButton);
menuButton.on('pointerup', menuSwip);
menuButton.eventMode = 'dynamic';

buttonHeight = y / 10;

menuNewGame = new PIXI.Graphics();

menu.addChild(menuNewGame);
menuNewGame.on('pointerup', setup);
menuNewGame.eventMode = 'dynamic';
const textNg = new PIXI.Text('new game', {
     fontFamily: 'Roboto',
     fontSize: 18,
     fill: 0xcccccc,
     align: 'center',
 });
menu.addChild(textNg);


menuWidthPlus = new PIXI.Graphics();

menu.addChild(menuWidthPlus);
menuWidthPlus.on('pointerup', widthPlus);
menuWidthPlus.eventMode = 'dynamic';
const textWidthPlus = new PIXI.Text('+', {
     fontFamily: 'Roboto',
     fontSize: 18,
     fill: 0xcccccc,
     align: 'center',
 });

menuWidthPlus.addChild(textWidthPlus);

menuWidthMinus = new PIXI.Graphics();

menu.addChild(menuWidthMinus);
menuWidthMinus.on('pointerup', widthMinus);
menuWidthMinus.eventMode = 'dynamic';
const textWidthMinus = new PIXI.Text('-', {
     fontFamily: 'Roboto',
     fontSize: 18,
     fill: 0xcccccc,
     align: 'center',
 });
menuWidthMinus.addChild(textWidthMinus);

menuHeightPlus = new PIXI.Graphics();

menu.addChild(menuHeightPlus);
menuHeightPlus.on('pointerup', heightPlus);
menuHeightPlus.eventMode = 'dynamic';
const textHeightPlus = new PIXI.Text('+', {
     fontFamily: 'Roboto',
     fontSize: 18,
     fill: 0xcccccc,
     align: 'center',
 });

menuHeightPlus.addChild(textHeightPlus);

menuHeightMinus = new PIXI.Graphics();

menu.addChild(menuHeightMinus);
menuHeightMinus.on('pointerup', heightMinus);
menuHeightMinus.eventMode = 'dynamic';
const textHeightMinus = new PIXI.Text('-', {
     fontFamily: 'Roboto',
     fontSize: 18,
     fill: 0xcccccc,
     align: 'center',
 });

menuHeightMinus.addChild(textHeightMinus);



const textSize = new PIXI.Text(String(cellsX + '×' + cellsY), {
     fontFamily: 'Roboto',
     fontSize: 20,
     fill: 0xcccccc,
     align: 'center',
 });

menu.addChild(textSize);



function widthPlus(){
  cellsX++;
  textSize.text = String(cellsX + '×' + cellsY);
}

function widthMinus(){
  cellsX--;
  textSize.text = String(cellsX + '×' + cellsY);
}

function heightPlus(){
  cellsY++;
  textSize.text = String(cellsX + '×' + cellsY);
}

function heightMinus(){
  cellsY--;
  textSize.text = String(cellsX + '×' + cellsY);
}


function checkIfSolved(){
  for (let i in cells){
    if (cells[i].trueX != cells[i].currentX || cells[i].trueY != cellsi[i].currentY){
      
    }
  }
  //u won!
  
}

function swapCells(cell1, cell2, auto = false){
  if (!cell1.locked && !cell2.locked){
    xInterp.push(new Interpolation(cell1.x, (0.5 + cell2.currentX) * cellWidth, 12, cell1));
    yInterp.push(new Interpolation(cell1.y, (0.5 + cell2.currentY) * cellHeight, 12, cell1));
  
    xInterp.push(new Interpolation(cell2.x, (0.5 + cell1.currentX) * cellWidth, 12, cell2));
    yInterp.push(new Interpolation(cell2.y, (0.5 + cell1.currentY) * cellHeight, 12, cell2));
  
    let cell1CurrentX = cell1.currentX;
    let cell1CurrentY = cell1.currentY;
  
    cell1.currentX = cell2.currentX;
    cell1.currentY = cell2.currentY;
  
    cell2.currentX = cell1CurrentX;
    cell2.currentY = cell1CurrentY;
    
    if (!auto){ 
      moves++;
      //check if solved
      for (let i in cells){
        if (cells[i].trueX != cells[i].currentX || cells[i].trueY != cells[i].currentY){
        return;
        }
      }
      //u won!
      console.log("completed in " + moves + " moves");
      winText.text = `completed in ${moves} moves`;
      winText.visible = true;
    }
  }
}

function cellClicked(e){
  if (!menuActive){
  console.log('clicked ' + this.parent.currentX + ', ' + this.parent.currentY);
  if (!cellSelected){
    if (!this.parent.locked){
      cellSelected = this.parent;
      this.parent.selected = true;
      cellSelected.scale.set(1.25);
      cellSelected.setParent(topContainer);
    }
  } else if (cellSelected === this.parent) {
    cellSelected.selected = false;
    cellSelected.scale.set(1.00);
    cellSelected.rotation = 0.0;
    cellSelected.setParent(container);
    cellSelected = null;
  } else {
    swapCells(this.parent, cellSelected);
    cellSelected.selected = false;
    cellSelected.scale.set(1.00);
    cellSelected.rotation = 0.0;
    cellSelected.setParent(container);
    this.parent.setParent(container);
    cellSelected = null;
  }
  }
}

function distanceColors(color1, color2){
  deltaColor = {
    'L': color1.L - color2.L,
    'a': color1.a - color2.a,
    'b': color1.b - color2.b
  }
  let minDelta = 0.3;
  
  let [lowestItems] = Object.entries(deltaColor).sort(([ ,v1], [ ,v2]) => v1 - v2);
  if (color1[lowestItems[0]] > 0){
    color2[lowestItems[0]] = - minDelta;
  } else {
    color2[lowestItems[0]] = minDelta;
  }
  return color2;
}

function randColor(baseColor){
  let rndScale = 0.7;
  let minDelta = 0.3;
  let deltaColor = {
    'L': Math.random() * rndScale - rndScale * 0.25,
    'a': Math.random() * rndScale - rndScale / 2,
    'b': Math.random() * rndScale - rndScale / 2
  };
  
  return {
    'L': baseColor.L + deltaColor.L,
    'a': baseColor.a + deltaColor.a,
    'b': baseColor.b + deltaColor.b
  };
}

function randColors(){
  let deltaColor = 0.7;
  
  let color1 = {
    'L': Math.random(),
    'a': Math.random() * 0.6 - 0.3,
    'b': Math.random() * 0.5 - 0.25
  };
  let color2 = randColor(color1);
  let color3 = randColor(color1);
  let color4 = randColor(color1);
  
  distanceColors(color1, color2);
  distanceColors(color2, color3);
  //distanceColors(color3, color4);
  distanceColors(color4, color2);
  //distanceColors(color4, color1);
  
  colorsLeft = getRGBlerpRangeInOklabSpace(rgbToHex(oklabToSRGB(color1)),
    rgbToHex(oklabToSRGB(color2)), cellsY);
    
  colorsRight = getRGBlerpRangeInOklabSpace(rgbToHex(oklabToSRGB(color3)),
    rgbToHex(oklabToSRGB(color4)), cellsY);
    
}


function setup(){
  
  //lets clean up
  for (let i in cells){
    cells[i].destroy();
  }
  
  cells = [];
  
  moves = 0;
  cellSelected = null;
  
  randColors();
  
  winText.visible = false;
  
  setDisplay();
  
  if (menuActive){
    //xInterp.push(new Interpolation(0, - menuWidth, 20, menu));
    menuActive = false;
  }
  
  //lets make some cells
  for(let i = 0; i < cellsX; i++){
    for(let j = 0; j < cellsY; j++){
      let cellLocked = false;
      if ((i == 0 || i == cellsX - 1) && (j == 0 || j == cellsY - 1)) { cellLocked = true; }
    
      let obj = new PIXI.Graphics();
    
      //make the cell with its color, x, y, locked status, and graphics object added to it
      cells[i * cellsY + j] = new Cell(
        rgbLerpThroughOklab(rgbToHex(colorsLeft[j]), rgbToHex(colorsRight[j]), cellsX, i),
        i, j, cellLocked, obj);
    
      //move the cell into position adjusted for pivot
      cells[i * cellsY + j].x = i * cellWidth + cellWidth / 2;
      cells[i * cellsY + j].y = j * cellHeight + cellHeight / 2;
    
      //draw the rectangle
      obj.beginFill(cells[i * cellsY + j].color);
      obj.drawRect(cellWidth / 2, cellHeight / 2, cellWidth, cellHeight);
      if (cellLocked){
        obj.beginFill('white');
        obj.drawCircle(cellWidth, cellHeight, cellHeight * 0.05);
      }
    
    
      obj.on('pointerup', cellClicked);
      obj.eventMode = 'dynamic';
  
      // Add it to the stage to render
      cells[i * cellsY + j].addChild(obj);
      container.addChild(cells[i * cellsY + j]);
    
      //some initial settings
      obj.parent.pivot.set(cellWidth, cellHeight);
      obj.scale.set(0);
      elapsed = 0.0;
    }
  }
}


let elapsed = 0.0;
// Add a ticker callback to move the sprite back and forth
app.ticker.add((delta) => {
  elapsed += delta;
  
  if (cellSelected){
    cellSelected.rotation = 0.0 + Math.sin(elapsed/ 7.0) / 8;
  }
  
  if (elapsed < 350){
    for (let i in cells){
      if (cells[i].anim == 0 && elapsed > i){
        scInterp.push(new Interpolation(0, 1, 30, cells[i]));
        cells[i].anim++;
      }
      if (cells[i].anim == 1 && elapsed - 120 > i && !cells[i].locked){
        scInterp.push(new Interpolation(1, 0, 20, cells[i]));
        cells[i].anim++;
      }
      if (cells[i].anim == 2 && elapsed - 190 > i ){
        swapCells(cells[i], cells[Math.floor(Math.random() * cells.length)], true);
        cells[i].anim++;
      }
      if (cells[i].anim == 3 && elapsed - 240 > i && !cells[i].locked){
        scInterp.push(new Interpolation(0, 1, 20, cells[i]));
        cells[i].anim++;
      }
    }
  }
  
  for (let i in xInterp){
    let currentRef = xInterp[i].ref;
    let fallback = xInterp[i].stop;
    let newVal = 0;
    try {
      newVal = xInterp[i].get(elapsed);
    } catch {
      newVal = fallback;
    }
    try {
      currentRef.x = newVal;
    } catch {}
  }
  for (let i in yInterp){
    let currentRef = yInterp[i].ref;
    let fallback = yInterp[i].stop;
    let newVal = 0;
    try {
      newVal = yInterp[i].get(elapsed);
    } catch {
      newVal = fallback;
    }
    try{ currentRef.y = newVal;}
    catch{}
  }
  for (let i in scInterp){
    let currentRef = scInterp[i].ref;
    let fallback = scInterp[i].stop;
    let newVal = 1;
    try {
      newVal = scInterp[i].get(elapsed);
    } catch {
      newVal = fallback;
    }
    try{ currentRef.graphics.scale.set(newVal); }
    catch{}
  }
  xInterp = xInterp.filter(Boolean);
  yInterp = yInterp.filter(Boolean);
  scInterp = scInterp.filter(Boolean);
});

setup();