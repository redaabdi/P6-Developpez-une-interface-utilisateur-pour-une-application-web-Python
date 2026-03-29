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

async function FillMoviesBox(movies_box_html, movies_url) {
    movies_box_html.forEach(async function(movie_box_html, i) {
        if (movies_url[i]) {
            movie_box_html.style.display = "block"
            let movie_data = await GetDetailsMovie(movies_url[i])
            movie_box_html.querySelector("h4").textContent = movie_data["title"]
            const image_html = movie_box_html.querySelector("img")
            image_html.src = movie_data["image_url"]
            image_html.addEventListener("error", () => {
                image_html.src = "images/image_not_found.jpeg";
        })
        }
        else {
            movie_box_html.style.display = "none"
        }
    })
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
    image.addEventListener("error", function() {
        image.src = "images/image_not_found.jpeg";
    })
}

async function FillTopRatedMovies(url_api) {
    let movies_url  = await GetBestMoviesURL(url_api + "?sort_by=-imdb_score",7)
    movies_url = movies_url.slice(1)
    const movies_box_html = document.querySelectorAll(".top-rated .movie-box") 
    await FillMoviesBox(movies_box_html, movies_url)
}

async function FillCategories(url_api) {
    const all_categories_html = document.querySelectorAll(".category")    
    for (const category_html of all_categories_html) {
        let category_name
        if (category_html.id === "others" || category_html.id == "second-others") {
            const select = category_html.querySelector(".category-select")
            category_name = select.value
            select.addEventListener("change", async function() {
                category_name = select.value
                movies_url = await GetBestMoviesURL(url_api + "?sort_by=-imdb_score&genre=" + category_name, 6)
                movies_box_html = category_html.querySelectorAll(".movie-box")
                await FillMoviesBox(movies_box_html, movies_url)
            })
        }
        else {
            category_name = category_html.id
        }

        movies_url = await GetBestMoviesURL(url_api + "?sort_by=-imdb_score&genre=" + category_name, 6)
        movies_box_html = category_html.querySelectorAll(".movie-box")
        await FillMoviesBox(movies_box_html, movies_url)
    }
}

async function main() {
    const url_api = "http://localhost:8000/api/v1/titles/"
    await FillBestMovie(url_api)
    await FillTopRatedMovies(url_api)
    await FillCategories(url_api)
}

main()
