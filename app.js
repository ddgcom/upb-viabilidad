// Estado de la aplicación
const appState = {
    currentMainTab: 'viabilidad',
    currentViabilityTab: 'energetica',
    currentStep: 1,
    viabilityScores: {},
    formData: {}
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initMainTabs();
    initStepTabs();
    initViabilityTabs();
    setupViabilityStepHandlers();
    setupFinancialParameters();
});

// ============ MAIN TABS (Caracterización / Viabilidad) ============

function initMainTabs() {
    const mainTabs = document.querySelectorAll('.main-tab');
    mainTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    appState.currentMainTab = tabId;

    document.querySelectorAll('.main-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        }
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetContent = document.getElementById(tabId);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

// ============ CHARACTERIZATION STEPS ============

function initStepTabs() {
    const stepTabs = document.querySelectorAll('.step-tab');
    stepTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const stepNumber = parseInt(this.getAttribute('data-step'));
            goToStep(stepNumber);
        });
    });
}

function goToStep(stepNumber) {
    appState.currentStep = stepNumber;

    document.querySelectorAll('.step-tab').forEach(tab => {
        tab.classList.remove('active');
        if (parseInt(tab.getAttribute('data-step')) === stepNumber) {
            tab.classList.add('active');
        }
    });

    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetStep = document.getElementById(`step-${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
}

function nextStep(stepNumber) {
    saveCurrentStepData();
    goToStep(stepNumber);
}

function prevStep(stepNumber) {
    goToStep(stepNumber);
}

function saveCurrentStepData() {
    const currentStepElement = document.querySelector('.step-content.active');
    if (!currentStepElement) return;

    const stepId = currentStepElement.id;
    const formElements = currentStepElement.querySelectorAll('input, select, textarea');

    appState.formData[stepId] = {};

    formElements.forEach(element => {
        if (element.type === 'checkbox') {
            if (!appState.formData[stepId][element.name]) {
                appState.formData[stepId][element.name] = [];
            }
            if (element.checked) {
                appState.formData[stepId][element.name].push(element.value);
            }
        } else if (element.type === 'radio') {
            if (element.checked) {
                appState.formData[stepId][element.name] = element.value;
            }
        } else {
            appState.formData[stepId][element.name] = element.value;
        }
    });
}

function finishCharacterization() {
    saveCurrentStepData();
    calculateViabilityEnergetic();
    switchTab('viabilidad');
    switchViabilityTab('energetica');
    showNotification('Caracterización completada. Inicie el análisis de viabilidad.');
}

// ============ VIABILITY TABS & NAVIGATION ============

function initViabilityTabs() {
    const viabilityTabs = document.querySelectorAll('.viability-main-tab');
    viabilityTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-viability');
            switchViabilityTab(tabId);
        });
    });
}

function switchViabilityTab(tabId) {
    appState.currentViabilityTab = tabId;

    document.querySelectorAll('.viability-main-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-viability') === tabId) {
            tab.classList.add('active');
        }
    });

    document.querySelectorAll('.viability-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetContent = document.getElementById(tabId);
    if (targetContent) {
        targetContent.classList.add('active');

        if (tabId === 'integral') {
            displayIntegralResults();
        }
    }
}

function setupViabilityStepHandlers() {
    // Energy viability steps
    const energySteps = document.querySelectorAll('#energetica .viability-step');
    energySteps.forEach(step => {
        step.addEventListener('click', function() {
            const stepId = this.getAttribute('data-step');
            goToViabilityStep('energetica', stepId);
        });
    });

    // Environmental viability steps
    const envSteps = document.querySelectorAll('#ambiental .viability-step');
    envSteps.forEach(step => {
        step.addEventListener('click', function() {
            const stepId = this.getAttribute('data-step');
            goToViabilityStep('ambiental', stepId);
        });
    });

    // Legal viability steps
    const legalSteps = document.querySelectorAll('#legal .viability-step');
    legalSteps.forEach(step => {
        step.addEventListener('click', function() {
            const stepId = this.getAttribute('data-step');
            goToViabilityStep('legal', stepId);
        });
    });

    // Financial viability steps
    const finSteps = document.querySelectorAll('#financiera .viability-step');
    finSteps.forEach(step => {
        step.addEventListener('click', function() {
            const stepId = this.getAttribute('data-step');
            goToViabilityStep('financiera', stepId);
        });
    });

    // Social viability steps
    const socSteps = document.querySelectorAll('#social .viability-step');
    socSteps.forEach(step => {
        step.addEventListener('click', function() {
            const stepId = this.getAttribute('data-step');
            goToViabilityStep('social', stepId);
        });
    });
}

function goToViabilityStep(viabilityType, stepId) {
    // Remove active from all steps
    document.querySelectorAll(`#${viabilityType} .viability-step`).forEach(step => {
        step.classList.remove('active');
    });

    // Add active to clicked step
    document.querySelector(`#${viabilityType} [data-step="${stepId}"]`).classList.add('active');

    // Hide all step contents
    document.querySelectorAll(`#${viabilityType} .viability-step-content`).forEach(content => {
        content.classList.remove('active');
    });

    // Show selected step content
    const stepContent = document.getElementById(stepId);
    if (stepContent) {
        stepContent.classList.add('active');
    }
}

