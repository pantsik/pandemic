//Pandemic simulator by Panos Tsikogiannopoulos

const bk = 200;
const un = 0;
const sl = 255;
const slidersHeight = 100;
const txtSize = 15;
const padLeft = 30;
const padUp = 20;

let unitsNumber = 5;
let unitDiameter = 150;
let speed = 3;
let startingStep = 100; //uper limit = min(width, height) - unitDiameter
let startingInfected = 1;
let cureTime = 200;
let immunityProb = 0.5;
let deathProb = 0.1;

let sliderUnitsNumber, sliderUnitDiameter, sliderSpeed, sliderStep, sliderInfected, sliderCureTime, sliderImmunityProb, sliderDeathProb;
let units = [], infected = [];
let i, j, step, string, button;
let initUnitsNumber, initUnitDiameter, initSpeed, initStep, initInfected, initCureTime, initImmunityProb, initDeathProb;
let uninfectedCount, infectedCount, recoveredCount, deadCount;

function preload() {
  menuImg = loadImage("virus tile opac 170.jpg");
  menuFont = loadFont("dead.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  if (window.DeviceOrientationEvent) {
    window.addEventListener('orientationchange', reloadScript, false);
  }

  for (j = 0; j <= height / 1000; j++ ) {
    for (i = 0; i <= width / 1000; i++ ) {
      image(menuImg, i * 1000, j * 1000);
    }
  }

  fill(0);
  strokeWeight(7);
  stroke(255, 0, 0);
  textSize(70);
  textAlign(CENTER);
  textFont(menuFont);
  text("Pandemic Simulator", width / 2, 100);

  strokeWeight(2);
  //stroke(150, 150, 150);
  noStroke();
  textSize(25);
  if (width > height) {
    textSize(25);
      fill(0);
    circle(width*1/4, height/2, 50);
    text("Uninfected unit", width*1/4, height/2 + 60);
    fill(255, 0, 0);
    circle(width*2/4, height/2, 50);
    fill(0);
    text("Infected unit", width*2/4, height/2 + 60);
    fill(0, 0, 255);
    circle(width*3/4, height/2, 50);
    fill(0);
    text("Immune unit", width*3/4, height/2 + 60);
  } else {
    textSize(55);
    fill(0);
    circle(width/2, height*3/10, 100);
    text("Uninfected unit", width/2, height*3/10 + 120);
    fill(255, 0, 0);
    circle(width/2, height*5/10, 100);
    fill(0);
    text("Infected unit", width/2, height*5/10 + 120);
    fill(0, 0, 255);
    circle(width/2, height*7/10, 100);
    fill(0);
    text("Immune unit", width/2, height*7/10 + 120);
  }

  button0 = createButton("| START SIMULATION |");
  button0.position(width / 2, height - 100);
  //button0.style('font-family', "Dead Kansas Regular");
  button0.style('font-family', "Dead Kansas");
  button0.style('font-size', 3 + 'vw');
  button0.center('horizontal');
  button0.mousePressed(initializeSimulation);

  fill(255);
  strokeWeight(2);
  stroke(0);
  textSize(20);
  textFont('Arial');
  text("This simulator was made in JavaScript with p5 library by Panos Tsikogiannopoulos", width / 2, height - 20);

  noLoop();
}

function reloadScript() {
  location.reload();
}

function initializeSimulation() {
  strokeWeight(1);
  textSize(txtSize);
  textAlign(LEFT);
  textFont('Arial');

  button0.hide();
  initUnitsNumber = unitsNumber;
  initUnitDiameter = unitDiameter;
  initSpeed = speed;
  initStep = startingStep;
  initInfected = startingInfected;
  initCureTime = cureTime;
  initImmunityProb = immunityProb;
  initDeathProb = deathProb;
  sliderUnitsNumber = createSlider(2, 500, unitsNumber, 1);
  sliderUnitDiameter = createSlider(1, 200, unitDiameter, 1);
  sliderSpeed = createSlider(0.5, 5, speed, 0.5);
  sliderStep = createSlider(10, 500, startingStep, 10);
  sliderInfected = createSlider(1, 10, startingInfected, 1);
  sliderCureTime = createSlider(50, 550, cureTime, 50);
  sliderImmunityProb = createSlider(0, 1, immunityProb, 0.1);
  sliderDeathProb = createSlider(0, 1, deathProb, 0.1);
  sliderUnitsNumber.position(0 + padLeft, height - slidersHeight + 1);
  sliderUnitDiameter.position(width * 1/6 + padLeft, height - slidersHeight + 1);
  sliderSpeed.position(width * 2/6 + padLeft, height - slidersHeight + 1);
  sliderStep.position(width * 3/6 + padLeft, height - slidersHeight + 1);
  sliderInfected.position(0 + padLeft, height - slidersHeight / 2 + 1);
  sliderCureTime.position(width * 1/6 + padLeft, height - slidersHeight / 2 + 1);
  sliderImmunityProb.position(width * 2/6 + padLeft, height - slidersHeight / 2 + 1);
  sliderDeathProb.position(width * 3/6 + padLeft, height - slidersHeight / 2 + 1);
  //sliderUnitsNumber.style('width', '80px');

  button = createButton("Reset simulation");
  button.position(width - 90, height - slidersHeight + slidersHeight / 2 - 20);
  button.size(80, 40);
  button.mousePressed(resetSimulation);

  loop();
  resetSimulation();
}

