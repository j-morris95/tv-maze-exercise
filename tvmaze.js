/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */

/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
  // TODO: Make an ajax request to the searchShows api.  Remove
  // hard coded data.
  const shows = [];
  const $searchQuery = $("#search-query").val();
  const response = await axios.get(
    `http://api.tvmaze.com/search/shows?q=${$searchQuery}`
  );
  for (let result of response.data) {
    shows.push({
      id: result.show.id,
      name: result.show.name,
      summary: result.show.summary,
      image: checkForImage(result),
    });
  }
  return shows;
}

function checkForImage(result) {
  try {
    return result.show.image.original;
  } catch (error) {
    return "https://tinyurl.com/tv-missing";
  }
}

/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}" data-show-name="${show.name}">
         <div class="card" data-show-id="${show.id}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
             <img class="card-img-top" src=${show.image}>
             <button class="btn-block btn-danger mt-2" data-toggle="modal" data-target="#episodeList" id="show-episodes">See Episodes</button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($item);
  }
}

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch(evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});

/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  // get episodes from tvmaze
  const response = await axios.get(
    `http://api.tvmaze.com/shows/${id}/episodes`
  );
  const episodes = [];
  for (let episode of response.data) {
    episodes.push({
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    });
  }
  // return array-of-episode-info, as described in docstring above
  return episodes;
}

/** Populate episodes list:
 *     - given list of episodes, add to DOM under corresponding show
 */

function populateEpisodes(episodes, showName) {
  const $episodesList = $("#episodes-list");
  $("#modalTitle").text(`${showName}`);
  for (let episode of episodes) {
    let $item = $(`
    <li>${episode.name} (season ${episode.season}, episode ${episode.number})
    </li>
    `);
    $episodesList.append($item);
  }
  $("#episodes-area").show();
}

$("#shows-list").on("click", "#show-episodes", showEpisodes);

async function showEpisodes(evt) {
  const showId = $(evt.target).closest(".Show").data("show-id");
  const showName = $(evt.target).closest(".Show").data("show-name");
  console.log(showName);
  const episodes = await getEpisodes(showId);
  populateEpisodes(episodes, showName);
}
