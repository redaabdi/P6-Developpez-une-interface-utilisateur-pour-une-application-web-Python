let all_data = {}

document.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-details")) {
        modal_html = document.getElementById('modal')
        modal_html.classList.add('active')
        const button = event.target;
        // remonter au parent (.transparent-rectangle)
        const parent = button.parentElement;
        // récupérer le titre dans ce parent
        const title = parent.querySelector(".title");
        let data_movie = all_data[title.textContent]
        modal_html.innerHTML = `
        <div class="content">
            <div class="top-content text">
                <h2 class="title text">${data_movie["original_title"]}</h2>
                <p class="year-genre">${data_movie["year"]} - ${data_movie["genres"].join(", ")}</p>
                <p class="rated-duration-countries">PG-${data_movie["rated"]} - ${data_movie["duration"]} minutes (${data_movie["countries"].join(" / ")})</p>
                <p class="imdb-score">IMDB score: ${data_movie["imdb_score"]}/10</p>
                <p class="box-office-gross">Box-office gross : $${data_movie["worldwide_gross_income"]} </p>
            </div>
            <button class="cross-button button close text">❌</button>
            <div class="directors text">
                <p class="bold directed">Directed by: </p>
                <p class="directors-name"> ${data_movie["directors"].join(", ")}</p>
            </div>
            <p class="description text">${data_movie["long_description"]}</p>
            <img class="image" src="${data_movie["image_url"]}"
            onerror="this.src='images/image_not_found.jpeg'">      
            <p class="actors text">With: <br>
            ${data_movie["actors"].join(", ")} </p>
            <button class="close-button close text">Close</button>
        </div>
    `
    }
    else if (event.target.classList.contains("close")) {
        document.getElementById('modal').classList.remove('active')
    }
});

async function ButtonSeeMore() {
    const ButtonSeeMore = document.querySelectorAll(".btn-see-more");
    ButtonSeeMore.forEach((button) => {
        button.addEventListener("click", () => {
            const section = button.closest(".category");
            const movieList = section.querySelector(".movie-list");
            movieList.classList.toggle("expanded");
            if (movieList.classList.contains("expanded")) {
                button.textContent = "See less";
            } else {
                button.textContent = "See more";
            }
        });
    });
}

async function GetDataCategory(url_category, number_of_movies) {
    const data_movies = []
    
    while (url_category && data_movies.length < number_of_movies) {
        let response = await fetch(url_category)
        let data_url = await response.json()
        for (const movie of data_url["results"]) {
            let response = await fetch(movie.url)
            let data_movie = await response.json()
            data_movies.push(data_movie)
            all_data[data_movie["original_title"]] = data_movie
            if (data_movies.length === number_of_movies) {
                break
            }
        }           
        url_category = data_url["next"]
    }
    return data_movies
}

async function CreateMoviesBox(genre_html, data_movies) {
    const movie_list_html = genre_html.querySelector('.movie-list')
    movie_list_html.innerHTML = ""
    for (const data_movie of data_movies) {
        movie_list_html.innerHTML += `
        <article class="movie-box">
                <div class="transparent-rectangle">
                    <h4 class="text title">${data_movie["original_title"]}</h4>
                    <button class="text btn-details">Details</button>
                </div>
                <img src="${data_movie["image_url"]}"
                onerror="this.src='images/image_not_found.jpeg'">
        </article>
    `
    }
}


async function FillBestMovie(url_api) {
    const data = await GetDataCategory(url_api + "?sort_by=-imdb_score", 1)
    const h2 = document.querySelector("#big-movie-box .movie-info h2")
    h2.textContent = data[0]["title"]
    const short_description = document.querySelector("#big-movie-box .movie-info p")
    short_description.textContent = data[0]["description"]


    const image = document.querySelector("#big-movie-box img")
    image.src = data[0]["image_url"]
    image.addEventListener("error", function() {
        image.src = "images/image_not_found.jpeg";
    })
}

async function FillTopRatedMovies(url_api) {
    const top_rated_html = document.querySelector(".top-rated")
    let data = await GetDataCategory(url_api + "?sort_by=-imdb_score", 7)
    data = data.slice(1)
    await CreateMoviesBox(top_rated_html, data)
}

async function FillGenres(url_api) {
    const categories_html = document.querySelectorAll(".genre")    
    for (const category_html of categories_html) {
        let category_name
        if (category_html.classList.contains("others")) {
            const select = category_html.querySelector(".select")
            category_name = select.value
            select.addEventListener("change", async function() {
            category_name = select.value
            data = await GetDataCategory(url_api + "?sort_by=-imdb_score&genre=" + category_name, 6)
            await CreateMoviesBox(category_html, data)
            })
        }
        else {
            category_name = category_html.id
        }
        data = await GetDataCategory(url_api + "?sort_by=-imdb_score&genre=" + category_name, 6)
        await CreateMoviesBox(category_html, data)

    }
}

async function FillAllCategories(url_api) {
    await FillBestMovie(url_api)
    await FillTopRatedMovies(url_api)
    await FillGenres(url_api)
}


FillAllCategories("http://localhost:8000/api/v1/titles/")
ButtonSeeMore()