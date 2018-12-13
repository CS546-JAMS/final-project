[![Build Status](https://travis-ci.com/CS546-JAMS/final-project.svg?branch=master)](https://travis-ci.com/CS546-JAMS/final-project)

# CS-546 Final Project
### Team: JAMS

Howdy, this is our submission for the final project for Web Programming I at Stevens.  We are making a band database to help share information about artists.  Users will be able to:

- View top-rated bands of the day
- Search for songs or bands by genre, band-members, and rating
- View information about bands such as their albums, the songs on each album, and the members of the band
- Enter new bands with auto-generated names

## For Professors and Other People Needing to Run This
Firstly, `git clone` and `cd` into the project directory.  Then hit us with an `npm install` to get your dependencies straightened out.  After that, please run a `npm run seed` to generate the test database.  After that, you may want to run an `npm test` just to make sure your system is working correctly.

Once you get the green light from Jest, feel free to start it up with an `npm start` and head on over to `localhost:3000`.  Once there, click around and explore!

If we were to continue this project, we'd love to:
- Separate all requests into an API and a web server sending out SPAs w/ React.  This way, we could have a fully RESTful API without Handlebars jumping in the way and forcing us to return HTML on GET requests instead of JSON.
- Switch to React on client-side.  Works well with the above, as we can just make requests to the API via fetch or Ajax, keeping everything very loosely coupled.  This would also give us a ton of flexibility regarding state management.

## Rules of the Craft

### Style Guide
We will be using the [Airbnb style guide](https://github.com/airbnb/javascript) for all of our JavaScript, please be sure to follow it with each commit.

### Contributions
Each new feature should be created on a unique branch from `dev`.  This helps to keep things encapsulated.

Each pull request should contain some discrete chunk of functionality that allows it to continue working as expected, along with a message describing what that functionality is.  

Essentially, we always want our `dev` branch to have a working version of the product.  Once we have reached a 'checkpoint' of features that justify a release, we will send it off with a pull request to the `master` branch.

#### Example

```bash
# Starting a new feature, can also branch from github.com
git checkout -b nameOfFeature dev

# Doing some work...
git add myFile.js
git commit -m "Start search functionality"

# And all done...
git add myFile.js
git commit -m "Finish search functionality"

# First merge the branch into dev
git checkout dev
git merge nameOfFeature

# Delete the old branch once merged
git branch -d nameOfFeature
```

### Testing and Travis
Unit and integration testing will be completed via Jest and Travis CI.  We will be providing documentation soon as to how to set this up in the project structure, as well as providing a `travis.yml` file for CI.

## Document Models
Advanced information on the models can be found in `src/models`.  We will also briefly define the document schemas here and provide some examples:

### Band
|   Field Name   |      Field Type      |
|:---------------|:---------------------|
| _id            | ObjectId             |
| name           | String               |
| genres         | List(String)         |
| members        | List(ObjectId) (FK)  |
| albums         | List(ObjectId) (FK)  |
| likes          | Number               |

``` javascript
{
    _id: 5bf31c40abbf7f4157db6ca6,
    name: 'Guns N\' Roses',
    genres: [ 'Rock' ],
    members: [],
    albums: [ 5bf31c40abbf7f4157db6ca7 ],
    likes: 12879
}
```

---

### Album
|   Field Name   |      Field Type      |
|:---------------|:---------------------|
| _id            | ObjectId             |
| band           | ObjectId (FK)        |
| title          | String               |
| songs          | List(ObjectId) (FK)  |
| genre          | String               |

``` javascript
{
    _id: 5bf31c40abbf7f4157db6ca7,
    band: 5bf31c40abbf7f4157db6ca6,
    title: 'Appetite for Destruction',
    songs: [ 5bf31c40abbf7f4157db6ca8, 5bf31c40abbf7f4157db6ca9 ],
    genre: 'Rock'
}
```

---

### Song
|   Field Name   |      Field Type      |
|:---------------|:---------------------|
| _id            | ObjectId             |
| album          | ObjectId (FK)        |
| title          | String               |
| lengthInSeconds| Number               |
| streams        | Number               |

``` javascript
{
    _id: 5bf31c40abbf7f4157db6ca9,
    album: 5bf31c40abbf7f4157db6ca7,
    title: 'Welcome to the Jungle',
    lengthInSeconds: 271,
    streams: 80678
}
```
---

### Artist
|   Field Name   |      Field Type      |
|:---------------|:---------------------|
| _id            | ObjectId             |
| name           | String               |
| bands          | List(History)        |
| birth          | String               |
| death          | String               |

### History _(subdoc of Artist)_
|   Field Name   |      Field Type      |
|:---------------|:---------------------|
| band           | ObjectId (FK)        |
| yearStart      | Number               |
| yearEnd        | Number               |
| roles          | List(String)         |

---

### Genre
|   Field Name   |      Field Type      |
|:---------------|:---------------------|
| _id            | ObjectId             |
| title          | String               |
| bands          | List(ObjectId) (FK)  |

---

Some notable relationships among the data:
- One-to-Many
    - Band-Album
    - Album-Song
- Many-to-Many
    - Artist-Band
    - Genre-Band

We'll see you on the other side!