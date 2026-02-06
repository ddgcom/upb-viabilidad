// Estado de la aplicación
const appState = {
    currentMainTab: 'caracterizacion-inicial',
    currentViabilityTab: 'energetica',
    viabilityScores: {},
    formData: {}
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initMainTabs();
    initViabilityTabs();
});

// ============ MAIN TABS (Pestañas principales moradas) ============

function initMainTabs() {
    const mainTabs = document.querySelectorAll('.main-tab');
    mainTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchMainTab(tabId);
        });
    });
}

function switchMainTab(tabId) {
    appState.currentMainTab = tabId;

    // Actualizar pestañas
    document.querySelectorAll('.main-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        }
    });

    // Mostrar contenido correspondiente
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetContent = document.getElementById(tabId);
    if (targetContent) {
        targetContent.classList.add('active');
    }

    // Si es viabilidad integral, calcular resultados
    if (tabId === 'viabilidad-integral') {
        displayIntegralResults();
    }

    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============ VIABILITY TABS (6 viabilidades) ============

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

    // Actualizar pestañas de viabilidad
    document.querySelectorAll('.viability-main-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-viability') === tabId) {
            tab.classList.add('active');
        }
    });

    // Mostrar contenido correspondiente
    document.querySelectorAll('.viability-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetContent = document.getElementById(tabId);
    if (targetContent) {
        targetContent.classList.add('active');
    }

    // Scroll al inicio del contenido
    window.scrollTo({ top: 200, behavior: 'smooth' });
}

// ============ CÁLCULO DE POTENCIAL ENERGÉTICO ============

function calculatePotential() {
    // Cálculo Solar
    const solarArea = parseFloat(document.querySelector('[name="cp_solar_area"]')?.value) || 0;
    const solarHSP = parseFloat(document.querySelector('[name="cp_solar_hsp"]')?.value) || 4.5;
    const solarEfficiency = 0.18; // 18% eficiencia típica
    const solarPotential = solarArea * solarHSP * solarEfficiency * 365;

    // Mostrar resultados
    const resultSolar = document.getElementById('result_solar');
    if (resultSolar) {
        resultSolar.textContent = solarPotential > 0 ? `${Math.round(solarPotential).toLocaleString()} kWh/año` : '-- kWh/año';
    }

    // Cálculo Eólico (simplificado)
    const eolicoVelocidad = parseFloat(document.querySelector('[name="cp_eolico_velocidad"]')?.value) || 0;
    let eolicoPotential = 0;
    if (eolicoVelocidad > 0) {
        // Fórmula simplificada: P = 0.5 * densidad * A * v^3 * Cp
        eolicoPotential = 0.5 * 1.225 * 50 * Math.pow(eolicoVelocidad, 3) * 0.35 * 8760 / 1000;
    }

    const resultEolico = document.getElementById('result_eolico');
    if (resultEolico) {
        resultEolico.textContent = eolicoPotential > 0 ? `${Math.round(eolicoPotential).toLocaleString()} kWh/año` : '-- kWh/año';
    }

    // Cálculo Hídrico (simplificado)
    const hidricoAltura = document.querySelector('[name="cp_hidrico_altura"]')?.value;
    const hidricoCaudal = document.querySelector('[name="cp_hidrico_caudal"]')?.value;
    let hidricoPotential = 0;

    const alturaMap = { 'baja': 3, 'media': 12, 'alta': 30, 'no-disponible': 0 };
    const caudalMap = { 'bajo': 5, 'medio': 25, 'alto': 75, 'desconocido': 0 };

    if (hidricoAltura && hidricoCaudal) {
        const h = alturaMap[hidricoAltura] || 0;
        const q = caudalMap[hidricoCaudal] || 0;
        // P = 9.81 * Q * H * eficiencia * horas/año
        hidricoPotential = 9.81 * (q / 1000) * h * 0.7 * 8760;
    }

    const resultHidrico = document.getElementById('result_hidrico');
    if (resultHidrico) {
        resultHidrico.textContent = hidricoPotential > 0 ? `${Math.round(hidricoPotential).toLocaleString()} kWh/año` : '-- kWh/año';
    }

    // Cálculo Biomasa (simplificado)
    const bovinos = parseInt(document.querySelector('[name="cp_biomasa_bovinos"]')?.value) || 0;
    const porcinos = parseInt(document.querySelector('[name="cp_biomasa_porcinos"]')?.value) || 0;
    const aves = parseInt(document.querySelector('[name="cp_biomasa_aves"]')?.value) || 0;

    // kg estiercol/día * m3 biogás/kg * kWh/m3 * días/año
    const biomasaPotential = (bovinos * 20 * 0.04 + porcinos * 5 * 0.06 + aves * 0.1 * 0.08) * 2 * 365;

    const resultBiomasa = document.getElementById('result_biomasa');
    if (resultBiomasa) {
        resultBiomasa.textContent = biomasaPotential > 0 ? `${Math.round(biomasaPotential).toLocaleString()} kWh/año` : '-- kWh/año';
    }

    showNotification('Cálculo de potencial energético completado');
}

