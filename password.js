
let commonPasswords = new Set();

/**
 * Calcula la longitud (L) de la contraseña.
 * Calculate the length (L) of the password.
 * @param {string} password - The password to evaluate.
 * @returns {number} - The number of characters in the password.
 */
function calculateL(password) {
  return password.length;
}

/**
 * Calcula el tamaño del alfabeto (N) de la contraseña.
 * Identifica los tipos de caracteres presentes y suma sus tamaños.
 * @param {string} password - La contraseña a evaluar.
 * @returns {number} - El tamaño del espacio de caracteres (keyspace).
 */
function calculateN(password) {
  let N = 0;
  const charSets = {
    lowercase: { regex: /[a-z]/, size: 26 },
    uppercase: { regex: /[A-Z]/, size: 26 },
    numbers: { regex: /[0-9]/, size: 10 },
    symbols: { regex: /[^a-zA-Z0-9]/, size: 32 } // Símbolos comunes del teclado (ej. !@#$%^&*...)
  };

  for (const key in charSets) {
    if (charSets[key].regex.test(password)) {
      N += charSets[key].size;
    }
  }

  return N;
}

/**
 * Calcula la entropía (E) de la contraseña en bits.
 * Fórmula: E = L * log2(N)
 * @param {string} password - La contraseña a evaluar.
 * @returns {number} - El valor de la entropía en bits.
 */
function calculateEntropy(password) {
  const L = calculateL(password);
  const N = calculateN(password);

  if (L === 0 || N < 2) {
    return 0;
  }

  const entropy = L * Math.log2(N);
  return entropy;
}

/**
 * Carga las contraseñas del diccionario en un Set para búsquedas eficientes.
 * @param {string[]} passwords - Un array de contraseñas comunes.
 */
function loadCommonPasswords(passwords) {
    commonPasswords = new Set(passwords);
}

/**
 * Convierte segundos en un formato de tiempo legible por humanos.
 * @param {number} seconds - El total de segundos.
 * @returns {string} - Una cadena que describe el tiempo (ej. "15 días", "siglos").
 */
function formatTime(seconds) {
    if (seconds < 1) return "instantáneamente";
    const intervals = {
        'siglo': 3153600000,
        'década': 315360000,
        'año': 31536000,
        'mes': 2592000,
        'día': 86400,
        'hora': 3600,
        'minuto': 60,
        'segundo': 1
    };

    for (let unit in intervals) {
        const value = seconds / intervals[unit];
        if (value >= 1) {
            const rounded = Math.floor(value);
            // Pluralización simple
            const unitName = rounded > 1 ? (unit === 'mes' ? 'meses' : unit + 's') : unit;
            return `aproximadamente ${rounded} ${unitName}`;
        }
    }
    return "milenios"; // Para valores astronómicos
}

/**
 * Realiza una evaluación completa de la fortaleza de la contraseña.
 * @param {string} password - La contraseña a evaluar.
 * @returns {object} - Un objeto con los resultados de la evaluación.
 */
function evaluatePassword(password) {
  // 1. Penalización por diccionario: ¿Es una contraseña común?
  if (commonPasswords.has(password)) {
    return {
      password: "••••••••",
      isValid: false,
      reason: "Contraseña extremadamente común y vulnerable. Debe ser cambiada.",
      entropy: 0,
      strength: "Muy Débil",
      crackTime: "instantáneamente"
    };
  }

  const entropy = calculateEntropy(password);
  let strength = "";

  // 2. Asignar categoría de fuerza basada en la entropía
  if (entropy < 60) {
    strength = "Débil";
  } else if (entropy >= 60 && entropy < 80) {
    strength = "Fuerte";
  } else {
    strength = "Muy Fuerte";
  }

  // 3. Calcular tiempo estimado de crackeo
  const attemptsPerSecond = 1e12; // Asumimos 10^12 (un billón) de intentos/segundo, una estimación moderna.
  const totalCombinations = Math.pow(2, entropy);
  // El tiempo promedio para encontrarla es la mitad del tiempo total.
  const secondsToCrack = totalCombinations / (2 * attemptsPerSecond);
  const crackTime = formatTime(secondsToCrack);

  return {
    password: "••••••••", // ¡Importante! No devolver la contraseña original.
    isValid: true,
    entropy: parseFloat(entropy.toFixed(2)),
    strength,
    crackTime
  };
}


module.exports = {
  loadCommonPasswords,
  evaluatePassword
};