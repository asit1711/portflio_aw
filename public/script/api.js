// Project Configuration
const GITHUB_USERNAME = 'asit1711';
const PROJECTS_CONFIG = [
    {
        title: 'MettaMate Platform',
        description: 'Community-built platform focused on networking, mentorship, events, and meaningful social impact experiences.',
        image: './assets/img/mettamate-platform.png',
        demoUrl: 'https://app.mettamate.ai/index',
        repoUrl: 'https://github.com/asit1711',
        technologies: ['Node.js', 'Express', 'Redis', 'BullMQ', 'JavaScript'],
        category: 'web'
    },
    {
        title: 'Redis Based Email Queued System',
        description: 'A resilient email delivery pipeline using Redis-backed queues, background workers, and retry logic to process high-volume transactional emails reliably.',
        image: './assets/img/email-queued-system.png',
        repoUrl: 'https://github.com/asit1711/Redis-Based-Email-Queue-System',
        technologies: ['Node.js', 'Express', 'Redis', 'BullMQ', 'Nodemailer'],
        category: 'api'
    }
];

// DOM Elements
const projectTimeline = document.getElementById('project-timeline');
const projectsGrid = document.getElementById('grid-view');
const loadingContainer = document.getElementById('loading-container');
const emptyState = document.getElementById('empty-state');
const projectModal = document.getElementById('project-modal');
const modalClose = document.getElementById('modal-close');
const filterButtons = document.querySelectorAll('.filter-btn');
const viewButtons = document.querySelectorAll('.projects-view-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const timelineIndicators = document.getElementById('timeline-indicators');

// Modal Elements
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalTech = document.getElementById('modal-tech');
const modalDescription = document.getElementById('modal-description');
const modalStats = document.getElementById('modal-stats');
const modalLinks = document.getElementById('modal-links');

// State
let projects = [];
let currentFilter = 'all';
let currentView = 'grid';
let currentProjectIndex = 0;
let scrollPosition = 0; // Store scroll position

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
    setupEventListeners();
});

// Scroll Lock Functions
function disableScroll() {
    // Store current scroll position
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add styles to prevent scrolling
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    
    // Also target the smooth-content wrapper if it exists
    const smoothContent = document.getElementById('smooth-content');
    if (smoothContent) {
        smoothContent.style.position = 'fixed';
        smoothContent.style.top = `-${scrollPosition}px`;
        smoothContent.style.width = '100%';
        smoothContent.style.overflow = 'hidden';
    }
}

function enableScroll() {
    // Remove scroll lock styles
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    
    // Remove styles from smooth-content if it exists
    const smoothContent = document.getElementById('smooth-content');
    if (smoothContent) {
        smoothContent.style.position = '';
        smoothContent.style.top = '';
        smoothContent.style.width = '';
        smoothContent.style.overflow = '';
    }
    
    // Restore scroll position
    window.scrollTo(0, scrollPosition);
}

// Event Listeners
function setupEventListeners() {
    modalClose.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            setActiveFilter(filter);
            filterProjects(filter);
        });
    });

    // View buttons
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const view = button.getAttribute('data-view');
            setActiveView(view);
        });
    });

    // Timeline controls
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            navigateTimeline(-1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            navigateTimeline(1);
        });
    }
}