// ============ CÁLCULO DE VIABILIDADES ============

function calculateAllViability() {
    // Calcular todas las viabilidades
    calculateViabilitySocial();
    calculateViabilityTecnica();
    calculateViabilityEnergetica();
    calculateViabilityAmbiental();
    calculateViabilityJuridica();
    calculateViabilityFinanciera();

    // Ir a viabilidad integral
    switchMainTab('viabilidad-integral');
}

function calculateViabilitySocial() {
    let score = 2.5; // Puntuación base

    // Evaluar motivaciones seleccionadas
    const motivaciones = document.querySelectorAll('[name="vs_motivaciones"]:checked');
    score += Math.min(motivaciones.length * 0.3, 1);

    // Evaluar participación
    const participacion = document.querySelector('[name="vs_participacion"]:checked');
    if (participacion) {
        score += parseInt(participacion.value) * 0.2;
    }

    // Evaluar consenso
    const consenso = document.querySelector('[name="vs_consenso"]:checked');
    if (consenso) {
        const consensoValues = { 'total': 1, 'mayoritario': 0.7, 'parcial': 0.4, 'bajo': 0.2, 'conflicto': 0 };
        score += consensoValues[consenso.value] || 0;
    }

    // Evaluar capacidad técnica
    const capacidades = document.querySelectorAll('[name="vs_capacidad"]:checked');
    score += Math.min(capacidades.length * 0.15, 0.5);

    score = Math.min(Math.max(score, 0), 5);
    appState.viabilityScores.social = score;
}

function calculateViabilityTecnica() {
    let score = 2; // Puntuación base

    // Potencial calculado
    const potencial = document.querySelector('[name="vt_potencial"]:checked');
    if (potencial && potencial.value === 'si') {
        score += 1;
    }

    // Redes de distribución
    const redes = document.querySelector('[name="vt_redes"]:checked');
    if (redes) {
        score += parseInt(redes.value) * 0.2;
    }

    // Espacio disponible
    const espacio = document.querySelector('[name="vt_espacio"]:checked');
    if (espacio && espacio.value === 'si') {
        score += 0.5;
    }

    // Experiencia previa
    const experiencia = document.querySelector('[name="vt_experiencia"]:checked');
    if (experiencia) {
        score += parseInt(experiencia.value) * 0.1;
    }

    // Mantenimiento
    const mantenimiento = document.querySelector('[name="vt_mantenimiento"]:checked');
    if (mantenimiento) {
        score += parseInt(mantenimiento.value) * 0.1;
    }

    score = Math.min(Math.max(score, 0), 5);
    appState.viabilityScores.tecnica = score;
}

function calculateViabilityEnergetica() {
    let score = 2; // Puntuación base

    // Factor de planta
    const factorPlanta = parseFloat(document.querySelector('[name="ve_factor_planta"]')?.value) || 0;
    if (factorPlanta >= 25) score += 1.5;
    else if (factorPlanta >= 20) score += 1;
    else if (factorPlanta >= 15) score += 0.5;

    // Capacidad menor a 100kW (más fácil de gestionar)
    const capacidad100 = document.querySelector('[name="ve_capacidad_100"]:checked');
    if (capacidad100 && capacidad100.value === 'no') {
        score += 0.5;
    }

    // Certificado operador de red
    const certificado = document.querySelector('[name="ve_certificado_or"]:checked');
    if (certificado) {
        if (certificado.value === 'si') score += 0.5;
        else if (certificado.value === 'en-tramite') score += 0.25;
    }

    // Distribución de demanda
    const dispersion = document.querySelector('[name="ve_dispersion"]:checked');
    if (dispersion) {
        const dispersionValues = { 'concentrada': 0.5, 'media': 0.3, 'dispersa': 0.1 };
        score += dispersionValues[dispersion.value] || 0;
    }

    score = Math.min(Math.max(score, 0), 5);
    appState.viabilityScores.energetica = score;
}

