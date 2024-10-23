const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Dimensiones del canvas
const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#ff8";

// Clase Círculo
class Circle {
  constructor(x, y, radius, color, text, speed) {
    this.posX = x;
    this.posY = y;
    this.radius = radius;
    this.originalColor = color;  // Guardar el color original
    this.color = color;
    this.text = text;
    this.speed = speed;
    this.dx = (Math.random() - 0.5) * this.speed * 2;  // Movimiento horizontal aleatorio
    this.dy = -Math.random() * this.speed;  // Movimiento hacia arriba
    this.colliding = false;  // Estado de colisión
  }

  draw(context) {
    context.beginPath();
    context.strokeStyle = this.color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "20px Arial";
    context.fillText(this.text, this.posX, this.posY);
    context.lineWidth = 2;
    context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
    context.stroke();
    context.closePath();
  }

  update(context) {
    this.draw(context);

    // Actualizar la posición en X
    this.posX += this.dx;

    // Rebotar en los bordes laterales del canvas
    if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
      this.dx = -this.dx;
    }

    // Actualizar la posición en Y (hacia arriba)
    this.posY += this.dy;

    // Rebotar en los bordes superior e inferior
    if (this.posY + this.radius > window_height) {  // Si toca el borde inferior
      this.dy = -Math.abs(this.dy);  // Cambia a negativo para subir
    } else if (this.posY - this.radius < 0) {  // Si toca el borde superior
      this.dy = Math.abs(this.dy);  // Cambia a positivo para bajar
    }
  }

  // Verificar si el círculo fue clicado
  isClicked(mouseX, mouseY) {
    const distance = Math.sqrt((this.posX - mouseX) ** 2 + (this.posY - mouseY) ** 2);
    return distance <= this.radius;
  }

  // Verificar colisión con otro círculo
  checkCollision(otherCircle) {
    const distance = Math.sqrt((this.posX - otherCircle.posX) ** 2 + (this.posY - otherCircle.posY) ** 2);
    return distance <= this.radius + otherCircle.radius;
  }

  // Manejar colisión (cambiar dirección y color)
  handleCollision(otherCircle) {
    // Calcular vector de colisión
    const dx = otherCircle.posX - this.posX;
    const dy = otherCircle.posY - this.posY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Asegurarnos de que los círculos no estén superpuestos
    const overlap = (this.radius + otherCircle.radius) - distance;
    if (overlap > 0) {
      const correctionFactor = overlap / distance;
      const correctionX = correctionFactor * dx / 2;
      const correctionY = correctionFactor * dy / 2;

      // Ajustar las posiciones para separar los círculos
      this.posX -= correctionX;
      this.posY -= correctionY;
      otherCircle.posX += correctionX;
      otherCircle.posY += correctionY;
    }

    // Invertir las direcciones de los círculos
    this.dx = -this.dx;
    this.dy = -this.dy;
    this.color = "#0000FF";  // Cambiar a color azul
    otherCircle.dx = -otherCircle.dx;
    otherCircle.dy = -otherCircle.dy;
    otherCircle.color = "#0000FF";  // Cambiar el otro círculo a azul también

    this.colliding = true;
    otherCircle.colliding = true;
  }

  resetColor() {
    if (!this.colliding) {
      this.color = this.originalColor;  // Volver al color original
    }
    this.colliding = false;  // Resetear estado de colisión
  }
}

// Array para almacenar los círculos
let circles = [];

// Generar círculos aleatorios que comienzan desde la parte inferior
function generateCircles(n) {
  for (let i = 0; i < n; i++) {
    let radius = Math.random() * 30 + 20;  // Radio entre 20 y 50
    let x = Math.random() * (window_width - radius * 2) + radius;
    let y = window_height + radius;  // Comienzan justo debajo del borde inferior
    let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;  // Color aleatorio
    let speed = Math.random() * 4 + 3;  // Velocidad entre 3 y 7 (aumentada)
    let text = `C${i + 1}`;  // Etiqueta del círculo
    circles.push(new Circle(x, y, radius, color, text, speed));
  }
}

// Animación de los círculos
function animate() {
  ctx.clearRect(0, 0, window_width, window_height);  // Limpiar el canvas
  circles.forEach(circle => {
    circle.update(ctx);

    // Verificar colisiones con otros círculos
    circles.forEach(otherCircle => {
      if (circle !== otherCircle && circle.checkCollision(otherCircle)) {
        circle.handleCollision(otherCircle);
      }
    });

    // Resetear el color después de cada frame
    circle.resetColor();
  });

  requestAnimationFrame(animate);
}

// Eliminar círculo al hacer clic
canvas.addEventListener('click', function (event) {
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  circles = circles.filter(circle => !circle.isClicked(mouseX, mouseY));  // Eliminar círculos clicados
});

// Generar 10 círculos y comenzar la animación
generateCircles(10);
animate();
