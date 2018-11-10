# CS-546 Final Project
### Team: JAMS

Howdy, this is our submission for the final project for Web Programming I at Stevens.  We are making a band database to help share information about artists.  Users will be able to:

- View top-rated bands of the day
- Search for songs or bands by genre, band-members, and rating
- View information about bands such as their albums, the songs on each album, and the members of the band
- Enter new bands with auto-generated names

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

We'll see you on the other side!