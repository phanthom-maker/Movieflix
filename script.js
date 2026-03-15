// TMDB API Configuration
const API_KEY = 'a6bde5e33e5ce8771488a61fc6ee7d34'; // Free public API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
const BACKDROP_SIZE = 'original';
const POSTER_SIZE = 'w500';

// DOM Elements
const navbar = document.querySelector('.navbar');
const heroSection = document.getElementById('hero-section');
const trendingGrid = document.getElementById('trending');
const popularGrid = document.getElementById('popular');
const topRatedGrid = document.getElementById('top-rated');
const upcomingGrid = document.getElementById('upcoming');
const modal = document.getElementById('movie-modal');
const closeModal = document.querySelector('.close-modal');

// Movie data cache
let movieCache = {};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    fetchMovies();
    setupEventListeners();
});

// Fetch all movie categories
async function fetchMovies() {
    try {
        showLoadingState();
        
        // Fetch different categories
        const [trending, popular, topRated, upcoming] = await Promise.all([
            fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`),
            fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`),
            fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`),
            fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`)
        ]);

        // Parse responses
        const trendingData = await trending.json();
        const popularData = await popular.json();
        const topRatedData = await topRated.json();
        const upcomingData = await upcoming.json();

        // Store in cache
        movieCache = {
            trending: trendingData.results,
            popular: popularData.results,
            topRated: topRatedData.results,
            upcoming: upcomingData.results
        };

        // Display movies
        displayMovies('trending', trendingData.results);
        displayMovies('popular', popularData.results);
        displayMovies('top-rated', topRatedData.results);
        displayMovies('upcoming', upcomingData.results);
        
        // Set hero section with first trending movie
        if (trendingData.results.length > 0) {
            setHeroMovie(trendingData.results[0]);
        }

        hideLoadingState();
    } catch (error) {
        console.error('Error fetching movies:', error);
        showError();
    }
}

// Display movies in grid
function displayMovies(category, movies) {
    const grid = document.getElementById(category);
    if (!grid) return;

    grid.innerHTML = movies.map(movie => `
        <div class="movie-card" onclick="openMovieModal(${JSON.stringify(movie).replace(/"/g, '&quot;')})">
            <img src="${movie.poster_path ? IMAGE_BASE_URL + 'w500' + movie.poster_path : 'https://via.placeholder.com/500x750?text=No+Image'}" 
                 alt="${movie.title}">
            <div class="movie-card-overlay">
                <div class="movie-card-title">${movie.title}</div>
                <div class="movie-card-rating">
                    <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
                </div>
            </div>
        </div>
    `).join('');
}

// Set hero section movie
function setHeroMovie(movie) {
    const backdropPath = movie.backdrop_path ? IMAGE_BASE_URL + BACKDROP_SIZE + movie.backdrop_path : '';
    heroSection.style.backgroundImage = `url('${backdropPath}')`;
    document.getElementById('hero-title').textContent = movie.title;
    document.getElementById('hero-description').textContent = movie.overview.substring(0, 200) + '...';
}

// Open movie modal
window.openMovieModal = function(movie) {
    const modal = document.getElementById('movie-modal');
    document.getElementById('modal-backdrop').src = movie.backdrop_path ? 
        IMAGE_BASE_URL + BACKDROP_SIZE + movie.backdrop_path : 
        'https://via.placeholder.com/1280x720?text=No+Image';
    document.getElementById('modal-title').textContent = movie.title;
    document.getElementById('modal-rating').innerHTML = `<i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}`;
    document.getElementById('modal-year').textContent = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    document.getElementById('modal-duration').innerHTML = '<i class="far fa-clock"></i> 2h 10m'; // Mock duration
    document.getElementById('modal-overview').textContent = movie.overview || 'No description available.';
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
closeModal.onclick = function() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Slider buttons
    document.querySelectorAll('.movie-row').forEach(row => {
        const slider = row.querySelector('.movies-grid');
        const prevBtn = row.querySelector('.prev');
        const nextBtn = row.querySelector('.next');

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                slider.scrollLeft -= 500;
            });

            nextBtn.addEventListener('click', () => {
                slider.scrollLeft += 500;
            });
        }
    });

    // Search functionality
    document.querySelector('.fa-search').addEventListener('click', () => {
        alert('Search feature coming soon!');
    });

    // Notification bell
    document.querySelector('.fa-bell').addEventListener('click', () => {
        alert('No new notifications');
    });
}

// Loading state
function showLoadingState() {
    const grids = ['trending', 'popular', 'top-rated', 'upcoming'];
    grids.forEach(gridId => {
        const grid = document.getElementById(gridId);
        if (grid) {
            grid.innerHTML = '<div class="loading">Loading movies...</div>';
        }
    });
}

function hideLoadingState() {
    // Remove loading states (handled by displayMovies)
}

function showError() {
    const grids = ['trending', 'popular', 'top-rated', 'upcoming'];
    grids.forEach(gridId => {
        const grid = document.getElementById(gridId);
        if (grid) {
            grid.innerHTML = '<div class="loading">Error loading movies. Please refresh.</div>';
        }
    });
}

// Add smooth scrolling to all movie rows
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Keyboard navigation for modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});