function resetSimulation() {

  units = [];
  infected = [];
  counter = 0;
  [uninfectedCount, infectedCount, recoveredCount, deadCount] = [0, 0, 0, 0];

  if (startingInfected > unitsNumber) {
    startingInfected = unitsNumber;
  }
  for (i = 0; i < startingInfected; i++) {
    while(true) {
      let r = int(random(unitsNumber));
      if (! infected[r]) {
        infected[r] = true;
        break;
      }
    }
  }
  for (i = 0; i < unitsNumber; i++) {
    if (infected[i] == true) {
      units[i] = new Unit(true);
      units[i].infectedOnce = true;
      infectedCount++;
    } else {
      units[i] = new Unit(false);
      uninfectedCount++;
    }
    step = int((startingStep / unitsNumber) * (i + 1));
    units[i].genarateRandomDestination();
  }
}

function draw() {
  if (isLooping()) {

    background(bk, bk, bk);
    stroke(0);
    fill(sl);
    rect(0, height - slidersHeight + 1, width, slidersHeight - 1);
    line(width * 4/6 + 1.5 * padLeft, height - slidersHeight + 1, width * 4/6 + 1.5 * padLeft, height);
    noStroke();

    fill(0);
    string = " number of units " + sliderUnitsNumber.value();
    text(string, 0 + padLeft, height - slidersHeight + txtSize + padUp);
    string = " available space " + sliderUnitDiameter.value();
    text(string, width * 1/6 + padLeft, height - slidersHeight + txtSize + padUp);
    string = " travel speed " + sliderSpeed.value();
    text(string, width * 2/6 + padLeft, height - slidersHeight + txtSize + padUp);
    string = " travel distance " + sliderStep.value();
    text(string, width * 3/6 + padLeft, height - slidersHeight + txtSize + padUp);
    string = " initially infected " + sliderInfected.value();
    text(string, 0 + padLeft, height - slidersHeight / 2 + txtSize + padUp);
    string = " infect. period " + cureTime; //sliderCureTime.value();
    text(string, width * 1/6 + padLeft, height - slidersHeight / 2 + txtSize + padUp);
    string = " immunity prob. " + immunityProb;
    text(string, width * 2/6 + padLeft, height - slidersHeight / 2 + txtSize + padUp);
    string = " death probability " + deathProb;
    text(string, width * 3/6 + padLeft, height - slidersHeight / 2 + txtSize + padUp);

    string = "uninfected: " + (uninfectedCount * 100 / unitsNumber).toFixed(0) + "%";
    text(string, width * 4.2/6 + padLeft, height - slidersHeight / 0.87 + txtSize + padUp);
    string = "infected: " + (infectedCount * 100 / unitsNumber).toFixed(0) + "%";
    text(string, width * 4.2/6 + padLeft, height - slidersHeight / 1.1 + txtSize + padUp);
    string = "recovered: " + (recoveredCount * 100 / unitsNumber).toFixed(0) + "%";
    text(string, width * 4.2/6 + padLeft, height - slidersHeight / 1.47 + txtSize + padUp);
    string = "dead: " + (deadCount * 100 / unitsNumber).toFixed(0) + "%";
    text(string, width * 4.2/6 + padLeft, height - slidersHeight / 2.2 + txtSize + padUp);

    unitsNumber = sliderUnitsNumber.value();
    unitDiameter = 202 - sliderUnitDiameter.value();
    speed = sliderSpeed.value();
    startingStep = sliderStep.value();
    startingInfected = sliderInfected.value();
    cureTime = sliderCureTime.value();
    immunityProb = sliderImmunityProb.value();
    deathProb = sliderDeathProb.value();
    if (unitDiameter > min(width, height) / 2) {
      unitDiameter = min(width, height) / 2;
    }
    if (startingStep > (min(width, height) - unitDiameter - 10) / 2) { // prevents the case that every point of target circle circumference to be outside of screen
      startingStep = (min(width, height) - unitDiameter - 10) / 2;
    }
    if (startingInfected > unitsNumber) {
      startingInfected = unitsNumber;
    }
    if (cureTime == 550) {
      cureTime = Infinity;
    }
    if (initUnitsNumber != unitsNumber ||
      initUnitDiameter != unitDiameter ||
      initSpeed != speed ||
      initStep != startingStep ||
      initInfected != startingInfected ||
      initCureTime != cureTime ||
      initImmunityProb != immunityProb ||
      initDeathProb != deathProb) {
          initUnitsNumber = unitsNumber;
          initUnitDiameter = unitDiameter;
          initSpeed = speed;
          initStep = startingStep;
          initInfected = startingInfected;
          initCureTime = cureTime;
          initImmunityProb = immunityProb;
          initDeathProb = deathProb;
          resetSimulation();
    }

    for (i = 0; i < units.length; i++) {
      if (units[i].dead) {
        units.splice(i, 1);
        continue;
      }

      units[i].update();
      units[i].show();

      if (units[i].infection) { // if current unit is infected
        for (j = 0; j < units.length; j++) {
          if (i != j && ! units[j].infection && ! units[j].immunity) { // If it is compared with another unit which is not infected and not immuned
            if (sqrt(pow(units[i].x - units[j].x, 2) + pow(units[i].y - units[j].y, 2)) < unitDiameter) { // If the distance between the two units is less than a unit's diameter
              units[j].infection = true;
              if (! units[j].infectedOnce) { // First time infected
                units[j].infectedOnce = true;
                uninfectedCount--;
                infectedCount++;
              } else { // More than once infected
                recoveredCount--;
                infectedCount++;
              }
              units[j].counter = 0;
            }
          }
        }
      }
    }
  }
}

