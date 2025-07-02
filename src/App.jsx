import { useEffect, useState } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [moviesList, setMoviesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce the search term to avoid too many API calls
  // by waiting for 500ms after the user stops typing
  // before making the API call
  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 500, [searchTerm]);

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
    
    } catch (error) {
      setErrorMessage('Failed to fetch movies. Please try again later.');
      console.error('Fetch error:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <main>

      <div className="pattern" />
      
      <div className="wrapper">
        <header>
          <img src="src/assets/heroImg.png" alt="Hero Banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy without Hassle</h1>
          
          <Search searchTerm = {searchTerm} setSearchTerm = {setSearchTerm} />
        </header>

        <section className='all-movies'>
          
          <h2 className='mt-[40px]'>All Movies</h2>
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