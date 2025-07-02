import { useEffect, useState } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';

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

  const fetchMovies = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
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
    fetchMovies();
  }, [])

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