function nextViabilityStep(viabilityType, nextStepId) {
    saveViabilityStepData(viabilityType);
    goToViabilityStep(viabilityType, nextStepId);
}

function prevViabilityStep(viabilityType, prevStepId) {
    goToViabilityStep(viabilityType, prevStepId);
}

function prevViabilityMainTab(tabId) {
    const tabs = ['energetica', 'ambiental', 'legal', 'financiera', 'social'];
    const currentIndex = tabs.indexOf(appState.currentViabilityTab);
    if (currentIndex > 0) {
        switchViabilityTab(tabs[currentIndex - 1]);
    }
}

function saveViabilityStepData(viabilityType) {
    const viabilityContent = document.getElementById(viabilityType);
    if (!viabilityContent) return;

    const formElements = viabilityContent.querySelectorAll('input, select, textarea');
    const stepData = {};

    formElements.forEach(element => {
        if (element.type === 'checkbox') {
            if (!stepData[element.name]) {
                stepData[element.name] = [];
            }
            if (element.checked) {
                stepData[element.name].push(element.value);
            }
        } else if (element.type === 'radio') {
            if (element.checked) {
                stepData[element.name] = element.value;
            }
        } else {
            stepData[element.name] = element.value;
        }
    });

    if (!appState.formData[viabilityType]) {
        appState.formData[viabilityType] = {};
    }
    Object.assign(appState.formData[viabilityType], stepData);
}

// ============ VIABILITY CALCULATIONS ============

function calculateViabilityEnergetic() {
    saveViabilityStepData('energetica');
    const data = appState.formData.energetica || {};

    let score = 0;
    const maxScore = 5;

    // Evaluación de figura legal
    if (data.energia_figura_legal && data.energia_figura_legal !== 'no-definido') {
        score += 1;
    }

    // Evaluación de capacidad de mantenimiento
    const mantenimiento = parseInt(data.energia_mantenimiento) || 0;
    score += (mantenimiento / 5); // Convertir 0-5 a 0-1

    // Evaluación de infraestructura
    const infraestructura = parseInt(data.energia_infraestructura) || 0;
    score += (infraestructura / 5);

    // Evaluación de certificados
    if (data.energia_certificado_or === 'si') {
        score += 1;
    } else if (data.energia_certificado_or === 'en-tramite') {
        score += 0.5;
    }

    // Evaluación de contrato
    if (data.energia_contrato_or === 'si') {
        score += 0.5;
    }

    // Normalizar a escala 0-5
    score = Math.min(score, maxScore);

    appState.viabilityScores.energetica = score;
    showNotification('Viabilidad Energética calculada: ' + score.toFixed(1) + '/5');
}

function calculateViabilityEnvironmental() {
    saveViabilityStepData('ambiental');
    const data = appState.formData.ambiental || {};

    let score = 2.5; // Puntuación base

    // Restricciones ambientales
    const restricciones = data.ambiental_restricciones || [];
    if (restricciones.length > 0) {
        score += (restricciones.length * 0.2);
    }

    // Ordenamiento territorial
    if (data.ambiental_pot === 'si') {
        score += 1;
    } else if (data.ambiental_pot === 'no-sabe') {
        score += 0.3;
    }

    // Patrimonio cultural
    if (data.ambiental_patrimonio === 'no') {
        score += 0.5;
    }

    // Licenciamiento
    if (data.ambiental_licencia_estado === 'otorgada') {
        score += 1;
    } else if (data.ambiental_licencia_estado === 'en-tramite') {
        score += 0.5;
    }

    // Consulta previa
    if (data.ambiental_consulta_previa === 'si' || data.ambiental_consulta_previa === 'no-aplica') {
        score += 0.5;
    }

    // Amenazas
    const amenazas = data.ambiental_amenazas || [];
    if (amenazas.includes('ninguna') || amenazas.length === 0) {
        score += 0.5;
    }

    score = Math.min(score, 5);

    appState.viabilityScores.ambiental = score;
    showNotification('Viabilidad Ambiental calculada: ' + score.toFixed(1) + '/5');
}

