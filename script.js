
const NB_ETOILES = Math.random() * (300 - 100 + 1) + 100;
const COULEUR = ["blue", "yellow", "purple", "red", "green"];

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const element = document.getElementById('ele')
const hauteur = element.getAttribute('data-hauteur')
const largeur = element.getAttribute('data-largeur')

function resizeCanvas() {
    canvas.width = (window.innerWidth/22)*largeur;
    canvas.height = (window.innerHeight/22)*hauteur;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const etoiles = [];

function creerEtoile(x, y, couleur, taille, vx, vy) {
    return { x, y, couleur, taille, vx, vy };
}

function dessinerEtoile(x, y, taille, couleur) {
    const spikes = 5;
    const outerRadius = taille;
    const innerRadius = taille / 2;
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(x, y - outerRadius);
    for (let i = 0; i < spikes; i++) {
        let x2 = x + Math.cos(rot) * outerRadius;
        let y2 = y - Math.sin(rot) * outerRadius;
        ctx.lineTo(x2, y2);
        rot += step;

        x2 = x + Math.cos(rot) * innerRadius;
        y2 = y - Math.sin(rot) * innerRadius;
        ctx.lineTo(x2, y2);
        rot += step;
    }
    ctx.lineTo(x, y - outerRadius);
    ctx.closePath();
    ctx.fillStyle = couleur;
    ctx.fill();
}

function creerSegment(x1, y1, x2, y2, couleur) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = couleur;
    ctx.stroke();
}

// Créer nos étoiles
for (let i = 0; i < NB_ETOILES; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const couleur = COULEUR[Math.floor(Math.random() * COULEUR.length)];
    const taille = Math.random() * 5 + 1;
    const vx = (Math.random() - 0.5) * 0.5;
    const vy = (Math.random() - 0.5) * 0.5;
    const etoile = creerEtoile(x, y, couleur, taille, vx, vy);
    etoiles.push(etoile);
}

let mouseX = 0;
let mouseY = 0;

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    etoiles.forEach(etoile => {
        etoile.x += etoile.vx;
        etoile.y += etoile.vy;

        if (etoile.x > canvas.width || etoile.x < 0) {
            etoile.vx *= -1;
        }
        if (etoile.y > canvas.height || etoile.y < 0) {
            etoile.vy *= -1;
        }

        dessinerEtoile(etoile.x, etoile.y, etoile.taille, etoile.couleur);
    });

    // Connecter les étoiles les plus proches entre elles
    for (let i = 0; i < etoiles.length; i++) {
        const etoileA = etoiles[i];
        const distances = [];
        for (let j = 0; j < etoiles.length; j++) {
            if (i !== j) {
                const etoileB = etoiles[j];
                const distance = Math.hypot(etoileA.x - etoileB.x, etoileA.y - etoileB.y);
                distances.push({ etoile: etoileB, distance });
            }
        }
        distances.sort((a, b) => a.distance - b.distance);
        const nearestEtoiles = distances.slice(0, 4);
        nearestEtoiles.forEach(nearest => {
            creerSegment(etoileA.x, etoileA.y, nearest.etoile.x, nearest.etoile.y, etoileA.couleur);
        });
    }

    // Connecter la souris aux étoiles les plus proches
    const etoilesTriees = [...etoiles].sort((a, b) => {
        const distA = Math.hypot(a.x - mouseX, a.y - mouseY);
        const distB = Math.hypot(b.x - mouseX, b.y - mouseY);
        return distA - distB;
    });

    const nearestEtoiles = etoilesTriees.slice(0, 4);

    nearestEtoiles.forEach(etoile => {
        creerSegment(mouseX, mouseY, etoile.x, etoile.y, etoile.couleur);
    });

    requestAnimationFrame(update);
}

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});

update();