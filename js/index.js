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
let cellsX = 7;
let cellsY = 9;
let cellWidth = (x - x / 5) / cellsX;
let cellHeight = (y - y / 5) / cellsY;
let colorsLeft = getRGBlerpRangeInOklabSpace('FBCEE9', 'ED40B8', cellsY);
let colorsRight = getRGBlerpRangeInOklabSpace('A4A2F8', '3A4199', cellsY);
let cellSelected = null;
let xInterp = [];
let yInterp = [];
let scInterp = [];
let moves = 0;

// Add two containers to center things on the page, so one set will always be on top
const container = new PIXI.Container();
container.x = x / 10;
container.y = y / 10 + y / 20;
app.stage.addChild(container);

const topContainer = new PIXI.Container();
topContainer.x = x / 10;
topContainer.y = y / 10 + y / 20;
app.stage.addChild(topContainer);


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
    }
  }
}

function cellClicked(e){
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

function randColors(){
  let deltaColor = 0.7;
  let color1 = {
    'L': Math.random(),
    'a': Math.random() * 0.6 - 0.3,
    'b': Math.random() * 0.5 - 0.25
  };
  let color2 = {
    'L': color1.L + Math.random() * deltaColor - deltaColor * 0.25,
    'a': color1.a + Math.random() * deltaColor - deltaColor / 2,
    'b': color1.b + Math.random() * deltaColor - deltaColor / 2
  };
  let color3 = {
    'L': color1.L + Math.random() * deltaColor - deltaColor * 0.25,
    'a': color1.a + Math.random() * deltaColor - deltaColor / 2,
    'b': color1.b + Math.random() * deltaColor - deltaColor / 2
  };
  let color4 = {
    'L': color1.L + Math.random() * deltaColor - deltaColor * 0.25,
    'a': color1.a + Math.random() * deltaColor - deltaColor / 2,
    'b': color1.b + Math.random() * deltaColor - deltaColor / 2
  };
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
  moves = 0;
  cellSelected = null;
  
  randColors();
  
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
    currentRef.x = newVal;
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
    currentRef.y = newVal;
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
    currentRef.graphics.scale.set(newVal);
  }
  xInterp = xInterp.filter(Boolean);
  yInterp = yInterp.filter(Boolean);
  scInterp = scInterp.filter(Boolean);
});

setup();