function calculateViabilityAmbiental() {
    let score = 3; // Puntuación base

    // Restricciones ambientales
    const restricciones = document.querySelectorAll('[name="va_restricciones"]:checked');
    const tieneNinguno = Array.from(restricciones).some(r => r.value === 'ninguno');
    if (tieneNinguno) {
        score += 1;
    } else {
        score -= restricciones.length * 0.3;
    }

    // POT permite el proyecto
    const pot = document.querySelector('[name="va_pot"]:checked');
    if (pot) {
        if (pot.value === 'si') score += 0.5;
        else if (pot.value === 'no') score -= 1;
    }

    // Estado de licencia ambiental
    const licencia = document.querySelector('[name="va_licencia"]:checked');
    if (licencia) {
        const licenciaValues = { 'otorgada': 1, 'en-tramite': 0.5, 'planeacion': 0.2, 'no-planificado': 0 };
        score += licenciaValues[licencia.value] || 0;
    }

    // Comunidades étnicas (requiere consulta previa)
    const etnicas = document.querySelector('[name="va_comunidades_etnicas"]:checked');
    if (etnicas && etnicas.value === 'no') {
        score += 0.3;
    }

    // Amenazas
    const amenazas = document.querySelectorAll('[name="va_amenazas"]:checked');
    const tieneNingunaAmenaza = Array.from(amenazas).some(a => a.value === 'ninguna');
    if (tieneNingunaAmenaza) {
        score += 0.3;
    } else {
        score -= amenazas.length * 0.2;
    }

    score = Math.min(Math.max(score, 0), 5);
    appState.viabilityScores.ambiental = score;
}

function calculateViabilityJuridica() {
    let score = 0; // Inicia en 0 porque requiere registro

    // Registro jurídico
    const registro = document.querySelector('[name="vj_registro"]:checked');
    if (registro && registro.value === 'si') {
        score += 2;
    } else {
        score = 0; // No viable sin registro
        appState.viabilityScores.juridica = score;
        return;
    }

    // Documentos disponibles
    const documentos = document.querySelectorAll('[name="vj_docs"]:checked');
    score += Math.min(documentos.length * 0.4, 1.5);

    // Registro RCE
    const rce = document.querySelector('[name="vj_rce"]:checked');
    if (rce) {
        if (rce.value === 'si') score += 1;
        else if (rce.value === 'en-tramite') score += 0.5;
    }

    // Capacidad menor a 5MW
    const capacidad = document.querySelector('[name="vj_capacidad"]:checked');
    if (capacidad && capacidad.value === 'si') {
        score += 0.5;
    }

    score = Math.min(Math.max(score, 0), 5);
    appState.viabilityScores.juridica = score;
}

function calculateViabilityFinanciera() {
    let score = 2; // Puntuación base

    // Recursos propios
    const recursos = document.querySelector('[name="vf_recursos"]:checked');
    if (recursos && recursos.value === 'si') {
        score += 0.5;
        const monto = parseFloat(document.querySelector('[name="vf_monto"]')?.value) || 0;
        if (monto > 0) score += 0.5;
    }

    // Fuentes de financiación estatales
    const fuentesEstado = document.querySelectorAll('[name="vf_fuentes_estado"]:checked');
    score += Math.min(fuentesEstado.length * 0.2, 0.8);

    // CAPEX calculado
    const capacidadKw = parseFloat(document.querySelector('[name="vf_capacidad_kw"]')?.value) || 0;
    const costoKw = parseFloat(document.querySelector('[name="vf_costo_kw"]')?.value) || 0;
    if (capacidadKw > 0 && costoKw > 0) {
        const capex = capacidadKw * costoKw;
        const capexInput = document.querySelector('[name="vf_capex"]');
        if (capexInput) capexInput.value = capex;
        score += 0.5;
    }

    // Incentivos tributarios
    const incentivos = document.querySelectorAll('[name="vf_incentivos"]:checked');
    score += Math.min(incentivos.length * 0.2, 0.7);

    score = Math.min(Math.max(score, 0), 5);
    appState.viabilityScores.financiera = score;
}

// ============ MOSTRAR RESULTADOS INTEGRALES ============