class Unit {
  constructor(inf) {
    this.infection = inf;
    this.infectedOnce = false;
    this.counter = 0;
    this.immunity = false;
    this.dead = false;
    this.deathProbability = random(1);
    this.x = random(unitDiameter/2, width - unitDiameter/2);
    this.y = random(unitDiameter/2, height - slidersHeight - unitDiameter/2);
  }

  update() {
    if (abs(this.curr_x - this.target_x) < speed/2 && abs(this.curr_y - this.target_y) < speed/2) { // If unit has reached the target point
      this.genarateRandomDestination();
    }
    this.curr_x += this.dx * speed;
    this.curr_y += this.dy * speed;
    this.x += this.dx * speed;
    this.y += this.dy * speed;
  }

  show() {
    fill(bk, bk, bk);
    //circle(this.x - this.dx * speed, this.y - this.dy * speed, unitDiameter + 1); // clears the old unit
    if (this.infection) {
      if (cureTime != Infinity) {
        this.counter++;
        if ((cureTime - this.counter) / (cureTime / 3) > 2) {
          fill(255, 0, 0);
        } else if ((cureTime - this.counter) / (cureTime / 3) > 1) {
          if (this.deathProbability < deathProb) { // This unit dies
            this.dead = true;
            infectedCount--;
            deadCount++;
            this.infectedOnce = false;
            fill(bk, bk, bk);
          } else {
            fill(178, 0, 0);
          }
        } else {
          fill(100, 0, 0);
        }
        if (this.counter == cureTime) { // This unit is cured
          this.infection = false;
          infectedCount--;
          recoveredCount++;
          this.counter = 0;
          this.deathProbability = random(1);
          if (random(1) < immunityProb) {
            this.immunity = true;
          }
        }
      } else {
        fill(255, 0, 0);
      }
    } else { // This unit is not infected
      if (this.immunity) {
        fill(0, 0, 255);
      } else {
        fill(un, un, un);
      }
    }
    //stroke(255);
    circle(this.x, this.y, unitDiameter); // shows the new unit
  }

  genarateRandomDestination() {
    this.curr_x = 0;
    this.curr_y = 0;
    this.theta = random(TWO_PI);
    this.dx = cos(this.theta);
    this.dy = sin(this.theta);
    if (this.x + this.dx * step + unitDiameter/2 <= width && this.x + this.dx * step - unitDiameter/2 >= 0 && this.y + this.dy * step + unitDiameter/2 <= height - slidersHeight && this.y + this.dy * step - unitDiameter/2 >= 0) {
      //this.stack = 0;
      this.target_x = this.dx * step;
      this.target_y = this.dy * step;
    } else { // The new target is out of the canvas limits
      this.curr_x = 0;
      this.curr_y = 0;
      this.genarateRandomDestination();
    }
  }
}
