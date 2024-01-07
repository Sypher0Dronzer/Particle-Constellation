/**@type {HTMLCanvasElement} */
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let particlecount=Math.floor(screen.width/5);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//ctx.createLinearGradient(startX, StartY, EndX, EndY)
const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

// Add three color stops
gradient.addColorStop(0, "#FED207");
gradient.addColorStop(0.2, "#FFB009");
gradient.addColorStop(0.4, "#FE6D5D");
gradient.addColorStop(0.6, "#F438AA");
gradient.addColorStop(0.8, "#FF02FD");
gradient.addColorStop(1, "#BD033B");

class Particle {
  constructor(effect) {
    this.effect = effect;
    this.radius = Math.random() * 15 + 6;
    this.x =
      this.radius +
      Math.floor(Math.random() * (this.effect.width - this.radius * 2));
    this.y =
      this.radius +
      Math.floor(Math.random() * (this.effect.height - this.radius * 2));
    this.velX = Math.random() * 1.5 -0.75;
    this.velY = Math.random() * 1.5 -0.75;
    // this push acts as a acceleration
    // now similar way we need friction to reduce the speed as well
    this.pushX = 0;
    this.pushY = 0;
    this.friction = 0.95;
  }
  reset() {
    // this portion ensures that no partcle is stuck outside the canvas on resizing
    this.x =
      this.radius +
      Math.floor(Math.random() * (this.effect.width - this.radius * 2));
    this.y =
      this.radius +
      Math.floor(Math.random() * (this.effect.height - this.radius * 2));
  }
  draw(context) {
    context.fillStyle = gradient;
    context.beginPath();
    context.globalAlpha=0.9

    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fill();
    context.beginPath();
    context.save()
    context.globalAlpha=0.7
    context.fillStyle = "white";
    context.arc(this.x - this.radius*0.2, this.y - this.radius*0.2, this.radius *0.5, 0, 2 * Math.PI);
    context.fill();

    context.restore();
  }
  // for bouncing
  update() {
    //mouse click effect
    if (this.effect.mouse.pressed) {
      let dy = this.y - this.effect.mouse.y;
      let dx = this.x - this.effect.mouse.x;
      let distance = Math.hypot(dx, dy);
      //adding phyics to the speed of particle movement based on distance from mouse radius
      let force = this.effect.mouse.radius / distance;
      if (distance < this.effect.mouse.radius) {
        let angle = Math.atan2(dy, dx);

        this.pushX += Math.cos(angle) * force;
        this.pushY += Math.sin(angle) * force;
      }
    }

    this.x += this.pushX + this.velX;
    this.y += this.pushY + this.velY;
    this.pushX *= this.friction; // these lines gradually reduce the push acceleration
    this.pushY *= this.friction;

    if (this.x < this.radius) {
      this.x = this.radius;
      this.velX *= -1;
    } else if (this.x > this.effect.width - this.radius) {
      this.x = this.effect.width - this.radius;
      this.velX *= -1;
    }
    if (this.y < this.radius) {
      this.y = this.radius;
      this.velY *= -1;
    } else if (
      this.y > this.effect.height - this.radius ||
      this.y == this.effect.height - this.radius
    ) {
      this.y = this.effect.height - this.radius;
      this.velY *= -1;
    }
  }
}

class Effect {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.particles = [];
    this.numberOfParticles = particlecount;
    this.createParticles();

    window.addEventListener("resize", (e) => {
      this.resize(e.target.innerWidth, e.target.innerHeight);
    });

    this.mouse = {
      x: 0,
      y: 0,
      pressed: false,
      radius: 100,
    };
    window.addEventListener("mousemove", (e) => {
      if (this.mouse.pressed) {
        this.mouse.x = e.x;
        this.mouse.y = e.y;
      }
    });
    window.addEventListener("touchstart", (e) => {
      [...e.changedTouches].forEach((touch) => {
        this.mouse.pressed = true;
        this.mouse.x = touch.pageX;
        this.mouse.y = touch.pageY;
        this.mouse.pressed = true;
      });
    });
    window.addEventListener("touchmove", (e) => {
      [...e.changedTouches].forEach((touch) => {
        this.mouse.pressed = true;
        this.mouse.x = touch.pageX;
        this.mouse.y = touch.pageY;
        this.mouse.pressed = true;
      });
    });
    window.addEventListener("mousedown", (e) => {
      this.mouse.pressed = true;
      this.mouse.x = e.x;
      this.mouse.y = e.y;
    });
    window.addEventListener("mouseup", () => {
      this.mouse.pressed = false;
    });
  }
  createParticles() {
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push(new Particle(this));
    }
  }
  handleParticles(context) {
    this.connectParticles(context); // we call the connecting line first since the code is executed from top to bottom so in order for lines to come behind the balls we call it first
    this.particles.forEach((particle) => {
      particle.draw(context);
      particle.update();
    });
  }
  connectParticles(context) {
    let maxDistance = 80;
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a; b < this.particles.length; b++) {
        let dx = this.particles[a].x - this.particles[b].x;
        let dy = this.particles[a].y - this.particles[b].y;
        let distance = Math.hypot(dx, dy);
        if (distance < maxDistance) {
          let opacity = 1 - distance / maxDistance;
          context.lineWidth = 2;
          context.globalAlpha = opacity;
          context.beginPath();
          context.moveTo(this.particles[a].x, this.particles[a].y);
          context.lineTo(this.particles[b].x, this.particles[b].y);

          // Draw the Path
          context.stroke();
          context.strokeStyle = gradient;
        }
      }
    }
  }
  resize(width, height) {
    this.canvas.width = width;
    this.width = width;
    this.height = height;
    this.canvas.height = height;
    this.particles.forEach((particle) => {
      particle.reset();
    });
  }
}
let effect = new Effect(canvas);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.handleParticles(ctx);
  requestAnimationFrame(animate);
}
animate();
