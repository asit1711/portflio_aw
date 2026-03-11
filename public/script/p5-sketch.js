let particles = [];
const numParticles = 50; 
let canvas;
let container;

function setup() {
  container = select('#p5-hero-background');
  if (!container) {
      console.error("p5.js container '#p5-hero-background' not found.");
      return;
  }
  container.size(container.width, container.height);

  canvas = createCanvas(container.width, container.height);
  canvas.parent('p5-hero-background'); 

  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle(random(width), random(height)));
  }

  updateParticleColors();
  noStroke(); 
}

function draw() {
    if (!container) return;

    let bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim();
    background(bgColor);

    for (let particle of particles) {
        particle.update();
        particle.show();
        particle.edges();
    }

}

function windowResized() {
    if (!container) return;
    resizeCanvas(container.width, container.height);
}

function updateParticleColors() {
  const theme = document.documentElement.getAttribute('data-theme');
  const accentColor = color(getComputedStyle(document.documentElement).getPropertyValue('--accent-secondary').trim());

  accentColor.setAlpha(theme === 'dark' ? 100 : 150);

  for (let particle of particles) {
    particle.setColor(accentColor);
  }
}

const themeObserver = new MutationObserver((mutationsList) => {
  for (let mutation of mutationsList) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
      if (typeof updateParticleColors === 'function') {
          updateParticleColors();
      }
    }
  }
});

themeObserver.observe(document.documentElement, { attributes: true });

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.2, 0.8));
    this.acc = createVector(0, 0);
    this.maxSpeed = 1;
    this.maxForce = 0.1;
    this.particleColor = color(200, 100);
    this.size = random(2, 4);
  }

  setColor(newColor) {
      this.particleColor = newColor;
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  show() {
    fill(this.particleColor);
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }

  edges() {
    if (this.pos.x > width + this.size) {
      this.pos.x = -this.size;
    } else if (this.pos.x < -this.size) {
      this.pos.x = width + this.size;
    }
    if (this.pos.y > height + this.size) {
      this.pos.y = -this.size;
    } else if (this.pos.y < -this.size) {
      this.pos.y = height + this.size;
    }
  }
}