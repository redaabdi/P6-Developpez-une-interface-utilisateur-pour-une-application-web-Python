async function GetBestMoviesURL(url, number_of_movies) {
    const best_movies = []
    let response = await fetch(url)
    let data = await response.json()
    while (true) { 
        for (const movie of data["results"]) {
            best_movies.push(movie.url)
            if (best_movies.length === number_of_movies) {
                break
            }
        }
        if (data["next"] && best_movies.length < number_of_movies ) {
            url = data["next"]
            response = await fetch(url)
            data = await response.json()
        }
        else {
            break
        }
    }
    return best_movies
}

async function GetDetailsMovie(url_movie) {
    let response = await fetch(url_movie)
    let details_movie = await response.json()
    return details_movie
}

async function FillBestMovie(url_api) {
    const movie_url = await GetBestMoviesURL(url_api + "?sort_by=-imdb_score", 1)
    const details_movie = await GetDetailsMovie(movie_url)
    const h2 = document.querySelector("#big-movie-card .movie-info h2")
    h2.textContent = details_movie["title"]
    const short_description = document.querySelector("#big-movie-card .movie-info p")
    short_description.textContent = details_movie["description"]
    const image = document.querySelector("#big-movie-card img")
    image.src = details_movie["image_url"]
    image.addEventListener("error", () => {
        image.src = "images/image_not_found.jpeg";
    })
}

async function FillTopRatedMovies(url_api) {
    let top_rated_movies = await GetBestMoviesURL(url_api + "?sort_by=-imdb_score",7)
    top_rated_movies = top_rated_movies.slice(1)

    const movies_boxes_html = document.querySelectorAll("#top-rated .movie-box") 
    for (let i=0; i < 6 ; i++) {
        let movie_data = await GetDetailsMovie(top_rated_movies[i])
        let title = movie_data["title"]
        let image_url = movie_data["image_url"]
        movie_box = movies_boxes_html[i]
        movie_box.querySelector("h4").textContent = title
        const image_html = movie_box.querySelector("img")
        image_html.src = image_url
        image_html.addEventListener("error", () => {
            image_html.src = "images/image_not_found.jpeg";
        })
    }
}

async function FillCategories() {
    let top_rated_movies = await GetMoviesURL("http://localhost:8000/api/v1/titles/?sort_by=-imdb_score",7)
    top_rated_movies = top_rated_movies.slice(1)

    const movies_boxes_html = document.querySelectorAll("#top-rated .movie-box") 
    for (let i=0; i < 6 ; i++) {
        let movie_data = await GetDetailsMovie(top_rated_movies[i])
        let title = movie_data["title"]
        let image_url = movie_data["image_url"]
        movie_box = movies_boxes_html[i]
        movie_box.querySelector("h4").textContent = title
        const image_html = movie_box.querySelector("img")
        image_html.src = image_url
        image_html.addEventListener("error", () => {
            image_html.src = "images/image_not_found.jpeg";
        })
    }
}






async function main() {
    const url_api = "http://localhost:8000/api/v1/titles/"
    await FillBestMovie(url_api)
    await FillTopRatedMovies(url_api)
}

main()

//http://localhost:8000/api/v1/titles/?&sort_by=-imdb_score
//http://localhost:8000/api/v1/titles/?&sort_by=-imdb_score&genre=Mystery
