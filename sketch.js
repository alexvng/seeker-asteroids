let asteroids = [];
let seekers = [];
let NUM_ASTEROIDS;
let NUM_SEEKERS = 1;
let PAUSE_FLAG = false;
let CHAOS_GRAPHICS = false;

function setup() {
  // adapt canvas to screen size
  createCanvas(window.innerWidth, window.innerHeight);

  // adapt # of asteroids to screen size
  NUM_ASTEROIDS = Math.floor((width + height) / 40); //TODO magic number

  // loop-create all asteroids, w/ random parameters
  for (let i = 0; i < NUM_ASTEROIDS; i++) {
    asteroids.push(
      new Asteroid(
        random(width), // spawn position x,y
        random(height),
        random(-0.5, 0.5), // velocity x,y
        random(-0.5, 0.5),
        Math.floor(random(3, 8)), // # of sides
        random(10, 50), // size
        random(-0.01, 0.01) // rotational speed
      )
    );
  }

  // loop-create all seekers
  for (let i = 0; i < NUM_SEEKERS; i++) {
    // random spawn position x,y
    seekers.push(new Seeker(random(width), random(height)));
  }

  // drawing parameters
  strokeWeight(2);
  fill(255);
}

function draw() {
  if (!CHAOS_GRAPHICS) {
    background(100);
  } // else disable background, so sprites don't get cleaned up =>

  text("Click to pause - press SPACE to change graphics mode", 10, 20);

  asteroids.forEach((a) => {
    if (!a.isDead) {
      a.update();
      a.render();
    } else if (!a.hasConverted) {
      // spawn new seekers, proportional to numFaces of dead asteroid
      for (let j = 0; j < a.numFaces / 2; j++) {
        seekers.push(new Seeker(a.pos.x, a.pos.y));
      }
      a.hasConverted = true;
    } // else nothing (skip dead asteroids)
  });

  seekers.forEach(s => {
    if (!s.isDead) {
      s.update(asteroids, seekers);
      s.render();
    } // else nothing (skip dead seekers)
  });
}

// click the mouse to pause or unpause
function mouseClicked() {
  PAUSE_FLAG = !PAUSE_FLAG;
  if (PAUSE_FLAG) {
    noLoop();
  } else {
    loop();
  }
}

// press spacebar to activate or deactivate chaos graphics mode
function keyPressed() {
  if (keyCode == 32) {
    CHAOS_GRAPHICS = !CHAOS_GRAPHICS;
  }
}
