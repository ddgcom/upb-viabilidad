// Estado de la aplicación
const appState = {
    viabilityScores: {},
    formData: {}
};

// Calcular todas las viabilidades
function calculateAllViability() {
    // Recolectar todos los datos del formulario
    const formElements = document.querySelectorAll('input, select, textarea');
    appState.formData = {};

    formElements.forEach(element => {
        if (element.type === 'checkbox') {
            if (!appState.formData[element.name]) {
                appState.formData[element.name] = [];
            }
            if (element.checked) {
                appState.formData[element.name].push(element.value);
            }
        } else if (element.type === 'radio') {
            if (element.checked) {
                appState.formData[element.name] = element.value;
            }
        } else if (element.value) {
            appState.formData[element.name] = element.value;
        }
    });

    // Calcular cada viabilidad
    calculateViabilityEnergetic();
    calculateViabilityEnvironmental();
    calculateViabilityLegal();
    calculateViabilityFinancial();
    calculateViabilitySocial();

    // Mostrar resultados
    displayResults();

    // Scroll a los resultados
    setTimeout(() => {
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// ============ VIABILITY CALCULATIONS ============

function calculateViabilityEnergetic() {
    let score = 0;
    const maxScore = 5;

    // Evaluación de figura legal
    if (appState.formData.energia_figura_legal && appState.formData.energia_figura_legal !== 'no-definido') {
        score += 1;
    }

    // Evaluación de capacidad de mantenimiento
    const mantenimiento = parseInt(appState.formData.energia_mantenimiento) || 0;
    score += (mantenimiento / 5);

    // Evaluación de infraestructura
    const infraestructura = parseInt(appState.formData.energia_infraestructura) || 0;
    score += (infraestructura / 5);

    // Evaluación de certificados
    if (appState.formData.energia_certificado_or === 'si') {
        score += 1;
    } else if (appState.formData.energia_certificado_or === 'en-tramite') {
        score += 0.5;
    }

    // Evaluación de contrato
    if (appState.formData.energia_contrato_or === 'si') {
        score += 0.5;
    }

    score = Math.min(score, maxScore);
    appState.viabilityScores.energetica = score;
}

function calculateViabilityEnvironmental() {
    let score = 2.5;

    // Restricciones ambientales
    const restricciones = appState.formData.ambiental_restricciones || [];
    if (restricciones.length > 0) {
        score += (restricciones.length * 0.2);
    }

    // Ordenamiento territorial
    if (appState.formData.ambiental_pot === 'si') {
        score += 1;
    } else if (appState.formData.ambiental_pot === 'no-sabe') {
        score += 0.3;
    }

    // Patrimonio cultural
    if (appState.formData.ambiental_patrimonio === 'no') {
        score += 0.5;
    }

    // Licenciamiento
    if (appState.formData.ambiental_licencia_estado === 'otorgada') {
        score += 1;
    } else if (appState.formData.ambiental_licencia_estado === 'en-tramite') {
        score += 0.5;
    }

    // Consulta previa
    if (appState.formData.ambiental_consulta_previa === 'si' || appState.formData.ambiental_consulta_previa === 'no-aplica') {
        score += 0.5;
    }

    // Amenazas
    const amenazas = appState.formData.ambiental_amenazas || [];
    if (amenazas.includes('ninguna') || amenazas.length === 0) {
        score += 0.5;
    }

    score = Math.min(score, 5);
    appState.viabilityScores.ambiental = score;
}

function calculateViabilityLegal() {
    let score = 0;

    // Documentos de constitución
    if (appState.formData.legal_documentos_constitucion === 'si') {
        score += 1.5;
    } else if (appState.formData.legal_documentos_constitucion === 'en-tramite') {
        score += 0.75;
    }

    // Personería jurídica
    if (appState.formData.legal_personeria === 'si') {
        score += 1.5;
    } else if (appState.formData.legal_personeria === 'en-tramite') {
        score += 0.75;
    }

    // Contrato de conexión
    if (appState.formData.legal_contrato_conexion === 'si') {
        score += 1;
    } else if (appState.formData.legal_contrato_conexion === 'en-tramite') {
        score += 0.5;
    }

    // Protección al usuario
    const proteccion = appState.formData.legal_proteccion_usuario || [];
    score += (proteccion.length * 0.33);

    score = Math.min(score, 5);
    appState.viabilityScores.legal = score;
}

function calculateViabilityFinancial() {
    let score = 2;

    // Evaluación de fuentes de financiación
    const fuentesEstado = appState.formData.financiera_fuentes_estado || [];
    const fuentesPrivadas = appState.formData.financiera_fuentes_privadas || [];
    const totalFuentes = fuentesEstado.length + fuentesPrivadas.length;

    score += Math.min(totalFuentes * 0.3, 1.5);

    // Evaluación de parámetros financieros
    const tarifa = parseFloat(appState.formData.financiera_tarifa_actual) || 0;
    const capex = parseFloat(appState.formData.financiera_capex) || 0;
    const potencial = parseFloat(appState.formData.financiera_potencial) || 0;

    if (tarifa > 0) score += 0.5;
    if (capex > 0) score += 0.5;
    if (potencial > 0) score += 0.5;

    // Evaluación de payback
    if (capex > 0 && potencial > 0 && tarifa > 0) {
        const ingresoAnual = potencial * tarifa;
        if (ingresoAnual > 0) {
            const paybackYears = capex / (ingresoAnual / 1000);
            if (paybackYears < 10) {
                score += 1;
            } else if (paybackYears < 15) {
                score += 0.5;
            }
        }
    }

    // Evaluación de financiamiento
    if (appState.formData.financiera_requiere_credito === 'no') {
        score += 0.5;
    } else if (appState.formData.financiera_requiere_credito === 'si') {
        const tasa = parseFloat(appState.formData.financiera_tasa_interes) || 0;
        const plazo = parseInt(appState.formData.financiera_plazo_meses) || 0;
        if (tasa > 0 && plazo > 0 && tasa <= 2) {
            score += 0.5;
        }
    }

    score = Math.min(score, 5);
    appState.viabilityScores.financiera = score;
}

function calculateViabilitySocial() {
    let score = 0;
    let responses = 0;

    const fields = [
        'social_comunicacion',
        'social_gestion_equipos',
        'social_pensamiento_estrategico',
        'social_inteligencia_emocional',
        'social_resolucion_problemas'
    ];

    fields.forEach(field => {
        const value = parseInt(appState.formData[field]) || 0;
        if (value > 0) {
            score += value;
            responses++;
        }
    });

    if (responses > 0) {
        score = score / responses;
    }

    appState.viabilityScores.social = score;
}

// ============ DISPLAY RESULTS ============

function displayResults() {
    const scores = appState.viabilityScores;

    // Mostrar sección de resultados
    document.getElementById('results-section').style.display = 'block';

    // Calcular promedio
    const avgScore = (
        (scores.energetica || 0) +
        (scores.ambiental || 0) +
        (scores.legal || 0) +
        (scores.financiera || 0) +
        (scores.social || 0)
    ) / 5;

    // Actualizar score general
    const scoreValue = document.getElementById('overall-score');
    scoreValue.textContent = avgScore.toFixed(1);

    // Actualizar color
    if (avgScore >= 4) {
        scoreValue.style.color = '#28a745';
    } else if (avgScore >= 3) {
        scoreValue.style.color = '#ffc107';
    } else {
        scoreValue.style.color = '#dc3545';
    }

    // Actualizar barras
    updateScoreBar('energetica', scores.energetica || 0);
    updateScoreBar('ambiental', scores.ambiental || 0);
    updateScoreBar('legal', scores.legal || 0);
    updateScoreBar('financiera', scores.financiera || 0);
    updateScoreBar('social', scores.social || 0);

    // Mostrar recomendación
    let recommendation = '';
    if (avgScore >= 4) {
        recommendation = `<div class="recommendation success">
            <h4>✓ Alta Viabilidad Integral (${avgScore.toFixed(1)}/5)</h4>
            <p>La comunidad cuenta con condiciones sólidas para avanzar a la fase de diseño integral del proyecto.</p>
        </div>`;
    } else if (avgScore >= 3) {
        recommendation = `<div class="recommendation warning">
            <h4>⚠ Viabilidad Media (${avgScore.toFixed(1)}/5)</h4>
            <p>El proyecto es potencialmente viable, pero requiere ajustes previos en algunos componentes.</p>
        </div>`;
    } else {
        recommendation = `<div class="recommendation error">
            <h4>✗ Baja Viabilidad (${avgScore.toFixed(1)}/5)</h4>
            <p>La comunidad presenta barreras críticas. Se sugiere replantear el diseño antes de continuar.</p>
        </div>`;
    }

    document.getElementById('viability-recommendation').innerHTML = recommendation;
}

function updateScoreBar(type, score) {
    const bar = document.getElementById(`score-${type}`);
    const text = document.getElementById(`score-${type}-text`);

    if (bar && text) {
        const percentage = (score / 5) * 100;
        bar.style.width = percentage + '%';
        text.textContent = score.toFixed(1) + '/5';
    }
}

// ============ UTILITIES ============

function resetForm() {
    // Limpiar todos los inputs
    const formElements = document.querySelectorAll('input, select, textarea');
    formElements.forEach(element => {
        if (element.type === 'checkbox' || element.type === 'radio') {
            element.checked = false;
        } else {
            element.value = '';
        }
    });

    // Ocultar resultados
    document.getElementById('results-section').style.display = 'none';

    // Limpiar datos
    appState.formData = {};
    appState.viabilityScores = {};

    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });

    showNotification('Formulario limpiado');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #c5d82a;
        color: #000;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Agregar animaciones
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    .recommendation {
        padding: 20px;
        border-radius: 8px;
        margin-top: 20px;
    }
    .recommendation.success {
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
    }
    .recommendation.warning {
        background-color: #fff3cd;
        border: 1px solid #ffeeba;
        color: #856404;
    }
    .recommendation.error {
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
    }
    .recommendation h4 {
        margin-top: 0;
        font-size: 16px;
    }
    .recommendation p {
        margin-bottom: 0;
        font-size: 14px;
    }
`;
document.head.appendChild(animationStyles);