function displayIntegralResults() {
    const scores = appState.viabilityScores;
    const viabilidades = ['energetica', 'ambiental', 'legal', 'financiera', 'social'];

    let totalScore = 0;
    let validCount = 0;

    viabilidades.forEach(viab => {
        const score = scores[viab] || 0;
        const message = getViabilityMessage(viab, score);

        // Update main tab (viabilidad-integral)
        const scoreElement = document.getElementById(`integral_${viab}`);
        const msgElement = document.getElementById(`msg_${viab}`);

        if (scoreElement) {
            scoreElement.textContent = `${score.toFixed(1)}/5`;
        }

        if (msgElement) {
            msgElement.textContent = message;
        }

        // Update subtab (integral within viabilidad tab)
        const subtabScoreElement = document.getElementById(`subtab_integral_${viab}`);
        const subtabMsgElement = document.getElementById(`subtab_msg_${viab}`);

        if (subtabScoreElement) {
            subtabScoreElement.textContent = `${score.toFixed(1)}/5`;
        }

        if (subtabMsgElement) {
            subtabMsgElement.textContent = message;
        }

        if (score > 0) {
            totalScore += score;
            validCount++;
        }
    });

    // Calcular promedio general
    const overallScore = validCount > 0 ? totalScore / validCount : 0;

    // Determine classification text and color
    let classificationText = 'Pendiente';
    let classificationColor = '#666';

    if (overallScore >= 4) {
        classificationText = 'Alta - Viable';
        classificationColor = '#27ae60';
    } else if (overallScore >= 3) {
        classificationText = 'Media - Requiere ajustes';
        classificationColor = '#f39c12';
    } else if (overallScore > 0) {
        classificationText = 'Baja - Barreras críticas';
        classificationColor = '#e74c3c';
    }

    // Update main tab (viabilidad-integral)
    const overallElement = document.getElementById('overall_score');
    if (overallElement) {
        overallElement.textContent = overallScore.toFixed(1);
    }

    const classificationElement = document.getElementById('classification_value');
    if (classificationElement) {
        classificationElement.textContent = classificationText;
        classificationElement.style.color = classificationColor;
    }

    // Update subtab (integral within viabilidad tab)
    const subtabOverallElement = document.getElementById('integral_overall_score');
    if (subtabOverallElement) {
        subtabOverallElement.textContent = overallScore.toFixed(1);
    }

    const subtabClassificationElement = document.getElementById('integral_classification');
    if (subtabClassificationElement) {
        subtabClassificationElement.textContent = classificationText;
        subtabClassificationElement.style.color = classificationColor;
    }

    // Generar recomendaciones
    generateRecommendations(scores, overallScore);
}

function getViabilityMessage(type, score) {
    const messages = {
        energetica: {
            high: 'El potencial energético y la infraestructura son favorables para el proyecto.',
            medium: 'Se requieren mejoras en infraestructura o conexión a red.',
            low: 'Es necesario evaluar alternativas tecnológicas o mejorar infraestructura.'
        },
        ambiental: {
            high: 'El proyecto cumple con los requisitos ambientales.',
            medium: 'Se requieren algunos permisos o estudios ambientales adicionales.',
            low: 'Existen restricciones ambientales significativas a resolver.'
        },
        legal: {
            high: 'La comunidad tiene constituida su personería jurídica y documentación completa.',
            medium: 'Se requiere completar documentación o registros pendientes.',
            low: 'Es prioritario constituir legalmente la comunidad energética.'
        },
        financiera: {
            high: 'El proyecto cuenta con fuentes de financiación identificadas y viabilidad financiera.',
            medium: 'Se requiere gestionar fuentes adicionales de financiación.',
            low: 'Es necesario desarrollar un plan financiero sólido.'
        },
        social: {
            high: 'La comunidad muestra alto nivel de cohesión social, liderazgo y participación activa.',
            medium: 'Se requiere fortalecer la participación comunitaria y el consenso.',
            low: 'Es necesario trabajar en la cohesión social y gobernanza antes de avanzar.'
        }
    };

    let level = 'low';
    if (score >= 4) level = 'high';
    else if (score >= 3) level = 'medium';

    return messages[type]?.[level] || 'Complete la evaluación para ver el resultado.';
}

function generateRecommendations(scores, overallScore) {
    const recommendationsDiv = document.getElementById('recommendations_content');
    if (!recommendationsDiv) return;

    let recommendations = [];

    if (scores.energetica < 3) {
        recommendations.push('- Revisar el cálculo de potencial energético y evaluar tecnologías alternativas.');
    }
    if (scores.ambiental < 3) {
        recommendations.push('- Gestionar permisos ambientales y verificar zonificación del POT.');
    }
    if (scores.legal < 3) {
        recommendations.push('- Priorizar la constitución legal de la comunidad energética y registro en el RCE.');
    }
    if (scores.financiera < 3) {
        recommendations.push('- Identificar y gestionar fuentes de financiación (FAER, FENOGE, cooperación).');
    }
    if (scores.social < 3) {
        recommendations.push('- Realizar talleres de sensibilización, fortalecer liderazgo y gobernanza comunitaria.');
    }

    if (recommendations.length === 0) {
        recommendations.push('El proyecto presenta buenas condiciones de viabilidad. Se recomienda avanzar a la fase de diseño integral.');
    }

    recommendationsDiv.innerHTML = recommendations.join('<br>');
}

// ============ EXPORTAR RESULTADOS ============

function exportResults() {
    const scores = appState.viabilityScores;
    const data = {
        fecha: new Date().toLocaleDateString('es-CO'),
        viabilidades: scores,
        promedioGeneral: Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `viabilidad_integral_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Resultados exportados correctamente');
}

// ============ NOTIFICACIONES ============

function showNotification(message) {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #27ae60;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