function setActiveFilter(filter) {
    currentFilter = filter;
    
    filterButtons.forEach(button => {
        if (button.getAttribute('data-filter') === filter) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function setActiveView(view) {
    currentView = view;
    
    viewButtons.forEach(button => {
        if (button.getAttribute('data-view') === view) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    const timelineView = document.getElementById('timeline-view');

    if (view === 'timeline' && timelineView) {
        timelineView.style.display = 'block';
        if (projectsGrid) {
            projectsGrid.style.display = 'none';
        }
        updateTimeline();
    } else {
        if (timelineView) {
            timelineView.style.display = 'none';
        }
        if (projectsGrid) {
            projectsGrid.style.display = 'grid';
        }
        renderGridProjects();
    }
}

// Fetch Projects
async function fetchProjects() {
    try {
        const projectPromises = PROJECTS_CONFIG.map(config => {
            if (config.repoName) {
                const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${config.repoName}`;
                return fetch(apiUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Repo '${config.repoName}' not found or API limit reached.`);
                        }
                        return response.json();
                    })
                    .then(repoData => ({
                        ...config,
                        title: repoData.name.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                        description: repoData.description || 'No description provided.',
                        stars: repoData.stargazers_count,
                        forks: repoData.forks_count,
                        repoUrl: repoData.html_url,
                        technologies: config.technologies || [repoData.language].filter(Boolean),
                        category: config.category || 'web'
                    }))
                    .catch(error => {
                        console.warn(`Failed to fetch ${config.repoName}:`, error.message);
                        return null;
                    });
            } else {
                return Promise.resolve({
                    ...config,
                    category: config.category || 'web'
                });
            }
        });

        const results = await Promise.all(projectPromises);
        projects = results.filter(p => p !== null);
        
        loadingContainer.style.display = 'none';
        
        if (projects.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        if (currentView === 'timeline') {
            updateTimeline();
        } else {
            renderGridProjects();
        }
    } catch (error) {
        console.error("Error fetching projects:", error);
        showErrorState();
    }
}

// Timeline Functions
function updateTimeline() {
    if (projects.length === 0) return;

    const filteredProjects = currentFilter === 'all' 
        ? projects 
        : projects.filter(project => project.category === currentFilter);

    if (filteredProjects.length === 0) {
        emptyState.style.display = 'block';
        projectTimeline.innerHTML = '';
        timelineIndicators.innerHTML = '';
        return;
    }

    emptyState.style.display = 'none';
    projectTimeline.innerHTML = '';
    timelineIndicators.innerHTML = '';

    // Reset index if needed
    if (currentProjectIndex >= filteredProjects.length) {
        currentProjectIndex = 0;
    }

    // Create project nodes
    filteredProjects.forEach((project, index) => {
        const projectNode = createTimelineNode(project, index);
        projectTimeline.appendChild(projectNode);

        // Create indicator
        const indicator = document.createElement('div');
        indicator.className = 'projects-timeline-indicator';
        if (index === currentProjectIndex) {
            indicator.classList.add('active');
        }
        indicator.addEventListener('click', () => {
            currentProjectIndex = index;
            updateTimeline();
        });
        timelineIndicators.appendChild(indicator);
    });

    // Set node positions
    updateNodePositions();
}

function updateNodePositions() {
    const nodes = projectTimeline.querySelectorAll('.project-node');
    const filteredProjects = currentFilter === 'all' 
        ? projects 
        : projects.filter(project => project.category === currentFilter);

    nodes.forEach((node, index) => {
        node.classList.remove('active', 'prev', 'next', 'hidden', 'hidden-right');

        if (index === currentProjectIndex) {
            node.classList.add('active');
        } else if (index === (currentProjectIndex - 1 + filteredProjects.length) % filteredProjects.length) {
            node.classList.add('prev');
        } else if (index === (currentProjectIndex + 1) % filteredProjects.length) {
            node.classList.add('next');
        } else if (index < currentProjectIndex) {
            node.classList.add('hidden');
        } else {
            node.classList.add('hidden-right');
        }
    });

    // Update indicators
    const indicators = timelineIndicators.querySelectorAll('.projects-timeline-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentProjectIndex);
    });
}

function navigateTimeline(direction) {
    const filteredProjects = currentFilter === 'all' 
        ? projects 
        : projects.filter(project => project.category === currentFilter);

    if (filteredProjects.length === 0) return;

    currentProjectIndex = (currentProjectIndex + direction + filteredProjects.length) % filteredProjects.length;
    updateNodePositions();
}

function createTimelineNode(project, index) {
    const node = document.createElement('div');
    node.className = 'project-node';
    node.dataset.projectId = project.repoName || project.title;
    
    const technologiesHTML = project.technologies.map(tech => 
        `<span class="tech-tag">${tech}</span>`
    ).join('');

    const demoLinkHTML = project.demoUrl ? 
        `<a href="${project.demoUrl}" class="project-link" target="_blank" rel="noopener noreferrer" title="Live Demo">
            <i class="fas fa-external-link-alt"></i>
        </a>` : '';

    const githubLinkHTML = project.repoUrl ? 
        `<a href="${project.repoUrl}" class="project-link" target="_blank" rel="noopener noreferrer" title="View on GitHub">
            <i class="fab fa-github"></i>
        </a>` : '';

    const statsHTML = project.stars !== undefined && project.forks !== undefined ? 
        `<div class="project-stats">
            <span><i class="fas fa-star"></i> ${project.stars}</span>
            <span><i class="fas fa-code-branch"></i> ${project.forks}</span>
        </div>` : '';

    node.innerHTML = `
        <div class="project-card">
            <img src="${project.image}" alt="${project.title}" class="project-image">
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <div class="project-tech">${technologiesHTML}</div>
                <p class="project-description">${project.description}</p>
                <div class="project-footer">
                    ${statsHTML}
                    <div class="project-links">
                        ${githubLinkHTML}
                        ${demoLinkHTML}
                    </div>
                </div>
            </div>
        </div>
    `;

    node.addEventListener('click', (e) => {
        // Don't open modal if clicking on links
        if (!e.target.closest('.project-link')) {
            openModal(project);
        }
    });

    return node;
}

// Grid Functions
function renderGridProjects() {
    if (projects.length === 0) return;

    const filteredProjects = currentFilter === 'all' 
        ? projects 
        : projects.filter(project => project.category === currentFilter);

    if (filteredProjects.length === 0) {
        emptyState.style.display = 'block';
        projectsGrid.innerHTML = '';
        return;
    }

    emptyState.style.display = 'none';
    projectsGrid.innerHTML = '';

    filteredProjects.forEach(project => {
        const projectCard = createGridCard(project);
        projectsGrid.appendChild(projectCard);
    });
}

function createGridCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card-grid';
    card.dataset.projectId = project.repoName || project.title;
    
    const technologiesHTML = project.technologies.map(tech => 
        `<span class="tech-tag-grid">${tech}</span>`
    ).join('');

    const demoLinkHTML = project.demoUrl ? 
        `<a href="${project.demoUrl}" class="project-link-grid" target="_blank" rel="noopener noreferrer" title="Live Demo">
            <i class="fas fa-external-link-alt"></i>
        </a>` : '';

    const githubLinkHTML = project.repoUrl ? 
        `<a href="${project.repoUrl}" class="project-link-grid" target="_blank" rel="noopener noreferrer" title="View on GitHub">
            <i class="fab fa-github"></i>
        </a>` : '';

    const statsHTML = project.stars !== undefined && project.forks !== undefined ? 
        `<div class="project-stats-grid">
            <span><i class="fas fa-star"></i> ${project.stars}</span>
            <span><i class="fas fa-code-branch"></i> ${project.forks}</span>
        </div>` : '';

    card.innerHTML = `
        <img src="${project.image}" alt="${project.title}" class="project-image-grid">
        <div class="project-content-grid">
            <h3 class="project-title-grid">${project.title}</h3>
            <div class="project-tech-grid">${technologiesHTML}</div>
            <p class="project-description-grid">${project.description}</p>
            <div class="project-footer-grid">
                ${statsHTML}
                <div class="project-links-grid">
                    ${githubLinkHTML}
                    ${demoLinkHTML}
                </div>
            </div>
        </div>
    `;

    card.addEventListener('click', (e) => {
        // Don't open modal if clicking on links
        if (!e.target.closest('.project-link-grid')) {
            openModal(project);
        }
    });

    return card;
}

