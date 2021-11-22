class Seeker {
  SIZE = 4;
  TIP_LENGTH = 3.5;
  SHOW_LINES = true;
  NEIGHBOR_DIST = 100; // sight range in boids mode
  TARGETING_LINE_WEIGHT = 0.2;

  constructor(posX, posY) {
    this.pos = createVector(posX, posY);
    this.vel = createVector(random(-1, 1), random(-1, 1));
    this.acc = createVector(0, 0);
    this.triangleDimensions; // check update()
    this.maxSpeed = 3;
    this.maxForce = 0.05;
    this.isDead = false; // has hit asteroid?
    this.target = null; // reference to targeted asteroid
    this.activateBoidsLogic = false; // ran out of targets, turns pink
  }

  update(asteroids, swarm) {
    //logic
    let tempTarget;
    let smallestDist = 1000; // arbitrary large number for min comparison
    asteroids.forEach((asteroid) => {
      let tempDist = this.pos.dist(asteroid.pos);
      if (
        // if smaller dist AND asteroid wasn't hit AND asteroid has no attacker currently
        tempDist < smallestDist &&
        !asteroid.isDying &&
        !asteroid.incomingSeeker
      ) {
        smallestDist = tempDist; // set comparison variable to new low
        tempTarget = asteroid; // save comparison object, it might be the right one
      }
      // check for collision (with active asteroids only)
      if (tempDist < asteroid.radius && !asteroid.isDead) {
        asteroid.isDying = true;
        this.isDead = true; // kill seeker, it has struck an asteroid (even if by accident)
      }
    });

    // keeps target consistent even if other asteroids fly closer
    if (!this.isDead) {
      if (tempTarget != this.target) {
        if (this.target == null) {
          // null check: change to closer target
          this.target = tempTarget;
        } else if (this.target.isDying) {
          // if someone else crashes into target, change to closer target
          this.target = tempTarget;
        }
      }

      if (this.target != null) {
        // if target:
        this.target.incomingSeeker = this; // send self-reference to asteroid
        this.seek(this.target.pos);
        this.activateBoidsLogic = false;
      } else {
        this.activateBoidsLogic = true; // out of targets, switch to boids mode
      }
    }

    if (this.activateBoidsLogic) {
      this.separate(swarm);
      this.align(swarm);
      this.cohesion(swarm);
    }

    //physics boilerplate
    this.acc.limit(this.maxForce);
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.clampPos();
    this.acc.mult(0);

    // use velocity to determine the triangle heading
    this.triangleDimensions = p5.Vector.normalize(this.vel).mult(this.SIZE);
  }

  /**
   * If it goes beyond the screen boundaries,
   * then teleport to the other side
   */
  clampPos() {
    const margin = 5; // can go up to 5px offscreen
    if (this.pos.x < 0 - margin) this.pos.x = width + margin;
    if (this.pos.x > width + margin) this.pos.x = 0 - margin;
    if (this.pos.y < 0 - margin) this.pos.y = height + margin;
    if (this.pos.y > height + margin) this.pos.y = 0 - margin;
  }

  render() {
    push();
    if (this.activateBoidsLogic) {
      fill(255, 0, 255); // magenta
    } else {
      fill(0, 255, 255); // cyan
    }
    triangle(
      this.pos.x + this.triangleDimensions.x * this.TIP_LENGTH, // TIP_LENGTH makes the shape look nicer
      this.pos.y + this.triangleDimensions.y * this.TIP_LENGTH,
      this.pos.x + this.triangleDimensions.y, // rotate normalizedVel by 90deg each way 
      this.pos.y - this.triangleDimensions.x,
      this.pos.x - this.triangleDimensions.y,
      this.pos.y + this.triangleDimensions.x
    );
    // draw a line to current target
    if (this.target != null && this.SHOW_LINES) {
      strokeWeight(this.TARGETING_LINE_WEIGHT);
      line(this.pos.x, this.pos.y, this.target.pos.x, this.target.pos.y);
    }
    pop();
  }

  // physics and boids logic below:
  applyForce(force) {
    this.acc.add(force);
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    let steering = p5.Vector.sub(desired, this.vel);
    steering.limit(this.maxForce);
    this.applyForce(steering);
  }

  separate(swarm) {
    let sum = createVector(0, 0);
    let count = 0;
    for (let other of swarm) {
      let distance = this.pos.dist(other.pos);
      if (distance != 0 && distance < this.NEIGHBOR_DIST) {
        let awayVec = p5.Vector.sub(this.pos, other.pos).normalize();
        awayVec.div(distance);
        sum.add(awayVec);
        count += 1;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.vel);
      steer.limit(this.maxForce);
      this.applyForce(steer);
    }
  }

  align(swarm) {
    let count = 0;
    let sum = createVector(0, 0);
    for (let other of swarm) {
      let distance = this.pos.dist(other.pos);
      if (distance < this.NEIGHBOR_DIST) {
        sum.add(other.vel);
        count += 1;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.vel);
      steer.limit(this.maxForce);
      this.applyForce(steer);
    }
  }

  cohesion(swarm) {
    let count = 0;
    let summedPos = createVector(0, 0);
    for (let other of swarm) {
      let distance = this.pos.dist(other.pos);
      if (distance < this.NEIGHBOR_DIST) {
        summedPos.add(other.pos);
        count += 1;
      }
    }
    if (count > 0) {
      summedPos.div(count);
      let desired = p5.Vector.sub(summedPos, this.pos);
      desired.setMag(this.maxSpeed);
      let steering = p5.Vector.sub(desired, this.vel);
      steering.limit(this.maxForce);
      this.applyForce(steering);
    }
  }
}
