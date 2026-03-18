document.addEventListener('DOMContentLoaded', function() {
    console.log('Apresentação Voltaki carregada e pronta.');

    // --- FUNÇÕES DE INICIALIZAÇÃO DE COMPONENTES ---

    function initTypingEffect() {
        const typingEffectElement = document.getElementById('typing-effect');
        if (!typingEffectElement) return;

        const phrases = [
            "Aumente sua recorrência e faturamento.",
            "Crie sua própria comunidade.",
            "Economize com taxas de aplicativos.",
            "Saiba em tempo real se o seu cliente está satisfeito.",
            "Automatize seu marketing de retenção."
        ];
        let phraseIndex = 0, letterIndex = 0, isDeleting = false;

        function type() {
            const currentPhrase = phrases[phraseIndex];
            const highlightWords = ["recorrência", "faturamento", "comunidade", "Economize", "taxas", "satisfeito", "Automatize", "marketing", "retenção"];
            
            let text = isDeleting 
                ? currentPhrase.substring(0, letterIndex - 1)
                : currentPhrase.substring(0, letterIndex + 1);

            highlightWords.forEach(word => {
                const regex = new RegExp(`\b(${word})\b`, 'gi');
                text = text.replace(regex, `<span class="text-highlight-neon">$1</span>`);
            });
            typingEffectElement.innerHTML = text;
            
            letterIndex += isDeleting ? -1 : 1;

            let timeout = isDeleting ? 50 : 150;
            if (!isDeleting && letterIndex === currentPhrase.length) {
                timeout = 2000;
                isDeleting = true;
            } else if (isDeleting && letterIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                timeout = 500;
            }
            setTimeout(type, timeout);
        }
        type();
    }

    function initParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                "particles": {
                    "number": {
                        "value": 80,
                        "density": {
                            "enable": true,
                            "value_area": 800
                        }
                    },
                    "color": {
                        "value": "#ffffff"
                    },
                    "shape": {
                        "type": "circle",
                        "stroke": {
                            "width": 0,
                            "color": "#000000"
                        },
                        "polygon": {
                            "nb_sides": 5
                        }
                    },
                    "opacity": {
                        "value": 0.5,
                        "random": false,
                        "anim": {
                            "enable": false,
                            "speed": 1,
                            "opacity_min": 0.1,
                            "sync": false
                        }
                    },
                    "size": {
                        "value": 3,
                        "random": true,
                        "anim": {
                            "enable": false,
                            "speed": 40,
                            "size_min": 0.1,
                            "sync": false
                        }
                    },
                    "line_linked": {
                        "enable": true,
                        "distance": 150,
                        "color": "#ffffff",
                        "opacity": 0.4,
                        "width": 1
                    },
                    "move": {
                        "enable": true,
                        "speed": 6,
                        "direction": "none",
                        "random": false,
                        "straight": false,
                        "out_mode": "out",
                        "bounce": false,
                        "attract": {
                            "enable": false,
                            "rotateX": 600,
                            "rotateY": 1200
                        }
                    }
                },
                "interactivity": {
                    "detect_on": "canvas",
                    "events": {
                        "onhover": {
                            "enable": true,
                            "mode": "repulse"
                        },
                        "onclick": {
                            "enable": true,
                            "mode": "push"
                        },
                        "resize": true
                    },
                    "modes": {
                        "grab": {
                            "distance": 400,
                            "line_linked": {
                                "opacity": 1
                            }
                        },
                        "bubble": {
                            "distance": 400,
                            "size": 40,
                            "duration": 2,
                            "opacity": 8,
                            "speed": 3
                        },
                        "repulse": {
                            "distance": 200,
                            "duration": 0.4
                        },
                        "push": {
                            "particles_nb": 4
                        },
                        "remove": {
                            "particles_nb": 2
                        }
                    }
                },
                "retina_detect": true
            });
        }
    }

    function initCacChart() {
        const ctx = document.getElementById('cac-chart')?.getContext('2d');
        if (!ctx) return;
        if (window.myCacChart instanceof Chart) window.myCacChart.destroy();

        const colors = {
            textColor: '#F0F0F0',
            gridColor: 'rgba(255, 255, 255, 0.1)',
            voltakiRed: '#E76F51',
            voltakiGreen: '#2A9D8F'
        };

        window.myCacChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Adquirir Novo Cliente', 'Reter Cliente Existente'],
                datasets: [{
                    data: [5, 1],
                    backgroundColor: [colors.voltakiRed, colors.voltakiGreen],
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                scales: {
                    x: { 
                        beginAtZero: true, 
                        ticks: { color: colors.textColor, font: { family: "'Inter', sans-serif" } }, 
                        grid: { color: colors.gridColor } 
                    },
                    y: { 
                        ticks: { color: colors.textColor, font: { family: "'Poppins', sans-serif", size: 14, weight: '600' } }, 
                        grid: { display: false } 
                    }
                },
                plugins: {
                    legend: { display: false },
                    title: { 
                        display: true, 
                        text: 'Custo de Aquisição vs. Retenção', 
                        color: colors.textColor, 
                        font: { family: "'Poppins', sans-serif", size: 18, weight: '700' } 
                    }
                }
            }
        });
    }

    function initFeesChart() {
        const ctx = document.getElementById('fees-chart')?.getContext('2d');
        if (!ctx) return;
        if (window.myFeesChart instanceof Chart) window.myFeesChart.destroy();

        const profitCenter = document.getElementById('profit-center');
        const colors = {
            textColor: '#F0F0F0',
            borderColor: '#0D1B2A',
            voltakiRed: '#E76F51',
            voltakiGreen: '#2A9D8F',
            accentBlue: '#4A90E2',
            accentYellow: '#feca57',
            accentGray: '#5A6A7B'
        };
        
        window.myFeesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Taxas de Plataforma', 'Marketing', 'Custo do Produto', 'Custos Operacionais', 'Seu Lucro'],
                datasets: [{
                    data: [26, 8, 30, 30, 6],
                    backgroundColor: ['#FF5722', colors.accentBlue, colors.accentYellow, colors.accentGray, colors.voltakiGreen],
                    borderColor: colors.borderColor, 
                    borderWidth: 5, 
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '70%',
                plugins: {
                    legend: { 
                        position: 'bottom', 
                        labels: { 
                            color: colors.textColor, 
                            font: { family: "'Inter', sans-serif", size: 12 }, 
                            padding: 20, 
                            usePointStyle: true, 
                            pointStyle: 'rectRounded' 
                        } 
                    },
                    title: { 
                        display: true, 
                        text: 'Divisão de um Pedido de R$100 no App', 
                        color: colors.textColor, 
                        font: { family: "'Poppins', sans-serif", size: 18, weight: 'bold' }, 
                        padding: { bottom: 25 } 
                    }
                },
                animation: {
                    duration: 1200, easing: 'easeInOutCubic',
                    onComplete: () => { if(profitCenter) profitCenter.classList.remove('profit-center-hidden'); }
                }
            }
        });
    }

    function initSavingsCalculator() {
        const faturamentoInput = document.getElementById('faturamento-apps');
        const marketingInput = document.getElementById('investimento-marketing');
        const taxaInput = document.getElementById('taxa-apps');
        const reducaoInput = document.getElementById('reducao-marketing');

        const faturamentoValueSpan = document.getElementById('faturamento-apps-value');
        const marketingValueSpan = document.getElementById('investimento-marketing-value');
        const taxaValueSpan = document.getElementById('taxa-apps-value');
        const reducaoValueSpan = document.getElementById('reducao-marketing-value');

        const elems = {
            taxas: document.getElementById('economia-taxas'),
            marketing: document.getElementById('economia-marketing'),
            total: document.getElementById('economia-total'),
            anual: document.getElementById('potencial-anual'),
            ctx: document.getElementById('savings-chart')?.getContext('2d')
        };
        if (!elems.ctx) return;

        let savingsChart;
        const formatCurrency = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        function animateNumberChange(element, startValue, endValue, isCurrency = true, isPercentage = false) {
            const duration = 500; // milliseconds
            let startTime = null;

            function step(currentTime) {
                if (!startTime) startTime = currentTime;
                const progress = Math.min((currentTime - startTime) / duration, 1);
                const currentValue = startValue + (endValue - startValue) * progress;

                let formattedValue;
                if (isCurrency) {
                    formattedValue = formatCurrency(currentValue);
                } else if (isPercentage) {
                    formattedValue = `${Math.round(currentValue)}%`;
                } else {
                    formattedValue = Math.round(currentValue).toLocaleString('pt-BR');
                }
                element.textContent = formattedValue;

                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            }
            window.requestAnimationFrame(step);
        }

        function calculateAndRender() {
            const faturamento = parseFloat(faturamentoInput.value) || 0;
            const marketing = parseFloat(marketingInput.value) || 0;
            const taxa = parseFloat(taxaInput.value) || 0;
            const reducao = parseFloat(reducaoInput.value) || 0;

            const oldEconomiaTaxas = parseFloat(elems.taxas.textContent.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
            const oldEconomiaMarketing = parseFloat(elems.marketing.textContent.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
            const oldEconomiaTotal = parseFloat(elems.total.textContent.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
            const oldPotencialAnual = parseFloat(elems.anual.textContent.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;

            const economiaTaxas = faturamento * (taxa / 100);
            const economiaMarketing = marketing * (reducao / 100);
            const economiaTotal = economiaTaxas + economiaMarketing;
            const potencialAnual = economiaTotal * 12;
            
            animateNumberChange(elems.taxas, oldEconomiaTaxas, economiaTaxas);
            animateNumberChange(elems.marketing, oldEconomiaMarketing, economiaMarketing);
            animateNumberChange(elems.total, oldEconomiaTotal, economiaTotal);
            animateNumberChange(elems.anual, oldPotencialAnual, potencialAnual);

            faturamentoValueSpan.textContent = formatCurrency(faturamento);
            marketingValueSpan.textContent = formatCurrency(marketing);
            taxaValueSpan.textContent = `${taxa}%`;
            reducaoValueSpan.textContent = `${reducao}%`;
            
            if (savingsChart) {
                savingsChart.data.datasets[0].data = [economiaTaxas, economiaMarketing];
                savingsChart.update('none'); // 'none' para evitar re-animação
            }
        }
        
        if (window.mySavingsChart instanceof Chart) window.mySavingsChart.destroy();
        const colors = {
            textColor: '#F0F0F0',
            borderColor: '#0D1B2A',
            voltakiRed: '#E76F51',
            accentBlue: '#4A90E2'
        };
        savingsChart = new Chart(elems.ctx, {
            type: 'bar', // Mudar para 'bar'
            data: {
                labels: ['Economia com Taxas', 'Economia com Marketing'],
                datasets: [{
                    label: 'Economia Mensal',
                    data: [0, 0],
                    backgroundColor: [
                        'rgba(255, 87, 51, 0.7)', // Cor primária com transparência
                        'rgba(74, 144, 226, 0.7)'  // Cor de destaque com transparência
                    ],
                    borderColor: [
                        '#FF5722',
                        '#4A90E2'
                    ],
                    borderWidth: 2,
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: 'y', // <-- Torna o gráfico horizontal
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: colors.textColor,
                            font: { family: "'Inter', sans-serif" },
                            // Formata os ticks do eixo X como moeda
                            callback: function(value, index, values) {
                                return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: colors.textColor,
                            font: { family: "'Poppins', sans-serif", size: 14 }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // Legenda é redundante com os rótulos do eixo Y
                    },
                    title: {
                        display: true,
                        text: 'Origem da Economia Mensal',
                        color: colors.textColor,
                        font: { family: "'Poppins', sans-serif", size: 18, weight: '600' },
                        padding: { bottom: 20 }
                    },
                    tooltip: {
                        backgroundColor: '#0D1B2A',
                        titleFont: { family: "'Poppins', sans-serif", size: 16 },
                        bodyFont: { family: "'Inter', sans-serif", size: 14 },
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.x !== null) {
                                    label += formatCurrency(context.parsed.x);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
        window.mySavingsChart = savingsChart;

        [faturamentoInput, marketingInput, taxaInput, reducaoInput].forEach(input => input.addEventListener('input', calculateAndRender));
        calculateAndRender();
    }

    function initScrollProgressBar() {
        const progressBar = document.getElementById('scroll-progress');
        if (!progressBar) return;

        window.addEventListener('scroll', () => {
            const totalHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPosition = window.scrollY;
            const progress = (scrollPosition / totalHeight) * 100;
            progressBar.style.width = progress + '%';
        });
    }

    function initTiltEffect() {
        VanillaTilt.init(document.querySelectorAll(".glass-card"), {
            max: 10,
            speed: 400,
            glare: true,
            "max-glare": 0.2,
        });
    }
    
    // Helper function for counter animation
    function animateCounter(counterElement, isCurrency = true) {
        const target = +counterElement.getAttribute('data-target');
        const duration = 2000; // 2 segundos
        let start = null;
        const initialValue = parseFloat(counterElement.innerText.replace(',', '.')) || 0;

        const step = timestamp => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            let current = progress * (target - initialValue) + initialValue;
            
            if (isCurrency) {
                 counterElement.innerText = current.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            } else if (target % 1 !== 0) { // se for decimal
                counterElement.innerText = current.toFixed(1).replace('.', ',');
            }
             else {
                counterElement.innerText = Math.floor(current).toLocaleString('pt-BR');
            }


            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                 if (isCurrency) {
                    counterElement.innerText = target.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                } else if (target % 1 !== 0) {
                    counterElement.innerText = target.toFixed(1).replace('.', ',');
                } else {
                    counterElement.innerText = target.toLocaleString('pt-BR');
                }
            }
        };
        window.requestAnimationFrame(step);
    }

        function initScrollytelling() {
            const scrollytellingSection = document.getElementById('implicacao');
            if (!scrollytellingSection) return;
    
            const steps = scrollytellingSection.querySelectorAll('.scrollytelling-step');
            const scrollyGraphics = scrollytellingSection.querySelectorAll('.scrolly-graphic');
            let currentActiveStep = -1; // Nenhum passo ativo inicialmente
    
            // Garante que todos os gráficos estejam inativos no início
            scrollyGraphics.forEach(graphic => graphic.classList.remove('active'));
    
            const observerOptions = {
                root: null, // viewport
                rootMargin: '0px',
                threshold: 0.7 // Aciona quando 70% do passo está visível
            };
    
            const scrollyObserver = new IntersectionObserver((entries) => {
                let isAnyStepIntersecting = false;
                
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        isAnyStepIntersecting = true;
                        currentActiveStep = parseInt(entry.target.dataset.step) - 1;
                    }
                });
                
                // Desativa todos os gráficos
                scrollyGraphics.forEach(graphic => graphic.classList.remove('active'));
    
                // Ativa o gráfico correto se um passo estiver visível
                if (isAnyStepIntersecting && scrollyGraphics[currentActiveStep]) {
                    scrollyGraphics[currentActiveStep].classList.add('active');
    
                    // Lógica para animar apenas uma vez
                    if (currentActiveStep === 0) { // Passo 1: Gráfico
                        initCacChart();
                    } else if (currentActiveStep === 1 || currentActiveStep === 2) { // Passo 2 ou 3: Números
                        const counter = scrollyGraphics[currentActiveStep].querySelector('.impact-number');
                        if (counter && !counter.dataset.animated) {
                            animateCounter(counter);
                            counter.dataset.animated = 'true'; // Marca como animado
                        }
                    }
                }
            }, observerOptions);
    
            steps.forEach(step => scrollyObserver.observe(step));
        }
    
        // Função para o efeito de digitação do título "Transforme o seu jogo!"
        function initTransformeTituloTypingEffect() {
            const transformeTitulo = document.getElementById('transforme-titulo');
            if (!transformeTitulo) return;
    
            const textToType = "Transforme o seu jogo!";
            let charIndex = 0;
    
            function type() {
                if (charIndex < textToType.length) {
                    transformeTitulo.textContent += textToType.charAt(charIndex);
                    charIndex++;
                    setTimeout(type, 100); // Ajuste a velocidade de digitação aqui
                } else {
                    // Opcional: para o cursor ou reinicia a animação se necessário
                }
            }
            
            // Limpa o conteúdo inicial e inicia a digitação
            transformeTitulo.textContent = ''; 
            type();
        }
    
    
        // --- LÓGICA DE INICIALIZAÇÃO GERAL ---
            initTypingEffect();
    initParticles();
    initTiltEffect();
    initScrollProgressBar();
    initScrollytelling();
    initTransformeTituloTypingEffect(); // Nova chamada

    // Navbar Inteligente no Scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });

    const navLinks = document.querySelectorAll('.navbar-nav .nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if(targetElement) targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Main IntersectionObserver for fade-in elements (excluding scrollytelling section)
    const mainObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                const id = entry.target.id;
                if (id === 'fees-chart') initFeesChart();
                else if (id === 'savings-chart') initSavingsCalculator();
                else if (id === 'como-funciona') {
                    initConnectorLine(); // Adiciona esta chamada
                    const steps = entry.target.querySelectorAll('.how-it-works-step');
                    steps.forEach((step, index) => {
                        const delay = parseInt(step.getAttribute('data-step-delay')) || (index * 200);
                        setTimeout(() => {
                            step.classList.add('is-visible');
                        }, delay);
                    });
                } else if (id === 'dashboard-preview') {
                    const kpiValues = entry.target.querySelectorAll('.kpi-value');
                    kpiValues.forEach(kpi => {
                        const target = parseFloat(kpi.textContent.replace(',', '.'));
                        kpi.setAttribute('data-target', target);
                        animateCounter(kpi, false); // false para nao formatar como moeda
                    });
                }

                mainObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    function initConnectorLine() {
        const container = document.querySelector('.how-it-works-grid');
        const svg = container.querySelector('.connector-line');
        const path = svg.querySelector('path');
        const steps = Array.from(container.querySelectorAll('.how-it-works-step'));

        if (!container || !svg || !path || steps.length < 2) return;

        const updateLine = () => {
            const containerRect = container.getBoundingClientRect();
            let pathData = '';

            for (let i = 0; i < steps.length; i++) {
                const stepRect = steps[i].getBoundingClientRect();
                const x = stepRect.left - containerRect.left + stepRect.width / 2;
                const y = stepRect.top - containerRect.top + stepRect.height / 2;

                if (i === 0) {
                    pathData += `M ${x} ${y}`;
                } else {
                    const prevStepRect = steps[i - 1].getBoundingClientRect();
                    const prevX = prevStepRect.left - containerRect.left + prevStepRect.width / 2;
                    const prevY = prevStepRect.top - containerRect.top + prevStepRect.height / 2;

                    // Adiciona um ponto de controle para a curva
                    const cx = (prevX + x) / 2;
                    const cy = (prevY + y) / 2;
                     // Use uma curva quadrática para um visual mais suave
                    pathData += ` Q ${cx} ${prevY}, ${ (x + prevX) / 2 } ${ (y + prevY) / 2 } T ${x} ${y}`;
                }
            }
            path.setAttribute('d', pathData);
            
            // Anima o traçado da linha
            const length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
            // Força o reflow para garantir que a animação comece
            path.getBoundingClientRect(); 
            path.style.strokeDashoffset = 0;
        };

        // Update on load and window resize
        updateLine();
        window.addEventListener('resize', updateLine);
    }


    // Observe all fade-in elements, but exclude the scrollytelling section's components
    document.querySelectorAll('.fade-in-element, #fees-chart, #savings-chart, #como-funciona, #dashboard-preview').forEach(el => {
        mainObserver.observe(el);
    });

    // Scroll-to-Top Button Logic
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { // Show button after scrolling 300px
                scrollToTopBtn.style.display = 'block';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
