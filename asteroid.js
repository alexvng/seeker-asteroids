class Asteroid {
  DEATH_TIMER = 1500;
  constructor(posX, posY, velX, velY, numFaces, radius, rotationRate) {
    this.pos = createVector(posX, posY);
    this.vel = createVector(velX, velY);
    // acceleration omitted, not relevant
    this.numFaces = numFaces;
    this.angularPos = 0; //radians
    this.radius = radius;
    this.angularSpeed = rotationRate;
    this.isTargeted = false; // seeker is locked on?
    this.incomingSeeker = null; // reference to incoming seeker
    this.isDying = false; // hit by seeker and is turning blue?
    this.deathTimer = 0; // how long since isDying? controls blue color
    this.isDead = false; // has disappeared?
    this.hasConverted = false; // has turned into seekers?
  }

  update() {
    // LOGIC
    if (this.incomingSeeker == null || this.isDead) {
      this.isTargeted = false; // if seeker reference is missing, asteroid isn't being targeted
    } else if (this.incomingSeeker.isDead) {
      this.isTargeted = false;
      this.incomingSeeker = null; // if seeker dies, delete reference to it
    } else {
      this.isTargeted = true;
    }
    if (this.isDying && !this.isDead) {
      // if asteroid is in the process of dying
      setTimeout(() => {
        this.isDead = true;
      }, this.DEATH_TIMER); //milliseconds
    }
    // physics boilerplate
    this.pos.add(this.vel);
    this.clampPos();
    this.angularPos += this.angularSpeed;
  }

  /**
   * If it goes beyond the screen boundaries,
   * then teleport to the other side
   */
  clampPos() {
    const margin = 20; // can go up to 20px offscreen
    if (this.pos.x < 0 - margin) this.pos.x = width + margin;
    if (this.pos.x > width + margin) this.pos.x = 0 - margin;
    if (this.pos.y < 0 - margin) this.pos.y = height + margin;
    if (this.pos.y > height + margin) this.pos.y = 0 - margin;
  }

  render() {
    push(); // begin temporary graphics settings
    const vertexSpacing = TAU / this.numFaces; // 360deg subdivided by numFaces
    if (this.isDying) {
      // transition color over time during isDying
      this.deathTimer += 2;
      fill(255 - this.deathTimer, 255, 255); // interpolate white (255,255,255) to cyan (0,255,255)
    }
    // draw the asteroid
    beginShape();
    // iterate over each vertex, incrase draw angle by fixed amount
    for (
      let i = 0, currentAngle = this.angularPos;
      i < this.numFaces;
      i++, currentAngle += vertexSpacing
    ) {
      let vert = p5.Vector.fromAngle(currentAngle, this.radius);
      vertex(this.pos.x + vert.x, this.pos.y + vert.y); // draw relative to pos
    }
    endShape(CLOSE); // CLOSE draws the last side
    pop();
  }
}