function calculateViabilityLegal() {
    saveViabilityStepData('legal');
    const data = appState.formData.legal || {};

    let score = 0;

    // Documentos de constitución
    if (data.legal_documentos_constitucion === 'si') {
        score += 1.5;
    } else if (data.legal_documentos_constitucion === 'en-tramite') {
        score += 0.75;
    }

    // Personería jurídica
    if (data.legal_personeria === 'si') {
        score += 1.5;
    } else if (data.legal_personeria === 'en-tramite') {
        score += 0.75;
    }

    // Contrato de conexión
    if (data.legal_contrato_conexion === 'si') {
        score += 1;
    } else if (data.legal_contrato_conexion === 'en-tramite') {
        score += 0.5;
    }

    // Protección al usuario
    const proteccion = data.legal_proteccion_usuario || [];
    score += (proteccion.length * 0.33);

    score = Math.min(score, 5);

    appState.viabilityScores.legal = score;
    showNotification('Viabilidad Legal calculada: ' + score.toFixed(1) + '/5');
}

function calculateViabilityFinancial() {
    saveViabilityStepData('financiera');
    const data = appState.formData.financiera || {};

    let score = 2; // Puntuación base

    // Evaluación de fuentes de financiación
    const fuentesEstado = data.financiera_fuentes_estado || [];
    const fuentesPrivadas = data.financiera_fuentes_privadas || [];
    const totalFuentes = fuentesEstado.length + fuentesPrivadas.length;

    score += Math.min(totalFuentes * 0.3, 1.5);

    // Evaluación de parámetros financieros
    const tarifa = parseFloat(data.financiera_tarifa_actual) || 0;
    const capex = parseFloat(data.financiera_capex) || 0;
    const potencial = parseFloat(data.financiera_potencial) || 0;

    if (tarifa > 0) score += 0.5;
    if (capex > 0) score += 0.5;
    if (potencial > 0) score += 0.5;

    // Evaluación de payback (años para recuperar inversión)
    if (capex > 0 && potencial > 0 && tarifa > 0) {
        const ingresoAnual = potencial * tarifa;
        if (ingresoAnual > 0) {
            const paybackYears = capex / (ingresoAnual / 1000); // Conversión USD a COP aproximada
            if (paybackYears < 10) {
                score += 1;
            } else if (paybackYears < 15) {
                score += 0.5;
            }
        }
    }

    // Evaluación de financiamiento
    if (data.financiera_requiere_credito === 'no') {
        score += 0.5;
    } else if (data.financiera_requiere_credito === 'si') {
        const tasa = parseFloat(data.financiera_tasa_interes) || 0;
        const plazo = parseInt(data.financiera_plazo_meses) || 0;
        if (tasa > 0 && plazo > 0 && tasa <= 2) {
            score += 0.5;
        }
    }

    score = Math.min(score, 5);

    appState.viabilityScores.financiera = score;
    showNotification('Viabilidad Financiera calculada: ' + score.toFixed(1) + '/5');
}

function calculateViabilitySocial() {
    saveViabilityStepData('social');
    const data = appState.formData.social || {};

    let score = 0;
    let responses = 0;

    // Evaluaciones de liderazgo
    const fields = [
        'social_comunicacion',
        'social_gestion_equipos',
        'social_pensamiento_estrategico',
        'social_inteligencia_emocional',
        'social_resolucion_problemas'
    ];

    fields.forEach(field => {
        const value = parseInt(data[field]) || 0;
        if (value > 0) {
            score += value;
            responses++;
        }
    });

    // Promediar
    if (responses > 0) {
        score = score / responses;
    }

    appState.viabilityScores.social = score;
    showNotification('Viabilidad Social calculada: ' + score.toFixed(1) + '/5');
}

function displayIntegralResults() {
    const scores = appState.viabilityScores;

    // Verificar si hay suficientes cálculos
    if (Object.keys(scores).length < 5) {
        document.getElementById('viability-no-data').style.display = 'block';
        document.getElementById('viability-results-summary').style.display = 'none';
        return;
    }

    document.getElementById('viability-no-data').style.display = 'none';
    document.getElementById('viability-results-summary').style.display = 'block';

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

    // Actualizar color basado en score
    if (avgScore >= 4) {
        scoreValue.style.color = '#28a745';
    } else if (avgScore >= 3) {
        scoreValue.style.color = '#ffc107';
    } else {
        scoreValue.style.color = '#dc3545';
    }

    // Actualizar barras de viabilidad individual
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

// ============ FINANCIAL PARAMETERS HANDLER ============

function setupFinancialParameters() {
    // Todas las preguntas se muestran siempre, sin condicionalidad
    // La función se mantiene para compatibilidad futura
}

// ============ UTILITIES ============

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
