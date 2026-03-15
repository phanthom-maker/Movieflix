// TMDB API Configuration
const API_KEY = 'abd1898a9e40cdf0414797825e97bc45'; // Your API key
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
        
        // Fetch different categories with your API key
        const [trending, popular, topRated, upcoming] = await Promise.all([
            fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`),
            fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`),
            fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`),
            fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`)
        ]);

        // Check if responses are OK
        if (!trending.ok || !popular.ok || !topRated.ok || !upcoming.ok) {
            throw new Error('Failed to fetch movies');
        }

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
        <div class="movie-card" onclick='openMovieModal(${JSON.stringify(movie)})'>
            <img src="${movie.poster_path ? IMAGE_BASE_URL + 'w500' + movie.poster_path : 'https://via.placeholder.com/500x750?text=No+Image'}" 
                 alt="${movie.title || movie.name}">
            <div class="movie-card-overlay">
                <div class="movie-card-title">${movie.title || movie.name}</div>
                <div class="movie-card-rating">
                    <i class="fas fa-star"></i> ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                </div>
            </div>
        </div>
    `).join('');
}

// Set hero section movie
function setHeroMovie(movie) {
    const backdropPath = movie.backdrop_path ? IMAGE_BASE_URL + BACKDROP_SIZE + movie.backdrop_path : '';
    const title = movie.title || movie.name;
    const overview = movie.overview || 'No description available.';
    
    if (backdropPath) {
        heroSection.style.backgroundImage = `url('${backdropPath}')`;
    } else {
        heroSection.style.backgroundImage = 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("https://via.placeholder.com/1920x1080?text=MovieFlix")';
    }
    
    document.getElementById('hero-title').textContent = title;
    document.getElementById('hero-description').textContent = overview.substring(0, 200) + (overview.length > 200 ? '...' : '');
}

// Open movie modal
window.openMovieModal = function(movie) {
    const modal = document.getElementById('movie-modal');
    const title = movie.title || movie.name;
    const overview = movie.overview || 'No description available.';
    const releaseDate = movie.release_date || movie.first_air_date || 'N/A';
    const voteAverage = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    
    // Set backdrop image
    const backdropPath = movie.backdrop_path ? IMAGE_BASE_URL + BACKDROP_SIZE + movie.backdrop_path : '';
    document.getElementById('modal-backdrop').src = backdropPath || 'https://via.placeholder.com/1280x720?text=No+Image';
    
    // Set movie info
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-rating').innerHTML = `<i class="fas fa-star"></i> ${voteAverage}`;
    document.getElementById('modal-year').textContent = releaseDate !== 'N/A' ? releaseDate.split('-')[0] : 'N/A';
    
    // Calculate mock duration (since TMDB doesn't provide this for all movies)
    const randomDuration = Math.floor(Math.random() * (150 - 90 + 1) + 90); // 90-150 minutes
    const hours = Math.floor(randomDuration / 60);
    const minutes = randomDuration % 60;
    document.getElementById('modal-duration').innerHTML = `<i class="far fa-clock"></i> ${hours}h ${minutes}m`;
    
    document.getElementById('modal-overview').textContent = overview;
    
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

    // User profile
    document.querySelector('.fa-user-circle').addEventListener('click', () => {
        alert('Profile feature coming soon!');
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

// Add some additional styling for better UX
const style = document.createElement('style');
style.textContent = `
    .loading {
        color: #e50914;
        font-size: 18px;
        text-align: center;
        padding: 50px;
        width: 100%;
    }
    
    .movie-card {
        cursor: pointer;
        transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .movie-card:hover {
        transform: scale(1.1);
        z-index: 100;
        box-shadow: 0 0 20px rgba(229, 9, 20, 0.5);
    }
    
    .modal-backdrop {
        width: 100%;
        height: 300px;
        object-fit: cover;
        opacity: 0.8;
    }
    
    .rating i, .duration i {
        margin-right: 5px;
        color: #e50914;
    }
`;
document.head.appendChild(style);
