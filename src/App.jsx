// import necessary libraries and components
import { useEffect, useState } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite';

// Define constants for API base URL, API key, and options for fetch requests
// The API key is stored in environment variables for security
// and is accessed using import.meta.env.VITE_TMDB_API_KEY
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

// Main App component
// This component manages the state and logic for fetching and displaying movies
// It includes a search feature, displays trending movies, and handles loading and error states
// It uses the useState and useEffect hooks from React for state management and side effects
// It also uses a custom hook useDebounce to debounce the search input
// The component renders a header with a search bar, a section for trending movies,
// and a section for displaying all movies based on the search term or trending movies

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [moviesList, setMoviesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [trendingMovies, setTrendingMovies] = useState([]);

  // Debounce the search term to avoid too many API calls
  // by waiting for 500ms after the user stops typing
  // before making the API call
  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 500, [searchTerm]);

  // Function to fetch trending movies from the Appwrite database
  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query 
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&sort_by=popularity.desc`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      
      if (!response.ok) {
        throw new Error(`Network response was not ok (status: ${response.status})`);
      }
      
      const data = await response.json();
      
      if(data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies. Please try again later.');
        setMoviesList([]);
        return;
      } else {
        setMoviesList(data.results);
        setErrorMessage('');
      }

      // Update search count in Appwrite database
      if (query && data.results.length > 0) {
        const movie = data.results[0]; // Use the first movie from the results
        await updateSearchCount(query, movie);
      }

    } catch (error) {
      setErrorMessage('Failed to fetch movies. Please try again later.');
      console.error('Fetch error:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch trending movies on initial load
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    }
  }

  // Load trending movies when the component mounts
  useEffect(() => {
    loadTrendingMovies();
  }, []);

  // Fetch movies based on the debounced search term
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  // Render the main application structure
  return (
    <main>

      <div className="pattern" />
      
      <div className="wrapper">
        <header>
          <img src="src/assets/heroImg.png" alt="Hero Banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy without Hassle</h1>
          
          <Search searchTerm = {searchTerm} setSearchTerm = {setSearchTerm} />
        </header>

        { trendingMovies.length > 0 && (
          <section className='trending'>
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul> 
          </section>
        )}

        <section className='all-movies'>
          
          <h2>All Movies</h2>
          { isLoading ? ( <Spinner / >
          ) : errorMessage ? ( <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {moviesList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}

        </section>

      </div>

    </main>
  )
}

export default App