// Filter Projects
function filterProjects(filter) {
    setActiveFilter(filter);
    
    if (currentView === 'timeline') {
        currentProjectIndex = 0;
        updateTimeline();
    } else {
        renderGridProjects();
    }
}

// Modal Functions
function openModal(project) {
    // Create the modal HTML with image overlay buttons
    const modalHTML = `
        <div class="modal-content">
            <button class="modal-close" id="modal-close">
                <i class="fas fa-times"></i>
            </button>
            <div class="modal-image-container">
                <img src="${project.image}" alt="${project.title}" class="modal-image" id="modal-image">
                <div class="modal-image-overlay">
                    <div class="modal-image-buttons">
                        ${project.repoUrl ? `
                            <a href="${project.repoUrl}" class="modal-image-button secondary" target="_blank" rel="noopener noreferrer">
                                <i class="fab fa-github"></i>
                                View on GitHub
                            </a>
                        ` : ''}
                        ${project.demoUrl ? `
                            <a href="${project.demoUrl}" class="modal-image-button primary" target="_blank" rel="noopener noreferrer">
                                <i class="fas fa-external-link-alt"></i>
                                Live Demo
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="modal-body">
                <h2 class="modal-title" id="modal-title">${project.title}</h2>
                <div class="modal-tech" id="modal-tech">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <p class="modal-description" id="modal-description">${project.description}</p>
                <div class="modal-stats" id="modal-stats">
                    ${project.stars !== undefined && project.forks !== undefined ? 
                        `<div class="stat-item">
                            <i class="fas fa-star"></i>
                            <span>${project.stars} Stars</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-code-branch"></i>
                            <span>${project.forks} Forks</span>
                        </div>` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Update the modal content
    projectModal.innerHTML = modalHTML;
    
    // Re-attach event listeners for the new close button
    const newModalClose = document.getElementById('modal-close');
    newModalClose.addEventListener('click', closeModal);
    
    // Disable scrolling on background
    disableScroll();
    
    // Show modal
    projectModal.classList.add('active');
}

function closeModal() {
    // Hide modal
    projectModal.classList.remove('active');
    
    // Re-enable scrolling on background
    enableScroll();
}

// Error State
function showErrorState() {
    loadingContainer.style.display = 'none';
    emptyState.style.display = 'block';
    emptyState.querySelector('.empty-title').textContent = 'Error Loading Projects';
    emptyState.querySelector('.empty-description').textContent = 'There was an error loading the projects. Please try again later.';
}
