async function GetMoviesCategory(url_category, number_of_movies) {
    const movies_url = []
    let response = await fetch(url_category)
    let data = await response.json()
    while (true) { 
        for (const movie of data["results"]) {
            movies_url.push(movie.url)
            if (movies_url.length === number_of_movies) {
                return movies_url
            }
        }
        if (data["next"]) {
            url_category = data["next"]
            response = await fetch(url_category)
            data = await response.json()
        }
        else {
            return movies_url
        }
    }
}

async function GetDetailsMovie(url_movie) {
    let response = await fetch(url_movie)
    let details_movie = await response.json()
    return details_movie
}

// async function CreateMoviesBox(movies_box_html, movies_url) {
//     movies_box_html.forEach(async function(movie_box_html, i) {
//         if (movies_url[i]) {
//             // movie_box_html.style.display = "block"
//             let movie_data = await GetDetailsMovie(movies_url[i])
//             movie_box_html.querySelector("h4").textContent = movie_data["title"]
//             const image_html = movie_box_html.querySelector("img")
//             image_html.src = movie_data["image_url"]
//             image_html.addEventListener("error", () => {
//                 image_html.src = "images/image_not_found.jpeg";
//         })
//         }
//         else {
//             // movie_box_html.style.display = "none"
//         }
//     })
// }

async function CreateMoviesBox(genre_html, movies_url) {
    for (const movie_url of movies_url) {
        let movie_data = await GetDetailsMovie(movie_url)
        const movie_list_html = genre_html.querySelector('.movie-list')
        movie_list_html.innerHTML += `
        <article class="movie-box">
                <div class="transparent-rectangle">
                    <h4>${movie_data["title"]}</h4>
                    <button>Details</button>
                </div>
                <img src="${movie_data["image_url"]}"
                onerror="this.src='images/image_not_found.jpeg'">
        </article>
    `
    
    }
}


async function FillBestMovie(url_api) {
    const movie_url = await GetMoviesCategory(url_api + "?sort_by=-imdb_score", 1)
    const details_movie = await GetDetailsMovie(movie_url)
    const h2 = document.querySelector("#big-movie-box .movie-info h2")
    h2.textContent = details_movie["title"]
    const short_description = document.querySelector("#big-movie-box .movie-info p")
    short_description.textContent = details_movie["description"]
    const image = document.querySelector("#big-movie-box img")
    image.src = details_movie["image_url"]
    image.addEventListener("error", function() {
        image.src = "images/image_not_found.jpeg";
    })
}

async function FillTopRatedMovies(url_api) {
    let movies_url  = await GetMoviesCategory(url_api + "?sort_by=-imdb_score",7)
    movies_url = movies_url.slice(1)
    const top_rated_html = document.querySelector(".top-rated") 
    await CreateMoviesBox(top_rated_html, movies_url)
}

// async function FillGenres(url_api) {
//     const all_genres_html = document.querySelectorAll(".genre")    
//     for (const genre_html of all_genres_html) {
//         let genre_name
//         if (genre_html.id === "others" || genre_html.id == "second-others") {
//             const select = genre_html.querySelector(".select")
//             genre_name = select.value
//             select.addEventListener("change", async function() {
//                 genre_name = select.value
//                 movies_url = await GetMoviesCategory(url_api + "?sort_by=-imdb_score&genre=" + genre_name, 6)
//                 movies_box_html = genre_html.querySelectorAll(".movie-box")
//                 await CreateMoviesBox(movies_box_html, movies_url)
//             })
//         }
//         else {
//             genre_name = genre_html.id
//         }
//         movies_url = await GetMoviesCategory(url_api + "?sort_by=-imdb_score&genre=" + genre_name, 6)
//         movies_box_html = genre_html.querySelectorAll(".movie-box")
//         await CreateMoviesBox(movies_box_html, movies_url)
//     }
// }

async function FillGenres(url_api) {
    const all_genres_html = document.querySelectorAll(".genre")    
    for (const genre_html of all_genres_html) {
        let genre_name
        if (genre_html.id === "others" || genre_html.id == "second-others") {
            const select = genre_html.querySelector(".select")
            genre_name = select.value
            select.addEventListener("change", async function() {
                genre_name = select.value
                movies_url = await GetMoviesCategory(url_api + "?sort_by=-imdb_score&genre=" + genre_name, 6)
                await CreateMoviesBox(genre_html, movies_url)
            })
        }
        else {
            genre_name = genre_html.id
        }
        movies_url = await GetMoviesCategory(url_api + "?sort_by=-imdb_score&genre=" + genre_name, 6)
        
        await CreateMoviesBox(genre_html, movies_url)
    }
}



async function main() {
    const url_api = "http://localhost:8000/api/v1/titles/"
    await FillBestMovie(url_api)
    await FillTopRatedMovies(url_api)
    await FillGenres(url_api)
}

main()
